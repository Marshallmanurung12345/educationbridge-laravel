<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Notification;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Campaign $campaign)
    {
        abort_unless($campaign->status === 'verified', 404);
        return response()->json($campaign->reports()->latest()->get());
    }

    // Only the campaign owner may submit a progress report.
    public function store(Request $request, Campaign $campaign)
    {
        if (
            $request->user()->role === 'sekolah' &&
            $request->user()->account_status !== 'verified'
        ) {
            return response()->json(['message' => 'Akun sekolah tidak aktif.'], 403);
        }

        if (
            $request->user()->id !== $campaign->user_id ||
            !in_array($campaign->status, ['verified', 'completed'], true)
        ) {
            return response()->json([
                'message' => 'Hanya pemilik campaign aktif yang dapat menambahkan laporan.',
            ], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'narrative' => 'required|string',
            'photo_url' => 'nullable|string',
        ]);

        $report = $campaign->reports()->create($data);

        // Notifikasi untuk Admin (Ada laporan dampak baru)
        Notification::create([
            'target_role' => 'admin',
            'type' => 'report_created',
            'title' => '📊 Laporan Dampak Baru',
            'message' => "Sekolah {$campaign->school_name} mengunggah laporan dampak baru: '{$report->title}'.",
            'campaign_id' => $campaign->id,
        ]);

        return response()->json($report, 201);
    }
}
