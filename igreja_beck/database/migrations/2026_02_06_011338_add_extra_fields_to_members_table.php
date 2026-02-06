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
        Schema::table('members', function (Blueprint $table) {
            // Dados Pessoais
            $table->enum('sex', ['masculino', 'feminino'])->nullable();
            $table->enum('marital_status', ['solteiro', 'casado', 'viuvo', 'divorciado'])->nullable();
            $table->string('cpf')->nullable()->unique();

            // Contato e Localização (extra)
            $table->string('cep', 9)->nullable();
            $table->string('logradouro')->nullable();
            $table->string('bairro')->nullable();
            $table->string('cidade')->nullable();
            $table->string('uf', 2)->nullable();

            // Dados Eclesiásticos
            $table->date('baptism_date')->nullable();
            $table->string('role')->nullable(); // Membro, Diácono, etc.
            $table->string('origin_church')->nullable();

            // Vínculos Familiares
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->foreignId('father_id')->nullable()->constrained('members')->onDelete('set null');
            $table->foreignId('mother_id')->nullable()->constrained('members')->onDelete('set null');
            $table->foreignId('spouse_id')->nullable()->constrained('members')->onDelete('set null');

            // Update category enum to include the new values
            // Note: Some DBs don't support updating enums easily, but for now we'll assume standard Laravel flow.
            // Alternatively, we can just use string for flexibility.
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropForeign(['father_id']);
            $table->dropForeign(['mother_id']);
            $table->dropForeign(['spouse_id']);
            $table->dropColumn([
                'sex',
                'marital_status',
                'cpf',
                'cep',
                'logradouro',
                'bairro',
                'cidade',
                'uf',
                'baptism_date',
                'role',
                'origin_church',
                'father_name',
                'mother_name',
                'father_id',
                'mother_id',
                'spouse_id'
            ]);
        });
    }
};
