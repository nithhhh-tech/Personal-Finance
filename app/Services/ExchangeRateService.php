<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateService
{
    public const CACHE_KEY = 'exchange_rates_usd_all';
    public const API_URL = 'https://open.er-api.com/v6/latest/USD';
    public const CACHE_TTL_HOURS = 6;

    public const FALLBACK_RATES = [
        'USD' => 1.0,
        'KHR' => 4100.0,
        'PHP' => 58.5,
        'VND' => 25400.0,
        'EUR' => 0.92,
        'GBP' => 0.78,
        'JPY' => 155.0,
        'CNY' => 7.25,
        'SGD' => 1.35,
        'AUD' => 1.52,
        'CAD' => 1.38,
    ];

    public function getRate(string $targetCurrency = 'KHR', bool $forceRefresh = false): array
    {
        $targetCurrency = strtoupper(trim($targetCurrency));

        if ($forceRefresh) {
            Cache::forget(self::CACHE_KEY);
            Cache::forget('exchange_rate_usd_khr');
        }

        $rateData = Cache::remember(self::CACHE_KEY, now()->addHours(self::CACHE_TTL_HOURS), function () {
            return $this->fetchFromApi();
        });

        $rates = $rateData['rates'] ?? [];
        $rate = $rates[$targetCurrency] ?? self::FALLBACK_RATES[$targetCurrency] ?? 1.0;

        return [
            'base' => 'USD',
            'target' => $targetCurrency,
            'rate' => (float) $rate,
            'rates' => $rates,
            'last_updated_at' => $rateData['last_updated_at'] ?? now()->toIso8601String(),
            'source' => $rateData['source'] ?? 'Fallback (Default Rate)',
            'is_fallback' => $rateData['is_fallback'] ?? true,
        ];
    }

    public function getUsdToKhrRate(bool $forceRefresh = false): array
    {
        return $this->getRate('KHR', $forceRefresh);
    }

    private function fetchFromApi(): array
    {
        try {
            $response = Http::timeout(5)->get(self::API_URL);

            if ($response->successful()) {
                $data = $response->json();
                $rates = $data['rates'] ?? [];

                if (!empty($rates) && is_array($rates)) {
                    $lastUpdated = isset($data['time_last_update_unix'])
                        ? date('c', $data['time_last_update_unix'])
                        : now()->toIso8601String();

                    return [
                        'rates' => $rates,
                        'last_updated_at' => $lastUpdated,
                        'source' => 'ExchangeRate-API',
                        'is_fallback' => false,
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('ExchangeRate API fetch failed: ' . $e->getMessage());
        }

        return [
            'rates' => self::FALLBACK_RATES,
            'last_updated_at' => now()->toIso8601String(),
            'source' => 'Fallback (Default Rate)',
            'is_fallback' => true,
        ];
    }
}
