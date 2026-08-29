import type { Metadata } from "next";
import Image from "next/image";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { ABOUT_TRAIL, getTeam } from "@/lib/about";

export const metadata: Metadata = {
  title: "Our Governance",
  description:
    "The board and leadership team responsible for how Elatronics Ventures is run.",
  alternates: { canonical: "/about/governance" },
};

export default async function GovernancePage() {
  const team = await getTeam();

  // `isBoard` exists to separate governance from operational management, so
  // the page that is actually about governance leads with the board.
  const board = team.filter((m: (typeof team)[number]) => m.isBoard);
  const management = team.filter((m: (typeof team)[number]) => !m.isBoard);

  const groups = [
    { heading: "Board of directors", members: board },
    { heading: "Leadership team", members: management },
  ].filter((g) => g.members.length > 0);

  return (
    <>
      <PageHero
        title="Our Governance"
        trail={ABOUT_TRAIL}
        intro="The people accountable for our standards, our safety record and the commitments we make to clients."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl space-y-14 px-6">
          {groups.length === 0 ? (
            <EmptyNotice>
              Details of our board and leadership team will be published here
              shortly.
            </EmptyNotice>
          ) : (
            groups.map((group) => (
              <div key={group.heading}>
                <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
                  {group.heading}
                </h2>
                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((member) => (
                    <li
                      key={member.id}
                      className="overflow-hidden rounded-lg border border-brand-100 bg-white"
                    >
                      <div className="relative aspect-[4/5] bg-surface">
                        {member.photo && (
                          <Image
                            src={member.photo.secureUrl}
                            alt={member.photo.alt || member.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-5">
                        <p className="font-display text-base font-semibold text-brand-900">
                          {member.name}
                        </p>
                        <p className="mt-0.5 text-sm text-accent-600">
                          {member.role}
                        </p>
                        {member.bio && (
                          <p className="mt-2 text-sm leading-relaxed text-steel-700">
                            {member.bio}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
