<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class EventController extends Controller
{

    public function index(Request $request)
    {
        return Event::latest()->paginate(10);
        $filters = $request->validate([
            'category' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'search' => 'sometimes|string|max:255',
        ]);

        $query = Event::query()
            ->with('user')
            ->latest('starts_at');

        if (!empty($filters['category']) && Schema::hasColumn('events', 'category')) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['date'])) {
            $query->whereDate('starts_at', $filters['date']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($subQuery) use ($filters) {
                $subQuery->where('title', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->paginate(10)->withQueryString();
    }

    public function show(Event $event)
    {
        $event->load('user');
        $event->loadMissing('user');
        return response()->json($event);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:180',
            'description' => 'nullable|string',
            'starts_at' => 'required|date',
            'capacity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'image_path' => 'nullable|string', // ahora es string con URL
        ]);

        $data['user_id'] = $request->user()->id;


        $event = Event::create($data);


        return response()->json($event, 201);
    }

    public function update(Request $request, Event $event)
    {
        $data = $request->validate([
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
