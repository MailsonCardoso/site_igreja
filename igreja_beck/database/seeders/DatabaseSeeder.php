<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Member;
use App\Models\Transaction;
use App\Models\Event;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Administrador Principal
        User::updateOrCreate(
            ['email' => 'adm@iprjaguarema.com.br'],
            [
                'name' => 'Pastor Administrador',
                'password' => Hash::make('@Secur1t1@'),
            ]
        );

        Member::create([
            'name' => 'João Silva',
            'email' => 'joao@email.com',
            'phone' => '(11) 98888-8888',
            'category' => 'membro',
            'status' => 'ativo',
        ]);

        Transaction::create([
            'type' => 'entrada',
            'description' => 'Dízimo Mensal',
            'category_name' => 'Dízimo',
            'amount' => 500.00,
            'date' => now(),
        ]);

        Event::create([
            'title' => 'Culto de Celebração',
            'description' => 'Culto principal de domingo',
            'location' => 'Templo Principal',
            'start_date' => now()->next('Sunday')->setTime(19, 0),
        ]);
    }
}
