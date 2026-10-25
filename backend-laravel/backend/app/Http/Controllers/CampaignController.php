<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Campaign;
use App\Models\Notification;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class CampaignController extends Controller
{
    // Publik: siapa saja bisa melihat daftar campaign (filter status/category, sort)
    public function index(Request $request)
    {
        $isAdmin = $request->user()?->role === 'admin';
        $query = Campaign::query();

        if ($request->boolean('summary') && ! $isAdmin) {
            $query
                ->select([
                    'id',
                    'school_id',
                    'school_name',
                    'location',
                    'category',
                    'title',
                    'end_date',
                    'target_amount',
                    'raised_amount',
                    'student_count',
                    'urgency',
                    'image_url',
                    'status',
                    'priority_score',
                ])
                ->with('school:id,npsn,name,provinsi,kabupaten_kota,kecamatan,desa_kelurahan,jumlah_siswa,jumlah_guru,is_3t,status_3t_detail,data_source');
        } else {
            $query->with('school');
        }

        if ($isAdmin) {
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
        if (! $isAdmin) {
            $campaigns->each(fn (Campaign $campaign) => $campaign->makeHidden(['user_id', 'supporting_document']));
        }
        if ($request->boolean('summary') && ! $isAdmin) {
            $campaigns->each(fn (Campaign $campaign) => $campaign->makeHidden('priority_breakdown'));
        }

        return response()->json($campaigns);
    }

    // School accounts must be verified; donors may submit on behalf of a school.
    public function store(Request $request)
    {
        $user = $request->user();
        $isSchool = $user->role === 'sekolah';
        $officialSchool = $isSchool ? $user->school : null;
        $manualSchoolAccount = $isSchool && ! $officialSchool;

        if ($isSchool && $user->account_status !== 'verified') {
            return response()->json([
                'message' => 'Akun sekolah harus diverifikasi admin sebelum dapat mengajukan kebutuhan.',
            ], 403);
        }

        $data = $request->validate([
            'school_id' => 'nullable|integer|exists:schools,id',
            'school_npsn' => $manualSchoolAccount ? 'required|digits:8' : ($isSchool ? 'nullable|digits:8' : 'required_without:school_id|digits:8'),
            'school_jenjang' => $manualSchoolAccount ? 'required|string|max:100' : ($isSchool ? 'nullable|string|max:100' : 'required_without:school_id|string|max:100'),
            'school_name' => $manualSchoolAccount ? 'required|string|max:255' : ($isSchool ? 'nullable|string|max:255' : 'required_without:school_id|string|max:255'),
            'location' => $manualSchoolAccount ? 'required|string|max:255' : ($isSchool ? 'nullable|string|max:255' : 'required_without:school_id|string|max:255'),
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'rab_description' => $isSchool ? 'nullable|string' : 'required|string',
            'supporting_document' => $isSchool
                ? 'nullable|string|max:2048'
                : 'required_without:supporting_document_file|nullable|string|max:2048',
            'supporting_document_file' => [
                $isSchool ? 'nullable' : 'required_without:supporting_document',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'applicant_relationship' => $isSchool ? 'nullable|string|max:255' : 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'target_amount' => 'required|integer|min:1',
            'student_count' => 'nullable|integer|min:0',
            'urgency' => 'required|integer|min:1|max:5',
            'facility_condition' => 'required|integer|min:1|max:5',
            'remoteness' => 'nullable|integer|min:1|max:5',
            'access_score' => 'required|integer|min:1|max:5',
            'image_url' => 'nullable|string|max:2048',
            'image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($isSchool) {
            if ($officialSchool && $officialSchool->npsn !== $user->npsn) {
                return response()->json([
                    'message' => 'Data sekolah terverifikasi belum terhubung dengan akun ini.',
                ], 422);
            }
        } else {
            $officialSchool = ! empty($data['school_id'])
                ? School::find($data['school_id'])
                : School::where('npsn', $data['school_npsn'])->first();
        }

        if ($officialSchool) {
            $data['school_id'] = $officialSchool->id;
            $data['school_npsn'] = $officialSchool->npsn;
            $data['school_jenjang'] = $officialSchool->jenjang;
            $data['school_name'] = $officialSchool->name;
            $data['location'] = "{$officialSchool->kecamatan}, {$officialSchool->kabupaten_kota}, {$officialSchool->provinsi}";
        } elseif ($manualSchoolAccount) {
            $data['school_id'] = null;
            $data['school_npsn'] = $user->npsn;
            $data['school_name'] = $user->organization_name;
        } else {
            $data['school_id'] = null;
        }
        $data['student_count'] = $data['student_count'] ?? $officialSchool?->jumlah_siswa ?? 0;
        $data['remoteness'] = $officialSchool?->is_3t
            ? 5
            : ($data['remoteness'] ?? 3);
        $imageFile = $data['image_file'] ?? null;
        $proofFile = $data['supporting_document_file'] ?? null;
        unset($data['image_file'], $data['supporting_document_file']);
        $data['status'] = 'pending';

        $campaign = DB::transaction(function () use ($user, $data, $imageFile, $proofFile) {
            $campaign = $user->campaigns()->create($data);
            $storedPaths = [];

            try {
                if ($imageFile) {
                    $path = $imageFile->store('campaign-uploads', 'local');
                    if (! $path) {
                        throw new RuntimeException('Foto kebutuhan gagal disimpan.');
                    }
                    $storedPaths[] = $path;
                    $campaign->image_url = $path;
                }

                if ($proofFile) {
                    $path = $proofFile->store('campaign-uploads', 'local');
                    if (! $path) {
                        throw new RuntimeException('Foto bukti pendukung gagal disimpan.');
                    }
                    $storedPaths[] = $path;
                    $campaign->supporting_document = $path;
                }

                $campaign->save();
            } catch (\Throwable $exception) {
                Storage::disk('local')->delete($storedPaths);
                throw $exception;
            }

            return $campaign;
        });

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

        $campaign->makeHidden('supporting_document');

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
        $campaigns->each(fn (Campaign $campaign) => $campaign->makeHidden('supporting_document'));

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

    public function photo(Request $request, Campaign $campaign)
    {
        $user = $request->user();
        abort_unless(
            in_array($campaign->status, ['verified', 'completed'], true) ||
                $user?->role === 'admin' ||
                $user?->id === $campaign->user_id,
            404,
        );

        return $this->serveCampaignImage($campaign->getRawOriginal('image_url'));
    }

    public function proof(Request $request, Campaign $campaign)
    {
        abort_unless($request->user()?->role === 'admin', 404);

        return $this->serveCampaignImage($campaign->getRawOriginal('supporting_document'));
    }

    private function serveCampaignImage(?string $path)
    {
        abort_unless(
            Campaign::isUploadedImagePath($path) &&
                Storage::disk('local')->exists($path),
            404,
        );

        return response()->file(Storage::disk('local')->path($path), [
            'Cache-Control' => 'private, max-age=300',
            'X-Content-Type-Options' => 'nosniff',
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
        $campaigns->getCollection()->each(fn (Campaign $campaign) => $campaign->makeHidden('supporting_document'));

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
            in_array($campaign->status, ['verified', 'completed'], true) ||
                $user?->role === 'admin' ||
                $user?->id === $campaign->user_id,
            404,
        );

        $campaign->load('school');
        if ($user?->role === 'admin' || $user?->id === $campaign->user_id) {
            $campaign->load('user:id,name,email,role,organization_name,phone');
        }
        if ($user?->role !== 'admin') {
            $campaign->makeHidden(['user_id', 'supporting_document']);
        }

        return response()->json($campaign);
    }

    // Pemilik (sekolah) boleh edit data campaign miliknya; admin boleh ubah status verifikasi.
    public function update(Request $request, Campaign $campaign)
    {
        $user = $request->user();
        $isOwner = $user->id === $campaign->user_id;
        $isAdmin = $user->role === 'admin';

        if (! $isOwner && ! $isAdmin) {
            return response()->json(['message' => 'Anda tidak berhak mengubah campaign ini.'], 403);
        }
        if ($user->role === 'sekolah' && $user->account_status !== 'verified') {
            return response()->json(['message' => 'Akun sekolah tidak aktif.'], 403);
        }
        if ($isOwner && ! $isAdmin && ! in_array($campaign->status, ['pending', 'needs_revision'], true)) {
            return response()->json([
                'message' => 'Pengajuan hanya dapat diubah saat menunggu pemeriksaan atau memerlukan perbaikan.',
            ], 403);
        }

        $rules = [
            'school_npsn' => 'sometimes|digits:8',
            'school_jenjang' => 'sometimes|string|max:100',
            'school_name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:100',
            'tags' => 'sometimes|array',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'rab_description' => 'sometimes|nullable|string',
            'supporting_document' => 'sometimes|nullable|string',
            'supporting_document_file' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'applicant_relationship' => 'sometimes|nullable|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'target_amount' => 'sometimes|integer|min:1',
            'student_count' => 'sometimes|integer|min:0',
            'urgency' => 'sometimes|integer|min:1|max:5',
            'facility_condition' => 'sometimes|integer|min:1|max:5',
            'remoteness' => 'sometimes|integer|min:1|max:5',
            'access_score' => 'sometimes|integer|min:1|max:5',
            'image_url' => 'nullable|string|max:2048',
            'image_file' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];

        if ($isAdmin) {
            $rules['status'] = 'sometimes|in:pending,needs_revision,verified,rejected,completed,suspended';
            $rules['verification_note'] = 'sometimes|nullable|string';
        }

        $data = $request->validate($rules);
        $imageFile = $data['image_file'] ?? null;
        $proofFile = $data['supporting_document_file'] ?? null;
        unset($data['image_file'], $data['supporting_document_file']);

        if (! $isAdmin) {
            unset($data['status']);
        }

        $previousImage = $campaign->getRawOriginal('image_url');
        $previousProof = $campaign->getRawOriginal('supporting_document');
        $newPaths = [];

        try {
            if ($imageFile) {
                $path = $imageFile->store('campaign-uploads', 'local');
                if (! $path) {
                    throw new RuntimeException('Foto kebutuhan gagal disimpan.');
                }
                $newPaths[] = $path;
                $data['image_url'] = $path;
            }

            if ($proofFile) {
                $path = $proofFile->store('campaign-uploads', 'local');
                if (! $path) {
                    throw new RuntimeException('Foto bukti pendukung gagal disimpan.');
                }
                $newPaths[] = $path;
                $data['supporting_document'] = $path;
            }

            $oldStatus = DB::transaction(function () use ($campaign, $data, $isAdmin, $user) {
                $campaign = Campaign::query()->lockForUpdate()->findOrFail($campaign->id);
                $before = $campaign->only(array_unique([
                    ...array_keys($data),
                    'priority_score',
                ]));
                $campaign->update($data);

                if (! $isAdmin) {
                    return $before['status'] ?? null;
                }

                $auditFields = [
                    'status',
                    'verification_note',
                    'school_npsn',
                    'school_jenjang',
                    'school_name',
                    'location',
                    'title',
                    'category',
                    'target_amount',
                    'student_count',
                    'urgency',
                    'facility_condition',
                    'remoteness',
                    'access_score',
                    'priority_score',
                ];
                $changedFields = array_values(array_filter(
                    array_intersect($auditFields, array_unique([...array_keys($data), 'priority_score'])),
                    fn ($field) => ($before[$field] ?? null) != $campaign->getAttribute($field),
                ));

                if ($changedFields === []) {
                    return $before['status'] ?? null;
                }

                $oldValues = array_intersect_key($before, array_flip($changedFields));
                $newValues = array_intersect_key($campaign->getAttributes(), array_flip($changedFields));
                $status = $campaign->status;
                $action = match (true) {
                    in_array('status', $changedFields, true) && $status === 'verified' => 'campaign_approved',
                    in_array('status', $changedFields, true) && $status === 'rejected' => 'campaign_rejected',
                    in_array('status', $changedFields, true) && $status === 'needs_revision' => 'campaign_revision_requested',
                    in_array('status', $changedFields, true) && $status === 'suspended' => 'campaign_suspended',
                    in_array('status', $changedFields, true) && $status === 'completed' => 'campaign_completed',
                    in_array('priority_score', $changedFields, true) => 'campaign_priority_updated',
                    default => 'campaign_updated',
                };

                AuditLog::create([
                    'actor_id' => $user->id,
                    'action' => $action,
                    'subject_type' => Campaign::class,
                    'subject_id' => $campaign->id,
                    'old_values' => $oldValues,
                    'new_values' => $newValues,
                    'note' => in_array('verification_note', $changedFields, true)
                        ? $campaign->verification_note
                        : null,
                ]);

                return $before['status'] ?? null;
            });
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($newPaths);
            throw $exception;
        }

        $replacedPaths = [];
        if ($imageFile && Campaign::isUploadedImagePath($previousImage)) {
            $replacedPaths[] = $previousImage;
        }
        if ($proofFile && Campaign::isUploadedImagePath($previousProof)) {
            $replacedPaths[] = $previousProof;
        }
        if ($replacedPaths !== []) {
            Storage::disk('local')->delete($replacedPaths);
        }
        $campaign = $campaign->fresh();

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
                    'message' => "Admin meminta perbaikan pada '{$campaign->title}'. Catatan: ".($campaign->verification_note ?: 'Mohon periksa dokumen.'),
                    'campaign_id' => $campaign->id,
                ]);
            } elseif ($data['status'] === 'rejected') {
                Notification::create([
                    'user_id' => $campaign->user_id,
                    'type' => 'campaign_rejected',
                    'title' => '❌ Pengajuan Campaign Ditolak',
                    'message' => "Pengajuan '{$campaign->title}' ditolak oleh Admin. Catatan: ".($campaign->verification_note ?: 'Persyaratan belum terpenuhi.'),
                    'campaign_id' => $campaign->id,
                ]);
            }
        }

        $campaign = $campaign->fresh()->load(['school', 'user:id,name,organization_name']);
        if (! $isAdmin) {
            $campaign->makeHidden('supporting_document');
        }

        return response()->json($campaign);
    }

    // Hanya admin (dibatasi lewat middleware role:admin di routes/api.php)
    public function destroy(Campaign $campaign)
    {
        if ($campaign->donations()->exists()) {
            return response()->json([
                'message' => 'Campaign dengan transaksi donasi tidak dapat dihapus.',
            ], 422);
        }

        $uploadedPaths = array_filter([
            $campaign->getRawOriginal('image_url'),
            $campaign->getRawOriginal('supporting_document'),
        ], fn ($path) => Campaign::isUploadedImagePath($path));

        DB::transaction(function () use ($campaign) {
            $before = ['status' => $campaign->status, 'title' => $campaign->title];
            $campaign->delete();

            AuditLog::create([
                'actor_id' => request()->user()->id,
                'action' => 'campaign_deleted',
                'subject_type' => Campaign::class,
                'subject_id' => $campaign->id,
                'old_values' => $before,
            ]);
        });

        if ($uploadedPaths !== []) {
            Storage::disk('local')->delete($uploadedPaths);
        }

        return response()->json(null, 204);
    }
}
