<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\School;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    // Publik: siapa saja bisa melihat daftar campaign (filter status/category, sort)
    public function index(Request $request)
    {
        $query = Campaign::query()->with('school');

        if ($request->user()?->role === 'admin') {
            $query->with('user:id,name,email,role,organization_name,phone');
        } else {
            $query->where('status', 'verified');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }
        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'LIKE', "%{$q}%")
                    ->orWhere('school_name', 'LIKE', "%{$q}%")
                    ->orWhere('location', 'LIKE', "%{$q}%");
            });
        }

        match ($request->query('sort')) {
            'newest' => $query->orderByDesc('created_at'),
            'progress' => $query->orderByRaw('(raised_amount * 1.0 / target_amount) DESC'),
            default => $query->orderByDesc('priority_score'),
        };

        $campaigns = $query->get();
        if ($request->user()?->role !== 'admin') {
            $campaigns->each(fn (Campaign $campaign) => $campaign->makeHidden('user_id'));
        }

        return response()->json($campaigns);
    }

    // School accounts must be verified; donors may submit on behalf of a school.
    public function store(Request $request)
    {
        $user = $request->user();
        $isSchool = $user->role === 'sekolah';

        $data = $request->validate([
            'school_id' => $isSchool ? 'nullable|exists:schools,id' : 'required|exists:schools,id',
            'npsn' => 'nullable|string|exists:schools,npsn',
            'school_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'rab_description' => $isSchool ? 'nullable|string' : 'required|string',
            'supporting_document' => $isSchool ? 'nullable|string|max:2048' : 'required|string|max:2048',
            'applicant_relationship' => $isSchool ? 'nullable|string|max:255' : 'required|string|max:255',
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

        if ($isSchool && $user->account_status !== 'verified') {
            return response()->json([
                'message' => 'Akun sekolah harus diverifikasi admin sebelum dapat mengajukan kebutuhan.',
            ], 403);
        }

        if ($isSchool) {
            $officialSchool = $user->school;
            if (!$officialSchool || $officialSchool->npsn !== $user->npsn) {
                return response()->json([
                    'message' => 'Data sekolah terverifikasi belum terhubung dengan akun ini.',
                ], 422);
            }
        } else {
            $officialSchool = School::find($data['school_id']);
        }

        if (!$officialSchool) {
            return response()->json(['message' => 'Sekolah yang dipilih tidak ditemukan.'], 422);
        }

        $data['school_id'] = $officialSchool->id;
        $data['school_name'] = $officialSchool->name;
        $data['location'] = "{$officialSchool->kecamatan}, {$officialSchool->kabupaten_kota}, {$officialSchool->provinsi}";
        $data['student_count'] = $data['student_count'] ?? $officialSchool->jumlah_siswa ?? 0;
        $data['remoteness'] = $officialSchool->is_3t ? 5 : ($data['remoteness'] ?? 3);
        $data['status'] = 'pending';
        unset($data['npsn']);
        $campaign = $user->campaigns()->create($data);

        Notification::create([
            'target_role' => 'admin',
            'type' => 'campaign_submitted',
            'title' => '📥 Pengajuan Campaign Baru',
            'message' => "{$user->name} mengajukan bantuan '{$campaign->title}' untuk {$campaign->school_name}. Silakan lakukan pemeriksaan.",
            'campaign_id' => $campaign->id,
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'campaign_submitted',
            'title' => '⏳ Pengajuan Berhasil Terkirim',
            'message' => "Pengajuan '{$campaign->title}' berhasil dikirim dan sedang menunggu pemeriksaan admin.",
            'campaign_id' => $campaign->id,
        ]);

        return response()->json($campaign->load(['school', 'user:id,name,organization_name']), 201);
    }

    // Daftar campaign milik sekolah yang sedang login (Dashboard Sekolah).
    public function mine(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'sekolah', 403);

        $campaigns = $user->campaigns()
            ->with('school')
            ->withCount(['donations', 'reports'])
            ->orderByDesc('created_at')
            ->get();

        $totalRaised = (int) $campaigns->sum('raised_amount');
        $totalTarget = (int) $campaigns->sum('target_amount');

        return response()->json([
            'campaigns' => $campaigns,
            'summary' => [
                'total_campaigns' => $campaigns->count(),
                'verified_campaigns' => $campaigns->where('status', 'verified')->count(),
                'pending_campaigns' => $campaigns->whereIn('status', ['pending', 'needs_revision'])->count(),
                'total_raised' => $totalRaised,
                'total_target' => $totalTarget,
                'total_donations' => (int) $campaigns->sum('donations_count'),
                'total_reports' => (int) $campaigns->sum('reports_count'),
            ],
        ]);
    }

    // Donors can only see their own submissions; admin decisions remain server-controlled.
    public function mySubmissions(Request $request)
    {
        $campaigns = $request->user()->campaigns()
            ->with('school')
            ->withCount(['donations', 'reports'])
            ->orderByDesc('created_at')
            ->paginate(10);

        $ownedCampaigns = $request->user()->campaigns();

        return response()->json([
            'campaigns' => $campaigns,
            'summary' => [
                'total_submissions' => (clone $ownedCampaigns)->count(),
                'pending' => (clone $ownedCampaigns)->where('status', 'pending')->count(),
                'needs_revision' => (clone $ownedCampaigns)->where('status', 'needs_revision')->count(),
                'approved' => (clone $ownedCampaigns)->where('status', 'verified')->count(),
                'rejected' => (clone $ownedCampaigns)->where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function show(Request $request, Campaign $campaign)
    {
        $user = $request->user();
        abort_unless(
            $campaign->status === 'verified' ||
                $user?->role === 'admin' ||
                $user?->id === $campaign->user_id,
            404,
        );

        $campaign->load('school');
        if ($user?->role === 'admin' || $user?->id === $campaign->user_id) {
            $campaign->load('user:id,name,email,role,organization_name,phone');
        } else {
            $campaign->makeHidden('user_id');
        }

        return response()->json($campaign);
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
        if ($user->role === 'sekolah' && $user->account_status !== 'verified') {
            return response()->json(['message' => 'Akun sekolah tidak aktif.'], 403);
        }
        if ($isOwner && !$isAdmin && !in_array($campaign->status, ['pending', 'needs_revision'], true)) {
            return response()->json([
                'message' => 'Pengajuan hanya dapat diubah saat menunggu pemeriksaan atau memerlukan perbaikan.',
            ], 403);
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
            'applicant_relationship' => 'sometimes|nullable|string|max:255',
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
            $rules['status'] = 'sometimes|in:pending,needs_revision,verified,rejected,completed,suspended';
            $rules['verification_note'] = 'sometimes|nullable|string';
        } else {
            unset($rules['school_name'], $rules['location']);
        }

        $data = $request->validate($rules);

        if (!$isAdmin) {
            unset($data['status']);
        }

        $oldStatus = $campaign->status;
        $oldPriorityScore = $campaign->priority_score;
        $oldValues = $campaign->only(array_keys($data));
        $campaign->update($data);

        if ($isAdmin && $data) {
            $scoreFields = ['urgency', 'facility_condition', 'remoteness', 'student_count', 'access_score'];
            if (array_intersect($scoreFields, array_keys($data))) {
                $oldValues['priority_score'] = $oldPriorityScore;
                $data['priority_score'] = $campaign->priority_score;
            }

            AuditLog::create([
                'actor_id' => $user->id,
                'action' => 'campaign_reviewed_or_updated',
                'subject_type' => Campaign::class,
                'subject_id' => $campaign->id,
                'old_values' => $oldValues,
                'new_values' => $data,
                'note' => $data['verification_note'] ?? null,
            ]);
        }

        // Notifikasi Perubahan Status dari Admin ke Sekolah
        if ($isAdmin && isset($data['status']) && $data['status'] !== $oldStatus) {
            if ($data['status'] === 'verified') {
                Notification::create([
                    'user_id' => $campaign->user_id,
                    'type' => 'campaign_verified',
                    'title' => '✅ Campaign Terverifikasi & Tayang!',
                    'message' => "Selamat! Permohonan bantuan '{$campaign->title}' telah disetujui Admin dan sekarang dipublikasikan.",
                    'campaign_id' => $campaign->id,
                ]);
            } elseif ($data['status'] === 'needs_revision') {
                Notification::create([
                    'user_id' => $campaign->user_id,
                    'type' => 'campaign_needs_revision',
                    'title' => '📝 Campaign Membutuhkan Perbaikan',
                    'message' => "Admin meminta perbaikan pada '{$campaign->title}'. Catatan: " . ($campaign->verification_note ?: 'Mohon periksa dokumen.'),
                    'campaign_id' => $campaign->id,
                ]);
            } elseif ($data['status'] === 'rejected') {
                Notification::create([
                    'user_id' => $campaign->user_id,
                    'type' => 'campaign_rejected',
                    'title' => '❌ Pengajuan Campaign Ditolak',
                    'message' => "Pengajuan '{$campaign->title}' ditolak oleh Admin. Catatan: " . ($campaign->verification_note ?: 'Persyaratan belum terpenuhi.'),
                    'campaign_id' => $campaign->id,
                ]);
            }
        }

        return response()->json($campaign->fresh()->load(['school', 'user:id,name,organization_name']));
    }

    // Hanya admin (dibatasi lewat middleware role:admin di routes/api.php)
    public function destroy(Campaign $campaign)
    {
        if ($campaign->donations()->exists()) {
            return response()->json([
                'message' => 'Campaign dengan transaksi donasi tidak dapat dihapus.',
            ], 422);
        }

        AuditLog::create([
            'actor_id' => request()->user()->id,
            'action' => 'campaign_deleted',
            'subject_type' => Campaign::class,
            'subject_id' => $campaign->id,
            'old_values' => ['status' => $campaign->status, 'title' => $campaign->title],
        ]);
        $campaign->delete();

        return response()->json(null, 204);
    }
}
