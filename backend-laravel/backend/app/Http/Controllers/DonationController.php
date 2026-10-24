<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonationController extends Controller
{
    public function index(Campaign $campaign)
    {
        abort_unless(in_array($campaign->status, ['verified', 'completed'], true), 404);
        return response()->json(
            $campaign->donations()
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

        $totalDonated = (int) $donations->sum('amount');

        return response()->json([
            'donations' => $donations,
            'total_donated' => $totalDonated,
            'total_donation_count' => $donations->count(),
            'campaigns_supported' => $donations->pluck('campaign_id')->unique()->count(),
        ]);
    }

    // Hanya role individu/perusahaan/pemerintah (middleware role:individu,perusahaan,pemerintah)
    public function store(Request $request, Campaign $campaign)
    {
        $data = $request->validate([
            'amount' => 'required|integer|min:10000',
            'payment_method' => 'required|in:transfer_bank,e_wallet,bank_bca,bank_mandiri,bank_bni,bank_bri,bank_bsi,bank_btn,bank_cimb_niaga,bank_ocbc,bank_danamon,bank_permata,bank_lainnya',
            'message' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Lock the campaign so the donation that reaches the target closes it
        // before another concurrent request can be accepted.
        $result = DB::transaction(function () use ($campaign, $user, $data) {
            $locked = Campaign::query()->lockForUpdate()->findOrFail($campaign->id);

            if ($locked->status !== 'verified') {
                return ['error' => 'Kebutuhan ini sudah ditutup untuk donasi.'];
            }

            if ($locked->end_date && now()->startOfDay()->greaterThan($locked->end_date)) {
                return ['error' => 'Batas waktu donasi untuk kebutuhan ini sudah berakhir.'];
            }

            $raisedAmount = (int) $locked->raised_amount;
            $targetAmount = (int) $locked->target_amount;
            if ($raisedAmount >= $targetAmount) {
                $locked->status = 'completed';
                $locked->save();

                return ['error' => 'Kebutuhan ini sudah terpenuhi dan ditutup untuk donasi. Terima kasih atas dukungannya.'];
            }

            $donation = $locked->donations()->create([
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
                'message' => $data['message'] ?? '',
            ]);

            $locked->raised_amount = $raisedAmount + (int) $data['amount'];
            if ($locked->raised_amount >= $targetAmount) {
                $locked->status = 'completed';
            }
            $locked->save();

            return ['donation' => $donation];
        });

        if (isset($result['error'])) {
            return response()->json([
                'message' => $result['error'],
            ], 422);
        }

        $donation = $result['donation'];
        $formattedAmount = 'Rp ' . number_format($data['amount'], 0, ',', '.');

        // Notifikasi untuk Sekolah Penerima Donasi
        Notification::create([
            'user_id' => $campaign->user_id,
            'type' => 'donation_received',
            'title' => '💰 Donasi Baru Diterima!',
            'message' => "{$donation->donor_name} menyalurkan donasi sebesar {$formattedAmount} untuk '{$campaign->title}'.",
            'campaign_id' => $campaign->id,
        ]);

        // Notifikasi untuk Admin
        Notification::create([
            'target_role' => 'admin',
            'type' => 'donation_received',
            'title' => '💳 Donasi Baru Tercatat',
            'message' => "Donasi sebesar {$formattedAmount} disalurkan oleh {$donation->donor_name} ke '{$campaign->title}'.",
            'campaign_id' => $campaign->id,
        ]);

        // Notifikasi untuk donatur (bukti donasi tercatat)
        Notification::create([
            'user_id' => $user->id,
            'type' => 'donation_sent',
            'title' => '🙏 Terima kasih atas donasi Anda!',
            'message' => "Donasi sebesar {$formattedAmount} untuk '{$campaign->title}' berhasil dicatat.",
            'campaign_id' => $campaign->id,
        ]);

        return response()->json($donation, 201);
    }
}
