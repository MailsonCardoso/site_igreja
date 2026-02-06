<?php
require __DIR__ . '/vendor/autoload.php';

$class = 'Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful';

if (class_exists($class)) {
    echo "Class exists: $class\n";
} else {
    echo "Class DOES NOT exist: $class\n";
}
