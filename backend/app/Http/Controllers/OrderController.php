<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Event;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Orders",
 *     description="Operaciones de compras"
 * )
 */
class OrderController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/orders",
     *     tags={"Orders"},
     *     summary="Crear una orden",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id","quantity"},
     *             @OA\Property(property="event_id", type="integer"),
     *             @OA\Property(property="quantity", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Orden creada"),
     *     @OA\Response(response=422, description="No hay suficiente cupo")
     * )
     */
    public function store(Request $r)
    {
        $data = $r->validate([
            'event_id' => 'required|exists:events,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $event = Event::findOrFail($data['event_id']);
        $vendidas = $event->orders()->sum('quantity');
        $disponibles = $event->capacity - $vendidas;

        if ($data['quantity'] > $disponibles) {
            return response()->json(['message' => 'No hay suficiente cupo'], 422);
        }

        $order = Order::create([
            'user_id' => $r->user()->id,
            'event_id' => $event->id,
            'quantity' => $data['quantity'],
            'total' => $event->price * $data['quantity'],
        ]);

        return response()->json($order, 201);
    }
    /**
 * @OA\Get(
 *     path="/api/orders",
 *     tags={"Orders"},
 *     summary="Listar órdenes del usuario autenticado",
 *     description="Devuelve todas las órdenes realizadas por el usuario autenticado, junto con la información del evento asociado.",
 *     security={{"sanctum":{}}},
 *     @OA\Response(
 *         response=200,
 *         description="Listado de órdenes del usuario autenticado",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="quantity", type="integer", example=2),
 *                 @OA\Property(property="total", type="number", format="float", example=1500.00),
 *                 @OA\Property(property="created_at", type="string", format="date-time", example="2025-10-08T18:00:00Z"),
 *                 @OA\Property(property="event", type="object",
 *                     @OA\Property(property="id", type="integer", example=3),
 *                     @OA\Property(property="title", type="string", example="Concierto de Rock"),
 *                     @OA\Property(property="starts_at", type="string", format="date-time", example="2025-11-01T21:00:00Z"),
 *                     @OA\Property(property="price", type="number", example=750.00)
 *                 )
 *             )
 *         )
 *     ),
 *     @OA\Response(response=401, description="No autenticado")
 * )
 */
public function index(Request $request)
{
    $user = $request->user();

    // Si el usuario no está autenticado (por seguridad extra)
    if (!$user) {
        return response()->json(['message' => 'No autenticado'], 401);
    }

    // Buscamos las órdenes del usuario con la relación de evento
    $orders = Order::where('user_id', $user->id)
        ->with('event')
        ->orderByDesc('created_at')
        ->get();

    return response()->json($orders, 200);
}

}
