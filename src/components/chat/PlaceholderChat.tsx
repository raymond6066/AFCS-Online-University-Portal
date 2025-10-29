export const PlaceholderChat = ({ title }: { title: string }) => (
  <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-inner dark:border-slate-700 dark:bg-slate-900/60">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
      Messaging integration placeholder. Connect to your preferred provider (Amazon Connect, Amazon Chime SDK, etc.).
    </p>
  </div>
);
