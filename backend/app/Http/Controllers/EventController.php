<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        return Event::latest()->paginate(10);
    }

    public function show(Event $event)
    {
        $event->load('user');
        return response()->json($event);
    }



    public function store(Request $r)
    {
    $data = $r->validate([
        'title' => 'required|string|max:180',
        'description' => 'nullable|string',
        'starts_at' => 'required|date',
        'capacity' => 'required|integer|min:0',
        'price' => 'required|numeric|min:0',
        'image_path' => 'nullable|string', // ahora es string con URL
    ]);

    $data['user_id'] = $r->user()->id;

    $event = Event::create($data);

    return response()->json($event, 201);
}

public function update(Request $r, Event $event)
{
    $data = $r->validate([
        'title' => 'sometimes|string|max:180',
        'description' => 'nullable|string',
        'starts_at' => 'sometimes|date',
        'capacity' => 'sometimes|integer|min:0',
        'price' => 'sometimes|numeric|min:0',
        'image_path' => 'nullable|string',
    ]);

    $event->update($data);

    return response()->json($event);
    }


    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['deleted' => true]);
    }
}
