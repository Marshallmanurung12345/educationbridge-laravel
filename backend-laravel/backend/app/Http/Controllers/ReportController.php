<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Campaign $campaign)
    {
        return response()->json($campaign->reports()->latest()->get());
    }

    // Hanya sekolah pemilik campaign yang boleh mengunggah laporan dampak.
    public function store(Request $request, Campaign $campaign)
    {
        if ($request->user()->id !== $campaign->user_id) {
            return response()->json([
                'message' => 'Hanya sekolah pengaju yang dapat menambahkan laporan untuk campaign ini.',
            ], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'narrative' => 'required|string',
            'photo_url' => 'nullable|string',
        ]);

        $report = $campaign->reports()->create($data);

        return response()->json($report, 201);
    }
}
