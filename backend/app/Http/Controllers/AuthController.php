<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     summary="Registrar un nuevo usuario",
     *     tags={"Autenticación"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation","role"},
     *             @OA\Property(property="name", type="string", example="Juan Pérez"),
     *             @OA\Property(property="email", type="string", format="email", example="juan@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="secret123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="secret123"),
     *             @OA\Property(
     *                 property="role",
     *                 type="string",
     *                 description="Tipo de rol del usuario",
     *                 enum={"admin","user","client"},
     *                 example="user"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario creado correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Usuario creado correctamente"),
     *             @OA\Property(
     *                 property="user",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Juan Pérez"),
     *                 @OA\Property(property="email", type="string", example="juan@example.com"),
     *                 @OA\Property(property="role", type="string", example="user")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error de validación"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function register(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,user,client'
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'role' => 'user',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado correctamente',
            'user' => $this->formatUserResponse($user)
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     summary="Iniciar sesión y obtener token",
     *     tags={"Autenticación"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="juan@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="secret123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login exitoso"),
     *             @OA\Property(property="user", type="object"),
     *             @OA\Property(property="token", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales inválidas",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Credenciales inválidas")
     *         )
     *     )
     * )
     */
    public function login(Request $r)
    {
        $data = $r->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('frontend')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login exitoso',
            'user' => $this->formatUserResponse($user),
            'token' => $token,
        ]);
        
    }

    /**
     * @OA\Get(
     *     path="/api/auth/me",
     *     summary="Obtener datos del usuario autenticado",
     *     tags={"Autenticación"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Datos del usuario",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="user", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Usuario desactivado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Usuario desactivado")
     *         )
     *     )
     * )
     */
    public function me(Request $r)
{
    $user = $r->user();

    if (!$user->is_active) {
        return response()->json([
            'success' => false,
            'message' => 'Usuario desactivado'
        ], 403);
    }

    // Devuelve solo los campos necesarios o todo el usuario
    return response()->json($this->formatUserResponse($user));
}

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => 'sometimes|nullable|string|max:30',
            'bio' => 'sometimes|nullable|string|max:500',
            'email_notifications' => 'sometimes|boolean',
            'current_password' => 'required_with:password|string',
            'password' => 'sometimes|string|min:8|confirmed',
            'avatar' => 'sometimes|file|image|max:2048',
            'remove_avatar' => 'sometimes|boolean',
        ]);

        if (array_key_exists('current_password', $validated)) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'La contraseña actual no coincide.',
                ], 422);
            }

            unset($validated['current_password']);
        }

        if (array_key_exists('password', $validated)) {
            $user->password = Hash::make($validated['password']);
            unset($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $validated['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }

        if (! empty($validated['remove_avatar']) && $user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $validated['avatar_path'] = null;
        }

        unset($validated['remove_avatar']);

        if (array_key_exists('phone', $validated) && $validated['phone'] === '') {
            $validated['phone'] = null;
        }

        if (array_key_exists('bio', $validated) && trim((string) $validated['bio']) === '') {
            $validated['bio'] = null;
        }

        $user->fill($validated);
        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => $this->formatUserResponse($user->fresh()),
        ]);
    }

    private function formatUserResponse(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_verified' => (bool) $user->is_verified,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
            'email_notifications' => (bool) $user->email_notifications,
            'is_active' => (bool) $user->is_active,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }


    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     summary="Cerrar sesión del usuario",
     *     tags={"Autenticación"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Sesión cerrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Sesión cerrada")
     *         )
     *     )
     * )
     */
    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada'
        ]);
    }
}
