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
  /**
   * Cloudinary publicId of the banner, resolved to a Media row at seed time.
   * Referenced by publicId rather than database id for the same reason the
   * sub-pages are: ids differ per environment.
   *
   * These were originally chosen through the admin, and nine of them were
   * 120x120 thumbnails - invisible as a problem while the banner sat under a
   * 75% wash, obvious once it was allowed to show. Pinning them here means the
   * choice is reviewable in a diff instead of living only in the database.
   */
  imagePublicId?: string;
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
    imagePublicId: "elatronics/gallery/fqiqfctbwo0gtma2ad0m",
    order: 1,
  },
  {
    slug: "marine-support-asset-integrity",
    title: "Marine Support & Asset Integrity",
    category: "EPCIM",
    summary:
      "Marine logistics and asset integrity management, including inspection programmes, condition monitoring and remedial work that keeps offshore assets in service.",
    imagePublicId: "elatronics/general/hoqaynbgeravjtiixnr7",
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
    imagePublicId: "elatronics/general/p4lbzhhktax6w6itgdq3",
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
    imagePublicId: "elatronics/gallery/bjqehuckpp1msu3zrbvn",
    order: 13,
  },
  {
    slug: "hose-management-solutions",
    title: "Hose Management Solutions",
    category: "SERVICE_OFFERING",
    summary:
      "Supply, testing, certification and lifecycle tracking of industrial and marine hoses, including scheduled re-testing and register management.",
    imagePublicId: "elatronics/general/lwgkjfdufrczt6syd4c2",
    order: 14,
  },
  {
    slug: "environmental-laboratory-support",
    title: "Environmental & Laboratory Support Services",
    category: "SERVICE_OFFERING",
    summary:
      "Environmental monitoring, sampling and laboratory analysis supporting regulatory compliance and site environmental management plans.",
    imagePublicId: "elatronics/gallery/dltnokuaax4slo98kgz6",
    order: 15,
  },
  {
    slug: "oilfield-support-services",
    title: "Oilfield Support Services",
    category: "SERVICE_OFFERING",
    summary:
      "Support services for drilling and production operations, covering personnel, equipment provision and site logistics.",
    imagePublicId: "elatronics/gallery/cz6mxpekbfoggipgeote",
    order: 16,
  },
  {
    slug: "rotating-equipment-repair",
    title: "Rotating Equipment Repair",
    category: "SERVICE_OFFERING",
    summary:
      "Overhaul and repair of pumps, compressors, turbines and gearboxes, including alignment, balancing and vibration analysis.",
    imagePublicId: "elatronics/general/i16pqndjcvm2x9ak5dmh",
    order: 17,
  },
  {
    slug: "heavy-lifting-transportation",
    title: "Heavy Lifting & Transportation",
    category: "SERVICE_OFFERING",
    summary:
      "Lifting studies, rigging and heavy haulage for oversized loads, including load-out, transport and installation of major components.",
    imagePublicId: "elatronics/general/tq2a4ytgyampnrkl0xfb",
    order: 18,
  },

  // ── Procurement ────────────────────────────────────────────────────────
  {
    slug: "global-procurement",
    title: "Global Procurement",
    category: "PROCUREMENT",
    summary:
      "Sourcing and supply of equipment, spares and consumables through established manufacturer and distributor channels, with expediting and inspection.",
    imagePublicId: "elatronics/gallery/qg2arrnost23tc5bv63a",
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
  /** Full copy for the sub-page's own route. Blank leaves "coming soon". */
  body?: string;
  /**
   * Cloudinary publicId of the card/banner image, resolved to a Media row at
   * seed time. Referenced by publicId rather than by database id because those
   * ids differ per environment - a hard-coded cuid would break the seed on any
   * database but the one it was written against. A publicId that is not in the
   * media table yet simply leaves the image unset, and the sub-page falls back
   * to its division's banner.
   */
  imagePublicId?: string;
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


  /**
   * Capability sub-pages for the remaining divisions.
   *
   * Every division on the reference site opens into a grid of these, not just
   * procurement, and until now only pipeline management had any - so eleven
   * division pages rendered with no grid at all.
   *
   * They name disciplines rather than jobs delivered. The temptation is to
   * list work done for named clients, but that is a per-company fact that
   * belongs to Elatronics and cannot be invented here; where the site wants
   * client-specific work it already has Projects, which carry a client and a
   * year. Summaries only, deliberately: what a division does is generic enough
   * to draft, while how it delivers is the company's own detail, and a page of
   * plausible filler is harder to notice and replace than an empty one. The
   * admin flags every record still missing a body.
   */
  "offshore-onshore-construction-installation": [
    {
      slug: "structural-fabrication",
      title: "Structural Fabrication",
      summary:
        "Fabrication of platform structures, decks, skids and support steelwork to approved drawings, with weld procedures and material traceability maintained throughout.",
      order: 1,
    },
    {
      slug: "platform-hook-up-commissioning",
      title: "Platform Hook-up & Commissioning",
      summary:
        "Hook-up of topsides equipment, tie-in of piping and cabling, and pre-commissioning through to handover of a system ready for start-up.",
      order: 2,
    },
    {
      slug: "specialist-welding",
      title: "Specialist Welding",
      summary:
        "Coded welding across carbon, alloy, stainless and duplex materials, including procedure qualification and welder certification for the applicable code.",
      order: 3,
    },
    {
      slug: "pipe-spooling-fabrication",
      title: "Pipe Spooling & Fabrication",
      summary:
        "Isometric take-off, shop fabrication and delivery of pipe spools, with dimensional control and weld records kept against each spool number.",
      order: 4,
    },
    {
      slug: "tank-construction-erection",
      title: "Tank Construction & Erection",
      summary:
        "Site erection and modification of storage tanks and vessels, covering plate work, welding, testing and the associated inspection records.",
      order: 5,
    },
    {
      slug: "conductor-wellhead-prefabrication",
      title: "Conductor & Wellhead Prefabrication",
      summary:
        "Prefabrication of conductor pipe, casing joints and wellhead components, welded and dimensionally checked before delivery to the drilling location.",
      order: 6,
    },
    {
      slug: "modular-skid-cargo-frames",
      title: "Modular Skids & Cargo Frames",
      summary:
        "Build of skid frames, containerised units and offshore lifting frames to the certification and load-testing required for offshore transfer.",
      order: 7,
    },
    {
      slug: "onshore-facility-construction",
      title: "Onshore Facility Construction",
      summary:
        "Civil, structural and mechanical construction for onshore plant and terminal facilities, from foundations through to equipment installation.",
      order: 8,
    },
  ],
  "marine-support-asset-integrity": [
    {
      slug: "marine-logistics-vessel-support",
      title: "Marine Logistics & Vessel Support",
      summary:
        "Coordination of vessel movements, offshore transfers and marine spread support for construction, inspection and maintenance campaigns.",
      order: 1,
    },
    {
      slug: "offshore-asset-inspection",
      title: "Offshore Asset Inspection",
      summary:
        "Scheduled inspection of platforms, jackets and topsides equipment, producing a condition record that feeds the integrity management plan.",
      order: 2,
    },
    {
      slug: "structural-integrity-assessment",
      title: "Structural Integrity Assessment",
      summary:
        "Assessment of structural condition and remaining life from inspection data, used to prioritise remedial work and set the next survey interval.",
      order: 3,
    },
    {
      slug: "splash-zone-underwater-repair",
      title: "Splash Zone & Underwater Repair",
      summary:
        "Repair and reinforcement of members in the splash zone and below water, including clamps, wraps and coating systems suited to immersed service.",
      order: 4,
    },
    {
      slug: "mooring-system-inspection",
      title: "Mooring System Inspection & Maintenance",
      summary:
        "Inspection of chains, wires, connectors and buoyancy, with change-out and re-certification of components that fall outside acceptance criteria.",
      order: 5,
    },
    {
      slug: "corrosion-protection-coating",
      title: "Corrosion Protection & Coating",
      summary:
        "Surface preparation, protective coating and cathodic protection work that extends the service life of exposed marine and offshore steelwork.",
      order: 6,
    },
  ],
  "general-maintenance": [
    {
      slug: "planned-preventive-maintenance",
      title: "Planned Preventive Maintenance",
      summary:
        "Routine servicing carried out to a maintenance schedule, keeping equipment within its operating envelope and reducing unplanned downtime.",
      order: 1,
    },
    {
      slug: "shutdown-turnaround-support",
      title: "Shutdown & Turnaround Support",
      summary:
        "Planning and execution of shutdown scopes, with manpower, tooling and inspection coordinated to return the plant to service on schedule.",
      order: 2,
    },
    {
      slug: "corrective-breakdown-repair",
      title: "Corrective & Breakdown Repair",
      summary:
        "Response to equipment failures, covering fault diagnosis, repair or replacement, and the checks needed before the unit is returned to duty.",
      order: 3,
    },
    {
      slug: "mechanical-maintenance-services",
      title: "Mechanical Maintenance",
      summary:
        "Overhaul and adjustment of mechanical plant, including alignment, bolt torquing, seal replacement and the associated condition checks.",
      order: 4,
    },
    {
      slug: "facility-fabric-maintenance",
      title: "Facility & Fabric Maintenance",
      summary:
        "Upkeep of buildings, structures, walkways and coatings across a facility, including remedial work identified during routine inspection.",
      order: 5,
    },
    {
      slug: "maintenance-manpower-support",
      title: "Maintenance Manpower & Technical Support",
      summary:
        "Supply of qualified technicians and supervisors to supplement an operator's own maintenance team for a campaign or a sustained period.",
      order: 6,
    },
  ],
  "inspection-ndt": [
    {
      slug: "conventional-ndt",
      title: "Conventional NDT",
      summary:
        "Ultrasonic, magnetic particle, dye penetrant and visual inspection applied to welds, castings and in-service components.",
      order: 1,
    },
    {
      slug: "advanced-ultrasonics",
      title: "Advanced Ultrasonics (PAUT & TOFD)",
      summary:
        "Phased array and time-of-flight diffraction inspection where conventional ultrasonics cannot resolve the flaw type or geometry involved.",
      order: 2,
    },
    {
      slug: "radiographic-testing",
      title: "Radiographic Testing",
      summary:
        "Radiography of welds and components, with exposure, processing and interpretation carried out to the acceptance standard in force.",
      order: 3,
    },
    {
      slug: "weld-inspection-qualification",
      title: "Weld Inspection & Qualification",
      summary:
        "Witnessing and documentation of welding procedure and welder qualification, and inspection of production welds against the approved procedure.",
      order: 4,
    },
    {
      slug: "corrosion-mapping-thickness-survey",
      title: "Corrosion Mapping & Thickness Survey",
      summary:
        "Wall thickness measurement and corrosion mapping of piping, vessels and tanks, consolidated into a record that supports fitness-for-service.",
      order: 5,
    },
    {
      slug: "lifting-equipment-inspection",
      title: "Lifting Equipment Inspection & Certification",
      summary:
        "Examination, proof loading and certification of cranes, slings and lifting accessories to the intervals the applicable regulations require.",
      order: 6,
    },
    {
      slug: "positive-material-identification",
      title: "Positive Material Identification",
      summary:
        "On-site alloy verification of piping, fittings and components, confirming that installed material matches the specified grade.",
      order: 7,
    },
  ],
  "electrical-instrumentation-control": [
    {
      slug: "electrical-installation-termination",
      title: "Electrical Installation & Termination",
      summary:
        "Installation of cable, containment, distribution equipment and terminations, tested and documented before energisation.",
      order: 1,
    },
    {
      slug: "instrument-calibration-loop-testing",
      title: "Instrument Calibration & Loop Testing",
      summary:
        "Calibration of field instruments and end-to-end loop checks, producing the certificates that support the commissioning record.",
      order: 2,
    },
    {
      slug: "control-automation-systems",
      title: "Control & Automation Systems",
      summary:
        "Installation, configuration and fault-finding on PLC, DCS and ESD systems, including modification of existing control logic.",
      order: 3,
    },
    {
      slug: "hazardous-area-inspection",
      title: "Hazardous Area Inspection",
      summary:
        "Inspection of Ex equipment and installations to the required grade, with a defect register and the remedial work needed to close it out.",
      order: 4,
    },
    {
      slug: "cable-laying-testing",
      title: "Cable Laying, Testing & Termination",
      summary:
        "Routing, pulling, glanding and testing of power, control and instrumentation cable, including insulation resistance and continuity records.",
      order: 5,
    },
    {
      slug: "switchgear-panel-maintenance",
      title: "Switchgear & Panel Maintenance",
      summary:
        "Servicing of switchgear, motor control centres and control panels, covering inspection, cleaning, protection testing and functional checks.",
      order: 6,
    },
  ],
  "hydraulic-system-solutions": [
    {
      slug: "hydraulic-power-unit-overhaul",
      title: "Hydraulic Power Unit Overhaul",
      summary:
        "Strip-down, inspection and rebuild of hydraulic power units, returning the pack to its rated pressure, flow and cleanliness condition.",
      order: 1,
    },
    {
      slug: "cylinder-repair-reconditioning",
      title: "Cylinder Repair & Reconditioning",
      summary:
        "Repair of hydraulic cylinders, covering seal replacement, rod and bore reconditioning, and pressure testing before return to service.",
      order: 2,
    },
    {
      slug: "hose-assembly-replacement",
      title: "Hose Assembly & Replacement",
      summary:
        "Made-up hydraulic assemblies to the correct hose, fitting and thread combination, supplied with pressure test records where required.",
      order: 3,
    },
    {
      slug: "oil-flushing-cleanliness",
      title: "Oil Flushing & Cleanliness Control",
      summary:
        "Flushing of hydraulic and lube systems to a target cleanliness code, with particle counts recorded before and after the flush.",
      order: 4,
    },
    {
      slug: "system-commissioning-troubleshooting",
      title: "System Commissioning & Troubleshooting",
      summary:
        "Commissioning of new hydraulic systems and diagnosis of pressure, flow and contamination faults on systems already in service.",
      order: 5,
    },
    {
      slug: "hydraulic-valve-manifold-servicing",
      title: "Valve & Manifold Servicing",
      summary:
        "Servicing and functional testing of directional, pressure and flow control valves and the manifolds they are mounted on.",
      order: 6,
    },
  ],
  "hose-management-solutions": [
    {
      slug: "hose-register-tagging",
      title: "Hose Register & Asset Tagging",
      summary:
        "Tagging and registration of every hose on site, so each assembly carries a traceable identity and a known test and replacement history.",
      order: 1,
    },
    {
      slug: "hose-pressure-testing-certification",
      title: "Pressure Testing & Certification",
      summary:
        "Hydrostatic testing of hose assemblies to the required interval, issued with certificates that satisfy the operator's assurance regime.",
      order: 2,
    },
    {
      slug: "hose-assembly-fabrication",
      title: "Hose Assembly & Fabrication",
      summary:
        "Assembly of hoses to length with the specified couplings, ferrules and end fittings, crimped and tested before issue.",
      order: 3,
    },
    {
      slug: "hose-inspection-condition-monitoring",
      title: "Inspection & Condition Monitoring",
      summary:
        "Periodic inspection of hoses in service, recording wear, damage and age so replacement is planned rather than reactive.",
      order: 4,
    },
    {
      slug: "hose-change-out-programmes",
      title: "Replacement & Change-out Programmes",
      summary:
        "Scheduled change-out of hoses approaching end of life, planned around operations to avoid unplanned isolation of the system.",
      order: 5,
    },
  ],
  "environmental-laboratory-support": [
    {
      slug: "environmental-baseline-studies",
      title: "Environmental Baseline Studies",
      summary:
        "Baseline surveys that establish the environmental condition of a site before work begins, providing the reference for later comparison.",
      order: 1,
    },
    {
      slug: "water-effluent-analysis",
      title: "Water & Effluent Analysis",
      summary:
        "Sampling and analysis of process water, effluent and discharge streams against the consent limits that apply to the operation.",
      order: 2,
    },
    {
      slug: "soil-sediment-sampling",
      title: "Soil & Sediment Sampling",
      summary:
        "Collection and analysis of soil and sediment samples, including chain-of-custody handling and reporting against the relevant screening values.",
      order: 3,
    },
    {
      slug: "air-quality-emissions-monitoring",
      title: "Air Quality & Emissions Monitoring",
      summary:
        "Monitoring of ambient air quality and point-source emissions, with results reported in the format the regulator expects.",
      order: 4,
    },
    {
      slug: "laboratory-analysis-reporting",
      title: "Laboratory Analysis & Reporting",
      summary:
        "Laboratory testing of collected samples and consolidation of results into a report that states method, detection limit and interpretation.",
      order: 5,
    },
    {
      slug: "waste-characterisation-support",
      title: "Waste Characterisation & Management Support",
      summary:
        "Characterisation of waste streams and support for their segregation, storage and lawful disposal through approved routes.",
      order: 6,
    },
  ],
  "oilfield-support-services": [
    {
      slug: "drilling-completion-support",
      title: "Drilling & Completion Support",
      summary:
        "Support to drilling and completion operations, covering equipment provision, handling and the personnel needed at the well site.",
      order: 1,
    },
    {
      slug: "oilfield-manpower-supply",
      title: "Personnel & Manpower Supply",
      summary:
        "Supply of qualified oilfield personnel on a call-off or campaign basis, with competence and certification verified before mobilisation.",
      order: 2,
    },
    {
      slug: "equipment-rental-provision",
      title: "Equipment Rental & Provision",
      summary:
        "Provision of oilfield equipment on rental, delivered inspected and certified, with support for the duration of the hire.",
      order: 3,
    },
    {
      slug: "site-logistics-camp-support",
      title: "Site Logistics & Camp Support",
      summary:
        "Logistics, accommodation and catering support that keeps a remote or offshore work site running through the length of a campaign.",
      order: 4,
    },
    {
      slug: "well-site-services",
      title: "Well Site Services",
      summary:
        "Services delivered at the well site during drilling, workover and intervention, coordinated around the operator's programme.",
      order: 5,
    },
  ],
  "rotating-equipment-repair": [
    {
      slug: "pump-overhaul-repair",
      title: "Pump Overhaul & Repair",
      summary:
        "Strip, inspect and rebuild of centrifugal and positive-displacement pumps, including wear part replacement and performance testing.",
      order: 1,
    },
    {
      slug: "compressor-maintenance",
      title: "Compressor Maintenance",
      summary:
        "Overhaul and routine maintenance of reciprocating, screw and centrifugal compressors, with clearances and running checks recorded.",
      order: 2,
    },
    {
      slug: "turbine-inspection-repair",
      title: "Turbine Inspection & Repair",
      summary:
        "Inspection and repair of gas and steam turbine components, covering blades, bearings, seals and the associated control elements.",
      order: 3,
    },
    {
      slug: "gearbox-rebuild",
      title: "Gearbox Rebuild",
      summary:
        "Rebuild of industrial gearboxes, including gear and bearing replacement, backlash setting and load testing before return to service.",
      order: 4,
    },
    {
      slug: "laser-shaft-alignment",
      title: "Laser Shaft Alignment",
      summary:
        "Precision alignment of driver and driven machines using laser equipment, with as-found and as-left readings recorded.",
      order: 5,
    },
    {
      slug: "dynamic-balancing",
      title: "Dynamic Balancing",
      summary:
        "In-situ and workshop balancing of rotors and impellers to reduce vibration to within the acceptance limits for the machine.",
      order: 6,
    },
    {
      slug: "vibration-analysis-condition-monitoring",
      title: "Vibration Analysis & Condition Monitoring",
      summary:
        "Vibration measurement and trending that identifies bearing, alignment and imbalance faults before they progress to failure.",
      order: 7,
    },
  ],
  "heavy-lifting-transportation": [
    {
      slug: "lift-planning-engineering",
      title: "Lift Planning & Engineering",
      summary:
        "Lift studies, rigging arrangements and method statements prepared for complex and heavy lifts before any equipment is mobilised.",
      order: 1,
    },
    {
      slug: "crane-rigging-services",
      title: "Crane & Rigging Services",
      summary:
        "Provision of cranes, rigging crews and certified lifting gear for installation, maintenance and construction lifts.",
      order: 2,
    },
    {
      slug: "heavy-haulage-abnormal-loads",
      title: "Heavy Haulage & Abnormal Loads",
      summary:
        "Road transport of oversized and overweight loads, including route survey, permitting and escorting where required.",
      order: 3,
    },
    {
      slug: "load-out-roll-on-roll-off",
      title: "Load-out & Roll-on / Roll-off",
      summary:
        "Load-out of fabricated structures to barge or vessel by crane, skidding or self-propelled transporter, to an agreed load-out procedure.",
      order: 4,
    },
    {
      slug: "jacking-skidding-positioning",
      title: "Jacking, Skidding & Positioning",
      summary:
        "Controlled jacking, skidding and final positioning of heavy equipment where crane access is restricted or unavailable.",
      order: 5,
    },
    {
      slug: "lifting-gear-supply-certification",
      title: "Lifting Gear Supply & Certification",
      summary:
        "Supply of slings, shackles and lifting accessories with proof-load test and material certification for the intended working load.",
      order: 6,
    },
  ],

  /**
   * Procurement supply lines.
   *
   * Written as product categories, not as representation agreements. The
   * reference site records each of its entries as an appointment by a named
   * manufacturer - "X has appointed us as its exclusive agent in Nigeria" -
   * and those are that company's own commercial arrangements, which cannot be
   * restated for Elatronics without inventing them. What is generic and true
   * of any procurement division is the category it supplies and how an item in
   * it gets specified, so that is what these say.
   *
   * Starting-point copy, like the division summaries above: the client should
   * review it, add the OEMs they actually represent, and replace the wording
   * with their own. The images are picked from the existing media library and
   * are illustrative rather than photographs of supplied goods.
   */
  "global-procurement": [
    {
      slug: "valves-actuators",
      title: "Valves & Actuators",
      summary:
        "Gate, globe, ball, butterfly, check and control valves with matching actuation, sourced to the pressure class, body material and trim specified for the service.",
      body: "Valves are sourced against the line class rather than the line size alone: pressure rating, body and trim material, end connection, seat leakage class and any fire-safe or fugitive-emission requirement are confirmed against the datasheet before an order is placed.\n\nTypical items: gate, globe, ball, butterfly, plug, check and needle valves; control and choke valves; pressure relief and safety valves; manual gearboxes, and electric, pneumatic and hydraulic actuators with their limit switches and positioners.",
      imagePublicId: "elatronics/gallery/hxnnsfouumu645q7gd1u",
      order: 1,
    },
    {
      slug: "pumps-pump-spares",
      title: "Pumps & Pump Spares",
      summary:
        "Centrifugal, positive-displacement, metering and submersible pumps, together with mechanical seals, wear parts and OEM spares for units already in service.",
      body: "New pumps are selected against duty point, fluid properties, NPSH available and the driver and baseplate arrangement already in place, so a replacement drops into the existing foundation and pipework wherever the duty allows.\n\nTypical items: centrifugal, multistage, screw, gear, diaphragm, metering and submersible pumps; mechanical seals and seal support systems; impellers, wear rings, shafts, bearings and casing gaskets; baseplates, couplings and coupling guards.",
      imagePublicId: "elatronics/gallery/g7qfgnnshsnnhlmey1bb",
      order: 2,
    },
    {
      slug: "rotating-equipment-spares",
      title: "Rotating Equipment Spares",
      summary:
        "Spares and consumables for turbines, compressors, gearboxes and drivers, identified from nameplate and parts-list data so the part supplied matches the machine installed.",
      body: "Rotating spares are identified from the machine's nameplate, serial number and OEM parts list rather than from a description, which is what prevents a dimensionally similar part being supplied for a duty it was never rated for.\n\nTypical items: rotors, blades and diaphragms; journal and thrust bearings; labyrinth and dry-gas seals; gears and pinions; couplings; filters, elements and lube-system components; instrumentation and vibration probes.",
      imagePublicId: "elatronics/general/i16pqndjcvm2x9ak5dmh",
      order: 3,
    },
    {
      slug: "air-compressors-compressed-air",
      title: "Air Compressors & Compressed Air Packages",
      summary:
        "Instrument and plant air compressors, dryers, receivers and nitrogen generation packages, supplied as units or as complete skid-mounted systems.",
      body: "Air packages are specified around the actual air demand, dew point and instrument-air quality class required on site, which means quoting the dryer and filtration train rather than the compressor alone.\n\nTypical items: screw, reciprocating and centrifugal compressors; refrigerated and desiccant dryers; air receivers; nitrogen generation packages; coalescing and particulate filters; aftercoolers, separators and condensate management.",
      imagePublicId: "elatronics/gallery/fkqw6sghekanhltfch82",
      order: 4,
    },
    {
      slug: "industrial-oil-marine-hoses",
      title: "Industrial, Oil & Marine Hoses",
      summary:
        "Suction, discharge, transfer and dock hoses for oil, chemical, water and dry-bulk service, supplied with the couplings, fittings and test certificates required.",
      body: "Hoses are supplied against the fluid, working pressure, temperature range and end fitting the application needs, with pressure-test and material certification where the service calls for it.\n\nTypical items: oil suction and discharge hoses; chemical and LPG transfer hoses; floating and submarine hoses; steam, water and air hoses; dry-bulk and food-grade hoses; camlock, flanged and threaded couplings, clamps and safety whip checks.",
      imagePublicId: "elatronics/general/lwgkjfdufrczt6syd4c2",
      order: 5,
    },
    {
      slug: "hydraulic-systems-fittings",
      title: "Hydraulic Systems, Hoses & Fittings",
      summary:
        "Hydraulic hoses, adaptors, valves, cylinders and power packs, together with the filtration and conditioning equipment that keeps a system within its cleanliness target.",
      body: "Hydraulic supply covers the assembly as well as the parts: hose, fitting and adaptor combinations are matched by thread form and pressure rating, so a replacement assembly is a like-for-like fit.\n\nTypical items: hydraulic hoses, fittings and adaptors; directional, pressure and flow control valves; cartridge valves and manifolds; cylinders and power packs; hydraulic pumps and motors; filters, coolers and vacuum dehydration units.",
      imagePublicId: "elatronics/gallery/bjqehuckpp1msu3zrbvn",
      order: 6,
    },
    {
      slug: "line-pipe-fittings-flanges",
      title: "Line Pipe, Fittings & Flanges",
      summary:
        "Carbon, alloy and stainless line pipe with matching fittings, flanges and fasteners, supplied with mill certification traceable to the heat number.",
      body: "Pipe and fittings are supplied to the specified grade, schedule and end preparation, with mill test certificates traceable to the heat, so the material record stands up at inspection.\n\nTypical items: seamless and welded line pipe; elbows, tees, reducers and caps; weld-neck, slip-on, blind and orifice flanges; forged and socket-weld fittings; API tubing and casing couplings; studs, nuts and gaskets.",
      imagePublicId: "elatronics/general/pdujndw0d7qnfl9vnin7",
      order: 7,
    },
    {
      slug: "tube-fittings-couplings",
      title: "Tube Fittings & Couplings",
      summary:
        "Instrumentation tube fittings, compression couplings, manifolds and small-bore valves for hydraulic, pneumatic and instrument tubing runs.",
      body: "Small-bore connections are supplied as a matched system - tube, ferrule and body from the same range - because mixing manufacturers on a compression fitting is a common cause of leaks on instrument lines.\n\nTypical items: single and twin-ferrule compression fittings; instrument tubing in stainless and alloy; needle, ball and check valves; two-, three- and five-valve manifolds; quick-connect couplings; tube clamps and supports.",
      imagePublicId: "elatronics/general/te8hrsc9wqgqbfvraoot",
      order: 8,
    },
    {
      slug: "cables-cable-accessories",
      title: "Cables & Cable Accessories",
      summary:
        "Power, control, instrumentation and fibre cables with the glands, terminations and accessories needed for hazardous and general-area installation.",
      body: "Cable is supplied against the installation's voltage, current, armouring and fire-performance requirements, together with the certified glands and accessories that keep a hazardous-area installation compliant.\n\nTypical items: LV and MV power cables; control and instrumentation cables; fire-resistant and low-smoke zero-halogen types; fibre optic cable; Ex-certified glands, shrouds and adaptors; lugs, ferrules, cleats, trays and ladders.",
      imagePublicId: "elatronics/general/lwxsvm0yd2vpu39zaay2",
      order: 9,
    },
    {
      slug: "instrumentation-process-control",
      title: "Instrumentation & Process Control",
      summary:
        "Transmitters, gauges, analysers and final control elements for pressure, temperature, level and flow, supplied with calibration data where required.",
      body: "Instruments are ordered against the measurement range, process connection, wetted material and hazardous-area certification on the datasheet, with calibration certificates supplied where the loop record needs them.\n\nTypical items: pressure, temperature, level and flow transmitters; gauges, thermowells and RTDs; level gauges and switches; control valves and positioners; analysers and sampling systems; junction boxes, barriers and isolators.",
      imagePublicId: "elatronics/gallery/r2jrcz7rcvxmwmuqeuhv",
      order: 10,
    },
    {
      slug: "electrical-equipment-control-panels",
      title: "Electrical Equipment & Control Panels",
      summary:
        "Switchgear, motors, drives, transformers and control panels for plant and utility systems, including Ex-rated equipment for classified areas.",
      body: "Electrical equipment is specified against the system's fault level, protection philosophy and area classification, so switchgear and enclosures arrive rated for the installation rather than needing rework on site.\n\nTypical items: LV and MV switchgear; motor control centres and starters; variable speed drives; transformers; electric motors; distribution boards and control panels; Ex-rated enclosures, lighting and junction boxes; UPS and battery systems.",
      imagePublicId: "elatronics/general/yfwexqk7czea4nmatni2",
      order: 11,
    },
    {
      slug: "wire-rope-slings-lifting-gear",
      title: "Wire Rope, Slings & Lifting Gear",
      summary:
        "Wire rope, chain and synthetic slings, shackles, hooks and lifting accessories supplied with proof-load test and material certification.",
      body: "Lifting gear is supplied certified: every sling, shackle and accessory carries proof-load test and material certification, and assemblies are made up to the working load limit and configuration the lift plan calls for.\n\nTypical items: wire rope and wire rope slings; chain slings and components; round and webbing slings; bow and dee shackles; eyebolts, hooks, swivels and master links; sockets, thimbles and ferrules; load cells and lifting beams.",
      imagePublicId: "elatronics/general/hvrghcbv8gkbbturhgng",
      order: 12,
    },
    {
      slug: "mooring-ropes-fenders",
      title: "Mooring Ropes, Hawsers & Fenders",
      summary:
        "Mooring ropes, hawsers, chains and pneumatic or foam-filled fenders for jetty, ship-to-ship and offshore terminal operations.",
      body: "Mooring equipment is selected against the vessel size, exposure and berth arrangement, with breaking-load and manufacturing certification supplied for the ropes and chains that carry the load.\n\nTypical items: mooring ropes and hawsers in polyester, polypropylene and HMPE; mooring and chafe chains with accessories; pneumatic and foam-filled fenders; buoys and floats; quick-release hooks; bollards, fairleads and mooring accessories.",
      imagePublicId: "elatronics/general/xkzlt44zlncazodd14zd",
      order: 13,
    },
    {
      slug: "filtration-filter-elements",
      title: "Filtration & Filter Elements",
      summary:
        "Filter housings, cartridges and elements for air, gas, hydraulic, lube and process duties, cross-referenced to the units already installed.",
      body: "Elements are cross-referenced from the installed housing and the original part number, so a replacement matches on micron rating, media, collapse pressure and seal arrangement rather than on dimensions alone.\n\nTypical items: air intake and gas filters; hydraulic and lube oil elements; coalescers and separators; process and cartridge filters; strainers and baskets; filter housings, vessels and differential pressure gauges.",
      imagePublicId: "elatronics/gallery/ubhph0u4giprilm1nxac",
      order: 14,
    },
    {
      slug: "water-treatment-equipment",
      title: "Water Treatment Equipment",
      summary:
        "Desalination, potable water and effluent treatment equipment with the membranes, dosing systems and consumables needed to keep a plant in operation.",
      body: "Water packages are specified against feed-water analysis and the required product quality, including the dosing, filtration and membrane consumables the plant will need through its first operating cycle.\n\nTypical items: reverse osmosis and desalination units; multimedia and cartridge filtration; membranes and membrane cleaning chemicals; dosing skids and metering pumps; UV and chlorination systems; effluent and produced-water treatment equipment.",
      imagePublicId: "elatronics/gallery/bwqgu1punfmwc4mpicx1",
      order: 15,
    },
    {
      slug: "lubricants-greases-chemicals",
      title: "Lubricants, Greases & Industrial Chemicals",
      summary:
        "Lubricating oils, greases, cleaning and treatment chemicals supplied in drums, IBCs and bulk, with product and safety data sheets.",
      body: "Lubricants and chemicals are supplied against the equipment manufacturer's specification and the site's handling and storage arrangements, with product and safety data sheets provided for every consignment.\n\nTypical items: turbine, compressor, hydraulic and gear oils; greases for general and high-temperature service; heat transfer fluids; cleaning and degreasing chemicals; corrosion inhibitors, biocides and scale treatments; desiccants and preservation products.",
      imagePublicId: "elatronics/gallery/i23ixlixrwf4cpmvbz91",
      order: 16,
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
    // Left untouched when the publicId is unknown to this database, so a seed
    // run against an environment whose media library differs does not blank a
    // banner that is already set.
    const image = d.imagePublicId
      ? await db.media.findUnique({
          where: { publicId: d.imagePublicId },
          select: { id: true },
        })
      : null;

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
      ...(image ? { heroImageId: image.id } : {}),
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
      // Resolved per record rather than in one batch: the list is short, and
      // a missing image must leave that one record unset rather than abort
      // the seed. undefined (not null) when absent, so re-running against a
      // database where an editor has since chosen their own image does not
      // wipe it.
      const image = s.imagePublicId
        ? await db.media.findUnique({
            where: { publicId: s.imagePublicId },
            select: { id: true },
          })
        : null;

      const data = {
        title: s.title,
        summary: s.summary,
        divisionId: division.id,
        order: s.order,
        status: "PUBLISHED" as const,
        publishedAt: new Date(),
        // Both spread rather than set to null when absent: a re-run must not
        // wipe a body or an image an editor has added since.
        ...(s.body ? { body: s.body } : {}),
        ...(image ? { heroImageId: image.id } : {}),
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
