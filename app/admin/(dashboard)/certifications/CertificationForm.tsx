"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveCertification, type SaveState } from "./actions";

export type MediaOption = {
  id: string;
  secureUrl: string;
  alt: string | null;
  publicId: string;
};

export type CertificationValues = {
  id: string | null;
  name: string;
  issuer: string;
  reference: string;
  description: string;
  fileId: string | null;
  issuedAt: string;
  expiresAt: string;
  order: number;
};

const field =
  "w-full rounded border border-brand-200 px-3 py-2 text-sm text-brand-950 outline-none transition-colors placeholder:text-steel-400 focus:border-brand-900 focus:ring-2 focus:ring-brand-900/15";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function CertificationForm({
  values,
  media,
}: {
  values: CertificationValues;
  media: MediaOption[];
}) {
  const save = saveCertification.bind(null, values.id);
  const [state, formAction] = useActionState<SaveState, FormData>(save, {});
  const [fileId, setFileId] = useState(values.fileId ?? "");

  const err = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p
          role="alert"
          className="rounded border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-800"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Certification
            </label>
            <input
              id="name"
              name="name"
              defaultValue={values.name}
              required
              className={field}
              placeholder="e.g. ISO 9001:2015 Quality Management"
            />
            {err("name") && <p className="text-xs text-accent-700">{err("name")}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="issuer" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Issuing body
              </label>
              <input
                id="issuer"
                name="issuer"
                defaultValue={values.issuer}
                className={field}
                placeholder="e.g. BSI, COREN, NCDMB"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reference" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Certificate number
              </label>
              <input
                id="reference"
                name="reference"
                defaultValue={values.reference}
                className={`${field} font-mono`}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="issuedAt" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Issued
              </label>
              <input id="issuedAt" name="issuedAt" type="date" defaultValue={values.issuedAt} className={field} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="expiresAt" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Expires
              </label>
              <input id="expiresAt" name="expiresAt" type="date" defaultValue={values.expiresAt} className={field} />
              {err("expiresAt") && <p className="text-xs text-accent-700">{err("expiresAt")}</p>}
              <p className="text-xs text-steel-500">
                Expired certificates are flagged in this list so they can be renewed.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
              Scope
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={values.description}
              rows={4}
              maxLength={600}
              className={field}
              placeholder="What the certificate covers."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-5 rounded-lg border border-brand-100 bg-white p-5">
            <div className="space-y-1.5">
              <label htmlFor="order" className="block text-xs font-semibold uppercase tracking-wide text-steel-600">
                Order
              </label>
              <input
                id="order"
                name="order"
                type="number"
                min={0}
                max={9999}
                defaultValue={values.order}
                className={field}
              />
              <p className="text-xs text-steel-500">Lower numbers appear first.</p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-600">
              Logo or certificate scan
            </p>
            <input type="hidden" name="fileId" value={fileId} />

            {media.length === 0 ? (
              <p className="text-sm text-steel-700">
                No media yet.{" "}
                <Link href="/admin/media" className="font-semibold text-brand-900 underline">
                  Upload one first
                </Link>
                .
              </p>
            ) : (
              <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setFileId("")}
                  className={`flex aspect-square items-center justify-center rounded border text-[11px] font-semibold ${
                    fileId === ""
                      ? "border-brand-900 bg-brand-50 text-brand-900"
                      : "border-brand-200 text-steel-600 hover:border-brand-300"
                  }`}
                >
                  None
                </button>
                {media.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFileId(m.id)}
                    title={m.publicId}
                    className={`relative aspect-square overflow-hidden rounded border bg-surface ${
                      fileId === m.id
                        ? "border-brand-900 ring-2 ring-brand-900/25"
                        : "border-brand-200 hover:border-brand-300"
                    }`}
                  >
                    <Image src={m.secureUrl} alt={m.alt ?? ""} fill sizes="120px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Save />
        <Link
          href="/admin/certifications"
          className="rounded border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
