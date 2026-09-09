<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Contoh pemakaian di routes/api.php:
     *   ->middleware('role:sekolah')
     *   ->middleware('role:individu,perusahaan,pemerintah')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk melakukan aksi ini.',
            ], 403);
        }

        return $next($request);
    }
}
