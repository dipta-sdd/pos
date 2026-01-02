# Testing Instructions

This document provides instructions on how to set up the environment and run the feature tests for this project.

## Prerequisites

- PHP 8.2 or higher
- Composer
- A configured database (e.g., MySQL, PostgreSQL, SQLite)

## Setup

1.  **Install Dependencies:**
    Navigate to the `server` directory and run `composer install` to install the required PHP packages.

    ```bash
    cd server
    composer install
    ```

2.  **Environment Configuration:**
    Create a `.env` file by copying the `.env.example`.

    ```bash
    cp .env.example .env
    ```

    Generate a new application key:

    ```bash
    php artisan key:generate
    ```

3.  **Database Configuration:**
    Update the `DB_*` variables in your `.env` file to match your local database credentials.

    For testing, it's highly recommended to use a separate database or an in-memory SQLite database. To use SQLite for tests, update your `phpunit.xml` file with the following environment variables:

    ```xml
    <env name="DB_CONNECTION" value="sqlite"/>
    <env name="DB_DATABASE" value=":memory:"/>
    ```

## Running Tests

1.  **Run Migrations and Seeders:**
    Before running the tests, you need to set up the database schema and seed it with initial data. The `RefreshDatabase` trait is used in the tests, which will handle migrating the database for each test, but it's good practice to have the database set up for other development purposes.

    ```bash
    php artisan migrate --seed
    ```

2.  **Execute the Test Suite:**
    Run the following command from the `server` directory to execute all the feature tests:

    ```bash
    php artisan test
    ```

    To run a specific test file, you can use the `--filter` option:

    ```bash
    php artisan test --filter=CategoryApiTest
    ```
