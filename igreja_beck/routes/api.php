<?php

use App\Http\Controllers\MemberController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MinistryController;
use App\Http\Controllers\CellController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LessonController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::post('upload', [UploadController::class, 'upload']);

    Route::apiResource('members', MemberController::class);
    Route::get('transactions/report', [TransactionController::class, 'report']);
    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('events', EventController::class);

    // Ministries & Rosters
    Route::apiResource('ministries', MinistryController::class);
    Route::apiResource('cells', CellController::class);

    // Courses & Lessons
    Route::apiResource('courses', CourseController::class);
    Route::post('courses/{course}/students', [CourseController::class, 'enrollStudent']);
    Route::delete('courses/{course}/students/{member}', [CourseController::class, 'removeStudent']);
    Route::get('courses/{course}/lessons', [LessonController::class, 'index']);
    Route::post('courses/{course}/lessons', [LessonController::class, 'store']);
    Route::put('courses/{course}/lessons/{lesson}', [LessonController::class, 'update']);
    Route::delete('courses/{course}/lessons/{lesson}', [LessonController::class, 'destroy']);
    Route::post('courses/{course}/lessons/{lesson}/attendance', [LessonController::class, 'recordAttendance']);

    Route::post('ministries/{ministry}/generate-rosters', [MinistryController::class, 'generateRosters']);
});
