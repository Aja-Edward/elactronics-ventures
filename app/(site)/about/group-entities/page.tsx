import type { Metadata } from "next";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { ABOUT_TRAIL, getGroupEntities } from "@/lib/about";

export const metadata: Metadata = {
  title: "Group Entities",
  description:
    "The companies that make up the Elatronics Ventures group and what each one does.",
  alternates: { canonical: "/about/group-entities" },
};

export default async function GroupEntitiesPage() {
  const entities = await getGroupEntities();

  return (
    <>
      <PageHero
        title="Group Entities"
        trail={ABOUT_TRAIL}
        intro="The companies that make up the group, and the capability each one brings."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {entities.length === 0 ? (
            <EmptyNotice>Our group companies will be listed here shortly.</EmptyNotice>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {entities.map((entity: (typeof entities)[number]) => (
                <li
                  key={entity.id}
                  className="flex flex-col rounded-lg border border-brand-100 bg-white p-5"
                >
                  <p className="font-display text-base font-semibold text-brand-900">
                    {entity.name}
                  </p>
                  {entity.description && (
                    <p className="mt-2 text-sm leading-relaxed text-steel-700">
                      {entity.description}
                    </p>
                  )}
                  {entity.website && (
                    <a
                      href={entity.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 text-sm font-medium text-brand-900 hover:text-accent-600"
                    >
                      Visit website
                      <span aria-hidden> →</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
