<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function index(Campaign $campaign)
    {
        return response()->json($campaign->donations()->latest()->get());
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

        $data = $request->validate([
            'amount' => 'required|integer|min:10000',
            'payment_method' => 'required|in:transfer_bank,e_wallet',
            'message' => 'nullable|string',
        ]);

        $user = $request->user();

        $donation = $campaign->donations()->create([
            'user_id' => $user->id,
            'donor_name' => $user->organization_name ?: $user->name,
            'donor_type' => $user->role,
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'],
            'message' => $data['message'] ?? '',
        ]);

        $campaign->increment('raised_amount', $data['amount']);

        return response()->json($donation, 201);
    }
}
