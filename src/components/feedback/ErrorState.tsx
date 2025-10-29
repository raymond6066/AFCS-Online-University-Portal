export const ErrorState = ({
  message = "Unable to load data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-3xl border border-red-300 bg-red-50/70 p-10 text-center shadow-inner dark:border-red-500/60 dark:bg-red-500/10">
    <p className="text-sm font-semibold text-red-600 dark:text-red-400">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-2xl bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-600"
      >
        Try again
      </button>
    )}
  </div>
);
