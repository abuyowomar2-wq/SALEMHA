<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $merchant = request()->user()->merchant;

        $products = Product::where('merchant_id', $merchant->id)
            ->withCount(['inventoryItems', 'availableItems'])
            ->latest()
            ->paginate(20);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'is_active' => true,
            ...$request->validated(),
        ]);

        return response()->json([
            'message' => 'تم إنشاء المنتج بنجاح',
            'product' => new ProductResource($product->loadCount(['inventoryItems', 'availableItems'])),
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        if ($product->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        return response()->json([
            'product' => new ProductResource($product->loadCount(['inventoryItems', 'availableItems'])),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        if ($product->merchant_id !== $request->user()->merchant->id) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        $product->update($request->validated());

        return response()->json([
            'message' => 'تم تحديث المنتج بنجاح',
            'product' => new ProductResource($product->loadCount(['inventoryItems', 'availableItems'])),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        $product->update(['is_active' => false]);

        return response()->json([
            'message' => 'تم تعطيل المنتج بنجاح',
        ]);
    }
}
