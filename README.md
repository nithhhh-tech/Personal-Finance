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

## Deploy on Render

This repo includes Render-ready Docker files:

- `Dockerfile`
- `.dockerignore`
- `docker/apache.conf`
- `docker/start.sh`
- `render.yaml`

Render's Laravel guide recommends Docker + PostgreSQL for Laravel apps. The start script automatically runs:

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Render Dashboard Steps

1. Push the latest code to GitHub.
2. In Render, create a new **PostgreSQL** database.
3. Copy the database **Internal Database URL**.
4. Create a new **Web Service** from this GitHub repository.
5. Choose **Docker** as the runtime.
6. Add these environment variables:

```env
APP_NAME=My Money Tracker
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-render-url.onrender.com
APP_KEY=base64:paste-your-generated-key
DB_CONNECTION=pgsql
DB_URL=paste-render-internal-database-url
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
LOG_CHANNEL=stderr
```

Generate `APP_KEY` locally with:

```bash
php artisan key:generate --show
```

7. Deploy the service. The Docker startup script will run migrations for the production database.

You can also use the included `render.yaml` as a Render Blueprint. If you use the blueprint, Render will create the web service and database together, but you still need to set `APP_KEY` and `APP_URL`.

## Other Hosting Database Notes

For Render, use PostgreSQL with `DB_CONNECTION=pgsql` and `DB_URL` as shown above.

If you later deploy on shared hosting or cPanel, you will probably use MySQL instead:

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
