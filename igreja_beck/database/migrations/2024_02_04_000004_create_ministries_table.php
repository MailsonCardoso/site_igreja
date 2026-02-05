<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ministries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('leader_id')->nullable()->constrained('members'); // Leader is a Member, not necessarily a User
            $table->timestamps();
        });

        Schema::create('rosters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ministry_id')->constrained();
            $table->date('date');
            $table->timestamps();
        });

        Schema::create('roster_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('roster_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->string('role'); // Cantor, Teclado, Recepção
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roster_members');
        Schema::dropIfExists('rosters');
        Schema::dropIfExists('ministries');
    }
};
