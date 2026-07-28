<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');

    Route::middleware(EnsureEmailIsVerified::class)->group(function () {
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/reports/monthly', [ReportController::class, 'monthly']);
        Route::apiResource('accounts', AccountController::class);
        Route::apiResource('budgets', BudgetController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('transactions', TransactionController::class);
    });
});
