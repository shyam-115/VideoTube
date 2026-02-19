export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500 mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}
