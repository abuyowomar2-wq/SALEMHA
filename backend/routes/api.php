<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ImportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Sallemha
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', fn () => response()->json(['status' => 'ok']));

/*
|--------------------------------------------------------------------------
| Auth Routes (Public)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

/*
|--------------------------------------------------------------------------
| Merchant Routes (Protected)
|--------------------------------------------------------------------------
*/
Route::prefix('merchant')->middleware(['auth:sanctum', 'merchant'])->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Inventory
    Route::get('/products/{product}/inventory', [InventoryController::class, 'index']);
    Route::post('/products/{product}/inventory', [InventoryController::class, 'store']);
    Route::post('/products/{product}/inventory/bulk', [InventoryController::class, 'bulk']);
    Route::put('/inventory/{inventoryItem}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{inventoryItem}', [InventoryController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::post('/orders/{order}/regenerate-link', [OrderController::class, 'regenerateLink']);
    Route::get('/orders/{order}/logs', [OrderController::class, 'logs']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

    // Settings
    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);

    // Customers
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Delivery Routes (Public)
|--------------------------------------------------------------------------
*/
Route::prefix('delivery')->group(function () {
    Route::get('/{slug}/{token}', [DeliveryController::class, 'show']);
    Route::post('/{slug}/{token}/verify', [DeliveryController::class, 'verify'])
        ->middleware('throttle:delivery-verify');
    Route::post('/{slug}/{token}/claim', [DeliveryController::class, 'claim']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Protected)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/merchants', [AdminController::class, 'merchants']);
    Route::get('/merchants/{merchant}', [AdminController::class, 'showMerchant']);
    Route::put('/merchants/{merchant}/status', [AdminController::class, 'updateMerchantStatus']);
    Route::get('/stats', [AdminController::class, 'stats']);
});
