export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-violet-600 dark:border-zinc-800 dark:border-t-violet-500 mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">{message}</p>
      </div>
    </div>
  );
}
