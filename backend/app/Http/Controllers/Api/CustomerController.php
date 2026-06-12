<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $merchant = request()->user()->merchant;

        $customers = Customer::where('merchant_id', $merchant->id)
            ->latest()
            ->paginate(30);

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        $customer = Customer::create([
            'merchant_id' => $merchant->id,
            ...$request->validated(),
        ]);

        return response()->json([
            'message' => 'تم إضافة العميل بنجاح',
            'customer' => new CustomerResource($customer),
        ], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        if ($customer->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'العميل غير موجود'], 404);
        }

        return response()->json([
            'customer' => new CustomerResource($customer),
        ]);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        if ($customer->merchant_id !== $request->user()->merchant->id) {
            return response()->json(['message' => 'العميل غير موجود'], 404);
        }

        $customer->update($request->only(['name', 'phone', 'email', 'notes']));

        return response()->json([
            'message' => 'تم تحديث العميل بنجاح',
            'customer' => new CustomerResource($customer),
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        if ($customer->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'العميل غير موجود'], 404);
        }

        $customer->delete();

        return response()->json(['message' => 'تم حذف العميل']);
    }
}
