<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\User;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'totalCampaigns' => Campaign::count(),
            'verifiedCampaigns' => Campaign::where('status', 'verified')->count(),
            'pendingCampaigns' => Campaign::where('status', 'pending')->count(),
            'totalRaised' => (int) Campaign::sum('raised_amount'),
            'totalStudents' => (int) Campaign::whereIn('status', ['verified', 'completed'])
                ->sum('student_count'),
        ]);
    }

    public function adminDashboard()
    {
        return response()->json([
            'pendingSchoolAccounts' => User::where('role', 'sekolah')
                ->where('account_status', 'pending_verification')
                ->count(),
            'pendingCampaigns' => Campaign::where('status', 'pending')->count(),
            'verifiedSchoolAccounts' => User::where('role', 'sekolah')
                ->where('account_status', 'verified')
                ->count(),
            'activeCampaigns' => Campaign::where('status', 'verified')->count(),
        ]);
    }
}
