<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Event;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Orders",
 *     description="Operaciones de compras y validación de QR"
 * )
 */
class OrderController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/orders",
     *     tags={"Orders"},
     *     summary="Crear una orden (compra)",
     *     security={{"sanctum":{}}}, 
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event_id","quantity"},
     *             @OA\Property(property="event_id", type="integer"),
     *             @OA\Property(property="quantity", type="integer"),
     *             @OA\Property(property="qr_code", type="string", example="orden:12345|evento:7|monto:1500")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Orden creada correctamente"),
     *     @OA\Response(response=422, description="No hay suficiente cupo")
     * )
     */
    public function store(Request $r)
    {
        $data = $r->validate([
            'event_id' => 'required|exists:events,id',
            'quantity' => 'sometimes|integer|min:1',
            'qr_code' => 'nullable|string',
        ]);

        $event = Event::findOrFail($data['event_id']);
        $vendidas = $event->orders()->sum('quantity');
        $disponibles = $event->capacity - $vendidas;

        $cantidad = $data['quantity'] ?? 1; // Default a 1 si no viene

        if ($cantidad > $disponibles) {
            return response()->json(['message' => 'No hay suficiente cupo'], 422);
        }

        $order = Order::create([
            'user_id' => $r->user()->id,
            'event_id' => $event->id,
            'quantity' => $cantidad,
            'total' => $event->price * $cantidad,
            'qr_code' => $data['qr_code'] ?? null, // 👈 NUEVO
        ]);

        return response()->json($order, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/orders",
     *     tags={"Orders"},
     *     summary="Listar órdenes del usuario autenticado",
     *     security={{"sanctum":{}}}
     * )
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $orders = Order::where('user_id', $user->id)
            ->with('event')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders, 200);
    }

    /**
     * @OA\Post(
     *     path="/api/orders/verify-qr",
     *     tags={"Orders"},
     *     summary="Verificar un código QR escaneado",
     *     description="Permite al dueño del evento validar si el QR corresponde a una orden válida.",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"qr_code"},
     *             @OA\Property(property="qr_code", type="string", example="orden:12345|evento:7|monto:1500")
     *         )
     *     ),
     *     @OA\Response(response=200, description="QR válido"),
     *     @OA\Response(response=404, description="QR inválido o no encontrado")
     * )
     */
    public function verifyQR(Request $r)
    {
        $r->validate([
            'qr_code' => 'required|string'
        ]);

        $order = Order::where('qr_code', $r->qr_code)->with('event')->first();

        if (!$order) {
            return response()->json(['message' => 'QR inválido o no encontrado'], 404);
        }

        // Verificar si el usuario autenticado es el dueño del evento
        if ($order->event->user_id !== $r->user()->id) {
            return response()->json(['message' => 'No autorizado para validar este QR'], 403);
        }

        return response()->json([
            'message' => 'QR válido ✅',
            'order' => $order
        ], 200);
    }
    // OrderController.php
/**
 * @OA\Post(
 *     path="/api/orders/validate",
 *     tags={"Orders"},
 *     summary="Validar un QR de ticket",
 *     security={{"sanctum":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"qr_data"},
 *             @OA\Property(property="qr_data", type="string")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Ticket validado"),
 *     @OA\Response(response=404, description="Ticket no encontrado"),
 *     @OA\Response(response=403, description="No autorizado")
 * )
 */
public function validateQR(Request $request)
{
    $request->validate(['qr_data' => 'required|string']);

    $user = $request->user(); // dueño del evento
    $qrData = $request->qr_data;

    preg_match('/ORDEN-(\d+)-EVENT-(\d+)-USER-(\d+)/', $qrData, $matches);

    if (!$matches) {
        return response()->json(['message' => 'QR inválido'], 404);
    }

    [$full, $orderId, $eventId, $userId] = $matches;

    $order = Order::where('id', $orderId)
        ->where('event_id', $eventId)
        ->whereHas('event', function($q) use ($user) {
            $q->where('user_id', $user->id); // propietario del evento
        })
        ->first();

    if (!$order) {
        return response()->json(['message' => 'No autorizado o ticket no encontrado'], 403);
    }

    if ($order->used) {
        return response()->json(['message' => 'Ticket ya utilizado'], 422);
    }

    $order->used = true;
    $order->save();

    return response()->json(['message' => 'Ticket validado con éxito', 'order' => $order]);
}
// OrderController.php

/**
 * @OA\Get(
 *     path="/api/events/{eventId}/orders",
 *     tags={"Orders"},
 *     summary="Listar tickets de un evento",
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(
 *         name="eventId",
 *         in="path",
 *         required=true,
 *         description="ID del evento",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Listado de tickets"),
 *     @OA\Response(response=403, description="No autorizado")
 * )
 */
public function ordersByEvent(Request $request, $eventId)
{
    $user = $request->user();
    $event = Event::where('id', $eventId)
        ->where('user_id', $user->id)
        ->first();

    if (!$event) {
        return response()->json(['message' => 'No autorizado'], 403);
    }

    // Incluye los datos del usuario comprador
    $orders = Order::with('user')
        ->where('event_id', $eventId)
        ->get();

    return response()->json($orders, 200);
}


/**
 * @OA\Get(
 *     path="/api/my-tickets",
 *     tags={"Orders"},
 *     summary="Listar eventos comprados por el usuario autenticado",
 *     security={{"sanctum":{}}},
 *     @OA\Response(response=200, description="Listado de eventos comprados")
 * )
 */
public function myTickets(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'No autenticado'], 401);
    }

    // Traemos todas las órdenes del usuario con la info completa del evento
    $orders = Order::where('user_id', $user->id)
        ->with('event') // carga toda la info del evento
        ->orderByDesc('created_at')
        ->get();

    // Mapear cada orden para el frontend
    $tickets = $orders->map(function($order) {
        return [
            'order_id' => $order->id,
            'quantity' => $order->quantity,
            'qr_code' => $order->qr_code,
            'event' => [
                'id' => $order->event->id,
                'title' => $order->event->title,
                'description' => $order->event->description,
                'starts_at' => $order->event->starts_at,
                'price' => $order->event->price,
                'image_path' => $order->event->image_path,
            ]
        ];
    });

    return response()->json($tickets, 200);
}



}
