<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

abstract class EventApi extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_events(): void
    {
        $user = User::factory()->create();
        $events = Event::factory()->count(3)->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/events');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'user_id',
                        'title',
                        'description',
                        'starts_at',
                        'capacity',
                        'price',
                        'category',
                        'image_path',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'current_page',
                'first_page_url',
                'from',
                'last_page',
                'last_page_url',
                'links',
                'path',
                'per_page',
                'to',
                'total',
            ])
            ->assertJsonFragment([
                'title' => $events->first()->title,
                'category' => $events->first()->category,
            ]);
    }

    public function test_authenticated_user_can_view_single_event(): void
    {
        $user = User::factory()->create();
        $event = Event::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/events/' . $event->id);

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $event->id,
                'title' => $event->title,
                'category' => $event->category,
            ])
            ->assertJsonStructure([
                'id',
                'user_id',
                'title',
                'description',
                'starts_at',
                'capacity',
                'price',
                'image_path',
                'created_at',
                'category',
                'updated_at',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    public function test_admin_can_create_event(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $eventData = Event::factory()->make();
        $payload = Arr::except($eventData->toArray(), ['user_id', 'created_at', 'updated_at']);
        $payload['starts_at'] = $eventData->starts_at->toISOString();
        $payload['price'] = (float) $payload['price'];

        $response = $this->postJson('/api/events', $payload);

        $response->assertCreated()
            ->assertJsonFragment([
                'title' => $payload['title'],
                'category' => $payload['category'],
            ]);

        $this->assertDatabaseHas('events', [
            'title' => $payload['title'],
            'category' => $payload['category'],
            'user_id' => $admin->id,
        ]);
    }

    public function test_admin_can_update_event(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $event = Event::factory()->for($admin)->create();

        Sanctum::actingAs($admin);

        $payload = [
            'title' => 'Updated Event Title',
            'capacity' => $event->capacity + 10,
            'category' => 'Meetups',
        ];

        $response = $this->putJson('/api/events/' . $event->id, $payload);

        $response->assertOk()
            ->assertJsonFragment([
                'title' => $payload['title'],
                'capacity' => $payload['capacity'],
                'category' => $payload['category'],
            ]);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => $payload['title'],
            'capacity' => $payload['capacity'],
            'category' => $payload['category'],
        ]);
    }

    public function test_admin_can_delete_event(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $event = Event::factory()->for($admin)->create();

        Sanctum::actingAs($admin);

        $response = $this->deleteJson('/api/events/' . $event->id);

        $response->assertOk()
            ->assertJson([
                'deleted' => true,
            ]);

        $this->assertDatabaseMissing('events', [
            'id' => $event->id,
        ]);
    }

    public function test_category_filter_returns_matching_events_only(): void
    {
        $user = User::factory()->create();
        Event::factory()->count(2)->for($user)->state([
            'category' => 'Music',
        ])->create();
        Event::factory()->for($user)->state([
            'category' => 'Sports',
        ])->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/events?category=Music');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment([
                'category' => 'Music',
            ])
            ->assertJsonMissing([
                'category' => 'Sports',
            ]);
    }

    public function test_regular_user_cannot_access_admin_event_routes(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $event = Event::factory()->create();

        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/events', [
            'title' => 'Forbidden Event',
            'starts_at' => now()->addDays(2)->toISOString(),
            'capacity' => 50,
            'price' => 25.5,
        ]);
        $createResponse->assertForbidden();

        $updateResponse = $this->putJson('/api/events/' . $event->id, [
            'title' => 'New Title',
        ]);
        $updateResponse->assertForbidden();

        $deleteResponse = $this->deleteJson('/api/events/' . $event->id);
        $deleteResponse->assertForbidden();

        $this->assertDatabaseCount('events', 1);
    }

    public function test_events_index_can_filter_by_search_and_include_user_relation(): void
    {
        $requestingUser = User::factory()->create();
        $matchingUser = User::factory()->create();
        $matchingEvent = Event::factory()->for($matchingUser)->create([
            'title' => 'Laravel Conference',
            'description' => 'All about Laravel',
        ]);
        Event::factory()->create([
            'title' => 'Symfony Meetup',
            'description' => 'Different framework',
        ]);

        Sanctum::actingAs($requestingUser);

        $response = $this->getJson('/api/events?search=Laravel');

        $response->assertOk();

        $data = $response->json('data');

        $this->assertNotEmpty($data);
        $this->assertCount(1, $data);
        $this->assertSame($matchingEvent->id, $data[0]['id']);
        $this->assertArrayHasKey('user', $data[0]);
        $this->assertSame($matchingUser->id, $data[0]['user']['id']);
        $this->assertStringContainsString('Laravel', $data[0]['title']);
    }
}
