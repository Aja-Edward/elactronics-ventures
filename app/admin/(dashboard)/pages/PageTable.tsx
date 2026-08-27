"use client";

import { deletePage, setPublished } from "./actions";
import RowActions, { StatusPill } from "@/components/admin/RowActions";

export type PageSummary = {
  id: string;
  title: string;
  slug: string;
  hasBody: boolean;
  published: boolean;
};

export default function PageTable({
  pages,
  canManage,
}: {
  pages: PageSummary[];
  canManage: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-100 bg-surface">
              {["Page", "Content", "Status", ""].map((h, i) => (
                <th
                  key={h || i}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-steel-600 ${i === 3 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-brand-900">{page.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-steel-500">/{page.slug}</p>
                </td>
                <td className="px-4 py-3 text-sm">
                  {page.hasBody ? (
                    <span className="text-steel-700">Body set</span>
                  ) : (
                    <span className="font-medium text-accent-700">No body yet</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusPill published={page.published} />
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    editHref={`/admin/pages/${page.id}`}
                    published={page.published}
                    canManage={canManage}
                    onTogglePublish={(p) => setPublished(page.id, p)}
                    onDelete={() => deletePage(page.id)}
                    confirmMessage={`Delete the "${page.title}" page?`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
