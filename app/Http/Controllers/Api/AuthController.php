<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate(['name' => ['required','string','max:255'], 'email' => ['required','email','unique:users,email'], 'password' => ['required','min:8'], 'base_currency' => ['nullable','string','size:3']]);
        $user = User::create($data);
        $this->createDefaultCategories($user);
        return response()->json(['user' => $user, 'token' => $user->createToken('api')->plainTextToken], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => ['required','email'], 'password' => ['required']]);
        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['The provided credentials are incorrect.']]);
        }
        return ['user' => $user, 'token' => $user->createToken('api')->plainTextToken];
    }

    public function me(Request $request) { return $request->user(); }
    public function logout(Request $request) { $request->user()->currentAccessToken()->delete(); return response()->noContent(); }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }

        return ['message' => __($status)];
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => Hash::make($password)])
                ->setRememberToken(Str::random(60));
            $user->save();
            $user->tokens()->delete();
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }

        return ['message' => __($status)];
    }

    private function createDefaultCategories(User $user): void
    {
        $defaults = [
            ['Salary', 'income', '#16a34a', []],
            ['Allowance', 'income', '#0d9488', []],
            ['Food', 'expense', '#dc2626', ['Breakfast', 'Lunch', 'Dinner', 'Coffee', 'Drinks', 'Snacks']],
            ['Transport', 'expense', '#ea580c', ['Fuel', 'Grab', 'Parking', 'Maintenance']],
            ['Bills', 'expense', '#7c3aed', ['Internet', 'Phone', 'Electricity', 'Water']],
            ['Shopping', 'expense', '#2563eb', ['Clothes', 'Electronics', 'Personal items']],
            ['Savings', 'expense', '#0891b2', []],
        ];

        foreach ($defaults as [$name, $type, $color, $subs]) {
            $parent = $user->categories()->create(['name' => $name, 'type' => $type, 'color' => $color]);
            foreach ($subs as $subName) {
                $user->categories()->create([
                    'name' => $subName,
                    'type' => $type,
                    'color' => $color,
                    'parent_id' => $parent->id,
                ]);
            }
        }
    }
}
