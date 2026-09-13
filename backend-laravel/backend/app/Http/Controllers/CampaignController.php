<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\School;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    // Publik: siapa saja bisa melihat daftar campaign (filter status/category, sort)
    public function index(Request $request)
    {
        $query = Campaign::query()->with(['school', 'user:id,name,organization_name']);

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
        $user = $request->user();

        $data = $request->validate([
            'school_id' => 'nullable|exists:schools,id',
            'npsn' => 'nullable|string|exists:schools,npsn',
            'school_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'rab_description' => 'nullable|string',
            'supporting_document' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'target_amount' => 'required|integer|min:1',
            'student_count' => 'nullable|integer|min:0',
            'urgency' => 'required|integer|min:1|max:5',
            'facility_condition' => 'required|integer|min:1|max:5',
            'remoteness' => 'nullable|integer|min:1|max:5',
            'access_score' => 'required|integer|min:1|max:5',
            'image_url' => 'nullable|string',
        ]);

        $officialSchool = null;
        if (!empty($data['school_id'])) {
            $officialSchool = School::find($data['school_id']);
        } elseif (!empty($data['npsn'])) {
            $officialSchool = School::where('npsn', $data['npsn'])->first();
        } elseif ($user->school_id) {
            $officialSchool = $user->school;
        }

        if ($officialSchool) {
            $data['school_id'] = $officialSchool->id;
            $data['school_name'] = $officialSchool->name;
            $data['location'] = "{$officialSchool->kecamatan}, {$officialSchool->kabupaten_kota}, {$officialSchool->provinsi}";
            $data['student_count'] = $officialSchool->jumlah_siswa ?? ($data['student_count'] ?? 0);
            $data['remoteness'] = $officialSchool->is_3t ? 5 : ($data['remoteness'] ?? 3);
        } else {
            $data['school_name'] = $data['school_name'] ?? 'Sekolah';
            $data['location'] = $data['location'] ?? 'Indonesia';
        }

        $campaign = $user->campaigns()->create($data);

        return response()->json($campaign->load(['school', 'user:id,name,organization_name']), 201);
    }

    public function show(Campaign $campaign)
    {
        return response()->json($campaign->load(['school', 'user:id,name,organization_name']));
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
            'rab_description' => 'sometimes|nullable|string',
            'supporting_document' => 'sometimes|nullable|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'target_amount' => 'sometimes|integer|min:1',
            'student_count' => 'sometimes|integer|min:0',
            'urgency' => 'sometimes|integer|min:1|max:5',
            'facility_condition' => 'sometimes|integer|min:1|max:5',
            'remoteness' => 'sometimes|integer|min:1|max:5',
            'access_score' => 'sometimes|integer|min:1|max:5',
            'image_url' => 'nullable|string',
        ];

        if ($isAdmin) {
            $rules['status'] = 'sometimes|in:pending,needs_revision,verified,rejected';
            $rules['verification_note'] = 'sometimes|nullable|string';
        }

        $data = $request->validate($rules);

        if (!$isAdmin) {
            unset($data['status']);
        }

        $campaign->update($data);

        return response()->json($campaign->fresh()->load(['school', 'user:id,name,organization_name']));
    }

    // Hanya admin (dibatasi lewat middleware role:admin di routes/api.php)
    public function destroy(Campaign $campaign)
    {
        $campaign->delete();

        return response()->json(null, 204);
    }
}
