<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

Route::view('/{any?}', 'app')->where('any', '.*');
