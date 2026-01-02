export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
          <div className="w-20 h-20 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please wait while we prepare your content
        </p>
      </div>
    </div>
  );
}
