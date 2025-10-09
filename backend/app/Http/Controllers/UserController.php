<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Users",
 *     description="Operaciones de administración de usuarios"
 * )
 */
class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/users",
     *     tags={"Users"},
     *     summary="Listar usuarios",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Listado de usuarios")
     * )
     */
    public function index()
    {
        return User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')
            ->orderByDesc('created_at')
            ->paginate(20);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/users",
     *     tags={"Users"},
     *     summary="Crear usuario",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="role", type="string"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Usuario creado")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['role'] = $data['role'] ?? 'user';
        $data['is_active'] = $data['is_active'] ?? true;

        $user = User::create($data);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'data' => $user->only(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/admin/users/{user}",
     *     tags={"Users"},
     *     summary="Actualizar usuario",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="role", type="string"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Usuario actualizado")
     * )
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

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
     * @OA\Delete(
     *     path="/api/admin/users/{user}",
     *     tags={"Users"},
     *     summary="Eliminar/desactivar usuario",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Usuario eliminado o desactivado")
     * )
     */
    public function destroy(Request $request, User $user)
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
