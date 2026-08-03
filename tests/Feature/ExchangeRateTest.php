<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\ExchangeRateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeRateTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_fetch_khr_exchange_rate(): void
    {
        Http::fake([
            'open.er-api.com/*' => Http::response([
                'result' => 'success',
                'base_code' => 'USD',
                'rates' => ['KHR' => 4125.5, 'PHP' => 58.2, 'THB' => 36.5],
                'time_last_update_unix' => 1722700000,
            ], 200),
        ]);

        Cache::forget(ExchangeRateService::CACHE_KEY);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/exchange-rate?currency=KHR');

        $response->assertOk()
            ->assertJson([
                'base' => 'USD',
                'target' => 'KHR',
                'rate' => 4125.5,
                'source' => 'ExchangeRate-API',
                'is_fallback' => false,
            ])
            ->assertJsonStructure(['last_updated_at', 'rates']);
    }

    public function test_authenticated_user_can_fetch_php_exchange_rate(): void
    {
        Http::fake([
            'open.er-api.com/*' => Http::response([
                'rates' => ['KHR' => 4125.5, 'PHP' => 58.2, 'THB' => 36.5],
                'time_last_update_unix' => 1722700000,
            ], 200),
        ]);

        Cache::forget(ExchangeRateService::CACHE_KEY);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/exchange-rate?currency=PHP');

        $response->assertOk()
            ->assertJson([
                'base' => 'USD',
                'target' => 'PHP',
                'rate' => 58.2,
                'is_fallback' => false,
            ]);
    }

    public function test_exchange_rate_falls_back_when_api_fails(): void
    {
        Http::fake([
            'open.er-api.com/*' => Http::response([], 500),
        ]);

        Cache::forget(ExchangeRateService::CACHE_KEY);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/exchange-rate?currency=KHR');

        $response->assertOk()
            ->assertJson([
                'base' => 'USD',
                'target' => 'KHR',
                'rate' => 4100,
                'is_fallback' => true,
            ]);
    }

    public function test_exchange_rate_falls_back_to_php_fallback_rate(): void
    {
        Http::fake([
            'open.er-api.com/*' => Http::response([], 500),
        ]);

        Cache::forget(ExchangeRateService::CACHE_KEY);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/exchange-rate?currency=PHP');

        $response->assertOk()
            ->assertJson([
                'base' => 'USD',
                'target' => 'PHP',
                'rate' => 58.5,
                'is_fallback' => true,
            ]);
    }

    public function test_force_refresh_bypasses_cache(): void
    {
        Http::fake([
            'open.er-api.com/*' => Http::sequence()
                ->push(['rates' => ['KHR' => 4120, 'PHP' => 58.0], 'time_last_update_unix' => 1722700000], 200)
                ->push(['rates' => ['KHR' => 4135, 'PHP' => 58.9], 'time_last_update_unix' => 1722710000], 200),
        ]);

        Cache::forget(ExchangeRateService::CACHE_KEY);
        $user = User::factory()->create();

        // Initial fetch
        $res1 = $this->actingAs($user)->getJson('/api/exchange-rate?currency=KHR');
        $this->assertEquals(4120, $res1->json('rate'));

        // Second fetch without refresh (returns cached 4120)
        $res2 = $this->actingAs($user)->getJson('/api/exchange-rate?currency=KHR');
        $this->assertEquals(4120, $res2->json('rate'));

        // Third fetch with refresh=1 (bypasses cache and returns 4135)
        $res3 = $this->actingAs($user)->getJson('/api/exchange-rate?currency=KHR&refresh=1');
        $this->assertEquals(4135, $res3->json('rate'));
    }
}
