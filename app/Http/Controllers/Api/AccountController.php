<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request) { return $request->user()->accounts()->latest()->get(); }
    public function store(Request $request) { $data = $this->validateData($request); $data['current_balance'] = $data['starting_balance'] ?? 0; return $request->user()->accounts()->create($data); }
    public function show(Request $request, string $id) { return $request->user()->accounts()->findOrFail($id); }
    public function update(Request $request, string $id) { $account = $request->user()->accounts()->findOrFail($id); $account->update($this->validateData($request, true)); return $account; }
    public function destroy(Request $request, string $id) { $request->user()->accounts()->findOrFail($id)->delete(); return response()->noContent(); }
    private function validateData(Request $request, bool $partial = false): array { $rule = $partial ? 'sometimes' : 'required'; return $request->validate(['name' => [$rule,'string','max:120'], 'type' => ['sometimes','string','max:40'], 'currency' => ['sometimes','string','size:3'], 'starting_balance' => ['sometimes','numeric','min:0']]); }
}