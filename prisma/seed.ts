import "dotenv/config";

import bcrypt from "bcryptjs";

import { db } from "../lib/db";

/**
 * Idempotent seed — safe to re-run. Everything uses upsert keyed on a natural
 * unique field, so running it twice updates rather than duplicating.
 *
 * IMPORTANT about the copy below: these division summaries are original,
 * generic descriptions of each service line, written as a starting point for
 * the client to review and replace with their own wording. They are not taken
 * from any other company's site, and they make no claim about equipment owned
 * or projects delivered — those are per-company facts that belong to
 * Elatronics and must come from them.
 */

type DivisionSeed = {
  slug: string;
  title: string;
  category: "EPCIM" | "SERVICE_OFFERING" | "PROCUREMENT";
  summary: string;
  order: number;
};

const DIVISIONS: DivisionSeed[] = [
  // ── EPCIM ──────────────────────────────────────────────────────────────
  {
    slug: "offshore-onshore-construction-installation",
    title: "Offshore & Onshore Construction and Installation",
    category: "EPCIM",
    summary:
      "Fabrication, installation and hook-up work across offshore platforms and onshore facilities, from structural steelwork through to commissioning support.",
    order: 1,
  },
  {
    slug: "marine-support-asset-integrity",
    title: "Marine Support & Asset Integrity",
    category: "EPCIM",
    summary:
      "Marine logistics and asset integrity management, including inspection programmes, condition monitoring and remedial work that keeps offshore assets in service.",
    order: 2,
  },
  {
    slug: "general-maintenance",
    title: "General Maintenance",
    category: "EPCIM",
    summary:
      "Planned and corrective maintenance for plant and production facilities, covering shutdown campaigns, routine servicing and emergency response.",
    order: 3,
  },

  // ── Service offerings ──────────────────────────────────────────────────
  {
    slug: "inspection-ndt",
    title: "Inspection & NDT",
    category: "SERVICE_OFFERING",
    summary:
      "Non-destructive testing and inspection services used to verify weld quality, detect corrosion and confirm the fitness-for-service of pressure equipment and structures.",
    order: 10,
  },
  {
    slug: "electrical-instrumentation-control",
    title: "Electrical, Instrumentation & Control",
    category: "SERVICE_OFFERING",
    summary:
      "Installation, calibration and maintenance of electrical distribution, field instrumentation and control systems, including loop checks and fault diagnosis.",
    order: 11,
  },
  {
    slug: "pipeline-management",
    title: "Pipeline Management",
    category: "SERVICE_OFFERING",
    summary:
      "Pipeline construction, pigging, pressure testing and integrity services for gathering lines, trunk lines and associated infrastructure.",
    order: 12,
  },
  {
    slug: "hydraulic-system-solutions",
    title: "Hydraulic System Solutions",
    category: "SERVICE_OFFERING",
    summary:
      "Design, servicing and repair of hydraulic power systems, including cylinder overhaul, flushing to cleanliness specification and on-site troubleshooting.",
    order: 13,
  },
  {
    slug: "hose-management-solutions",
    title: "Hose Management Solutions",
    category: "SERVICE_OFFERING",
    summary:
      "Supply, testing, certification and lifecycle tracking of industrial and marine hoses, including scheduled re-testing and register management.",
    order: 14,
  },
  {
    slug: "environmental-laboratory-support",
    title: "Environmental & Laboratory Support Services",
    category: "SERVICE_OFFERING",
    summary:
      "Environmental monitoring, sampling and laboratory analysis supporting regulatory compliance and site environmental management plans.",
    order: 15,
  },
  {
    slug: "oilfield-support-services",
    title: "Oilfield Support Services",
    category: "SERVICE_OFFERING",
    summary:
      "Support services for drilling and production operations, covering personnel, equipment provision and site logistics.",
    order: 16,
  },
  {
    slug: "rotating-equipment-repair",
    title: "Rotating Equipment Repair",
    category: "SERVICE_OFFERING",
    summary:
      "Overhaul and repair of pumps, compressors, turbines and gearboxes, including alignment, balancing and vibration analysis.",
    order: 17,
  },
  {
    slug: "heavy-lifting-transportation",
    title: "Heavy Lifting & Transportation",
    category: "SERVICE_OFFERING",
    summary:
      "Lifting studies, rigging and heavy haulage for oversized loads, including load-out, transport and installation of major components.",
    order: 18,
  },

  // ── Procurement ────────────────────────────────────────────────────────
  {
    slug: "global-procurement",
    title: "Global Procurement",
    category: "PROCUREMENT",
    summary:
      "Sourcing and supply of equipment, spares and consumables through established manufacturer and distributor channels, with expediting and inspection.",
    order: 20,
  },
];

async function seedSiteSettings() {
  const data = {
    companyName: "Elatronics Ventures",
    tagline: "Integrated engineering and industrial services",
    country: "Nigeria",
    addressLine: "Royal Garden Estate, Off Lakowe Lake Resort Road",
    city: "Lakowe, Ibeju-Lekki",
    state: "Lagos State",
    email: "sadohgani@yahoo.com",
    phone: "+234 803 282 9403",
    whatsapp: "+234 903 022 8288",
    workingHours: "Mon – Fri, 9am to 5pm",
    defaultSeoTitle: "Elatronics Ventures | Engineering & Industrial Services",
    defaultSeoDescription:
      "Integrated engineering, construction, maintenance and inspection services for the energy and industrial sectors in Nigeria.",
  };

  await db.siteSetting.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });

  console.log("  site settings   ok");
}

async function seedDivisions() {
  for (const d of DIVISIONS) {
    const data = {
      title: d.title,
      category: d.category,
      summary: d.summary,
      order: d.order,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    };

    await db.division.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, ...data },
      update: data,
    });
  }

  console.log(`  divisions       ok (${DIVISIONS.length})`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "  admin user      SKIPPED — set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then re-run",
    );
    return;
  }

  if (password.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters. This account can edit the whole site.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.upsert({
    where: { email },
    create: {
      email,
      name: "Site Administrator",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    // Deliberately does not overwrite the password on re-run — re-seeding
    // should never silently reset a password that has since been changed.
    update: { role: "SUPER_ADMIN", isActive: true },
  });

  console.log(`  admin user      ok (${email})`);
}

async function main() {
  console.log("seeding:");
  await seedSiteSettings();
  await seedDivisions();
  await seedAdmin();
  console.log("done.");
}

main()
  .catch((error) => {
    console.error("seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
