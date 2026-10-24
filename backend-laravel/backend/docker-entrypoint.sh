#!/bin/sh
set -eu

if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY must be set to a generated Laravel application key." >&2
    exit 1
fi

php artisan migrate --force
php artisan import:official-schools
php artisan db:seed --class=ProductionAdminSeeder --force
php artisan config:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
