# docker/development/php-fpm/Dockerfile
ARG PHP_VERSION=8.4
FROM php:${PHP_VERSION}-fpm-alpine AS base

ARG UID=1000
ARG GID=1000

# ── Системные зависимости ──────────────────────────────────────────────────────
RUN apk add --no-cache \
    su-exec \
    linux-headers \
    libpq-dev \
    libzip-dev \
    icu-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    oniguruma-dev \
    && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    && docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_pgsql \
    pgsql \
    zip \
    intl \
    gd \
    bcmath \
    opcache \
    mbstring \
    pcntl \
    sockets \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /tmp/pear

# ── Composer ──────────────────────────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── Пользователь ──────────────────────────────────────────────────────────────
RUN delgroup www-data 2>/dev/null || true \
    && deluser www-data 2>/dev/null || true \
    && addgroup -g ${GID} -S www-data \
    && adduser -u ${UID} -S -G www-data -H www-data \
    && mkdir -p /var/www/app /var/www/.composer \
    && chown -R www-data:www-data /var/www

# ── PHP-FPM pool config ────────────────────────────────────────────────────────
RUN sed -i \
    -e "s/^user = .*/user = www-data/" \
    -e "s/^group = .*/group = www-data/" \
    -e "s/^listen.owner = .*/listen.owner = www-data/" \
    -e "s/^listen.group = .*/listen.group = www-data/" \
    /usr/local/etc/php-fpm.d/www.conf

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh



WORKDIR /var/www/app
EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]