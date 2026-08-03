<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExchangeRateService;
use Illuminate\Http\Request;

class ExchangeRateController extends Controller
{
    public function show(Request $request, ExchangeRateService $service)
    {
        $targetCurrency = $request->input('currency', $request->input('target', 'KHR'));
        $forceRefresh = $request->boolean('refresh');
        $rateData = $service->getRate($targetCurrency, $forceRefresh);

        return response()->json($rateData);
    }
}
