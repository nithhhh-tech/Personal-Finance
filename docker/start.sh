#!/bin/sh
set -e

export PORT="${PORT:-8000}"

if [ -n "$DATABASE_URL" ] && [ -z "$DB_URL" ]; then
    export DB_URL="$DATABASE_URL"
fi

printf "Listen %s\n" "$PORT" > /etc/apache2/ports.conf
sed -i "s/__PORT__/${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Do not run optimize:clear here: CACHE_STORE=database can fail before
# migrations create the cache table. Clear non-database caches safely.
rm -f bootstrap/cache/config.php bootstrap/cache/routes-v7.php bootstrap/cache/services.php bootstrap/cache/packages.php
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec apache2-foreground
