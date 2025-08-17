import { Loader2, Shield } from "lucide-react";

export function UserLoding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Animated Logo/Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center">
            <Shield className="w-12 h-12 text-white animate-pulse" />
          </div>

          {/* Animated Rings */}
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-blue-200 border-t-blue-500 rounded-2xl animate-spin" />
          <div
            className="absolute inset-2 w-20 h-20 mx-auto border-4 border-indigo-200 border-t-indigo-500 rounded-2xl animate-spin"
            style={{
              animationDirection: "reverse",
              animationDuration: "1.5s",
            }}
          />
        </div>

        {/* Loading Text */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Securing Your Session
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please wait while we verify your authentication...
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse"
            style={{ width: "60%" }}
          />
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-gray-500 dark:text-gray-400">
              Checking credentials
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <span className="text-gray-500 dark:text-gray-400">
              Validating session
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    </div>
  );
}
