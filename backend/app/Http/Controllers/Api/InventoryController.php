<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\BulkInventoryRequest;
use App\Http\Requests\Inventory\StoreInventoryRequest;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryItem;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Product $product): AnonymousResourceCollection|JsonResponse
    {
        if ($product->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        $items = InventoryItem::where('product_id', $product->id)
            ->latest()
            ->paginate(50);

        return InventoryItemResource::collection($items);
    }

    public function store(StoreInventoryRequest $request, Product $product): JsonResponse
    {
        if ($product->merchant_id !== $request->user()->merchant->id) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        $encrypted = app(InventoryService::class)->encryptItem($request->validated()['data']);

        $item = InventoryItem::create([
            'product_id' => $product->id,
            'data' => $encrypted,
            'status' => 'available',
        ]);

        return response()->json([
            'message' => 'تمت إضافة العنصر للمخزون بنجاح',
            'item' => new InventoryItemResource($item),
        ], 201);
    }

    public function bulk(BulkInventoryRequest $request, Product $product): JsonResponse
    {
        if ($product->merchant_id !== $request->user()->merchant->id) {
            return response()->json(['message' => 'المنتج غير موجود'], 404);
        }

        $service = app(InventoryService::class);

        if ($request->hasFile('csv_file')) {
            $lines = $service->parseCsv($request->file('csv_file')->getRealPath());
        } else {
            $lines = $service->parseTextLines($request->input('items'));
        }

        $count = 0;

        DB::transaction(function () use ($lines, $product, $service, &$count) {
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '') {
                    continue;
                }

                InventoryItem::create([
                    'product_id' => $product->id,
                    'data' => $service->encryptItem($line),
                    'status' => 'available',
                ]);

                $count++;
            }
        });

        return response()->json([
            'message' => "تمت إضافة {$count} عنصر للمخزون بنجاح",
            'count' => $count,
        ], 201);
    }

    public function update(StoreInventoryRequest $request, InventoryItem $inventoryItem): JsonResponse
    {
        $product = $inventoryItem->product;

        if ($product->merchant_id !== $request->user()->merchant->id) {
            return response()->json(['message' => 'العنصر غير موجود'], 404);
        }

        $encrypted = app(InventoryService::class)->encryptItem($request->validated()['data']);

        $inventoryItem->update(['data' => $encrypted]);

        return response()->json([
            'message' => 'تم تحديث العنصر بنجاح',
            'item' => new InventoryItemResource($inventoryItem),
        ]);
    }

    public function destroy(InventoryItem $inventoryItem): JsonResponse
    {
        $product = $inventoryItem->product;

        if ($product->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'العنصر غير موجود'], 404);
        }

        $inventoryItem->update(['status' => 'disabled']);

        return response()->json([
            'message' => 'تم تعطيل العنصر بنجاح',
        ]);
    }
}
