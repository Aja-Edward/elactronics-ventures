import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The admin list screen: heading, published count, "new" button, table.
 *
 * Columns are supplied as cell renderers so each entity decides what is worth
 * showing, while the chrome around them stays identical across the admin.
 */

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  /** Right-aligns the column; used for the actions column. */
  right?: boolean;
};

export default function ResourceList<T extends { id: string; status: string }>({
  title,
  newHref,
  newLabel,
  empty,
  columns,
  rows,
}: {
  title: string;
  newHref: string;
  newLabel: string;
  empty: ReactNode;
  columns: Column<T>[];
  rows: T[];
}) {
  const published = rows.filter((row) => row.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-steel-700">
            {published} of {rows.length} published.
          </p>
        </div>
        <Link
          href={newHref}
          className="rounded bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          {newLabel}
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 bg-white p-12 text-center">
          <p className="text-sm text-steel-700">{empty}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-100 bg-surface">
                  {columns.map((column, i) => (
                    <th
                      key={column.header || i}
                      className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-steel-600 ${
                        column.right ? "text-right" : ""
                      }`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column, i) => (
                      <td
                        key={column.header || i}
                        className={`px-4 py-3 text-sm text-steel-700 ${
                          column.right ? "text-right" : ""
                        }`}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
