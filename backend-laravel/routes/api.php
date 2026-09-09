<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\Route;

// ---------- AUTH ----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ---------- PUBLIC READS ----------
Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
Route::get('/campaigns/{campaign}/donations', [DonationController::class, 'index']);
Route::get('/campaigns/{campaign}/reports', [ReportController::class, 'index']);
Route::get('/match', [MatchController::class, 'index']);
Route::get('/stats', [StatsController::class, 'index']);

// ---------- PROTECTED (butuh login, Authorization: Bearer <token>) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Hanya role "sekolah" boleh mengajukan campaign
    Route::post('/campaigns', [CampaignController::class, 'store'])->middleware('role:sekolah');

    // Pemilik campaign ATAU admin (logika detail ada di controller)
    Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);

    // Hanya admin boleh menghapus campaign
    Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy'])->middleware('role:admin');

    // Hanya individu / perusahaan (CSR) / pemerintah boleh berdonasi
    Route::post('/campaigns/{campaign}/donations', [DonationController::class, 'store'])
        ->middleware('role:individu,perusahaan,pemerintah');

    // Laporan dampak hanya bisa dibuat oleh sekolah pemilik campaign (dicek di controller)
    Route::post('/campaigns/{campaign}/reports', [ReportController::class, 'store'])->middleware('role:sekolah');
});
