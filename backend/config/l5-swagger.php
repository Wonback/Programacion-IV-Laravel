<?php

return [

    'default' => 'default',

    'documentations' => [
        'default' => [

            'api' => [
                'title' => 'API - Sistema de Eventos',
            ],

            'routes' => [
                // URL para acceder a la UI de Swagger
                'api' => 'docs',

                // Archivo JSON generado
                'docs' => 'api-docs.json',

                // Callback de OAuth2 (si necesitás)
                'oauth2_callback' => 'api/oauth2-callback',
            ],

            'paths' => [
                'use_absolute_path' => true,
                'swagger_ui_assets_path' => 'vendor/swagger-api/swagger-ui/dist/',
                'docs_json' => 'api-docs.json',
                'docs_yaml' => 'api-docs.yaml',
                'annotations' => [
                    base_path('app'),
                ],
            ],
        ],
    ],

    'defaults' => [
        'routes' => [
            'docs' => 'api-docs.json',
            'oauth2_callback' => 'api/oauth2-callback',
            'middleware' => [],
        ],

        'paths' => [
            'docs' => storage_path('api-docs'),
            'views' => base_path('resources/views/vendor/l5-swagger'),
            'base' => env('L5_SWAGGER_BASE_PATH', null),
            'excludes' => [],
        ],

        'scanOptions' => [
            'exclude' => [],
            'open_api_spec_version' => env('L5_SWAGGER_OPEN_API_SPEC_VERSION', \L5Swagger\Generator::OPEN_API_DEFAULT_SPEC_VERSION),
        ],

        'securityDefinitions' => [
            'securitySchemes' => [
                'bearerAuth' => [
                    'type' => 'http',
                    'scheme' => 'bearer',
                    'bearerFormat' => 'JWT',
                    'description' => 'Usar token en formato: Bearer {token}'
                ],
            ],
            'security' => [
                ['bearerAuth' => []],
            ],
        ],

        'generate_always' => env('L5_SWAGGER_GENERATE_ALWAYS', true),
        'generate_yaml_copy' => false,
        'proxy' => false,
        'additional_config_url' => null,
        'operations_sort' => null,
        'validator_url' => null,

        'ui' => [
            'display' => [
                'dark_mode' => false,
                'doc_expansion' => 'none',
                'filter' => true,
            ],
            'authorization' => [
                'persist_authorization' => true,
            ],
        ],

        'constants' => [
            'L5_SWAGGER_CONST_HOST' => env('L5_SWAGGER_CONST_HOST', 'http://127.0.0.1:8000'),
        ],
    ],
];
