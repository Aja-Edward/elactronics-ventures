import "dotenv/config";

import bcrypt from "bcryptjs";

import { db } from "../lib/db";
import { SKID_GROUP } from "../lib/service-groups";

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
  /** Long-form page copy. Only divisions whose page has been written carry it. */
  body?: string;
  /** Sidebar bullets on the division page. */
  capabilities?: string[];
};

/**
 * Paragraphs rather than one long string: the division page splits body text
 * on blank lines, so the join is the format the renderer expects.
 */
const PIPELINE_BODY = [
  "Elatronics Ventures supports pipeline operators across the full asset lifecycle - from construction and tie-in through inspection, monitoring and repair - covering gathering lines, trunk lines, flow lines and the associated station pipework. Scopes are planned around keeping the line in service: shutdown time is minimised and, where the technique allows, work is carried out on a live system.",
  "Integrity work runs on measurement rather than assumption. Inspection and monitoring data feed an assessment of a line's current condition and remaining life, which in turn sets the repair strategy - composite wrap, clamp, repair saddle or spool replacement - and the interval before the next survey. Findings are reported against the applicable codes so operators can evidence compliance to regulators.",
  "Work is delivered onshore, in swamp terrain and offshore, either as a single intervention or as a managed programme covering a whole network. Where a scope spans disciplines, the division draws on the inspection and NDT, general maintenance, and electrical, instrumentation and control teams under one set of project controls.",
].join("\n\n");

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
    body: PIPELINE_BODY,
    capabilities: [
      "Pipeline inspection and integrity assessment",
      "Pipeline monitoring and leak detection",
      "Hot tapping and line stopping",
      "Composite repair and structural reinforcement",
      "Emergency pipeline closures, clamps and repair saddles",
      "Pipe spool fabrication and replacement",
      "Descaling, cleaning and pigging",
      "Valve maintenance and repair",
      "Storage tank inspection",
      "Nitrogen services, helium leak testing and purging",
    ],
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

/**
 * Services that sit beneath a division, keyed by the parent division's slug.
 *
 * Separate from SKID_SYSTEMS below because these carry a divisionId instead of
 * a group: the division page renders them as the service list under its
 * overview copy, whereas the skid systems are their own top-level section.
 */
type DivisionServiceSeed = {
  slug: string;
  title: string;
  summary: string;
  order: number;
};

const DIVISION_SERVICES: Record<string, DivisionServiceSeed[]> = {
  "pipeline-management": [
    {
      slug: "pipeline-construction-repairs",
      title: "Pipeline Construction & Repairs",
      summary:
        "Construction, tie-in and repair of liquid and gas pipelines onshore and in swamp terrain, covering route preparation, welding, testing and reinstatement.",
      order: 1,
    },
    {
      slug: "pipe-spool-fabrication-replacement",
      title: "Pipe Spool Fabrication & Replacement",
      summary:
        "Survey, fabrication and change-out of pipe spools for onshore, offshore and process plant pipework, with material traceability and weld records.",
      order: 2,
    },
    {
      slug: "hot-tapping-line-stopping",
      title: "Hot Tapping & Line Stopping",
      summary:
        "Under-pressure drilling and line stopping that allow branch connections, isolations and repairs without taking the line out of service.",
      order: 3,
    },
    {
      slug: "emergency-pipeline-repair-eprs",
      title: "Emergency Pipeline Repair (EPRS)",
      summary:
        "Standby repair arrangements for onshore and offshore lines, covering emergency closures, clamps and repair saddles for rapid containment of a leak or rupture.",
      order: 4,
    },
    {
      slug: "pipeline-inspection-services",
      title: "Pipeline Inspection Services",
      summary:
        "In-line and external inspection to locate corrosion, wall loss and mechanical damage, consolidated into a single condition record for the line.",
      order: 5,
    },
    {
      slug: "pipeline-integrity-management",
      title: "Pipeline Integrity Management",
      summary:
        "In-trench evaluation of reported anomalies, fitness-for-service assessment and remaining-life estimation used to prioritise repair and set survey intervals.",
      order: 6,
    },
    {
      slug: "pipeline-monitoring-leak-detection",
      title: "Pipeline Monitoring & Leak Detection",
      summary:
        "Monitoring and detection systems configured to the operating profile of a gas or crude line, with alarms routed to the operator's control room.",
      order: 7,
    },
    {
      slug: "pipeline-pressure-monitoring",
      title: "Pipeline Pressure Monitoring",
      summary:
        "Pressure surveillance and line-break control that flag an abnormal drop early and can trigger automatic isolation.",
      order: 8,
    },
    {
      slug: "pipeline-drone-inspection",
      title: "Drone Inspection & Survey",
      summary:
        "Aerial inspection of pipelines, tanks, vessels and structures by licensed pilots, reaching right-of-way and elevated assets without scaffolding or rope access.",
      order: 9,
    },
    {
      slug: "composite-repair-reinforcement",
      title: "Composite Repair & Structural Reinforcement",
      summary:
        "Engineered composite wraps that restore strength to corroded or damaged pipe, valves, tanks and structural steel, applied in service where the defect allows.",
      order: 10,
    },
    {
      slug: "pipeline-pre-commissioning",
      title: "Pipeline Pre-Commissioning & Commissioning",
      summary:
        "Flooding, cleaning, gauging, hydrotesting, dewatering and drying of pipelines, risers and flow lines, through to handover of a line ready for product.",
      order: 11,
    },
    {
      slug: "pipeline-cleaning-pigging",
      title: "Descaling, Cleaning & Pigging",
      summary:
        "Progressive pigging, chemical cleaning and descaling to restore bore, remove deposits and prepare a line for inspection or commissioning.",
      order: 12,
    },
    {
      slug: "valve-maintenance-repair",
      title: "Valve Maintenance & Repair",
      summary:
        "Inspection, overhaul, testing and certification of pipeline and station valves, including actuator checks and in-situ repair where removal is impractical.",
      order: 13,
    },
    {
      slug: "nitrogen-leak-testing-services",
      title: "Nitrogen Services & Leak Testing",
      summary:
        "Liquid and gaseous nitrogen for purging, inerting and pressure testing, together with helium leak testing of critical joints and systems.",
      order: 14,
    },
  ],
};

/**
 * The skid-package systems. These hang off `Service.group` rather than a
 * division: they are a manufacturing capability of their own and get a
 * top-level menu entry, so there is no parent division to attach them to.
 */
type SkidSeed = { slug: string; title: string; summary: string; order: number };

const SKID_SYSTEMS: SkidSeed[] = [
  {
    slug: "midstream-oil-gas-modular-process-systems",
    title: "Midstream Oil & Gas Modular Process Systems",
    summary:
      "Skid-mounted separation, dehydration, compression and metering packages for gathering, processing and transmission duty.",
    order: 1,
  },
  {
    slug: "downstream-oil-gas-skid-mounted-modular-process-systems",
    title: "Downstream Oil & Gas Skid-Mounted Modular Process Systems",
    summary:
      "Modular process packages for refining and product handling, including blending, transfer, filtration and custody transfer skids.",
    order: 2,
  },
  {
    slug: "power-generation-skid-mounted-modular-process-systems",
    title: "Power Generation Skid-Mounted Modular Process Systems",
    summary:
      "Fuel conditioning, lube oil, cooling and auxiliary packages built to sit alongside gas turbine and reciprocating engine sets.",
    order: 3,
  },
  {
    slug: "water-generation",
    title: "Water Generation",
    summary:
      "Desalination, potable water and water treatment packages for offshore installations, camps and industrial sites.",
    order: 4,
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
      // Spread conditionally: only some divisions ship long-form copy here, and
      // a re-run must not blank a body an editor has since written for one the
      // seed knows nothing but the summary of.
      ...(d.body ? { body: d.body } : {}),
      ...(d.capabilities ? { capabilities: d.capabilities } : {}),
    };

    await db.division.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, ...data },
      update: data,
    });
  }

  console.log(`  divisions       ok (${DIVISIONS.length})`);
}

async function seedDivisionServices() {
  let count = 0;

  for (const [divisionSlug, services] of Object.entries(DIVISION_SERVICES)) {
    const division = await db.division.findUnique({
      where: { slug: divisionSlug },
      select: { id: true },
    });

    // A service with no division renders nowhere, so skip rather than orphan
    // it. Divisions are seeded above, so a miss here means a stale slug.
    if (!division) {
      console.log(`  div services    SKIPPED - no division "${divisionSlug}"`);
      continue;
    }

    for (const s of services) {
      const data = {
        title: s.title,
        summary: s.summary,
        divisionId: division.id,
        order: s.order,
        status: "PUBLISHED" as const,
        publishedAt: new Date(),
      };

      await db.service.upsert({
        where: { slug: s.slug },
        create: { slug: s.slug, ...data },
        update: data,
      });
      count += 1;
    }
  }

  console.log(`  div services    ok (${count})`);
}

async function seedSkidSystems() {
  for (const s of SKID_SYSTEMS) {
    const data = {
      title: s.title,
      group: SKID_GROUP,
      summary: s.summary,
      order: s.order,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    };

    await db.service.upsert({
      where: { slug: s.slug },
      create: { slug: s.slug, ...data },
      update: data,
    });
  }

  console.log(`  skid systems    ok (${SKID_SYSTEMS.length})`);
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
  await seedDivisionServices();
  await seedSkidSystems();
  await seedAdmin();
  console.log("done.");
}

main()
  .catch((error) => {
    console.error("seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
