<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Notifikasi yang boleh dilihat user:
     *  - notifikasi personal miliknya sendiri (user_id = user yang login), DAN
     *  - notifikasi broadcast untuk role-nya (target_role = role user).
     *
     * Scope ini dipakai konsisten oleh index(), unreadCount() dan markAllAsRead()
     * supaya user tidak bisa membaca / mengubah notifikasi milik user lain.
     */
    private function visibleQuery(Request $request)
    {
        $user = $request->user();

        return Notification::query()->where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('target_role', $user->role);
        });
    }

    public function index(Request $request)
    {
        $notifications = $this->visibleQuery($request)
            ->with('campaign')
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $count = $this->visibleQuery($request)->where('is_read', false)->count();

        return response()->json(['unread_count' => $count]);
    }

    public function markAsRead(Request $request, $id)
    {
        // whereIn scope: kalau notifikasi bukan milik user / role-nya, hasilnya null -> 404.
        $notification = $this->visibleQuery($request)
            ->whereKey($id)
            ->first();

        if (!$notification) {
            return response()->json([
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json($notification);
    }

    public function markAllAsRead(Request $request)
    {
        $this->visibleQuery($request)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Semua notifikasi telah ditandai dibaca.']);
    }
}