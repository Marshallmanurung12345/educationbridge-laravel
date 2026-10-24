<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SchoolAccountController extends Controller
{
    public function index()
    {
        return response()->json(
            User::query()
                ->with('school:id,name,npsn,provinsi,kabupaten_kota')
                ->where('role', 'sekolah')
                ->orderByRaw("CASE WHEN account_status = 'pending_verification' THEN 0 ELSE 1 END")
                ->orderBy('created_at')
                ->get([
                    'id',
                    'name',
                    'email',
                    'organization_name',
                    'npsn',
                    'phone',
                    'school_id',
                    'account_status',
                    'verification_note',
                    'created_at',
                ]),
        );
    }

    public function updateStatus(Request $request, User $user)
    {
        abort_unless($user->role === 'sekolah', 404);

        $data = $request->validate([
            'status' => ['required', Rule::in(['verified', 'revision_required', 'rejected', 'suspended'])],
            'note' => ['required_if:status,revision_required,rejected,suspended', 'nullable', 'string', 'max:2000'],
        ]);

        $officialSchool = School::where('npsn', $user->npsn)->first();
        if ($data['status'] === 'verified' && !$officialSchool) {
            return response()->json([
                'message' => 'NPSN belum ditemukan pada data sekolah resmi. Minta sekolah memperbaiki data sebelum verifikasi.',
            ], 422);
        }

        DB::transaction(function () use ($request, $user, $data, $officialSchool) {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
            $previous = [
                'account_status' => $lockedUser->account_status,
                'school_id' => $lockedUser->school_id,
                'verification_note' => $lockedUser->verification_note,
            ];
            $lockedUser->account_status = $data['status'];
            $lockedUser->verification_note = $data['note'] ?? null;
            if ($data['status'] === 'verified') {
                $lockedUser->school_id = $officialSchool->id;
            }
            $lockedUser->save();

            if ($previous['account_status'] !== $lockedUser->account_status ||
                $previous['school_id'] !== $lockedUser->school_id ||
                $previous['verification_note'] !== $lockedUser->verification_note) {
                AuditLog::create([
                    'actor_id' => $request->user()->id,
                    'action' => 'school_account_status_changed',
                    'subject_type' => User::class,
                    'subject_id' => $lockedUser->id,
                    'old_values' => $previous,
                    'new_values' => [
                        'account_status' => $lockedUser->account_status,
                        'school_id' => $lockedUser->school_id,
                        'verification_note' => $lockedUser->verification_note,
                    ],
                    'note' => $lockedUser->verification_note,
                ]);
            }
        });

        return response()->json($user->fresh()->load('school'));
    }

    public function updateOwnProfile(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'sekolah', 403);
        abort_unless(
            in_array($user->account_status, ['pending_verification', 'revision_required'], true),
            403,
            'Data hanya dapat diperbaiki saat akun menunggu verifikasi atau memerlukan perbaikan.',
        );

        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'organization_name' => 'required|string|max:255',
            'npsn' => 'required|digits:8',
            'phone' => 'required|string|max:30',
        ]);
        $data['email'] = strtolower(trim($data['email']));
        $school = School::where('npsn', $data['npsn'])->first();

        $user->fill([
            ...$data,
            'school_id' => $school?->id,
            'account_status' => 'pending_verification',
            'verification_note' => null,
        ])->save();

        return response()->json($user->fresh()->load('school'));
    }
}
