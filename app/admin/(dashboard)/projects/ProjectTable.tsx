"use client";

import Image from "next/image";

import { deleteProject, setPublished } from "./actions";
import RowActions, { StatusPill } from "@/components/admin/RowActions";

export type ProjectSummary = {
  id: string;
  title: string;
  slug: string;
  clientName: string | null;
  year: number | null;
  divisionTitle: string | null;
  isFeatured: boolean;
  published: boolean;
  imageUrl: string | null;
};

export default function ProjectTable({
  items,
  canManage,
}: {
  items: ProjectSummary[];
  canManage: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-100 bg-surface">
              {["Project", "Client", "Year", "Division", "Status", ""].map((h, i) => (
                <th
                  key={h || i}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-steel-600 ${i === 5 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded border border-brand-100 bg-surface">
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-brand-900">
                        {item.title}
                        {item.isFeatured && (
                          <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-800">
                            Featured
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-steel-500">/{item.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-steel-700">{item.clientName ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-steel-700 tabular-nums">{item.year ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-steel-700">{item.divisionTitle ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusPill published={item.published} />
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    editHref={`/admin/projects/${item.id}`}
                    published={item.published}
                    canManage={canManage}
                    onTogglePublish={(p) => setPublished(item.id, p)}
                    onDelete={() => deleteProject(item.id)}
                    confirmMessage={`Delete "${item.title}" permanently? Gallery entries go with it; images stay in the media library.`}
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
