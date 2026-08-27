import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CertificationForm, {
  type CertificationValues,
  type MediaOption,
} from "../CertificationForm";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Edit certification" };

const BLANK: CertificationValues = {
  id: null,
  name: "",
  issuer: "",
  reference: "",
  description: "",
  fileId: null,
  issuedAt: "",
  expiresAt: "",
  order: 0,
};

const asDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function EditCertificationPage({
  params,
}: PageProps<"/admin/certifications/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [cert, media] = await Promise.all([
    creating
      ? null
      : db.certification.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            issuer: true,
            reference: true,
            description: true,
            fileId: true,
            issuedAt: true,
            expiresAt: true,
            order: true,
          },
        }),
    db.media.findMany({
      where: { resourceType: "IMAGE" },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { id: true, secureUrl: true, alt: true, publicId: true },
    }),
  ]);

  if (!creating && !cert) notFound();

  const values: CertificationValues = cert
    ? {
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer ?? "",
        reference: cert.reference ?? "",
        description: cert.description ?? "",
        fileId: cert.fileId,
        issuedAt: asDateInput(cert.issuedAt),
        expiresAt: asDateInput(cert.expiresAt),
        order: cert.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New certification" : values.name}
      </h1>
      <CertificationForm values={values} media={media as MediaOption[]} />
    </div>
  );
}
