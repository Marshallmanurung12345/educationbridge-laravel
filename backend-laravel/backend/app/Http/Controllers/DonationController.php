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
        return response()->json($campaign->donations()->latest()->get());
    }

    // Riwayat donasi milik user yang sedang login (dipakai Dashboard Donatur).
    public function mine(Request $request)
    {
        $donations = $request->user()
            ->donations()
            ->with('campaign:id,title,school_name,status,raised_amount,target_amount')
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
        if ($campaign->status !== 'verified') {
            return response()->json(['message' => 'Kebutuhan ini belum tersedia untuk donasi.'], 422);
        }

        if ($campaign->end_date && now()->startOfDay()->greaterThan($campaign->end_date)) {
            return response()->json(['message' => 'Batas waktu donasi untuk kebutuhan ini sudah berakhir.'], 422);
        }

        $remaining = (int) $campaign->target_amount - (int) $campaign->raised_amount;

        if ($remaining <= 0) {
            return response()->json(['message' => 'Kebutuhan ini sudah terpenuhi penuh. Terima kasih atas dukungannya.'], 422);
        }

        $data = $request->validate([
            'amount' => 'required|integer|min:10000|max:' . max($remaining, 10000),
            'payment_method' => 'required|in:transfer_bank,e_wallet',
            'message' => 'nullable|string|max:500',
        ], [
            'amount.max' => 'Nominal donasi melebihi sisa kebutuhan. Sisa yang dibutuhkan: Rp ' . number_format($remaining, 0, ',', '.') . '.',
        ]);

        $user = $request->user();

        // Transaksi + lock supaya dua donasi bersamaan tidak menghilangkan data
        // dan raised_amount tidak pernah melebihi target_amount.
        $donation = DB::transaction(function () use ($campaign, $user, $data, $remaining) {
            $locked = Campaign::query()->lockForUpdate()->findOrFail($campaign->id);

            $sisaTerkini = (int) $locked->target_amount - (int) $locked->raised_amount;
            if ($data['amount'] > $sisaTerkini) {
                return null;
            }

            $donation = $locked->donations()->create([
                'user_id' => $user->id,
                'donor_name' => $user->organization_name ?: $user->name,
                'donor_type' => $user->role,
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'message' => $data['message'] ?? '',
            ]);

            $locked->increment('raised_amount', $data['amount']);

            return $donation;
        });

        if (!$donation) {
            return response()->json([
                'message' => 'Nominal donasi melebihi sisa kebutuhan terkini. Mohon muat ulang halaman.',
            ], 422);
        }

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
