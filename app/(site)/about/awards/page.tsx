import type { Metadata } from "next";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { ABOUT_TRAIL, getAwards } from "@/lib/about";

export const metadata: Metadata = {
  title: "Awards & Recognitions",
  description:
    "Awards and industry recognition received by Elatronics Ventures.",
  alternates: { canonical: "/about/awards" },
};

export default async function AwardsPage() {
  const awards = await getAwards();

  return (
    <>
      <PageHero
        title="Awards & Recognitions"
        trail={ABOUT_TRAIL}
        intro="Recognition from clients, partners and industry bodies for the work we deliver."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          {awards.length === 0 ? (
            <EmptyNotice>
              Awards and recognition will be listed here shortly.
            </EmptyNotice>
          ) : (
            <ul className="divide-y divide-brand-100 border-y border-brand-100">
              {awards.map((award: (typeof awards)[number]) => (
                <li key={award.id} className="py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-brand-900">
                      {award.title}
                    </span>
                    <span className="text-sm text-steel-600 tabular-nums">
                      {[award.awardedBy, award.year].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  {award.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-steel-700">
                      {award.description}
                    </p>
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
