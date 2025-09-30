<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_users_with_is_active_and_ordered_by_latest(): void
    {
        $baseTime = Carbon::parse('2024-01-01 12:00:00');

        $oldestUser = User::factory()->create([
            'created_at' => $baseTime->copy()->subDays(3),
            'is_active' => false,
        ]);

        $middleUser = User::factory()->create([
            'created_at' => $baseTime->copy()->subDay(),
            'is_active' => true,
        ]);

        $latestUser = User::factory()->create([
            'created_at' => $baseTime->copy()->subHours(6),
            'is_active' => false,
        ]);

        $admin = User::factory()->create([
            'role' => 'admin',
            'created_at' => $baseTime->copy()->addDay(),
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/users');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
                ],
            ]);

        $this->assertSame(
            [
                $admin->id,
                $latestUser->id,
                $middleUser->id,
                $oldestUser->id,
            ],
            array_column($response->json('data'), 'id')
        );
    }
}
