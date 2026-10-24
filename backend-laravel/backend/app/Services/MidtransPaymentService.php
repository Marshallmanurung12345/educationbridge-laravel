<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MidtransPaymentService
{
    public function isConfigured(): bool
    {
        return filled(config('services.midtrans.server_key'));
    }

    /**
     * @throws ConnectionException
     */
    public function createSnapTransaction(Donation $donation, Campaign $campaign, User $user): array
    {
        $payload = [
            'transaction_details' => [
                'order_id' => $donation->order_id,
                'gross_amount' => (int) $donation->amount,
            ],
            'item_details' => [[
                'id' => (string) $campaign->id,
                'price' => (int) $donation->amount,
                'quantity' => 1,
                'name' => mb_substr($campaign->title, 0, 50),
            ]],
            'customer_details' => [
                'first_name' => mb_substr($user->name, 0, 50),
                'email' => $user->email,
            ],
        ];

        if (filled(config('services.midtrans.finish_url'))) {
            $payload['callbacks'] = ['finish' => config('services.midtrans.finish_url')];
        }

        $client = $this->client();
        $notificationUrl = config('services.midtrans.notification_url');
        if (filled($notificationUrl)) {
            $client = $client->withHeaders([
                'X-Override-Notification' => $notificationUrl,
            ]);
        }

        $response = $client->post($this->snapBaseUrl() . '/snap/v1/transactions', $payload);

        $redirectUrl = $response->json('redirect_url');
        if (! $response->successful() || ! is_string($redirectUrl) || ! filter_var($redirectUrl, FILTER_VALIDATE_URL)) {
            Log::warning('Midtrans Snap transaction creation failed.', [
                'order_id' => $donation->order_id,
                'http_status' => $response->status(),
            ]);

            throw new RuntimeException('Pembayaran belum dapat dibuat. Silakan coba kembali.');
        }

        return [
            'redirect_url' => $redirectUrl,
            'transaction_token' => $response->json('token'),
        ];
    }

    /**
     * @throws ConnectionException
     */
    public function getTransactionStatus(string $orderId): array
    {
        $response = $this->client()
            ->get($this->apiBaseUrl() . '/v2/' . rawurlencode($orderId) . '/status');

        if (! $response->successful() || ! is_array($response->json())) {
            Log::warning('Midtrans status lookup failed.', [
                'order_id' => $orderId,
                'http_status' => $response->status(),
            ]);

            throw new RuntimeException('Status pembayaran belum dapat diperiksa. Silakan coba lagi.');
        }

        return $response->json();
    }

    public function isAuthenticNotification(array $payload): bool
    {
        $serverKey = config('services.midtrans.server_key');
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signature = $payload['signature_key'] ?? null;

        if (! is_string($serverKey) || $serverKey === '' ||
            ! is_string($orderId) || ! is_string($statusCode) ||
            ! is_string($grossAmount) || ! is_string($signature)) {
            return false;
        }

        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return hash_equals($expected, $signature);
    }

    private function client()
    {
        return Http::acceptJson()
            ->asJson()
            ->withBasicAuth((string) config('services.midtrans.server_key'), '')
            ->timeout(15);
    }

    private function snapBaseUrl(): string
    {
        return config('services.midtrans.is_production')
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    private function apiBaseUrl(): string
    {
        return config('services.midtrans.is_production')
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }
}
