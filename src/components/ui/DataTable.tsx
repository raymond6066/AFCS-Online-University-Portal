import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor: (item: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  data,
  columns,
  emptyMessage,
}: {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}) {
  return (
    <div className="table-card">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
        <thead className="bg-slate-50/80 dark:bg-slate-900/60">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={`px-4 py-3 font-medium text-slate-500 dark:text-slate-300 ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500 dark:text-slate-300">
                {emptyMessage ?? "No records found."}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                {columns.map((column) => (
                  <td key={column.header} className={`px-4 py-3 text-slate-700 dark:text-slate-200 ${column.className ?? ""}`}>
                    {column.accessor(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
