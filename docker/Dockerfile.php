FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    zlib-dev \
    libzip-dev \
    zip \
    unzip \
    curl

RUN docker-php-ext-install pdo pdo_pgsql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend
