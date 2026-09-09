<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    // Publik: siapa saja bisa melihat daftar campaign (filter status/category, sort)
    public function index(Request $request)
    {
        $query = Campaign::query()->with('school:id,name,organization_name');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        match ($request->query('sort')) {
            'newest' => $query->orderByDesc('created_at'),
            'progress' => $query->orderByRaw('(raised_amount * 1.0 / target_amount) DESC'),
            default => $query->orderByDesc('priority_score'),
        };

        return response()->json($query->get());
    }

    // Hanya role "sekolah" (dibatasi lewat middleware role:sekolah di routes/api.php)
    public function store(Request $request)
    {
        $data = $request->validate([
            'school_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_amount' => 'required|integer|min:1',
            'student_count' => 'required|integer|min:0',
            'urgency' => 'required|integer|min:1|max:5',
            'facility_condition' => 'required|integer|min:1|max:5',
            'remoteness' => 'required|integer|min:1|max:5',
            'image_url' => 'nullable|string',
        ]);

        $campaign = $request->user()->campaigns()->create($data);

        return response()->json($campaign, 201);
    }

    public function show(Campaign $campaign)
    {
        return response()->json($campaign->load('school:id,name,organization_name'));
    }

    // Pemilik (sekolah) boleh edit data campaign miliknya; admin boleh ubah status verifikasi.
    public function update(Request $request, Campaign $campaign)
    {
        $user = $request->user();
        $isOwner = $user->id === $campaign->user_id;
        $isAdmin = $user->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'Anda tidak berhak mengubah campaign ini.'], 403);
        }

        $rules = [
            'school_name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:100',
            'tags' => 'sometimes|array',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'target_amount' => 'sometimes|integer|min:1',
            'student_count' => 'sometimes|integer|min:0',
            'urgency' => 'sometimes|integer|min:1|max:5',
            'facility_condition' => 'sometimes|integer|min:1|max:5',
            'remoteness' => 'sometimes|integer|min:1|max:5',
            'image_url' => 'nullable|string',
        ];

        if ($isAdmin) {
            $rules['status'] = 'sometimes|in:pending,verified,rejected';
        }

        $data = $request->validate($rules);

        if (!$isAdmin) {
            unset($data['status']);
        }

        $campaign->update($data);

        return response()->json($campaign->fresh());
    }

    // Hanya admin (dibatasi lewat middleware role:admin di routes/api.php)
    public function destroy(Campaign $campaign)
    {
        $campaign->delete();

        return response()->json(null, 204);
    }
}
