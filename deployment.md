# Deployment Guide - POS System

This guide outlines the steps to deploy the POS system (Next.js Frontend & Laravel Backend).

## 🚀 Backend (Laravel)

1.  **Clone & Install Dependencies**:
    ```bash
    cd server
    composer install
    ```
2.  **Environment Setup**:
    ```bash
    cp .env.example .env
    php artisan key:generate
    php artisan jwt:secret
    ```
3.  **Database Configuration**:
    Configure your DB in `.env` (SQLite by default).
    ```bash
    php artisan migrate --seed
    ```
4.  **Storage Link**:
    ```bash
    php artisan storage:link
    ```
5.  **Serve**:
    ```bash
    php artisan serve
    # Or configure Nginx/Apache for production
    ```

## 💻 Frontend (Next.js)

1.  **Install Dependencies**:
    ```bash
    cd client
    npm install
    ```
2.  **Environment Setup**:
    Create `.env.local` and set `NEXT_PUBLIC_API_URL`:
    ```bash
    NEXT_PUBLIC_API_URL=http://your-laravel-api.com/api
    ```
3.  **Build**:
    ```bash
    npm run build
    ```
4.  **Start**:
    ```bash
    npm start
    # Or use PM2 to manage the process
    ```

## 🛠️ Essential Maintenance Commands

- **Reset Database**: `php artisan migrate:fresh --seed`
- **Clear Cache**: `php artisan optimize:clear`
- **Link Storage**: `php artisan storage:link` (Critical for product images)

## 🔑 Default Credentials (If seeded)
Check `database/seeders/DatabaseSeeder.php` for admin credentials.
Typically: `admin@example.com` / `password123`.
