<?php

namespace App\Services;

use App\Models\DeliveryAttempt;
use App\Models\DeliveryLink;
use App\Models\DeliveryLog;
use App\Models\InventoryItem;
use App\Models\Order;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class DeliveryService
{
    public function createDeliveryLink(Order $order): array
    {
        if ($order->delivery_status === 'product_viewed') {
            return ['error' => 'تم تسليم هذا الطلب مسبقًا. لا يمكن إنشاء رابط جديد تلقائيًا.'];
        }

        $rawToken = DeliveryLink::generateToken();
        $tokenHash = DeliveryLink::hashToken($rawToken);

        $existing = DeliveryLink::where('order_id', $order->id)->first();

        if ($existing) {
            $existing->update([
                'token_hash' => $tokenHash,
                'is_active' => true,
                'expires_at' => null,
            ]);

            $order->update(['delivery_status' => 'sent']);

            DeliveryLog::create([
                'order_id' => $order->id,
                'event' => 'link_resent',
                'details' => ['token_hash' => substr($tokenHash, 0, 16) . '...'],
            ]);

            return ['link' => $existing, 'raw_token' => $rawToken];
        }

        $link = DeliveryLink::create([
            'order_id' => $order->id,
            'token_hash' => $tokenHash,
            'is_active' => true,
        ]);

        $order->update(['delivery_status' => 'sent']);

        DeliveryLog::create([
            'order_id' => $order->id,
            'event' => 'link_created',
            'details' => ['token_hash' => substr($tokenHash, 0, 16) . '...'],
        ]);

        return ['link' => $link, 'raw_token' => $rawToken];
    }

    public function verifyDelivery(DeliveryLink $link, string $orderNumber, string $customerPhone): array
    {
        $order = $link->order;

        $this->recordAttempt($link, [
            'order_number' => $orderNumber,
            'phone_masked' => $this->maskPhone($customerPhone),
        ], false);

        if (! $link->is_active) {
            return ['success' => false, 'message' => 'الرابط غير نشط'];
        }

        if ($link->expires_at && $link->expires_at->isPast()) {
            return ['success' => false, 'message' => 'انتهت صلاحية الرابط'];
        }

        if ($order->status === 'cancelled') {
            return ['success' => false, 'message' => 'الطلب ملغي'];
        }

        if ($order->delivery_status === 'product_viewed') {
            return ['success' => false, 'message' => 'تم استلام المنتج مسبقًا'];
        }

        $failedAttempts = DeliveryAttempt::where('delivery_link_id', $link->id)
            ->where('success', false)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count();

        if ($failedAttempts >= 3) {
            return ['success' => false, 'message' => 'تم تجاوز عدد المحاولات. حاول مرة أخرى بعد 5 دقائق'];
        }

        if ($order->order_number !== $orderNumber || $order->customer_phone !== $customerPhone) {
            return ['success' => false, 'message' => 'بيانات التحقق غير صحيحة'];
        }

        $this->recordAttempt($link, [
            'order_number' => $orderNumber,
            'phone_masked' => $this->maskPhone($customerPhone),
        ], true, true);

        if (! in_array($order->delivery_status, ['opened', 'verified'])) {
            $order->update(['delivery_status' => 'verified']);
            DeliveryLog::create([
                'order_id' => $order->id,
                'event' => 'verification_success',
            ]);
        }

        $sessionToken = bin2hex(random_bytes(32));
        cache()->put("delivery_session:{$sessionToken}", [
            'order_id' => $order->id,
            'delivery_link_id' => $link->id,
            'ip' => request()->ip(),
            'user_agent' => md5(request()->userAgent() ?? ''),
        ], now()->addMinutes(10));

        return [
            'success' => true,
            'message' => 'تم التحقق بنجاح',
            'session_token' => $sessionToken,
        ];
    }

    public function claimProduct(Order $order, string $sessionToken): array
    {
        if ($order->delivery_status === 'product_viewed') {
            return ['success' => false, 'message' => 'تم استلام المنتج مسبقًا'];
        }

        if (! $order->product_id) {
            return ['success' => false, 'message' => 'الطلب لا يحتوي على منتج'];
        }

        $sessionData = cache()->get("delivery_session:{$sessionToken}");

        if (! $sessionData) {
            return ['success' => false, 'message' => 'انتهت الجلسة. يرجى التحقق مرة أخرى'];
        }

        if ($sessionData['order_id'] != $order->id) {
            return ['success' => false, 'message' => 'انتهت الجلسة. يرجى التحقق مرة أخرى'];
        }

        if ($sessionData['ip'] !== request()->ip()) {
            return ['success' => false, 'message' => 'انتهت الجلسة. يرجى التحقق مرة أخرى'];
        }

        $productData = DB::transaction(function () use ($order) {
            $item = InventoryItem::where('product_id', $order->product_id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->first();

            if (! $item) {
                throw new \RuntimeException('نفذ المخزون');
            }

            $item->update([
                'status' => 'used',
                'order_id' => $order->id,
                'used_at' => now(),
            ]);

            $order->update(['delivery_status' => 'product_viewed']);

            DeliveryLog::create([
                'order_id' => $order->id,
                'event' => 'product_viewed',
                'details' => ['item_id' => $item->id],
            ]);

            return Crypt::decryptString($item->data);
        });

        cache()->forget("delivery_session:{$sessionToken}");

        return [
            'success' => true,
            'product_name' => $order->product->name,
            'product_type' => $order->product->type,
            'data' => $productData,
            'instructions' => $order->product->instructions,
        ];
    }

    private function maskPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        $len = strlen($phone);

        if ($len <= 4) {
            return str_repeat('*', $len);
        }

        return substr($phone, 0, 2) . str_repeat('*', $len - 4) . substr($phone, -2);
    }

    private function recordAttempt(DeliveryLink $link, array $input, bool $success, bool $replace = false): void
    {
        if ($replace) {
            DeliveryAttempt::where('delivery_link_id', $link->id)
                ->where('created_at', '>=', now()->subMinutes(1))
                ->delete();
        }

        DeliveryAttempt::create([
            'delivery_link_id' => $link->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'input_data' => $input,
            'success' => $success,
            'failure_reason' => $success ? null : 'بيانات التحقق غير متطابقة',
        ]);
    }
}
