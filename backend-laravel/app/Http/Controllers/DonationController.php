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
        $data = $request->validate([
            'amount' => 'required|integer|min:10000',
            'message' => 'nullable|string',
        ]);

        $user = $request->user();

        $donation = $campaign->donations()->create([
            'user_id' => $user->id,
            'donor_name' => $user->organization_name ?: $user->name,
            'donor_type' => $user->role,
            'amount' => $data['amount'],
            'message' => $data['message'] ?? '',
        ]);

        $campaign->increment('raised_amount', $data['amount']);

        return response()->json($donation, 201);
    }
}
