<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'starts_at' => $this->faker->dateTimeBetween('+1 days', '+1 year'),
            'capacity' => $this->faker->numberBetween(10, 200),
            'price' => $this->faker->randomFloat(2, 10, 500),
            'image_path' => $this->faker->imageUrl(),
            'category' => $this->faker->randomElement(['Music', 'Sports', 'Tech']),
        ];
    }
}
