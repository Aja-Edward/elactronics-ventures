import type { Metadata } from "next";
import Link from "next/link";

import CertificationRow, { type CertSummary } from "./CertificationRow";
import { canPublish, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Certifications" };

export default async function CertificationsAdminPage() {
  const user = await getCurrentUser();

  const rows = await db.certification.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      issuer: true,
      reference: true,
      status: true,
      order: true,
      expiresAt: true,
      file: { select: { secureUrl: true } },
    },
  });

  const now = new Date();
  const certs: CertSummary[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    issuer: r.issuer,
    reference: r.reference,
    status: r.status,
    order: r.order,
    expiresAt: r.expiresAt ? r.expiresAt.toISOString().slice(0, 10) : null,
    expired: Boolean(r.expiresAt && r.expiresAt < now),
    logoUrl: r.file?.secureUrl ?? null,
  }));

  const expiredCount = certs.filter((c) => c.expired).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
            Certifications
          </h1>
          <p className="mt-1 text-sm text-steel-700">
            {certs.filter((c) => c.status === "PUBLISHED").length} of {certs.length} published.
          </p>
        </div>
        <Link
          href="/admin/certifications/new"
          className="rounded bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          New certification
        </Link>
      </div>

      {/* An expired certificate on a public site is a false accreditation
          claim, so it is surfaced rather than left to be noticed. */}
      {expiredCount > 0 && (
        <p className="rounded border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800">
          {expiredCount} certificate{expiredCount === 1 ? " has" : "s have"} passed
          their expiry date. Renew or unpublish — a lapsed certificate shown
          publicly overstates what the company currently holds.
        </p>
      )}

      {certs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 bg-white p-12 text-center">
          <p className="text-sm text-steel-700">
            No certifications yet. Add one, then attach an image from the media
            library.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-100 bg-surface">
                  {["Certification", "Expires", "Order", "Status", ""].map((h, i) => (
                    <th
                      key={h || i}
                      className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-steel-600 ${i === 4 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {certs.map((cert) => (
                  <CertificationRow
                    key={cert.id}
                    cert={cert}
                    canManage={user ? canPublish(user.role) : false}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
