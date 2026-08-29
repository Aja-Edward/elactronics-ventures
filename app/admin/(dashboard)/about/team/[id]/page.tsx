import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { save } from "../actions";
import ResourceForm, {
  type Field,
  type FieldValues,
} from "@/components/admin/ResourceForm";
import { getMediaOptions } from "@/lib/admin/crud";
import { db } from "@/lib/db";

export const instant = false;

export const metadata: Metadata = { title: "Edit person" };

const FIELDS: Field[] = [
  { kind: "text", name: "name", label: "Full name", required: true, placeholder: "e.g. Gani Sadoh" },
  { kind: "text", name: "role", label: "Role", required: true, placeholder: "e.g. Managing Director" },
  {
    kind: "text",
    name: "slug",
    label: "Web address",
    hint: "Filled in from the name. Change it only if you need to.",
  },
  { kind: "email", name: "email", label: "Email" },
  { kind: "url", name: "linkedin", label: "LinkedIn", full: true, placeholder: "https://…" },
  {
    kind: "textarea",
    name: "bio",
    label: "Biography",
    rows: 6,
    maxLength: 1200,
    full: true,
    placeholder: "Background, qualifications and responsibilities.",
  },
];

const SIDE_FIELDS: Field[] = [
  {
    kind: "checkbox",
    name: "isBoard",
    label: "Board member",
    hint: "Board members are listed above the leadership team.",
  },
  { kind: "number", name: "order", label: "Order", min: 0, max: 9999, hint: "Lower numbers appear first." },
];

const BLANK: FieldValues = {
  name: "", role: "", slug: "", email: "", linkedin: "", bio: "",
  photoId: "", isBoard: false, order: 0,
};

export default async function EditTeamMemberPage({
  params,
}: PageProps<"/admin/about/team/[id]">) {
  const { id } = await params;
  const creating = id === "new";

  const [row, media] = await Promise.all([
    creating
      ? null
      : db.teamMember.findUnique({
          where: { id },
          select: {
            id: true, name: true, role: true, slug: true, email: true,
            linkedin: true, bio: true, photoId: true, isBoard: true, order: true,
          },
        }),
    getMediaOptions(),
  ]);

  if (!creating && !row) notFound();

  const values: FieldValues = row
    ? {
        name: row.name,
        role: row.role,
        slug: row.slug,
        email: row.email ?? "",
        linkedin: row.linkedin ?? "",
        bio: row.bio ?? "",
        photoId: row.photoId ?? "",
        isBoard: row.isBoard,
        order: row.order,
      }
    : BLANK;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
        {creating ? "New person" : String(values.name)}
      </h1>
      <ResourceForm
        action={save.bind(null, row?.id ?? null)}
        values={values}
        fields={FIELDS}
        sideFields={SIDE_FIELDS}
        media={{ name: "photoId", label: "Photo", options: media }}
        slug={{ source: "name", name: "slug" }}
        cancelHref="/admin/about/team"
      />
    </div>
  );
}
