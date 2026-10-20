<?php
/**
 * Script de teste de conectividade com a base de dados MySQL.
 * As credenciais são carregadas de forma segura do arquivo igreja_beck/.env
 */

$envPath = __DIR__ . '/igreja_beck/.env';
if (!file_exists($envPath)) {
    die("Arquivo .env não encontrado em $envPath\n");
}

$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env = [];
foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#')) continue;
    if (strpos($line, '=') !== false) {
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
            $value = substr($value, 1, -1);
        }
        $env[$name] = $value;
    }
}

try {
    $dsn = "mysql:host={$env['DB_HOST']};port={$env['DB_PORT']};dbname={$env['DB_DATABASE']};charset=utf8mb4";
    $pdo = new PDO($dsn, $env['DB_USERNAME'], $env['DB_PASSWORD'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
    ]);
    echo "Conexão com o banco de dados [{$env['DB_DATABASE']}] realizada com sucesso!\n";
} catch (\PDOException $e) {
    echo "Erro na conexão: " . $e->getMessage() . "\n";
}
