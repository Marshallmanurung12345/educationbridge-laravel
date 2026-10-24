<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Notification;
use App\Services\MidtransPaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class DonationController extends Controller
{
    public function index(Campaign $campaign)
    {
        abort_unless(in_array($campaign->status, ['verified', 'completed'], true), 404);
        return response()->json(
            $campaign->donations()
                ->where('payment_status', 'success')
                ->select(['id', 'amount', 'created_at'])
                ->latest()
                ->get(),
        );
    }

    // Riwayat donasi milik user yang sedang login (dipakai Dashboard Donatur).
    public function mine(Request $request)
    {
        $donations = $request->user()
            ->donations()
            ->with([
                'campaign' => fn ($query) => $query
                    ->select(['id', 'title', 'school_name', 'status', 'raised_amount', 'target_amount'])
                    ->withCount('reports'),
            ])
            ->latest()
            ->get();

        $successfulDonations = $donations->where('payment_status', 'success');

        return response()->json([
            'donations' => $donations,
            'total_donated' => (int) $successfulDonations->sum('amount'),
            'total_donation_count' => $successfulDonations->count(),
            'campaigns_supported' => $successfulDonations->pluck('campaign_id')->unique()->count(),
        ]);
    }

    public function store(Request $request, Campaign $campaign)
    {
        $data = $request->validate([
            'amount' => 'required|integer|min:10000',
            'payment_method' => 'required|in:bank_bca,bank_bri,bank_bni,bank_mandiri,bank_bsi',
        ]);

        $user = $request->user();
        if ($campaign->status !== 'verified') {
            return response()->json(['message' => 'Kebutuhan ini sudah ditutup untuk donasi.'], 422);
        }
        if ($campaign->end_date && now()->startOfDay()->greaterThan($campaign->end_date)) {
            return response()->json(['message' => 'Batas waktu donasi untuk kebutuhan ini sudah berakhir.'], 422);
        }
        if ((int) $campaign->raised_amount >= (int) $campaign->target_amount) {
            return response()->json([
                'message' => 'Kebutuhan ini sudah terpenuhi dan ditutup untuk donasi. Terima kasih atas dukungannya.',
            ], 422);
        }

        $donation = DB::transaction(function () use ($campaign, $user, $data) {
            $locked = Campaign::query()->lockForUpdate()->findOrFail($campaign->id);
            if ($locked->status !== 'verified' ||
                ($locked->end_date && now()->startOfDay()->greaterThan($locked->end_date)) ||
                (int) $locked->raised_amount >= (int) $locked->target_amount) {
                return null;
            }

            return $locked->donations()->create([
                'user_id' => $user->id,
                'donor_name' => $user->organization_name ?: $user->name,
                'donor_type' => match ($user->role) {
                    'individu' => 'individu',
                    'perusahaan' => 'perusahaan',
                    'pemerintah' => 'pemerintah',
                    default => 'individu',
                },
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'payment_status' => 'pending',
                'order_id' => 'donation-' . Str::uuid(),
            ]);
        });

        if (! $donation) {
            return response()->json([
                'message' => 'Kebutuhan ini sudah ditutup untuk donasi.',
            ], 422);
        }

        return response()->json([
            'donation' => $donation,
            'payment_status' => 'pending',
        ], 201);
    }

    public function handleMidtransNotification(Request $request, MidtransPaymentService $midtrans)
    {
        $notification = $request->all();
        if (! $midtrans->isAuthenticNotification($notification)) {
            return response()->json(['message' => 'Signature not valid.'], 401);
        }

        $orderId = $notification['order_id'];
        $donation = Donation::query()->where('order_id', $orderId)->first();
        if (! $donation) {
            return response()->json(['message' => 'Transaction not found.'], 404);
        }

        try {
            $providerStatus = $midtrans->getTransactionStatus($orderId);
        } catch (ConnectionException $exception) {
            Log::warning('Could not verify Midtrans notification.', [
                'order_id' => $orderId,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json(['message' => 'Payment status verification is temporarily unavailable.'], 503);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        $updatedDonation = $this->applyProviderStatus($donation, $providerStatus);
        if (! $updatedDonation) {
            return response()->json(['message' => 'Transaction details did not match.'], 422);
        }

        return response()->json(['message' => 'Notification processed.']);
    }

    public function refreshMine(string $orderId, Request $request, MidtransPaymentService $midtrans)
    {
        $donation = $request->user()->donations()
            ->with('campaign:id,title')
            ->where('order_id', $orderId)
            ->firstOrFail();

        if ($donation->payment_status === 'unverified') {
            return response()->json($donation);
        }
        if (str_starts_with((string) $donation->payment_method, 'bank_')) {
            return response()->json($donation);
        }

        try {
            $providerStatus = $midtrans->getTransactionStatus($orderId);
        } catch (ConnectionException $exception) {
            Log::warning('Could not refresh Midtrans payment status.', [
                'order_id' => $orderId,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json(['message' => 'Status pembayaran belum dapat diperiksa. Silakan coba lagi.'], 503);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        $updatedDonation = $this->applyProviderStatus($donation, $providerStatus);
        if (! $updatedDonation) {
            return response()->json(['message' => 'Rincian transaksi tidak cocok.'], 422);
        }

        return response()->json($updatedDonation);
    }

    private function applyProviderStatus(Donation $donation, array $providerStatus): ?Donation
    {
        if (($providerStatus['order_id'] ?? null) !== $donation->order_id ||
            ! isset($providerStatus['gross_amount']) ||
            ! is_numeric($providerStatus['gross_amount']) ||
            (int) round((float) $providerStatus['gross_amount']) !== (int) $donation->amount ||
            (string) ($providerStatus['status_code'] ?? '') !== '200') {
            return null;
        }

        $providerTransactionStatus = $providerStatus['transaction_status'] ?? '';
        $nextStatus = match ($providerTransactionStatus) {
            'settlement' => 'success',
            'capture' => ($providerStatus['fraud_status'] ?? '') === 'accept' ? 'success' : 'pending',
            'deny', 'cancel', 'expire' => 'failed',
            default => 'pending',
        };

        return DB::transaction(function () use ($donation, $providerStatus, $nextStatus) {
            $lockedDonation = Donation::query()->lockForUpdate()->findOrFail($donation->id);
            if (in_array($lockedDonation->payment_status, ['success', 'failed'], true)) {
                return $lockedDonation->fresh();
            }

            $lockedDonation->payment_method = $providerStatus['payment_type'] ?? $lockedDonation->payment_method;
            $lockedDonation->midtrans_transaction_id =
                $providerStatus['transaction_id'] ?? $lockedDonation->midtrans_transaction_id;
            if ($nextStatus === 'success') {
                $campaign = Campaign::query()->lockForUpdate()->findOrFail($lockedDonation->campaign_id);
                $lockedDonation->payment_status = 'success';
                $lockedDonation->save();

                $campaign->raised_amount = (int) $campaign->raised_amount + (int) $lockedDonation->amount;
                if ($campaign->status === 'verified' &&
                    (int) $campaign->raised_amount >= (int) $campaign->target_amount) {
                    $campaign->status = 'completed';
                }
                $campaign->save();

                $formattedAmount = 'Rp ' . number_format((int) $lockedDonation->amount, 0, ',', '.');
                Notification::create([
                    'user_id' => $campaign->user_id,
                    'type' => 'donation_received',
                    'title' => 'Donasi terkonfirmasi',
                    'message' => "Donasi sebesar {$formattedAmount} untuk '{$campaign->title}' telah dikonfirmasi oleh Midtrans.",
                    'campaign_id' => $campaign->id,
                ]);
                Notification::create([
                    'target_role' => 'admin',
                    'type' => 'donation_received',
                    'title' => 'Donasi terkonfirmasi',
                    'message' => "Donasi sebesar {$formattedAmount} untuk '{$campaign->title}' telah dikonfirmasi oleh Midtrans.",
                    'campaign_id' => $campaign->id,
                ]);
                if ($lockedDonation->user_id) {
                    Notification::create([
                        'user_id' => $lockedDonation->user_id,
                        'type' => 'donation_sent',
                        'title' => 'Donasi Anda berhasil',
                        'message' => "Donasi sebesar {$formattedAmount} untuk '{$campaign->title}' telah dikonfirmasi.",
                        'campaign_id' => $campaign->id,
                    ]);
                }
            } else {
                $lockedDonation->payment_status = $nextStatus;
                $lockedDonation->save();
            }

            return $lockedDonation->fresh();
        });
    }
}
