#!/bin/bash
set -e

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Try running migrations (don't block if DB not ready yet)
php artisan migrate --force --seed 2>/dev/null || echo "DB not ready yet, will retry on next deploy"

# Start Laravel's built-in server on Render's PORT
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
