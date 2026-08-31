import "dotenv/config";

import { db } from "../lib/db";

/**
 * One-off import of the OEM manufacturer list, as a starting point for the
 * client to curate.
 *
 * IMPORTANT — read before publishing any of these.
 *
 * This list is transcribed from the reference site this project is modelled
 * on. It is that company's set of authorisations, not Elatronics'. An OEM
 * authorisation is a factual claim about a commercial relationship, both about
 * Elatronics and about the named manufacturer, so every row lands as a DRAFT
 * and nothing appears on /oem until someone at Elatronics confirms the
 * authorisation genuinely exists and publishes it.
 *
 * Descriptions are of what each manufacturer makes, which is a fact about that
 * manufacturer rather than a claim about Elatronics. They are still worth a
 * read: the reference site has typos in a few, and several manufacturers have
 * been renamed or acquired since it was written.
 *
 * Deliberately not wired into seed.ts. Once an editor has deleted the rows
 * that do not apply, re-running the seed must not resurrect them. Run this by
 * hand exactly once:
 *
 *   npx tsx prisma/import-oem-partners.ts
 *
 * Re-running is safe — it skips any manufacturer already in the table by name,
 * so it tops up a partial import rather than duplicating one.
 */

type PartnerSeed = { name: string; country: string; description: string };

const PARTNERS: PartnerSeed[] = [
  {
    name: "Airpack Netherlands BV",
    country: "Netherlands",
    description:
      "Manufacturer of air and gas compressor packages, air and gas dryer packages and nitrogen generators built to client requirements.",
  },
  {
    name: "Trelleborg AB",
    country: "France",
    description:
      "Manufacturer of low and medium pressure industrial hoses, oil and marine hoses, rubber sheeting and matting, and expansion joints.",
  },
  {
    name: "Trelleborg Marine & Infrastructure",
    country: "France",
    description:
      "Manufacturer of highly engineered polymer solutions and marine equipment.",
  },
  {
    name: "Cannon Bono Artes Ingegneria",
    country: "Italy",
    description:
      "Manufacturer of produced and injection water systems, desalination and drinking water production, industrial process water treatment, water treatment for steam generation, civil and industrial waste water treatment, and water recovery.",
  },
  {
    name: "Cannon Bono Energia",
    country: "Italy",
    description:
      "Manufacturer of heat recovery steam generators, fire tube steam generators, water tube package boilers, thermal fluid heaters, super-heated water generators, waste heat recovery boilers, evaporators and incinerators for industrial waste fluid.",
  },
  {
    name: "Klinger",
    country: "Italy",
    description:
      "Manufacturer of instrumentation equipment including glass level gauges, gauge cocks, magnetic level gauges, glass flow indicators, Y strainers and steam traps.",
  },
  {
    name: "Marit",
    country: "France",
    description: "Manufacturer of mooring chains and accessories.",
  },
  {
    name: "Heinzmann UK Ltd",
    country: "United Kingdom",
    description:
      "Independent European manufacturer and world supplier of rotating machinery controls, specialising in control systems for gas, steam and hydro turbines.",
  },
  {
    name: "Wozair Limited",
    country: "United Kingdom",
    description:
      "International manufacturer specialising in the design, manufacture and installation of heavy-duty heating, ventilating and air conditioning (HVAC).",
  },
  {
    name: "Aquatherm",
    country: "Germany",
    description:
      "Manufacturer of polypropylene piping for pressurised mechanical and plumbing systems of all sizes.",
  },
  {
    name: "Industrias Guerra SA",
    country: "Spain",
    description: "Manufacturer of offshore and marine cranes built to client requirements.",
  },
  {
    name: "Macoga SA",
    country: "Spain",
    description: "Manufacturer of expansion joints.",
  },
  {
    name: "Amarinth Pumps",
    country: "United Kingdom",
    description:
      "Specialists in the design, application and manufacture of centrifugal pumps and associated equipment.",
  },
  {
    name: "ComatReleco",
    country: "Switzerland",
    description:
      "One of the world's leading suppliers of high-quality relays and contactors of all kinds.",
  },
  {
    name: "3P PRINZ",
    country: "Italy",
    description: "Manufacturer of pumps and packaged pumping systems.",
  },
  {
    name: "Woodfield Systems",
    country: "Spain",
    description:
      "Manufacturer of customised bulk fluid handling and safety access solutions for loading and unloading product in the oil and gas, chemical, petrochemical and aviation sectors.",
  },
  {
    name: "The Impulse Group",
    country: "United Kingdom",
    description: "Manufacturer of offshore flexible pipes and risers.",
  },
  {
    name: "OptaSense",
    country: "United Arab Emirates",
    description: "Manufacturer of monitoring solutions for high-value assets.",
  },
  {
    name: "GasPack",
    country: "Netherlands",
    description: "Manufacturer of gas cleaning units.",
  },
  {
    name: "Opra Turbines",
    country: "Netherlands",
    description: "Manufacturer of turbines.",
  },
  {
    name: "DMT Marine Equipment",
    country: "Romania",
    description: "Manufacturer of marine equipment, winches and naval equipment.",
  },
  {
    name: "Aeroflex",
    country: "France",
    description: "Manufacturer of specialty hoses.",
  },
  {
    name: "Ansaldo Energia",
    country: "Italy",
    description: "Manufacturer of turbomachinery for power generation applications.",
  },
  {
    name: "Bosch Rexroth",
    country: "South Africa",
    description:
      "Bosch Rexroth Africa group of companies — drive and control technology for industrial and mobile applications.",
  },
  {
    name: "Val Controls A/S",
    country: "Denmark",
    description:
      "Production and development company for control, monitoring and test equipment for valves and actuators.",
  },
  {
    name: "Strohm",
    country: "Netherlands",
    description:
      "Manufacturer of thermoplastic composite pipe for flowlines, risers and subsea jumpers.",
  },
  {
    name: "Enerpac",
    country: "United States",
    description: "Manufacturer of hydraulic tools, equipment and accessories.",
  },
  {
    name: "Completion Oil Tools",
    country: "India",
    description:
      "Manufacturer and global supplier of downhole completion and production tools.",
  },
  {
    name: "Freudenberg",
    country: "Germany",
    description:
      "Manufacturer of filtration solutions for a wide range of industries.",
  },
  {
    name: "Turbotect Ltd",
    country: "Switzerland",
    description:
      "Manufacturer and distributor of gas turbine and fuel oil treatment products.",
  },
  {
    name: "Delcorte",
    country: "France",
    description: "Major European manufacturer of pipe fittings for end users.",
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const [index, partner] of PARTNERS.entries()) {
    // OemPartner has no unique column, so existence is checked by name. That
    // also makes a re-run top up a partial import instead of duplicating it.
    const existing = await db.oemPartner.findFirst({
      where: { name: partner.name },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await db.oemPartner.create({
      data: {
        name: partner.name,
        country: partner.country,
        description: partner.description,
        order: (index + 1) * 10,
        // Draft, always. See the note at the top of this file.
        status: "DRAFT",
      },
    });
    created += 1;
  }

  console.log(`OEM partners: ${created} created, ${skipped} already present.`);
  console.log(
    "All created as DRAFT — confirm each authorisation before publishing it.",
  );
}

main()
  .catch((error) => {
    console.error("import failed:", error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
