#!/bin/bash
set -e

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Wait for PostgreSQL to be ready
echo "Waiting for database..."
until php artisan migrate:status --no-ansi > /dev/null 2>&1; do
    sleep 2
done

# Run migrations
php artisan migrate --force --seed

# Start Apache
exec "$@"
