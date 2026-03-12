<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $user->load('profile.department', 'emergencyContact');

        $token = $user->createToken('hr-session')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user),
            'role'  => $user->getRoleNames()->first(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile.department', 'emergencyContact');
        return response()->json([
            'user' => new UserResource($user),
            'role' => $user->getRoleNames()->first(),
        ]);
    }
}
