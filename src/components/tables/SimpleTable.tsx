import type { ReactNode } from "react";

interface Column<T> {
  header: string;
  accessor: (item: T) => ReactNode;
  className?: string;
}

interface SimpleTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export const SimpleTable = <T,>({ columns, data, emptyMessage = "No records found." }: SimpleTableProps<T>) => {
  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/70">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
        <thead className="bg-slate-50/80 dark:bg-slate-800/70">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={`px-6 py-4 font-semibold text-slate-600 dark:text-slate-200 ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/60">
              {columns.map((column) => (
                <td key={column.header} className={`px-6 py-4 text-slate-700 dark:text-slate-200 ${column.className ?? ""}`}>
                  {column.accessor(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
