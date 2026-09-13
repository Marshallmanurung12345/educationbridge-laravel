<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Notification::query()->with('campaign');

        if ($user->role === 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('target_role', 'admin');
            });
        } else {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('target_role', $user->role);
            });
        }

        $notifications = $query->orderByDesc('created_at')->limit(30)->get();

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $query = Notification::query()->where('is_read', false);

        if ($user->role === 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('target_role', 'admin');
            });
        } else {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('target_role', $user->role);
            });
        }

        return response()->json(['unread_count' => $query->count()]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = Notification::findOrFail($id);

        $notification->update(['is_read' => true]);

        return response()->json($notification);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $query = Notification::query()->where('is_read', false);

        if ($user->role === 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('target_role', 'admin');
            });
        } else {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('target_role', $user->role);
            });
        }

        $query->update(['is_read' => true]);

        return response()->json(['message' => 'Semua notifikasi telah ditandai dibaca.']);
    }
}