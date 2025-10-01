<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminStoreUserRequest;
use App\Http\Requests\AdminUpdateUserRequest;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): LengthAwarePaginator
    {

        return User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')
            ->orderByDesc('created_at')
            ->paginate(20);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(AdminStoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['role'] = $data['role'] ?? 'user';
        $data['is_active'] = $data['is_active'] ?? true;

        $user = User::create($data);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'data' => $user->only(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
        ], 201);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(AdminUpdateUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        if ($user->is($request->user()) && array_key_exists('role', $validated) && $validated['role'] !== $user->role) {
            return response()->json([
                'message' => 'No puedes cambiar tu propio rol mientras estás autenticado.',
            ], 422);
        }

        $user->fill($validated);
        $user->save();

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'data' => $user->only(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
        ]);
    }

    /**
     * Remove or deactivate the specified user from storage.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->is($request->user())) {
            return response()->json([
                'message' => 'No puedes eliminar tu propia cuenta desde esta acción.',
            ], 422);
        }

        if ($request->boolean('force')) {
            $user->tokens()->delete();
            $user->delete();

            return response()->json([
                'message' => 'Usuario eliminado permanentemente.',
            ]);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'El usuario ya se encuentra desactivado.',
            ], 200);
        }

        $user->is_active = false;
        $user->save();
        $user->tokens()->delete();
        return response()->json([
            'message' => 'Usuario desactivado correctamente.',
            'data' => $user->only(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
        ]);
    }
}
