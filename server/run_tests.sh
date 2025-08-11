#!/bin/bash

# Authentication API Test Runner
# This script provides easy commands to run authentication tests

echo "🔐 Authentication API Test Runner"
echo "=================================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all         Run all authentication tests"
    echo "  auth        Run only AuthenticationTest"
    echo "  password    Run only PasswordResetTest"
    echo "  jwt         Run only JWTTokenTest"
    echo "  coverage    Run tests with coverage report"
    echo "  verbose     Run tests with verbose output"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 auth"
    echo "  $0 coverage"
}

# Function to run tests
run_tests() {
    local test_path=$1
    local options=$2
    
    echo "🧪 Running tests: $test_path"
    echo "Command: php artisan test $test_path $options"
    echo ""
    
    php artisan test $test_path $options
}

# Main script logic
case "${1:-help}" in
    "all")
        echo "🚀 Running all authentication tests..."
        run_tests "tests/Feature/Auth/"
        ;;
    "auth")
        echo "👤 Running AuthenticationTest..."
        run_tests "tests/Feature/Auth/AuthenticationTest.php"
        ;;
    "password")
        echo "🔑 Running PasswordResetTest..."
        run_tests "tests/Feature/Auth/PasswordResetTest.php"
        ;;
    "jwt")
        echo "🎫 Running JWTTokenTest..."
        run_tests "tests/Feature/Auth/JWTTokenTest.php"
        ;;
    "coverage")
        echo "📊 Running tests with coverage..."
        run_tests "tests/Feature/Auth/" "--coverage"
        ;;
    "verbose")
        echo "🔍 Running tests with verbose output..."
        run_tests "tests/Feature/Auth/" "-v"
        ;;
    "help"|*)
        show_usage
        ;;
esac

echo ""
echo "✅ Test execution completed!" 