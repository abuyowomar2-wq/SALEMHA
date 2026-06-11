<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['https://salemha-1.onrender.com', 'https://sallemha-frontend.onrender.com'],

    'allowed_origins_patterns' => ['#^https://.*\.onrender\.com$#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
