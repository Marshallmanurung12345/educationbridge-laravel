<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Public registration is limited to schools and donors; admin accounts are provisioned separately.
    public function register(Request $request)
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:sekolah,individu',
            'organization_name' => 'required_if:role,sekolah|nullable|string|max:255',
            'npsn' => 'required_if:role,sekolah|nullable|digits:8',
            'phone' => 'required_if:role,sekolah|nullable|string|max:30',
        ]);

        $school = $data['role'] === 'sekolah'
            ? School::where('npsn', $data['npsn'])->first()
            : null;

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'organization_name' => $data['organization_name'] ?? null,
            'npsn' => $data['npsn'] ?? null,
            'school_id' => $school?->id,
            'phone' => $data['phone'] ?? null,
            'account_status' => $data['role'] === 'sekolah'
                ? 'pending_verification'
                : 'verified',
        ]);

        $token = $user->createToken('educationbridge')->plainTextToken;

        return response()->json(['user' => $user->load('school'), 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau kata sandi salah.'],
            ]);
        }

        $token = $user->createToken('educationbridge')->plainTextToken;

        return response()->json(['user' => $user->load('school'), 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('school'));
    }
}
