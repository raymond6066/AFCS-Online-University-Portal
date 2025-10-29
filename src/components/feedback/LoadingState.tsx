export const LoadingState = ({ message = "Loading data..." }: { message?: string }) => (
  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-inner dark:border-slate-700 dark:bg-slate-900/60">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{message}</p>
  </div>
);
