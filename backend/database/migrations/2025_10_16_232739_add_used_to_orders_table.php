<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_add_used_to_orders_table.php
public function up(): void
{
    Schema::table('orders', function (Blueprint $table) {
        $table->boolean('used')->default(false);
    });
}

public function down(): void
{
    Schema::table('orders', function (Blueprint $table) {
        $table->dropColumn('used');
    });
}

};
