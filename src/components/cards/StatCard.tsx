interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
}

export const StatCard = ({ title, value, subtitle, trend }: StatCardProps) => (
  <div className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur dark:bg-slate-900/70">
    <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</p>
    <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    {subtitle && <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{subtitle}</p>}
    {trend && <p className="mt-3 text-xs font-semibold text-emerald-500">{trend}</p>}
  </div>
);
