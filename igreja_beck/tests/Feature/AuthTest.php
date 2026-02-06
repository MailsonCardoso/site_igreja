<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase; // Cuidado: isso vai limpar o banco de testes. Se estiver usando o mesmo banco de dev, pode ser perigoso. Melhor verificar o phpunit.xml primeiro.

    public function test_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);


        $response->assertStatus(200);
        $response->assertJsonStructure(['access_token']);
    }
}
