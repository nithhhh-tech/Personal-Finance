<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate(['name' => ['required','string','max:255'], 'email' => ['required','email','unique:users,email'], 'password' => ['required','min:8'], 'base_currency' => ['nullable','in:USD,KHR']]);
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

    private function createDefaultCategories(User $user): void
    {
        foreach ([['Salary','income','#5F8575'], ['Allowance','income','#D4A373'], ['Food','expense','#C15C3D'], ['Transport','expense','#BC6C25'], ['Bills','expense','#4E3629'], ['Shopping','expense','#E6A15C'], ['Savings','expense','#A59285']] as [$name, $type, $color]) {
            $user->categories()->create(['name' => $name, 'type' => $type, 'color' => $color]);
        }
    }
}

