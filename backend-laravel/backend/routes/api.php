<?php

use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SchoolAccountController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\Route;

// ---------- AUTH ----------
// throttle:auth -> maksimal 5 percobaan / menit (lihat AppServiceProvider).
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

// ---------- PUBLIC READS ----------
Route::get('/schools', [SchoolController::class, 'index']);
Route::get('/schools/{npsn}', [SchoolController::class, 'show']);
Route::get('/regions/{level}/{parentCode?}', [RegionController::class, 'index']);
Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
Route::get('/campaigns/{campaign}/donations', [DonationController::class, 'index']);
Route::get('/campaigns/{campaign}/reports', [ReportController::class, 'index']);
Route::get('/match', [MatchController::class, 'index']);
Route::get('/stats', [StatsController::class, 'index']);
Route::post('/payments/midtrans/notification', [DonationController::class, 'handleMidtransNotification']);

// ---------- PROTECTED (butuh login, Authorization: Bearer <token>) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::put('/school-account', [SchoolAccountController::class, 'updateOwnProfile']);
    Route::get('/admin/school-accounts', [SchoolAccountController::class, 'index'])->middleware('role:admin');
    Route::get('/admin/stats', [StatsController::class, 'adminDashboard'])->middleware('role:admin');
    Route::put('/admin/school-accounts/{user}/status', [SchoolAccountController::class, 'updateStatus'])->middleware('role:admin');
    Route::get('/admin/audit-logs', [AuditLogController::class, 'index'])->middleware('role:admin');
    Route::get('/admin/reports', [AdminReportController::class, 'index'])->middleware('role:admin');
    Route::delete('/admin/reports/{report}', [AdminReportController::class, 'destroy'])->middleware('role:admin');

    // Schools and donors may submit campaigns for admin review.
    Route::post('/campaigns', [CampaignController::class, 'store'])->middleware('role:sekolah,individu,perusahaan,pemerintah');

    // Daftar campaign milik sekolah yang sedang login (Dashboard Sekolah)
    Route::get('/my-campaigns', [CampaignController::class, 'mine'])->middleware('role:sekolah');

    // Daftar pengajuan milik donatur yang sedang login.
    Route::get('/my-submissions', [CampaignController::class, 'mySubmissions'])
        ->middleware('role:individu,perusahaan,pemerintah');

    // Pemilik campaign ATAU admin (logika detail ada di controller)
    Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);

    // Hanya admin boleh menghapus campaign
    Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy'])->middleware('role:admin');

    // Hanya individu / perusahaan (CSR) / pemerintah boleh berdonasi
    Route::post('/campaigns/{campaign}/donations', [DonationController::class, 'store'])
        ->middleware('role:individu,perusahaan,pemerintah');

    // Riwayat donasi milik sendiri (semua role donatur)
    Route::get('/my-donations', [DonationController::class, 'mine'])
        ->middleware('role:individu,perusahaan,pemerintah');
    Route::get('/my-donations/status/{orderId}', [DonationController::class, 'refreshMine'])
        ->middleware('role:individu,perusahaan,pemerintah');

    // The owner may report progress for an active campaign.
    Route::post('/campaigns/{campaign}/reports', [ReportController::class, 'store'])->middleware('role:sekolah,individu,perusahaan,pemerintah');

    // Notifikasi Sistem
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});
