<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\User;
use App\Mail\AccountVerificationMail;

class VerificationController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/send-verification",
     *     summary="Enviar correo de verificación de cuenta",
     *     tags={"Verificación"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Correo de verificación enviado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Correo de verificación enviado.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Cuenta ya verificada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Tu cuenta ya está verificada.")
     *         )
     *     )
     * )
     */
    public function sendVerificationEmail(Request $request)
    {
        $user = $request->user();

        if ($user->is_verified) {
            return response()->json(['message' => 'Tu cuenta ya está verificada.'], 400);
        }

        $token = Str::random(64);
        $user->verification_token = $token;
        $user->save();

        // Enviar correo usando el Mailable
        Mail::to($user->email)->send(new AccountVerificationMail($user));

        return response()->json(['message' => 'Correo de verificación enviado.']);
    }

    /**
     * @OA\Get(
     *     path="/api/verify-email/{token}",
     *     summary="Verificar cuenta mediante token recibido por correo",
     *     tags={"Verificación"},
     *     @OA\Parameter(
     *         name="token",
     *         in="path",
     *         required=true,
     *         description="Token de verificación recibido en el correo",
     *         @OA\Schema(type="string", example="d41d8cd98f00b204e9800998ecf8427e")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cuenta verificada correctamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Cuenta verificada correctamente.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Token inválido o expirado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Token inválido o expirado.")
     *         )
     *     )
     * )
     */
    public function verifyEmail($token)
    {
        $user = User::where('verification_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Token inválido o expirado.'], 400);
        }

        $user->is_verified = true;
        $user->verification_token = null;
        $user->save();

        return response()->json(['message' => 'Cuenta verificada correctamente.']);
    }

    /**
     * @OA.Post(
     *     path="/api/request-admin",
     *     summary="Solicitar rol de administrador (requiere cuenta verificada)",
     *     tags={"Verificación"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Usuario promovido a administrador exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Ahora eres administrador.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Cuenta no verificada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Debes verificar tu cuenta antes de solicitar rol de administrador.")
     *         )
     *     )
     * )
     */
    public function requestAdmin(Request $request)
    {
        $user = $request->user();

        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Debes verificar tu cuenta antes de solicitar rol de administrador.'
            ], 403);
        }

        $user->role = 'admin';
        $user->save();

        return response()->json(['message' => 'Ahora eres administrador.']);
    }
}
