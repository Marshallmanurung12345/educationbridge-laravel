<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Report;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function index()
    {
        return response()->json(
            Report::query()
                ->with('campaign:id,title,school_name,status')
                ->latest('created_at')
                ->get(),
        );
    }

    public function destroy(Report $report)
    {
        DB::transaction(function () use ($report) {
            AuditLog::create([
                'actor_id' => request()->user()->id,
                'action' => 'report_deleted',
                'subject_type' => Report::class,
                'subject_id' => $report->id,
                'old_values' => [
                    'campaign_id' => $report->campaign_id,
                    'title' => $report->title,
                ],
                'created_at' => now(),
            ]);

            $report->delete();
        });

        return response()->noContent();
    }
}
