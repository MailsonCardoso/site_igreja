<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pastoral_appointments', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // Gabinete, Visita
            $table->string('title')->nullable();
            $table->string('person');
            $table->unsignedBigInteger('member_id')->nullable();
            $table->date('date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('Confirmado');
            $table->timestamps();
        });

        Schema::create('pastoral_requests', function (Blueprint $table) {
            $table->id();
            $table->string('person');
            $table->unsignedBigInteger('member_id')->nullable();
            $table->string('type'); // Gabinete, Visita
            $table->text('reason')->nullable();
            $table->dateTime('requested_at')->useCurrent();
            $table->string('status')->default('Pendente'); // Pendente, Agendado, Cancelado
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pastoral_requests');
        Schema::dropIfExists('pastoral_appointments');
    }
};
