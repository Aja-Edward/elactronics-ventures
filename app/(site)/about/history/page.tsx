import type { Metadata } from "next";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { ABOUT_TRAIL, getMilestones } from "@/lib/about";

export const metadata: Metadata = {
  title: "Our History",
  description:
    "The milestones behind Elatronics Ventures, from incorporation to the capabilities we operate today.",
  alternates: { canonical: "/about/history" },
};

export default async function HistoryPage() {
  const milestones = await getMilestones();

  return (
    <>
      <PageHero
        title="Our History"
        trail={ABOUT_TRAIL}
        intro="How the business grew into the divisions and capabilities it operates today."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          {milestones.length === 0 ? (
            <EmptyNotice>Our company timeline will be published here shortly.</EmptyNotice>
          ) : (
            <ol className="space-y-6 border-l border-brand-200 pl-6">
              {milestones.map((m: (typeof milestones)[number]) => (
                <li key={m.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-accent-600"
                  />
                  <p className="font-display text-lg font-bold text-brand-900 tabular-nums">
                    {m.year}
                  </p>
                  <p className="mt-0.5 font-medium text-brand-900">{m.title}</p>
                  {m.description && (
                    <p className="mt-1 text-sm leading-relaxed text-steel-700">
                      {m.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
