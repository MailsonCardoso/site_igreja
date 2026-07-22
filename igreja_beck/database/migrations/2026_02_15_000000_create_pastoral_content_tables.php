<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pastor_sermons', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('series')->default('Avulso');
            $table->string('verse')->nullable();
            $table->date('date')->nullable();
            $table->string('status')->default('Planejado');
            $table->string('color')->default('bg-amber-400');
            $table->json('content')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();
        });

        Schema::create('pastor_series', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('total')->default(0);
            $table->integer('completed')->default(0);
            $table->string('color')->default('bg-blue-500');
            $table->string('cover_color')->default('from-blue-500/20 to-blue-500/5');
            $table->date('start_date')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();
        });

        Schema::create('pastor_insights', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->text('content');
            $table->string('title')->nullable();
            $table->string('reference')->nullable();
            $table->json('tags')->nullable();
            $table->unsignedBigInteger('sermon_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pastor_sermons');
        Schema::dropIfExists('pastor_series');
        Schema::dropIfExists('pastor_insights');
    }
};
