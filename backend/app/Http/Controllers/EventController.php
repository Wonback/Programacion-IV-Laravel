<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

/**
 * @OA\Tag(
 *     name="Events",
 *     description="Operaciones de eventos"
 * )
 */
class EventController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/events",
     *     tags={"Events"},
     *     summary="Listar eventos",
     *     @OA\Parameter(name="category", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Listado de eventos")
     * )
     */
    public function index(Request $request)
    {
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

        return $query
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * @OA\Get(
     *     path="/api/events/{event}",
     *     tags={"Events"},
     *     summary="Mostrar un evento",
     *     @OA\Parameter(name="event", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalle del evento")
     * )
     */
    public function show(Event $event)
    {
        $event->load('user');
        $event->loadMissing('user');
        return response()->json($event);
    }

    /**
     * @OA\Post(
     *     path="/api/events",
     *     tags={"Events"},
     *     summary="Crear un evento",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title","starts_at","capacity","price"},
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="starts_at", type="string", format="date-time"),
     *             @OA\Property(property="capacity", type="integer"),
     *             @OA\Property(property="price", type="number"),
     *             @OA\Property(property="category", type="string"),
     *             @OA\Property(property="image_path", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Evento creado")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:180',
            'description' => 'nullable|string',
            'starts_at' => 'required|date',
            'capacity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'image_path' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = $request->user()->id;

        $event = Event::create($data);

        return response()->json($event, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/events/{event}",
     *     tags={"Events"},
     *     summary="Actualizar un evento",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="event", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="starts_at", type="string", format="date-time"),
     *             @OA\Property(property="capacity", type="integer"),
     *             @OA\Property(property="price", type="number"),
     *             @OA\Property(property="category", type="string"),
     *             @OA\Property(property="image_path", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Evento actualizado")
     * )
     */
    public function update(Request $request, Event $event)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:180',
            'description' => 'nullable|string',
            'starts_at' => 'sometimes|date',
            'capacity' => 'sometimes|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
            'image_path' => 'nullable|string',
            'category' => 'sometimes|nullable|string|max:255',
        ]);

        $event->update($data);

        return response()->json($event);
    }

    /**
     * @OA\Delete(
     *     path="/api/events/{event}",
     *     tags={"Events"},
     *     summary="Eliminar un evento",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="event", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Evento eliminado")
     * )
     */
    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['deleted' => true]);
    }
    // EventController.php

    /**
     * @OA\Get(
     *     path="/api/my-events",
     *     tags={"Events"},
     *     summary="Listar eventos del usuario autenticado con estadísticas",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de eventos propios con cantidad de tickets vendidos",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="title", type="string", example="Concierto A"),
     *                 @OA\Property(property="capacity", type="integer", example=100),
     *                 @OA\Property(property="orders_count", type="integer", example=25)
     *             )
     *         )
     *     )
     * )
     */
   
    public function myEvents(Request $request)
    {
        $user = $request->user();

        $events = Event::where('user_id', $user->id)
            ->withCount('orders') 
            ->latest('starts_at')
            ->get(['id', 'title', 'capacity']);

        return response()->json($events);
    }


}
