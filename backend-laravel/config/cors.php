<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Tambahkan domain frontend production kalian di sini setelah deploy, contoh:
    // 'https://educationbridge-fe.vercel.app'
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false karena kita pakai Bearer token (bukan cookie SPA stateful Sanctum)
    'supports_credentials' => false,
];
