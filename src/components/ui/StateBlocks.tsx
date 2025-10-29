export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="card text-sm text-slate-600 dark:text-slate-300">
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card border border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-200">
      {message}
    </div>
  );
}
