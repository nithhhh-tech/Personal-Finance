<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request) { return $request->user()->categories()->latest()->get(); }
    public function store(Request $request) { return $request->user()->categories()->create($this->validateData($request)); }
    public function show(Request $request, string $id) { return $request->user()->categories()->findOrFail($id); }
    public function update(Request $request, string $id) { $category = $request->user()->categories()->findOrFail($id); $category->update($this->validateData($request, true)); return $category; }
    public function destroy(Request $request, string $id) { $request->user()->categories()->findOrFail($id)->delete(); return response()->noContent(); }
    private function validateData(Request $request, bool $partial = false): array { $rule = $partial ? 'sometimes' : 'required'; return $request->validate(['name' => [$rule,'string','max:120'], 'type' => [$rule,'in:income,expense'], 'icon' => ['nullable','string','max:40'], 'color' => ['sometimes','string','max:20']]); }
}
