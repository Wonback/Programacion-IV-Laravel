<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Event;

class OrderController extends Controller
{
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
