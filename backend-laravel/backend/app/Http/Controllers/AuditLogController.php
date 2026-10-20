<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;

class AuditLogController extends Controller
{
    public function index()
    {
        return response()->json(
            AuditLog::query()
                ->with('actor:id,name')
                ->latest('created_at')
                ->limit(100)
                ->get(),
        );
    }
}
