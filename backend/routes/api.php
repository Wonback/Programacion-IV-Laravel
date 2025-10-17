<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| Rutas API
|--------------------------------------------------------------------------
| Todas las rutas de tu API deben empezar con /api/
| Laravel agrega automáticamente el prefijo /api a todo lo que está acá.
*/

// Auth públicas
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Eventos públicos
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-events', [EventController::class, 'myEvents']);
});


// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Usuario autenticado
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Solo administradores
    Route::middleware('admin')->group(function () {
        // Eventos
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
        Route::middleware('auth:sanctum')->group(function () {
            // Listar tickets de un evento (solo para el dueño)
            Route::get('/events/{eventId}/orders', [OrderController::class, 'ordersByEvent']);
        });

        // Usuarios
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::post('/admin/users', [UserController::class, 'store']);
        Route::put('/admin/users/{user}', [UserController::class, 'update']);
        Route::patch('/admin/users/{user}', [UserController::class, 'update']);
        Route::delete('/admin/users/{user}', [UserController::class, 'destroy']);
    });

    // Compras
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/orders/validate', [OrderController::class, 'validateQR']);
    });
    

});
