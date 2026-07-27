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

## Deploy on Koyeb + Neon

This repo includes Docker files that work for Koyeb:

- `Dockerfile`
- `.dockerignore`
- `docker/apache.conf`
- `docker/start.sh`

The start script automatically runs:

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Koyeb Dashboard Steps

1. Push the latest code to GitHub.
2. In Neon, create a free PostgreSQL project.
3. Copy the Neon **connection string** for the production branch.
4. In Koyeb, create a new **Web Service** from this GitHub repository.
5. Choose **Dockerfile** as the builder.
6. Expose port `8000` with HTTP route `/`.
6. Add these environment variables:

```env
APP_NAME=My Money Tracker
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-koyeb-url.koyeb.app
APP_KEY=base64:paste-your-generated-key
DB_CONNECTION=pgsql
DB_URL=paste-neon-connection-string
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

Keep the Neon `sslmode=require` value in your connection string.

## Deploy on Render

This repo still includes `render.yaml` if you later return to Render. For Render, use PostgreSQL and Docker, then set `APP_KEY`, `APP_URL`, `DB_CONNECTION=pgsql`, and `DB_URL`.

On Render, paste the database **Internal Database URL** into `DB_URL`.

Correct:

```env
DB_CONNECTION=pgsql
DB_URL=postgresql://user:password@host:5432/database
```

Wrong:

```env
DB_CONNECTION=pgsql
DB_DATABASE=paste-render-internal-database-url-here
```

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
