<?php

namespace App\Services;

use App\Models\DeliveryLog;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SallaService
{
    public function fetchOrders(string $apiKey, string $storeUrl): array
    {
        $baseUrl = rtrim($storeUrl, '/');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->timeout(30)->get($baseUrl . '/api/v1/orders', [
                'status' => 'paid',
                'per_page' => 50,
            ]);

            if (! $response->successful()) {
                Log::warning('Salla API failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return ['error' => 'فشل الاتصال بمتجر سلة. تأكد من صحة المفتاح والرابط.'];
            }

            $data = $response->json();
            $orders = $data['data'] ?? [];

            return ['orders' => $orders, 'total' => $data['meta']['total'] ?? 0];
        } catch (\Exception $e) {
            Log::error('Salla API exception', ['message' => $e->getMessage()]);
            return ['error' => 'حدث خطأ في الاتصال بسلة.'];
        }
    }

    public function importOrders(array $sallaOrders, int $merchantId): array
    {
        $imported = 0;
        $skipped = 0;

        foreach ($sallaOrders as $sallaOrder) {
            $orderNumber = $sallaOrder['id'] ?? $sallaOrder['reference_id'] ?? null;
            $customerName = $sallaOrder['customer']['name'] ?? 'عميل سلة';
            $customerPhone = $sallaOrder['customer']['mobile'] ?? '';

            if (! $orderNumber) {
                $skipped++;
                continue;
            }

            $exists = Order::where('merchant_id', $merchantId)
                ->where('order_number', (string) $orderNumber)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            $order = Order::create([
                'merchant_id' => $merchantId,
                'order_number' => (string) $orderNumber,
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'customer_email' => $sallaOrder['customer']['email'] ?? null,
                'status' => 'pending',
                'delivery_status' => 'not_sent',
                'notes' => 'مستورد من سلة',
            ]);

            $deliveryService = app(DeliveryService::class);
            $deliveryService->createDeliveryLink($order);

            DeliveryLog::create([
                'order_id' => $order->id,
                'event' => 'link_created',
                'details' => ['source' => 'salla_import', 'salla_order_id' => $orderNumber, 'token_hash' => substr($order->deliveryLink->token_hash ?? '', 0, 16)],
            ]);

            $imported++;
        }

        return ['imported' => $imported, 'skipped' => $skipped];
    }
}
