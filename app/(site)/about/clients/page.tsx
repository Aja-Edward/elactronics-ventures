import type { Metadata } from "next";
import Image from "next/image";

import EmptyNotice from "@/components/site/EmptyNotice";
import PageHero from "@/components/site/PageHero";
import WorkWithUs from "@/components/site/WorkWithUs";
import { ABOUT_TRAIL, getClients } from "@/lib/about";

export const metadata: Metadata = {
  title: "Clients",
  description:
    "Operators and contractors Elatronics Ventures has delivered work for.",
  alternates: { canonical: "/about/clients" },
};

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <PageHero
        title="Clients"
        trail={ABOUT_TRAIL}
        intro="The operators and contractors we deliver for."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {clients.length === 0 ? (
            <EmptyNotice>Our client list will be published here shortly.</EmptyNotice>
          ) : (
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {clients.map((client: (typeof clients)[number]) => (
                <li
                  key={client.id}
                  className="flex flex-col items-center gap-3 rounded-lg border border-brand-100 bg-white p-5 text-center"
                >
                  {client.logo ? (
                    <span className="relative block h-14 w-full">
                      <Image
                        src={client.logo.secureUrl}
                        alt={client.logo.alt || client.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain"
                      />
                    </span>
                  ) : (
                    <span className="font-display text-base font-semibold text-brand-900">
                      {client.name}
                    </span>
                  )}
                  {client.sector && (
                    <span className="text-xs uppercase tracking-wide text-steel-600">
                      {client.sector}
                    </span>
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
