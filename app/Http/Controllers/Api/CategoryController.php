<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /** Return all parent categories (top-level) with their subcategories eager-loaded */
    public function index(Request $request)
    {
        $hasParent = \Illuminate\Support\Facades\Schema::hasColumn('categories', 'parent_id');
        return $request->user()
            ->categories()
            ->when($hasParent, fn ($q) => $q->with('subcategories'))
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        return $request->user()->categories()->create($this->validateData($request));
    }

    public function show(Request $request, string $id)
    {
        $hasParent = \Illuminate\Support\Facades\Schema::hasColumn('categories', 'parent_id');
        return $request->user()->categories()->when($hasParent, fn ($q) => $q->with('subcategories'))->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $category = $request->user()->categories()->findOrFail($id);
        $category->update($this->validateData($request, true));
        $hasParent = \Illuminate\Support\Facades\Schema::hasColumn('categories', 'parent_id');
        return $hasParent ? $category->load('subcategories') : $category;
    }

    public function destroy(Request $request, string $id)
    {
        $request->user()->categories()->findOrFail($id)->delete();
        return response()->noContent();
    }

    public function seedDefaults(Request $request)
    {
        $user = $request->user();
        $defaults = [
            'Food' => [
                ['Breakfast', 2.00],
                ['Lunch', 3.50],
                ['Dinner', 5.00],
                ['Coffee', 1.50],
                ['Drinks', 1.00],
                ['Snacks', 1.50],
            ],
            'Transport' => [
                ['Fuel', 5.00],
                ['Grab', 4.00],
                ['Parking', 1.00],
                ['Maintenance', 15.00],
            ],
            'Bills' => [
                ['Internet', 25.00],
                ['Phone', 10.00],
                ['Electricity', 30.00],
                ['Water', 10.00],
            ],
            'Shopping' => [
                ['Clothes', 20.00],
                ['Electronics', 50.00],
                ['Personal items', 15.00],
            ],
        ];

        $createdCount = 0;
        foreach ($defaults as $parentName => $subItems) {
            $parent = $user->categories()->where('name', 'like', "%{$parentName}%")->whereNull('parent_id')->first();
            if (! $parent) {
                $parent = $user->categories()->create([
                    'name' => $parentName,
                    'type' => 'expense',
                    'color' => '#dc2626',
                ]);
            }
            foreach ($subItems as [$subName, $defaultAmount]) {
                $exists = $user->categories()->where('parent_id', $parent->id)->where('name', $subName)->exists();
                if (! $exists) {
                    $user->categories()->create([
                        'name' => $subName,
                        'type' => $parent->type,
                        'color' => $parent->color,
                        'parent_id' => $parent->id,
                        'default_amount' => $defaultAmount,
                    ]);
                    $createdCount++;
                }
            }
        }

        return response()->json(['message' => "Seeded {$createdCount} default sub-categories with 1-tap shortcut prices!"]);
    }

    private function validateData(Request $request, bool $partial = false): array
    {
        $rule = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'name'           => [$rule, 'string', 'max:120'],
            'type'           => [$rule, 'in:income,expense'],
            'icon'           => ['nullable', 'string', 'max:40'],
            'color'          => ['sometimes', 'string', 'max:20'],
            'parent_id'      => ['nullable', 'integer', 'exists:categories,id'],
            'default_amount' => ['nullable', 'numeric', 'gte:0'],
        ]);
    }
}
