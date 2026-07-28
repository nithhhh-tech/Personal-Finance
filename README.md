# My Money Tracker

A full-stack personal finance tracking website for recording daily income and expenses, organizing money across multiple wallets, and understanding where money goes each month.

The React interface and Laravel API are contained in the same project and deployed together. Financial data is stored in PostgreSQL, while Laravel Sanctum protects the API using personal access tokens.

> This project is designed for manual personal finance tracking. It does not connect directly to banks and should never be used to store bank passwords, PINs, card security codes, or other sensitive banking credentials.

## Project Status

**Active development**

The current version is deployed and being used for real daily money tracking. Core authentication, wallet management, category management, transaction recording, dashboard summaries, and reporting charts are working.

## Features

### Authentication

- User registration and login
- Password hashing through Laravel
- Laravel Sanctum bearer-token authentication
- Protected finance API routes
- Current-user session endpoint
- Logout and current-token revocation
- Base currency selection during registration: USD or KHR

### Wallet Management

- Create wallets for cash, ABA, Wing, savings, and other money sources
- Choose USD or KHR for each wallet
- Set a starting balance
- Automatically recalculate the current wallet balance when transactions change
- User-specific wallet records

### Categories

- Separate income and expense categories
- Custom category names and colors
- Default categories created automatically for every new account:
  - Salary
  - Allowance
  - Food
  - Transport
  - Bills
  - Shopping
  - Savings

### Money Records

- Record income and expenses
- Select wallet and category
- Store amount, date, payment method, and notes
- Support USD and KHR transaction fields
- Store an exchange rate and normalized base amount
- Search transaction history from the website
- API filtering by type, wallet, category, date range, and description
- Paginated transaction API results

### Dashboard and Reports

- Total current balance
- Income earned today
- Expenses recorded today
- Monthly income
- Monthly expenses
- Monthly amount left
- Recent money records
- Wallet balance overview
- Earned-versus-spent chart
- Spending-by-category chart

### Interface

- Responsive React single-page interface
- Desktop sidebar navigation
- Compact mobile navigation
- Public landing page with feature and privacy sections
- Login and registration drawer
- Dark brown financial dashboard theme
- Loading, validation, error, and empty states

## Technology Stack

### Backend

- PHP 8.2+
- Laravel 12
- Laravel Sanctum 4
- PostgreSQL
- Eloquent ORM
- REST API

### Frontend

- React 19
- Vite 7
- Tailwind CSS 4
- Axios
- Recharts
- Lucide React
- Inter Variable font

### Deployment

- Docker
- Apache
- Render Blueprint configuration
- Multi-stage frontend and backend production build

## Architecture

```text
Web Browser
    │
    ▼
React Single-Page Interface
    │  Axios requests to /api
    ▼
Laravel REST API
    │  Sanctum bearer token
    ▼
Eloquent Models
    │
    ▼
PostgreSQL Database
```

Laravel serves the compiled React interface and the API from one deployment, so the project does not require separate frontend and backend hosting.

## Main Database Tables

| Table | Purpose |
|---|---|
| `users` | User account, login information, and base currency |
| `accounts` | Cash, ABA, Wing, savings, and other wallets |
| `categories` | User-defined income and expense categories |
| `transactions` | Income and expense money records |
| `personal_access_tokens` | Laravel Sanctum authentication tokens |

## Project Structure

```text
app/
├── Http/Controllers/Api/     # Authentication and finance API controllers
└── Models/                   # User, Account, Category, and Transaction models

database/migrations/         # PostgreSQL-compatible database schema

resources/
├── css/app.css               # Tailwind and application styles
├── js/
│   ├── app.jsx               # React entry point
│   └── src/
│       ├── components/       # Layout, forms, authentication, and reusable UI
│       ├── lib/              # Axios client and formatting helpers
│       └── pages/            # Dashboard, records, wallets, and categories
└── views/app.blade.php       # Laravel page that mounts React

routes/
├── api.php                   # REST API routes
└── web.php                   # React SPA fallback route

docker/                      # Apache and container startup configuration
Dockerfile                   # Production multi-stage image
render.yaml                  # Render web service and PostgreSQL blueprint
```

## Local Installation

### Requirements

Install the following before starting:

- PHP 8.2 or newer
- Composer
- Node.js 22 or newer
- npm
- PostgreSQL

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Personal-Finance-main
```

### 2. Install Dependencies

```bash
composer install
npm install
```

### 3. Create the Environment File

macOS or Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 4. Configure the Local Environment

Update `.env` for local development:

```env
APP_NAME="My Money Tracker"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=personal_finance
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
MAIL_MAILER=log
```

You may use `DB_URL` instead of the separate PostgreSQL values:

```env
DB_CONNECTION=pgsql
DB_URL=postgresql://username:password@127.0.0.1:5432/personal_finance
```

Create the `personal_finance` PostgreSQL database before running migrations.

### 5. Generate the Application Key

```bash
php artisan key:generate
```

### 6. Run Database Migrations

```bash
php artisan migrate
```

### 7. Start Development

Run everything through the Composer development script:

```bash
composer run dev
```

Or use two terminals:

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

Open the website at:

```text
http://127.0.0.1:8000
```

## Production Build

Build the frontend assets:

```bash
npm ci
npm run build
```

Optimize Laravel for production:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Run production migrations:

```bash
php artisan migrate --force
```

## Deploying on Render

This repository includes:

- `render.yaml`
- `Dockerfile`
- `.dockerignore`
- `docker/apache.conf`
- `docker/start.sh`

### Blueprint Deployment

1. Push the project to GitHub.
2. In Render, create a new Blueprint from the repository.
3. Render reads `render.yaml` and creates:
   - The Docker web service
   - The PostgreSQL database
4. Set the required secret values in the Render dashboard:

```env
APP_KEY=base64:your-generated-key
APP_URL=https://your-render-domain.onrender.com
```

Generate a production application key locally:

```bash
php artisan key:generate --show
```

The Render Blueprint configures `DB_CONNECTION=pgsql` and connects `DB_URL` to the PostgreSQL service.

During container startup, the project automatically runs:

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Manual Render Environment Variables

When deploying without the Blueprint, configure at least:

```env
APP_NAME="My Money Tracker"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your-generated-key
APP_URL=https://your-render-domain.onrender.com

LOG_CHANNEL=stderr
DB_CONNECTION=pgsql
DB_URL=your_postgresql_connection_string
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

Do not commit the real `.env` file or any production credentials to GitHub.

## API Reference

All protected endpoints require this header:

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Accept: application/json
```

### Authentication

| Method | Endpoint | Authentication | Purpose |
|---|---|---:|---|
| `POST` | `/api/register` | No | Register and receive a token |
| `POST` | `/api/login` | No | Log in and receive a token |
| `GET` | `/api/me` | Yes | Get the authenticated user |
| `POST` | `/api/logout` | Yes | Revoke the current token |

### Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Return balances, daily totals, monthly totals, recent records, and category spending |

### Wallets

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/accounts` | List wallets |
| `POST` | `/api/accounts` | Create a wallet |
| `GET` | `/api/accounts/{id}` | View a wallet |
| `PUT/PATCH` | `/api/accounts/{id}` | Update a wallet |
| `DELETE` | `/api/accounts/{id}` | Delete a wallet |

### Categories

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create a category |
| `GET` | `/api/categories/{id}` | View a category |
| `PUT/PATCH` | `/api/categories/{id}` | Update a category |
| `DELETE` | `/api/categories/{id}` | Delete a category |

### Money Records

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/transactions` | List paginated money records |
| `POST` | `/api/transactions` | Create a money record |
| `GET` | `/api/transactions/{id}` | View a money record |
| `PUT/PATCH` | `/api/transactions/{id}` | Update a money record |
| `DELETE` | `/api/transactions/{id}` | Delete a money record |

Supported transaction query parameters:

```text
type=income|expense
account_id={id}
category_id={id}
from=YYYY-MM-DD
to=YYYY-MM-DD
search={description}
```

Example:

```http
GET /api/transactions?type=expense&from=2026-07-01&to=2026-07-31&search=food
```

## Useful Commands

```bash
# Run the complete local development environment
composer run dev

# Run Laravel tests
composer test

# Build production frontend assets
npm run build

# Format PHP code
./vendor/bin/pint

# Inspect registered routes
php artisan route:list

# Reset the local database
php artisan migrate:fresh
```

> `php artisan migrate:fresh` permanently deletes all records in the selected database. Do not run it against the production database or any database containing real financial data.

## Security and Privacy Notes

- Passwords are hashed by Laravel before storage.
- Protected endpoints require a valid Sanctum token.
- The current token is removed during logout.
- Financial records are queried through the authenticated user.
- The website does not require direct bank access.
- Never store bank passwords, PINs, OTP codes, or full card details in transaction notes.
- Keep `APP_DEBUG=false` in production.
- Keep `.env`, database URLs, application keys, and mail credentials out of Git.
- Back up production data regularly, especially because the project is being used for real financial records.

## Roadmap

Planned improvements include:

- Email ownership verification and resend-verification flow
- Password recovery
- First-time onboarding that guides users to create a wallet
- Always-visible shortcuts for adding income and expenses
- Modal or drawer-based transaction entry
- Frontend edit and delete actions
- More complete transaction filtering in the interface
- Currency-aware USD and KHR formatting
- Budget limits and spending progress
- Savings goals
- Recurring income and expenses
- Data export and backup tools
- Improved reports and long-term trends
- Mobile application using the same Laravel API

## Author

**Van Phanith**

Built as a personal project for practical daily money tracking and continued full-stack development practice.
