<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'suporte@platformx.com.br'; // Tentando com um email comum ou o do admin
$password = '12345678'; // Senha comum de teste

$user = User::where('email', $email)->first();

if (!$user) {
    echo "Usuário não encontrado: $email\n";
    // Listar alguns usuários para ver quem existe
    $users = User::limit(5)->get();
    echo "Usuários existentes (primeiros 5):\n";
    foreach ($users as $u) {
        echo "- {$u->email} (ID: {$u->id})\n";
    }
} else {
    echo "Usuário encontrado: {$user->email}\n";
    echo "Hash no banco: {$user->password}\n";

    // Testar alguns formatos de senha
    $passwordsToTest = [$password, '12345678', 'admin123'];
    foreach ($passwordsToTest as $p) {
        $check = Hash::check($p, $user->password);
        echo "Senha '$p' matches? " . ($check ? "SIM" : "NÃO") . "\n";
    }
}
