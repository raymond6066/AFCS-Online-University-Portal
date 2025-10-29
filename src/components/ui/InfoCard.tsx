import { PropsWithChildren } from "react";

export function InfoCard({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div className="card space-y-3">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary-500">{subtitle}</p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>
    </div>
  );
}
