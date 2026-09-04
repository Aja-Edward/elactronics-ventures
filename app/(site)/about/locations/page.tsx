import type { Metadata } from "next";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { ABOUT_TRAIL, getLocations } from "@/lib/about";

export const metadata: Metadata = {
  title: "Global Locations",
  description:
    "Where Elatronics Ventures operates from, including our head office and regional bases.",
  alternates: { canonical: "/about/locations" },
};

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <>
      <PageHero
        pageSlug="about-locations"
        title="Global Locations"
        trail={ABOUT_TRAIL}
        intro="The offices and operating bases we work from."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {locations.length === 0 ? (
            <EmptyNotice>Our locations will be listed here shortly.</EmptyNotice>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((loc: (typeof locations)[number]) => (
                <li
                  key={loc.id}
                  className="rounded-lg border border-brand-100 bg-white p-5"
                >
                  <p className="font-display text-base font-semibold text-brand-900">
                    {loc.name}
                    {loc.isHeadOffice && (
                      <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-800">
                        Head office
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-steel-700">
                    {[loc.addressLine, loc.city, loc.state, loc.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {loc.phone && (
                    <a
                      href={`tel:${loc.phone.replace(/\s/g, "")}`}
                      className="mt-2 block text-sm font-medium text-brand-900 hover:text-accent-600"
                    >
                      {loc.phone}
                    </a>
                  )}
                  {loc.email && (
                    <a
                      href={`mailto:${loc.email}`}
                      className="mt-1 block text-sm font-medium text-brand-900 hover:text-accent-600"
                    >
                      {loc.email}
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
