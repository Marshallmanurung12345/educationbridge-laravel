<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:120',
            'action' => 'nullable|string|max:100',
            'actor' => 'nullable|integer|exists:users,id',
            'from' => 'nullable|date_format:Y-m-d',
            'to' => 'nullable|date_format:Y-m-d|after_or_equal:from',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = AuditLog::query()->with('actor:id,name');
        if (! empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }
        if (! empty($filters['actor'])) {
            $query->where('actor_id', $filters['actor']);
        }
        if (! empty($filters['from'])) {
            $query->where('created_at', '>=', $filters['from'] . ' 00:00:00');
        }
        if (! empty($filters['to'])) {
            $query->where('created_at', '<', Carbon::parse($filters['to'])->addDay()->startOfDay());
        }
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('action', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%")
                    ->orWhere('subject_id', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%")
                    ->orWhereHas('actor', fn ($actor) => $actor->where('name', 'like', "%{$search}%"));
            });
        }

        $logs = $query->latest('created_at')
            ->latest('id')
            ->paginate($filters['per_page'] ?? 20);

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
            'filters' => [
                'actions' => AuditLog::query()->distinct()->orderBy('action')->pluck('action'),
                'actors' => User::query()
                    ->whereIn('id', AuditLog::query()->whereNotNull('actor_id')->select('actor_id')->distinct())
                    ->orderBy('name')
                    ->get(['id', 'name']),
            ],
        ]);
    }
}
