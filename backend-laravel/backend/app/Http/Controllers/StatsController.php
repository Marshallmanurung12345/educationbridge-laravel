<?php

namespace App\Http\Controllers;

use App\Models\Campaign;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'totalCampaigns' => Campaign::count(),
            'verifiedCampaigns' => Campaign::where('status', 'verified')->count(),
            'pendingCampaigns' => Campaign::where('status', 'pending')->count(),
            'totalRaised' => (int) Campaign::sum('raised_amount'),
            'totalStudents' => (int) Campaign::where('status', 'verified')->sum('student_count'),
        ]);
    }
}
