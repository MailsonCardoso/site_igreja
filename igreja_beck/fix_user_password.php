<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'rogerio1981junho@outlook.com';
$password = '87856506334';

$user = User::where('email', $email)->first();

if ($user) {
    echo "Usuário encontrado: {$user->email}\n";
    $user->password = Hash::make($password);
    $user->save();
    echo "Senha atualizada com sucesso para o formato correto!\n";
} else {
    echo "Usuário NÃO encontrado: {$email}. Verifique se o e-mail está digitado corretamente ou se o usuário foi realmente criado.\n";

    // Listar usuários para ajudar a identificar
    echo "\nLista de e-mails cadastrados no sistema:\n";
    foreach (User::all() as $u) {
        echo "- {$u->email}\n";
    }
}
