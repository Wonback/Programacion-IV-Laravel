<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_order_when_capacity_available(): void
    {
        $buyer = User::factory()->create();
        $eventOwner = User::factory()->create();
        $event = Event::factory()->for($eventOwner)->create([
            'capacity' => 50,
            'price' => 150.75,
        ]);

        Sanctum::actingAs($buyer);

        $payload = [
            'event_id' => $event->id,
            'quantity' => 3,
        ];

        $response = $this->postJson('/api/orders', $payload);

        $expectedTotal = round((float) $event->price * $payload['quantity'], 2);

        $response->assertCreated()
            ->assertJsonStructure([
                'id',
                'user_id',
                'event_id',
                'quantity',
                'total',
                'created_at',
                'updated_at',
            ])
            ->assertJsonFragment([
                'user_id' => $buyer->id,
                'event_id' => $event->id,
                'quantity' => $payload['quantity'],
                'total' => $expectedTotal,
            ]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $buyer->id,
            'event_id' => $event->id,
            'quantity' => $payload['quantity'],
            'total' => $expectedTotal,
        ]);

        $this->assertDatabaseCount('orders', 1);
    }

    public function test_user_cannot_create_order_when_capacity_exceeded(): void
    {
        $buyer = User::factory()->create();
        $eventOwner = User::factory()->create();
        $event = Event::factory()->for($eventOwner)->create([
            'capacity' => 5,
            'price' => 80,
        ]);

        $existingBuyer = User::factory()->create();
        Order::create([
            'user_id' => $existingBuyer->id,
            'event_id' => $event->id,
            'quantity' => 4,
            'total' => $event->price * 4,
        ]);

        Sanctum::actingAs($buyer);

        $response = $this->postJson('/api/orders', [
            'event_id' => $event->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'No hay suficiente cupo',
            ]);

        $this->assertDatabaseCount('orders', 1);
    }
}
