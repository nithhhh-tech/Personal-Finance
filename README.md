# PocketLedger API

PocketLedger is a Laravel REST API for a personal finance system: daily income and expense tracking, accounts/wallets, categories, transaction history, and dashboard summaries.

## MVP Features

- Sanctum token authentication: register, login, logout, current user
- Account and wallet CRUD with starting/current balances
- Income and expense category CRUD with defaults on registration
- Transaction CRUD with filters by type, date, account, category, and search text
- Automatic account balance recalculation after transaction changes
- Dashboard summary for current balance, today totals, monthly income, monthly expenses, monthly savings, recent transactions, and spending by category

## Run Locally

```bash
composer install
php artisan migrate:fresh
php artisan serve
```

The API will be available at `http://127.0.0.1:8000/api`.

## Main Endpoints

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/dashboard/summary`
- `apiResource /api/accounts`
- `apiResource /api/categories`
- `apiResource /api/transactions`

Use the returned bearer token from login/register for protected routes.
