# My Money Tracker

My Money Tracker is a Laravel 12 + React personal money tracker. It helps you record what you earned, what you spent, which wallet the money came from, and what is left each month.

## Features

- React dashboard inside the same Laravel project
- Sanctum token authentication: register, login, logout, current user
- Wallet CRUD for cash, ABA, Wing, savings, and other money sources
- Earned/spent category CRUD with defaults on registration
- Money record CRUD with filters by type, date, wallet, category, and search text
- Automatic wallet balance recalculation after money records change
- Dashboard summary for money left, earned today, spent today, earned this month, left this month, recent records, and spent-by-category charts

## Run Locally

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate:fresh
php artisan serve
```

In another terminal:

```bash
npm run dev
```

Open `http://127.0.0.1:8000`.

## Production Database

The app is ready to use a hosted SQL database. For most hosting providers, create a MySQL database and set these environment variables on your host:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=personal_finance
DB_USERNAME=your-database-user
DB_PASSWORD=your-database-password
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

If your host gives you PostgreSQL, use `DB_CONNECTION=pgsql` and port `5432` instead.

After setting the production environment variables, run:

```bash
php artisan key:generate --force
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm ci
npm run build
```

Never upload your local `.env` file to GitHub. Use `.env.example` as the template and set real values only inside the hosting dashboard.

## Main API Endpoints

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/dashboard/summary`
- `apiResource /api/accounts`
- `apiResource /api/categories`
- `apiResource /api/transactions`

Use the returned bearer token from login/register for protected routes.
