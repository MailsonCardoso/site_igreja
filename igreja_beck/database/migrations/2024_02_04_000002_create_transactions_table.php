<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['entrada', 'saida']);
            $table->string('description');
            $table->string('category_name');
            $table->decimal('amount', 10, 2);
            $table->date('date');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->string('receipt_url')->nullable(); // Foto do comprovante
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
