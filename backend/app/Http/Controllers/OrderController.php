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
     *     path="/orders",
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
}
