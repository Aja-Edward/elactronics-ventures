import type { Metadata } from "next";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { ABOUT_TRAIL, getFaqs } from "@/lib/about";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to the questions we are asked most often about working with Elatronics Ventures.",
  alternates: { canonical: "/about/faqs" },
};

export default async function FaqsPage() {
  const faqs = await getFaqs();

  // Grouped here rather than in the query: the rows already arrive sorted by
  // category, so this is a single pass, and Prisma has no grouped-rows shape
  // that would survive the select anyway.
  const groups = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const key = faq.category?.trim() || "General";
    groups.set(key, [...(groups.get(key) ?? []), faq]);
  }

  return (
    <>
      <PageHero
        pageSlug="about-faqs"
        title="Frequently Asked Questions"
        crumb="FAQs"
        trail={ABOUT_TRAIL}
        intro="The questions we are asked most often about scope, mobilisation and how we work."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl space-y-12 px-6">
          {faqs.length === 0 ? (
            <EmptyNotice>
              Frequently asked questions will be published here shortly.
            </EmptyNotice>
          ) : (
            [...groups.entries()].map(([category, items]) => (
              <div key={category}>
                {/* The heading is noise when everything is uncategorised. */}
                {groups.size > 1 && (
                  <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
                    {category}
                  </h2>
                )}
                <div className="mt-6 divide-y divide-brand-100 border-y border-brand-100">
                  {items.map((faq) => (
                    <details key={faq.id} className="group py-4">
                      <summary className="flex cursor-pointer items-start justify-between gap-4 font-medium text-brand-900 marker:content-['']">
                        {faq.question}
                        <span
                          aria-hidden
                          className="mt-0.5 shrink-0 text-steel-500 transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-steel-700">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <WorkWithUs />
    </>
  );
}
