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
      body: "Construction is planned around keeping the line in service wherever the technique allows, so tie-in points, isolation and reinstatement are agreed before any excavation starts. Welding runs to a qualified procedure and every joint is recorded against its own number, which is what makes the as-built traceable years later.\n\nTypical scope: route preparation, stringing and bending; qualified welding and NDT of field joints; tie-ins and hot work under permit; field joint coating and holiday testing; hydrostatic testing and dewatering; backfill, reinstatement and as-built records.",
      imagePublicId: "elatronics/general/fydprstmi8tlm6zonrtz",
      order: 1,
    },
    {
      slug: "pipe-spool-fabrication-replacement",
      title: "Pipe Spool Fabrication & Replacement",
      summary:
        "Survey, fabrication and change-out of pipe spools for onshore, offshore and process plant pipework, with material traceability and weld records.",
      body: "Spools are surveyed in place before they are drawn, because the dimension that matters is the one in the field rather than the one on the original isometric. Each spool is fabricated, tested and marked as a numbered item so it can be installed in sequence without adjustment on site.\n\nTypical scope: site survey and dimensional take-off; shop fabrication to the line class; welding, NDT and pressure testing; coating and lining where the service requires it; removal of the existing spool under isolation; installation, tie-in weld and reinstatement.",
      imagePublicId: "elatronics/gallery/bql3bpzyapg1r7rag251",
      order: 2,
    },
    {
      slug: "hot-tapping-line-stopping",
      title: "Hot Tapping & Line Stopping",
      summary:
        "Under-pressure drilling and line stopping that allow branch connections, isolations and repairs without taking the line out of service.",
      body: "Hot tapping and line stopping let a branch, isolation or repair be made without taking the line down, which is why they are used where a shutdown would cost more than the operation itself. The fitting is welded and tested on a live line, so weld procedure, wall thickness and flow conditions are confirmed before any cutting begins.\n\nTypical scope: wall thickness verification and weldability assessment; split tee and fitting installation on a live line; drilling under pressure; single and double line stops for isolation; completion plugs and permanent capping; pressure testing and reinstatement to service.",
      imagePublicId: "elatronics/general/cgkvplhmlu7ahkkcbccx",
      order: 3,
    },
    {
      slug: "emergency-pipeline-repair-eprs",
      title: "Emergency Pipeline Repair (EPRS)",
      summary:
        "Standby repair arrangements for onshore and offshore lines, covering emergency closures, clamps and repair saddles for rapid containment of a leak or rupture.",
      body: "An emergency repair arrangement is only useful if the equipment and the procedure are ready before the failure. Clamps, saddles and connectors are held against the line sizes and pressure classes actually in service, so response time is spent mobilising rather than sourcing.\n\nTypical scope: standby repair arrangements for onshore, swamp and offshore lines; emergency clamps, repair saddles and mechanical connectors; leak containment and isolation; temporary and permanent repair options; post-repair testing; incident reporting and replenishment of used equipment.",
      imagePublicId: "elatronics/general/cmzmxiecojtmrn5rii6s",
      order: 4,
    },
    {
      slug: "pipeline-inspection-services",
      title: "Pipeline Inspection Services",
      summary:
        "In-line and external inspection to locate corrosion, wall loss and mechanical damage, consolidated into a single condition record for the line.",
      body: "Inspection is aimed at producing one condition record for the line rather than a set of unrelated surveys. In-line and external results are referenced to the same chainage, so an indication found by one method can be confirmed and located by another.\n\nTypical scope: in-line inspection support and tool tracking; external corrosion and coating surveys; close interval potential survey; direct assessment at excavation sites; wall thickness verification of reported features; consolidated condition reporting against chainage.",
      imagePublicId: "elatronics/general/mb5zr6yrdbdcfrpxp4b3",
      order: 5,
    },
    {
      slug: "pipeline-integrity-management",
      title: "Pipeline Integrity Management",
      summary:
        "In-trench evaluation of reported anomalies, fitness-for-service assessment and remaining-life estimation used to prioritise repair and set survey intervals.",
      body: "Integrity management turns inspection data into an intervention plan. Reported anomalies are assessed against acceptance criteria, remaining life is estimated from the corrosion rate the data actually shows, and repairs are ranked so the highest-risk feature is addressed first rather than the most convenient.\n\nTypical scope: anomaly assessment and fitness-for-service evaluation; corrosion rate and remaining life estimation; repair prioritisation and intervention planning; re-inspection interval setting; integrity records and reporting; review following any change of service or operating condition.",
      imagePublicId: "elatronics/gallery/ja0vmensnpnwspjvkbca",
      order: 6,
    },
    {
      slug: "pipeline-monitoring-leak-detection",
      title: "Pipeline Monitoring & Leak Detection",
      summary:
        "Monitoring and detection systems configured to the operating profile of a gas or crude line, with alarms routed to the operator's control room.",
      body: "Leak detection is judged on how small a loss it can find and how quickly, so the method is matched to the line, the product and the consequence of a release rather than selected on capability alone. Alarms are tuned against normal operating variation to keep false alarms from eroding trust in the system.\n\nTypical scope: leak detection system selection and installation; flow and pressure based monitoring; acoustic and fibre optic methods where suited; alarm threshold setting against operating variation; system testing and verification; monitoring, response procedures and operator training.",
      imagePublicId: "elatronics/general/yfwexqk7czea4nmatni2",
      order: 7,
    },
    {
      slug: "pipeline-pressure-monitoring",
      title: "Pipeline Pressure Monitoring",
      summary:
        "Pressure surveillance and line-break control that flag an abnormal drop early and can trigger automatic isolation.",
      body: "Pressure data is only meaningful once it is trended. Instruments are installed at defined points, calibrated and referenced to a common time base, so a change in profile can be attributed to the line rather than to a drifting transmitter.\n\nTypical scope: pressure transmitter installation and calibration; data logging and remote transmission; surge and transient monitoring; profile trending and comparison against operating limits; alarm and shutdown setpoint verification; reporting to the operator's control room.",
      imagePublicId: "elatronics/gallery/r2jrcz7rcvxmwmuqeuhv",
      order: 8,
    },
    {
      slug: "pipeline-drone-inspection",
      title: "Drone Inspection & Survey",
      summary:
        "Aerial inspection of pipelines, tanks, vessels and structures by licensed pilots, reaching right-of-way and elevated assets without scaffolding or rope access.",
      body: "Aerial survey covers right-of-way that is slow or unsafe to walk, particularly in swamp and flooded terrain. Flights are flown to a repeatable path and altitude so imagery can be compared between surveys, which is what turns a photograph into evidence of change.\n\nTypical scope: right-of-way and encroachment survey; leak and vegetation change detection; thermal and high-resolution imagery; repeatable flight paths for survey-to-survey comparison; imagery referenced to chainage; reporting of findings with location and photographic record.",
      imagePublicId: "elatronics/gallery/bwqgu1punfmwc4mpicx1",
      order: 9,
    },
    {
      slug: "composite-repair-reinforcement",
      title: "Composite Repair & Structural Reinforcement",
      summary:
        "Engineered composite wraps that restore strength to corroded or damaged pipe, valves, tanks and structural steel, applied in service where the defect allows.",
      body: "A composite wrap restores strength to a defect that has not breached the wall, and its value is that it can often be applied without taking the line out of service. Defect depth and remaining wall are measured first, because the repair is designed to the defect rather than applied to a standard thickness.\n\nTypical scope: defect measurement and repair design; surface preparation and load transfer filling; engineered composite wrap application to pipe, valves, tanks and structural steel; cure monitoring and hardness verification; documentation of the repair against the design; post-application inspection.",
      imagePublicId: "elatronics/general/pdujndw0d7qnfl9vnin7",
      order: 10,
    },
    {
      slug: "pipeline-pre-commissioning",
      title: "Pipeline Pre-Commissioning & Commissioning",
      summary:
        "Flooding, cleaning, gauging, hydrotesting, dewatering and drying of pipelines, risers and flow lines, through to handover of a line ready for product.",
      body: "Pre-commissioning proves the line is clean, tight and dry before product is admitted. Each stage is completed and accepted in turn, since a line that passes a pressure test but has not been properly dried will still cause problems once it is in service.\n\nTypical scope: flooding, cleaning and gauging; hydrostatic pressure testing and hold periods; dewatering and swabbing; drying to a specified dew point; nitrogen purging and inerting; commissioning records and acceptance certificates.",
      imagePublicId: "elatronics/gallery/ubhph0u4giprilm1nxac",
      order: 11,
    },
    {
      slug: "pipeline-cleaning-pigging",
      title: "Descaling, Cleaning & Pigging",
      summary:
        "Progressive pigging, chemical cleaning and descaling to restore bore, remove deposits and prepare a line for inspection or commissioning.",
      body: "Pigging is planned around what is in the line and what the line will accept. Pig type, sequence and launch conditions are chosen from the deposit expected and the internal geometry, because an over-aggressive first pass is how pigs get stuck.\n\nTypical scope: pig selection and run planning; descaling, wax and debris removal; progressive cleaning runs and gauging plates; pig tracking and receipt; launcher and receiver operation; debris analysis and reporting of internal condition.",
      imagePublicId: "elatronics/general/lwgkjfdufrczt6syd4c2",
      order: 12,
    },
    {
      slug: "valve-maintenance-repair",
      title: "Valve Maintenance & Repair",
      summary:
        "Inspection, overhaul, testing and certification of pipeline and station valves, including actuator checks and in-situ repair where removal is impractical.",
      body: "Valve work addresses sealing and operability together. A valve that seals but will not stroke to position is as much an isolation problem as one that leaks, so both are tested and recorded before the valve is accepted back into the line.\n\nTypical scope: in-line and workshop valve maintenance; seat and seal replacement; sealant injection and emergency sealing; actuator servicing and stroke testing; leak testing to the required rate; greasing programmes and valve register updating.",
      imagePublicId: "elatronics/gallery/hxnnsfouumu645q7gd1u",
      order: 13,
    },
    {
      slug: "nitrogen-leak-testing-services",
      title: "Nitrogen Services & Leak Testing",
      summary:
        "Liquid and gaseous nitrogen for purging, inerting and pressure testing, together with helium leak testing of critical joints and systems.",
      body: "Nitrogen is used where oxygen or moisture cannot be tolerated, and helium leak testing finds the small leaks that a pressure hold will never reveal. The two are used together where a joint must be proven tight rather than simply shown not to fail.\n\nTypical scope: nitrogen purging, inerting and blanketing; pressure testing with nitrogen where hydrostatic testing is unsuitable; helium leak testing of critical joints and systems; oxygen and dew point monitoring during purge; leak location and rate measurement; test certificates and purge records.",
      imagePublicId: "elatronics/gallery/fkqw6sghekanhltfch82",
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
      body: "Fabrication is driven by the approved drawing and the weld procedure that goes with it. Material is identified and traced from receipt, fit-up is checked before welding starts, and dimensional control is recorded at each stage, so the finished piece arrives at site within tolerance rather than needing rework in position.\n\nTypical scope: primary and secondary steelwork; deck sections, walkways and handrails; equipment supports and skid frames; padeyes and lifting points; surface preparation and protective coating; dimensional and weld inspection records issued with the finished item.",
      imagePublicId: "elatronics/gallery/bql3bpzyapg1r7rag251",
      order: 1,
    },
    {
      slug: "platform-hook-up-commissioning",
      title: "Platform Hook-up & Commissioning",
      summary:
        "Hook-up of topsides equipment, tie-in of piping and cabling, and pre-commissioning through to handover of a system ready for start-up.",
      body: "Hook-up is planned from the tie-in register rather than the drawing set. Every mechanical, piping, electrical and instrument connection between the new item and the existing facility is listed, sequenced around the access and shutdown windows available, and signed off individually before the system is handed to commissioning.\n\nTypical scope: structural and pipework tie-ins; cable pulling, glanding and termination; instrument hook-up and loop checks; flushing, pressure testing and reinstatement; punch list management through to system handover certificates.",
      imagePublicId: "elatronics/gallery/qg2arrnost23tc5bv63a",
      order: 2,
    },
    {
      slug: "specialist-welding",
      title: "Specialist Welding",
      summary:
        "Coded welding across carbon, alloy, stainless and duplex materials, including procedure qualification and welder certification for the applicable code.",
      body: "Coded welding begins with a qualified procedure and a welder qualified against it. The procedure is written for the material, thickness and position involved, welders are tested to it, and consumables are controlled from storage through to deposition, so the weld in the structure matches the one that was qualified.\n\nTypical scope: carbon, low-alloy, stainless and duplex materials; TIG, MMA, MIG/MAG and FCAW processes; pipework, structural and pressure-retaining welds; procedure and welder qualification records; NDT coordination and repair to an approved repair procedure.",
      imagePublicId: "elatronics/general/vkqborajqadpz7bnh0no",
      order: 3,
    },
    {
      slug: "pipe-spooling-fabrication",
      title: "Pipe Spooling & Fabrication",
      summary:
        "Isometric take-off, shop fabrication and delivery of pipe spools, with dimensional control and weld records kept against each spool number.",
      body: "Spools are built from isometrics and returned as numbered, traceable items. Take-off, cutting, fit-up and welding are controlled against the line class, and each spool carries its own dimensional and weld record, so it can be installed in sequence without being re-measured at site.\n\nTypical scope: isometric and material take-off; cutting, bevelling and fit-up; shop welding and NDT; pickling and passivation where the service demands it; coating; spool marking, listing and delivery in installation order.",
      imagePublicId: "elatronics/general/pdujndw0d7qnfl9vnin7",
      order: 4,
    },
    {
      slug: "tank-construction-erection",
      title: "Tank Construction & Erection",
      summary:
        "Site erection and modification of storage tanks and vessels, covering plate work, welding, testing and the associated inspection records.",
      body: "Tank work follows the erection sequence the design calls for. Floor, shell and roof plate are laid, fitted and welded in an order that controls distortion, and weld testing and settlement checks are recorded as the tank goes up rather than assembled afterwards for the hydrostatic test.\n\nTypical scope: floor, shell and roof plate erection; shell modification and plate replacement; nozzle and manway installation; vacuum box, radiographic and hydrostatic testing; internal lining and external coating; staircases, platforms and gauging equipment.",
      imagePublicId: "elatronics/gallery/i23ixlixrwf4cpmvbz91",
      order: 5,
    },
    {
      slug: "conductor-wellhead-prefabrication",
      title: "Conductor & Wellhead Prefabrication",
      summary:
        "Prefabrication of conductor pipe, casing joints and wellhead components, welded and dimensionally checked before delivery to the drilling location.",
      body: "Conductor and casing joints are prefabricated ahead of the rig so drilling is not waiting on welding. Joints are welded to procedure, dimensionally checked and marked against the string they belong to, then delivered in running order.\n\nTypical scope: conductor pipe welding and bevelling; casing and wellhead component preparation; weld-on connectors and centralisers; NDT of completed joints; marking, listing and delivery to the well site in running sequence.",
      imagePublicId: "elatronics/gallery/pgnoy2zhkhxww9qrxhia",
      order: 6,
    },
    {
      slug: "modular-skid-cargo-frames",
      title: "Modular Skids & Cargo Frames",
      summary:
        "Build of skid frames, containerised units and offshore lifting frames to the certification and load-testing required for offshore transfer.",
      body: "A frame intended for offshore transfer is designed and built to be lifted. Padeye positions, load paths and the certification route are settled before fabrication starts, and the finished unit is proof loaded and certified rather than simply weighed and shipped.\n\nTypical scope: skid and baseframe fabrication; containerised units and half-height baskets; offshore lifting frames and spreader bars; padeye fitting and NDT; proof load testing, weighing and certification; identification plates and register entry.",
      imagePublicId: "elatronics/gallery/g7qfgnnshsnnhlmey1bb",
      order: 7,
    },
    {
      slug: "onshore-facility-construction",
      title: "Onshore Facility Construction",
      summary:
        "Civil, structural and mechanical construction for onshore plant and terminal facilities, from foundations through to equipment installation.",
      body: "Onshore construction is sequenced around the interfaces rather than the trades. Civil, structural, mechanical and electrical work is planned so each discipline hands over a completed and inspected interface to the next, and the record follows the work instead of being assembled at the end of the job.\n\nTypical scope: foundations, plinths and civil works; structural steel erection; equipment setting and alignment; piping installation and testing; electrical and instrument installation; pre-commissioning checks and handover documentation.",
      imagePublicId: "elatronics/gallery/ja0vmensnpnwspjvkbca",
      order: 8,
    },
  ],
  "marine-support-asset-integrity": [
    {
      slug: "marine-logistics-vessel-support",
      title: "Marine Logistics & Vessel Support",
      summary:
        "Coordination of vessel movements, offshore transfers and marine spread support for construction, inspection and maintenance campaigns.",
      body: "Marine support is planned around the weather window and the vessel's capability, not the scope alone. Mobilisation, transfer of personnel and equipment, and standby arrangements are agreed before sailing, so an offshore campaign is not held up by a gap in the supply chain.\n\nTypical scope: vessel sourcing and coordination; cargo and equipment mobilisation; personnel transfer arrangements; marine spread management for construction and inspection campaigns; deck operations and lifting supervision; demobilisation and back-load.",
      imagePublicId: "elatronics/gallery/pgnoy2zhkhxww9qrxhia",
      order: 1,
    },
    {
      slug: "offshore-asset-inspection",
      title: "Offshore Asset Inspection",
      summary:
        "Scheduled inspection of platforms, jackets and topsides equipment, producing a condition record that feeds the integrity management plan.",
      body: "Inspection is carried out to a written scheme of examination rather than on sight. Locations are fixed, methods are stated, and readings are taken at the same points each campaign, which is what makes change measurable between one survey and the next.\n\nTypical scope: topsides and structural visual inspection; close visual examination and NDT of critical members; coating and corrosion condition surveys; access by rope, scaffold or platform as the location requires; anomaly recording and photographic reporting against a fixed location register.",
      imagePublicId: "elatronics/news/swregvvg1pqrrxy7m1az",
      order: 2,
    },
    {
      slug: "structural-integrity-assessment",
      title: "Structural Integrity Assessment",
      summary:
        "Assessment of structural condition and remaining life from inspection data, used to prioritise remedial work and set the next survey interval.",
      body: "Assessment turns inspection readings into a decision. Measured wall loss, defect size and coating condition are compared against acceptance criteria, and where a member falls outside them the remaining life is estimated, so repair can be scheduled rather than forced by a failure.\n\nTypical scope: review and consolidation of inspection data; fitness-for-service assessment against the applicable code; remaining life estimation; anomaly ranking and repair prioritisation; recommended inspection intervals; reporting suitable for the duty holder's own records.",
      imagePublicId: "elatronics/gallery/cz6mxpekbfoggipgeote",
      order: 3,
    },
    {
      slug: "splash-zone-underwater-repair",
      title: "Splash Zone & Underwater Repair",
      summary:
        "Repair and reinforcement of members in the splash zone and below water, including clamps, wraps and coating systems suited to immersed service.",
      body: "Repairs in the splash zone and below water are constrained by access and by cure conditions, so the method is chosen for the environment first. Systems that tolerate wet application and immersion are used, and the repair is inspected in place rather than removed for testing.\n\nTypical scope: splash zone coating and wrap systems; structural clamps and grouted connections; underwater welding and bolted repairs; marine growth removal and surface preparation; anode replacement; post-repair inspection and photographic record.",
      imagePublicId: "elatronics/news/wwmgmninbq4dhpb1nr5q",
      order: 4,
    },
    {
      slug: "mooring-system-inspection",
      title: "Mooring System Inspection & Maintenance",
      summary:
        "Inspection of chains, wires, connectors and buoyancy, with change-out and re-certification of components that fall outside acceptance criteria.",
      body: "A mooring is only as good as its weakest component, so inspection covers the whole load path: chain, connectors, wire, buoyancy and terminations. Any item measured outside acceptance criteria is changed out rather than left under observation.\n\nTypical scope: chain and connector measurement for wear and elongation; wire rope inspection; shackle and swivel examination; buoyancy and float condition; anode checks; change-out and re-certification of components; reporting against the mooring register.",
      imagePublicId: "elatronics/general/q4hfhgbhnkragg3dvnlg",
      order: 5,
    },
    {
      slug: "corrosion-protection-coating",
      title: "Corrosion Protection & Coating",
      summary:
        "Surface preparation, protective coating and cathodic protection work that extends the service life of exposed marine and offshore steelwork.",
      body: "Coating life is set by surface preparation more than by the product. Blast profile, cleanliness and ambient conditions are checked and recorded before any coat is applied, and each coat is inspected before the next goes on, because a fault buried under a topcoat cannot be found later.\n\nTypical scope: surface preparation to the specified standard; primer, intermediate and topcoat application; thermal spray and specialist systems where required; dry film thickness and holiday testing; cathodic protection surveys and anode replacement; coating condition reporting.",
      imagePublicId: "elatronics/general/cgkvplhmlu7ahkkcbccx",
      order: 6,
    },
  ],
  "general-maintenance": [
    {
      slug: "planned-preventive-maintenance",
      title: "Planned Preventive Maintenance",
      summary:
        "Routine servicing carried out to a maintenance schedule, keeping equipment within its operating envelope and reducing unplanned downtime.",
      body: "Preventive maintenance is scheduled from the equipment's own requirements rather than from a calendar convention. Running hours, duty and manufacturer intervals set the task list, and completion is recorded with as-found condition, so the history stays useful for the decisions that come later.\n\nTypical scope: routine servicing to the maintenance schedule; lubrication and consumable replacement; filter and seal changes; functional checks and adjustment; recording of as-found and as-left condition; feedback of findings into the maintenance plan.",
      imagePublicId: "elatronics/general/yfwexqk7czea4nmatni2",
      order: 1,
    },
    {
      slug: "shutdown-turnaround-support",
      title: "Shutdown & Turnaround Support",
      summary:
        "Planning and execution of shutdown scopes, with manpower, tooling and inspection coordinated to return the plant to service on schedule.",
      body: "A turnaround is decided in the planning. Scope is frozen, tasks are sequenced against the critical path, and materials, tooling and manpower are staged before the plant comes down, so time on site is spent working rather than waiting for something to arrive.\n\nTypical scope: scope review and work pack preparation; manpower and tooling mobilisation; execution of mechanical, piping and inspection scopes; emergent work management; reinstatement and leak testing; handback documentation and close-out reporting.",
      imagePublicId: "elatronics/gallery/ja0vmensnpnwspjvkbca",
      order: 2,
    },
    {
      slug: "corrective-breakdown-repair",
      title: "Corrective & Breakdown Repair",
      summary:
        "Response to equipment failures, covering fault diagnosis, repair or replacement, and the checks needed before the unit is returned to duty.",
      body: "Breakdown work starts with the cause, not the symptom. The failed component is examined before it is replaced so the same failure is not repeated in a fortnight, and the unit is function tested against its duty before it is accepted back into service.\n\nTypical scope: fault diagnosis and isolation; component repair or replacement; alignment, balancing and adjustment as required; function and performance testing; failure examination and reporting; recommendations to prevent recurrence.",
      imagePublicId: "elatronics/general/i16pqndjcvm2x9ak5dmh",
      order: 3,
    },
    {
      slug: "mechanical-maintenance-services",
      title: "Mechanical Maintenance",
      summary:
        "Overhaul and adjustment of mechanical plant, including alignment, bolt torquing, seal replacement and the associated condition checks.",
      body: "Mechanical work is controlled by the numbers that matter to the machine: alignment tolerance, bolt load, clearance and runout. Each is measured and recorded rather than judged by feel, so the assembly performs as designed once it is back on duty.\n\nTypical scope: dismantling and reassembly of mechanical plant; shaft alignment and soft foot correction; controlled bolt tensioning and torquing; bearing and seal replacement; clearance and runout measurement; commissioning checks on return to service.",
      imagePublicId: "elatronics/general/vkqborajqadpz7bnh0no",
      order: 4,
    },
    {
      slug: "facility-fabric-maintenance",
      title: "Facility & Fabric Maintenance",
      summary:
        "Upkeep of buildings, structures, walkways and coatings across a facility, including remedial work identified during routine inspection.",
      body: "Fabric maintenance closes out the deterioration that inspection has already found. Coatings, structures, walkways and drainage are repaired on a planned basis, so small defects are dealt with before they become access restrictions or integrity concerns.\n\nTypical scope: structural steel and platform repairs; walkway, grating and handrail replacement; coating touch-up and recoating; insulation and cladding repair; building fabric and drainage works; defect close-out against the inspection register.",
      imagePublicId: "elatronics/general/pava3zyf5fx41xhnwa1d",
      order: 5,
    },
    {
      slug: "maintenance-manpower-support",
      title: "Maintenance Manpower & Technical Support",
      summary:
        "Supply of qualified technicians and supervisors to supplement an operator's own maintenance team for a campaign or a sustained period.",
      body: "Supplementary manpower is only useful if it arrives ready to work. Competence, certification and medical status are verified before mobilisation, and personnel are matched to the discipline and the equipment the site actually runs rather than to a job title.\n\nTypical scope: technicians, fitters, welders and supervisors; short-term cover and campaign-length placements; discipline supervision and site coordination; verification of competence and certification; timesheet and reporting arrangements agreed before mobilisation.",
      imagePublicId: "elatronics/gallery/r2jrcz7rcvxmwmuqeuhv",
      order: 6,
    },
  ],
  "inspection-ndt": [
    {
      slug: "conventional-ndt",
      title: "Conventional NDT",
      summary:
        "Ultrasonic, magnetic particle, dye penetrant and visual inspection applied to welds, castings and in-service components.",
      body: "Method selection follows the flaw being looked for. Surface-breaking defects, embedded defects and wall loss each call for a different technique, and applying the wrong one returns a clean result on a component that is not clean.\n\nTypical scope: ultrasonic thickness and flaw detection; magnetic particle inspection; dye penetrant inspection; visual and close visual examination; hardness testing; reporting against the acceptance standard in force, with technician qualification stated.",
      imagePublicId: "elatronics/gallery/r2jrcz7rcvxmwmuqeuhv",
      order: 1,
    },
    {
      slug: "advanced-ultrasonics",
      title: "Advanced Ultrasonics (PAUT & TOFD)",
      summary:
        "Phased array and time-of-flight diffraction inspection where conventional ultrasonics cannot resolve the flaw type or geometry involved.",
      body: "Phased array and time-of-flight diffraction are used where conventional ultrasonics cannot resolve the geometry or the flaw type involved. Both produce an imaged, recordable result, which means a weld can be compared directly against its own earlier inspection.\n\nTypical scope: phased array inspection of welds and corrosion; time-of-flight diffraction for weld volumetrics; encoded scans with retained data files; scan plans and calibration blocks specific to the component; reporting with imaged results and defect sizing.",
      imagePublicId: "elatronics/divisions/ah32g5aqlq1vczjelrkh",
      order: 2,
    },
    {
      slug: "radiographic-testing",
      title: "Radiographic Testing",
      summary:
        "Radiography of welds and components, with exposure, processing and interpretation carried out to the acceptance standard in force.",
      body: "Radiography is controlled as much for safety as for image quality. Exposure calculation, source handling and barrier control are planned before shooting, and image quality indicators confirm that what was produced can actually be interpreted.\n\nTypical scope: gamma and X-ray exposure of welds and castings; digital and film-based radiography; image quality verification; interpretation to the applicable acceptance standard; controlled area management and radiation safety; reporting with film or file retention.",
      imagePublicId: "elatronics/general/pdujndw0d7qnfl9vnin7",
      order: 3,
    },
    {
      slug: "weld-inspection-qualification",
      title: "Weld Inspection & Qualification",
      summary:
        "Witnessing and documentation of welding procedure and welder qualification, and inspection of production welds against the approved procedure.",
      body: "Weld inspection covers the procedure as well as the product. The welding procedure is qualified and the welder tested against it before production starts, and production welds are then inspected against that qualified procedure rather than against a general expectation of good practice.\n\nTypical scope: witnessing of procedure qualification tests; welder qualification and continuity records; visual inspection of fit-up, root and cap; monitoring of preheat, interpass temperature and consumable control; NDT coordination; weld record and repair tracking.",
      imagePublicId: "elatronics/gallery/bql3bpzyapg1r7rag251",
      order: 4,
    },
    {
      slug: "corrosion-mapping-thickness-survey",
      title: "Corrosion Mapping & Thickness Survey",
      summary:
        "Wall thickness measurement and corrosion mapping of piping, vessels and tanks, consolidated into a record that supports fitness-for-service.",
      body: "A thickness survey is only useful if the same points can be read again, so locations are fixed and referenced to a grid or a drawing before the first reading is taken. Results are then trended rather than reported in isolation.\n\nTypical scope: ultrasonic wall thickness readings at fixed points; corrosion mapping of vessels, tanks and piping; inspection of insulated pipework where access allows; grid marking and location referencing; trend comparison against previous surveys; remaining life indication.",
      imagePublicId: "elatronics/general/p4lbzhhktax6w6itgdq3",
      order: 5,
    },
    {
      slug: "lifting-equipment-inspection",
      title: "Lifting Equipment Inspection & Certification",
      summary:
        "Examination, proof loading and certification of cranes, slings and lifting accessories to the intervals the applicable regulations require.",
      body: "Lifting equipment is examined on the interval the regulations and the duty require, and anything that fails is quarantined rather than returned to the rack. A discarded sling finding its way back into service is the failure this regime exists to prevent.\n\nTypical scope: thorough examination of cranes, hoists and runways; sling, shackle and accessory inspection; proof load testing; colour coding and register updating; quarantine and disposal of failed items; certification issued against each item's unique identity.",
      imagePublicId: "elatronics/general/siwecfv0s5snxnpu11cj",
      order: 6,
    },
    {
      slug: "positive-material-identification",
      title: "Positive Material Identification",
      summary:
        "On-site alloy verification of piping, fittings and components, confirming that installed material matches the specified grade.",
      body: "PMI confirms that what was installed is what was specified. Composition is checked in place, which catches the substitution and mixing errors a paper trail alone will not, particularly on small-bore fittings and replacement components fitted under time pressure.\n\nTypical scope: on-site alloy verification of piping, fittings, valves and welds; verification of consumables and weld deposits; sampling regimes agreed against risk; marking of verified items; reporting of non-conforming material against the specification.",
      imagePublicId: "elatronics/general/etud3eysekrrdkrykst5",
      order: 7,
    },
  ],
  "electrical-instrumentation-control": [
    {
      slug: "electrical-installation-termination",
      title: "Electrical Installation & Termination",
      summary:
        "Installation of cable, containment, distribution equipment and terminations, tested and documented before energisation.",
      body: "Installation is taken to the point of a documented, testable circuit. Cable is routed, supported and glanded to the specification, terminations are made to the drawing, and testing is completed and recorded before anything is energised.\n\nTypical scope: containment, tray and ladder installation; cable pulling and support; glanding and termination; distribution board and equipment installation; insulation resistance, continuity and polarity testing; as-built marking and issue of test records.",
      imagePublicId: "elatronics/gallery/r2jrcz7rcvxmwmuqeuhv",
      order: 1,
    },
    {
      slug: "instrument-calibration-loop-testing",
      title: "Instrument Calibration & Loop Testing",
      summary:
        "Calibration of field instruments and end-to-end loop checks, producing the certificates that support the commissioning record.",
      body: "Calibration proves the instrument; a loop check proves the loop. Both are needed, because an instrument calibrated on the bench says nothing about the wiring, the barrier and the control system it will actually report through once installed.\n\nTypical scope: bench and field calibration of transmitters, switches and gauges; five-point calibration with as-found and as-left records; loop checks from field device to control system; certificates issued against traceable test equipment; punch listing of loop defects.",
      imagePublicId: "elatronics/divisions/ah32g5aqlq1vczjelrkh",
      order: 2,
    },
    {
      slug: "control-automation-systems",
      title: "Control & Automation Systems",
      summary:
        "Installation, configuration and fault-finding on PLC, DCS and ESD systems, including modification of existing control logic.",
      body: "Changes to control and safety systems are made under a documented change. Logic is reviewed and tested before it is downloaded, and safety functions are proof tested rather than assumed to work on the grounds that the software compiled without error.\n\nTypical scope: PLC, DCS and ESD installation and configuration; logic modification under change control; I/O checks and system integration testing; safety function proof testing; HMI and alarm configuration; fault diagnosis on systems already in service.",
      imagePublicId: "elatronics/general/yfwexqk7czea4nmatni2",
      order: 3,
    },
    {
      slug: "hazardous-area-inspection",
      title: "Hazardous Area Inspection",
      summary:
        "Inspection of Ex equipment and installations to the required grade, with a defect register and the remedial work needed to close it out.",
      body: "Ex inspection is a grading exercise. Equipment is inspected to the visual, close or detailed grade the regime calls for, and every defect found is logged and closed out, because an unlogged defect in a classified area is the one that stays open indefinitely.\n\nTypical scope: initial, periodic and sample inspection to the applicable grade; verification of equipment certification against the area classification; enclosure, gland and seal condition; earthing and bonding checks; defect register maintenance and close-out of remedial work.",
      imagePublicId: "elatronics/gallery/ja0vmensnpnwspjvkbca",
      order: 4,
    },
    {
      slug: "cable-laying-testing",
      title: "Cable Laying, Testing & Termination",
      summary:
        "Routing, pulling, glanding and testing of power, control and instrumentation cable, including insulation resistance and continuity records.",
      body: "Cable is installed to survive its whole life, not merely to reach the far end. Bend radius, support spacing, segregation and pulling tension are controlled during installation, because damage done while pulling tends to appear as a fault years afterwards.\n\nTypical scope: route survey and containment installation; cable pulling under controlled tension; segregation of power, control and instrument runs; glanding and termination; insulation resistance, continuity and phasing tests; cable schedule and test record completion.",
      imagePublicId: "elatronics/general/pava3zyf5fx41xhnwa1d",
      order: 5,
    },
    {
      slug: "switchgear-panel-maintenance",
      title: "Switchgear & Panel Maintenance",
      summary:
        "Servicing of switchgear, motor control centres and control panels, covering inspection, cleaning, protection testing and functional checks.",
      body: "Switchgear is worked on dead and proven dead, and protection settings are verified as part of the job. A clean, well-serviced panel whose protection has not been tested has not actually been maintained.\n\nTypical scope: isolation, cleaning and inspection of switchgear and motor control centres; contact and mechanism servicing; protection relay testing and setting verification; thermographic survey; breaker function testing; insulation testing and issue of records.",
      imagePublicId: "elatronics/general/vkqborajqadpz7bnh0no",
      order: 6,
    },
  ],
  "hydraulic-system-solutions": [
    {
      slug: "hydraulic-power-unit-overhaul",
      title: "Hydraulic Power Unit Overhaul",
      summary:
        "Strip-down, inspection and rebuild of hydraulic power units, returning the pack to its rated pressure, flow and cleanliness condition.",
      body: "A power unit is rebuilt to its rated pressure, flow and cleanliness rather than merely to working order. Pump condition, valve condition, reservoir cleanliness and cooling capacity are addressed together, since restoring one and ignoring the rest simply relocates the failure.\n\nTypical scope: strip, clean and inspect; pump, motor and valve overhaul or replacement; reservoir cleaning and filtration review; hose, seal and gauge replacement; reassembly, flushing and pressure testing; performance test against the rated duty.",
      imagePublicId: "elatronics/general/i16pqndjcvm2x9ak5dmh",
      order: 1,
    },
    {
      slug: "cylinder-repair-reconditioning",
      title: "Cylinder Repair & Reconditioning",
      summary:
        "Repair of hydraulic cylinders, covering seal replacement, rod and bore reconditioning, and pressure testing before return to service.",
      body: "What the bore and rod will accept decides the repair. Measured wear determines whether a cylinder is resealed, honed, re-chromed, sleeved or replaced, and pressure testing after assembly confirms that decision before it goes back into a load path.\n\nTypical scope: dismantling and dimensional inspection; bore honing and rod re-chroming; seal, bearing and wiper replacement; end cap and port repair; reassembly and hydrostatic pressure testing; painting and identification marking.",
      imagePublicId: "elatronics/general/vkqborajqadpz7bnh0no",
      order: 2,
    },
    {
      slug: "hose-assembly-replacement",
      title: "Hose Assembly & Replacement",
      summary:
        "Made-up hydraulic assemblies to the correct hose, fitting and thread combination, supplied with pressure test records where required.",
      body: "Assemblies are made to the pressure rating and thread form of the application and crimped with the die matched to that hose and fitting combination. A mismatched crimp holds on the bench and lets go under pressure, which is why the combination is controlled rather than improvised.\n\nTypical scope: measurement and assembly to length; crimping to the manufacturer's die specification; adaptor and quick-coupling fitting; pressure testing and cleanliness flushing; identification tagging; planned replacement of assemblies approaching end of life.",
      imagePublicId: "elatronics/general/lwgkjfdufrczt6syd4c2",
      order: 3,
    },
    {
      slug: "oil-flushing-cleanliness",
      title: "Oil Flushing & Cleanliness Control",
      summary:
        "Flushing of hydraulic and lube systems to a target cleanliness code, with particle counts recorded before and after the flush.",
      body: "Flushing is finished when the fluid meets a stated cleanliness code, not when the loop has run for an agreed number of hours. Particle counts are taken before and after, and the target is set against the most contamination-sensitive component in the system.\n\nTypical scope: flushing rig connection and loop design; high-velocity flushing to turbulent flow; filtration and particle counting to ISO cleanliness codes; sampling before, during and after; fluid replacement or reinstatement; certificate stating the cleanliness achieved.",
      imagePublicId: "elatronics/gallery/i23ixlixrwf4cpmvbz91",
      order: 4,
    },
    {
      slug: "system-commissioning-troubleshooting",
      title: "System Commissioning & Troubleshooting",
      summary:
        "Commissioning of new hydraulic systems and diagnosis of pressure, flow and contamination faults on systems already in service.",
      body: "Hydraulic faults are found by measurement rather than by replacement. Pressure, flow and temperature are read at defined points to locate where the loss occurs, which avoids changing components that were never the cause of the problem.\n\nTypical scope: pre-commissioning checks and safe start-up; setting of relief, sequence and flow controls; function testing against the operating description; pressure and flow measurement for fault location; contamination and overheating investigation; commissioning record and settings sheet.",
      imagePublicId: "elatronics/gallery/ubhph0u4giprilm1nxac",
      order: 5,
    },
    {
      slug: "hydraulic-valve-manifold-servicing",
      title: "Valve & Manifold Servicing",
      summary:
        "Servicing and functional testing of directional, pressure and flow control valves and the manifolds they are mounted on.",
      body: "Valve faults are very often contamination faults, so servicing deals with the condition of the fluid alongside the valve itself, and each valve is function tested on its manifold rather than in isolation on a bench.\n\nTypical scope: strip, clean and inspection of directional, pressure and flow control valves; cartridge valve and manifold servicing; solenoid and coil replacement; seal kits and spool condition assessment; setting and function testing; leak testing on reassembly.",
      imagePublicId: "elatronics/general/ql5bgaapbufcaoeivlur",
      order: 6,
    },
  ],
  "hose-management-solutions": [
    {
      slug: "hose-register-tagging",
      title: "Hose Register & Asset Tagging",
      summary:
        "Tagging and registration of every hose on site, so each assembly carries a traceable identity and a known test and replacement history.",
      body: "A register turns a consumable into a managed asset. Each assembly is tagged with a unique identity so its specification, test date and replacement date are known, which is what makes a planned change-out possible at all.\n\nTypical scope: site-wide hose survey and identification; unique tagging and durable marking; recording of specification, rating, date of manufacture and location; register set-up and handover; periodic reconciliation of the register against what is physically installed.",
      imagePublicId: "elatronics/general/te8hrsc9wqgqbfvraoot",
      order: 1,
    },
    {
      slug: "hose-pressure-testing-certification",
      title: "Pressure Testing & Certification",
      summary:
        "Hydrostatic testing of hose assemblies to the required interval, issued with certificates that satisfy the operator's assurance regime.",
      body: "Testing is carried out at the interval and pressure the service requires, and the result is recorded against the hose's own identity. A certificate that cannot be traced back to a specific assembly proves nothing about the one hanging on the rack.\n\nTypical scope: hydrostatic testing to the specified test pressure; visual and dimensional examination before test; electrical continuity testing where required; certification against each tagged identity; quarantine and disposal of failed assemblies; register update on completion.",
      imagePublicId: "elatronics/gallery/ubhph0u4giprilm1nxac",
      order: 2,
    },
    {
      slug: "hose-assembly-fabrication",
      title: "Hose Assembly & Fabrication",
      summary:
        "Assembly of hoses to length with the specified couplings, ferrules and end fittings, crimped and tested before issue.",
      body: "Assemblies are built from a matched hose, ferrule and fitting combination and crimped to the manufacturer's die specification, so the finished item performs to the rating printed on it rather than to an assumption made during assembly.\n\nTypical scope: cutting and assembly to measured length; crimping and swaging to specification; end fitting, flange and coupling selection; cleaning and capping before dispatch; proof testing and certification; tagging and entry into the hose register.",
      imagePublicId: "elatronics/general/etud3eysekrrdkrykst5",
      order: 3,
    },
    {
      slug: "hose-inspection-condition-monitoring",
      title: "Inspection & Condition Monitoring",
      summary:
        "Periodic inspection of hoses in service, recording wear, damage and age so replacement is planned rather than reactive.",
      body: "Hoses are inspected against defined rejection criteria — cover damage, kinking, exposed reinforcement, coupling movement and age — so removal from service is a decision against a standard rather than an opinion formed on the day.\n\nTypical scope: periodic visual and tactile inspection in place; recording of wear, damage and age against the register; identification of assemblies approaching end of life; immediate removal of any assembly meeting rejection criteria; inspection reporting and trend review.",
      imagePublicId: "elatronics/general/ql5bgaapbufcaoeivlur",
      order: 4,
    },
    {
      slug: "hose-change-out-programmes",
      title: "Replacement & Change-out Programmes",
      summary:
        "Scheduled change-out of hoses approaching end of life, planned around operations to avoid unplanned isolation of the system.",
      body: "Change-out is planned around the operation, so hoses are replaced during available access instead of after a failure. Assemblies approaching end of life are grouped by system and isolation requirement, which keeps the number of separate shutdowns down.\n\nTypical scope: replacement planning from register data; grouping by system, isolation and access; pre-made assemblies staged before the window opens; controlled removal and installation; post-installation pressure and leak testing; register update and certification issue.",
      imagePublicId: "elatronics/general/vkqborajqadpz7bnh0no",
      order: 5,
    },
  ],
  "environmental-laboratory-support": [
    {
      slug: "environmental-baseline-studies",
      title: "Environmental Baseline Studies",
      summary:
        "Baseline surveys that establish the environmental condition of a site before work begins, providing the reference for later comparison.",
      body: "A baseline is only worth having if it can be repeated. Sampling locations, methods and detection limits are fixed at the outset and documented well enough that a survey years later can be compared against it directly rather than approximately.\n\nTypical scope: survey design and selection of sampling locations; soil, water, sediment and air sampling; ecological and habitat description; laboratory analysis against agreed parameters; interpretation against relevant screening values; baseline report written as a future reference.",
      imagePublicId: "elatronics/gallery/bwqgu1punfmwc4mpicx1",
      order: 1,
    },
    {
      slug: "water-effluent-analysis",
      title: "Water & Effluent Analysis",
      summary:
        "Sampling and analysis of process water, effluent and discharge streams against the consent limits that apply to the operation.",
      body: "Effluent monitoring is judged against the consent that applies to the discharge, so the parameter list, sampling frequency and detection limits are taken from the permit rather than from a standard suite chosen for convenience.\n\nTypical scope: grab and composite sampling of process water, effluent and discharge; field measurement of pH, conductivity, dissolved oxygen and temperature; laboratory analysis for hydrocarbons, metals, nutrients and solids; comparison against consent limits; reporting in the required format.",
      imagePublicId: "elatronics/gallery/mwyejqfbo0gengn0lw1a",
      order: 2,
    },
    {
      slug: "soil-sediment-sampling",
      title: "Soil & Sediment Sampling",
      summary:
        "Collection and analysis of soil and sediment samples, including chain-of-custody handling and reporting against the relevant screening values.",
      body: "Sample integrity decides the result. Containers, preservation and holding times are controlled from the moment of collection and chain of custody is kept unbroken to the laboratory, because a correctly analysed sample that was wrongly handled is still a wrong answer.\n\nTypical scope: sampling location survey and setting out; surface and depth sampling; correct container, preservation and cool-chain handling; unbroken chain-of-custody documentation; laboratory analysis for hydrocarbons, metals and physical parameters; reporting against screening criteria.",
      imagePublicId: "elatronics/general/cgkvplhmlu7ahkkcbccx",
      order: 3,
    },
    {
      slug: "air-quality-emissions-monitoring",
      title: "Air Quality & Emissions Monitoring",
      summary:
        "Monitoring of ambient air quality and point-source emissions, with results reported in the format the regulator expects.",
      body: "Monitoring is planned around the source and the receptor. Point-source emissions and ambient air need different equipment, positions and averaging periods, and a result is only comparable to a limit when it was measured the way the limit was written.\n\nTypical scope: ambient air quality monitoring; point-source stack emission measurement; noise and dust surveys where required; equipment calibration and siting to the applicable method; averaging and reporting over the required periods; comparison against regulatory limits.",
      imagePublicId: "elatronics/news/swregvvg1pqrrxy7m1az",
      order: 4,
    },
    {
      slug: "laboratory-analysis-reporting",
      title: "Laboratory Analysis & Reporting",
      summary:
        "Laboratory testing of collected samples and consolidation of results into a report that states method, detection limit and interpretation.",
      body: "A result means little without its method and detection limit. Reports state how the determination was made, what the limit of detection was, and how the value sits against the criterion being applied, so the reader can judge the finding rather than take it on trust.\n\nTypical scope: analysis of water, soil, sediment and product samples; hydrocarbon, metals, nutrient and physical parameter determinations; quality control samples, blanks and duplicates; method and detection limit stated against every result; interpretation against applicable criteria.",
      imagePublicId: "elatronics/gallery/dme8ayuoy0oboumxkoo8",
      order: 5,
    },
    {
      slug: "waste-characterisation-support",
      title: "Waste Characterisation & Management Support",
      summary:
        "Characterisation of waste streams and support for their segregation, storage and lawful disposal through approved routes.",
      body: "Characterisation determines the lawful route. A waste stream is sampled and classified before disposal is arranged, because the classification decides the carrier, the documentation and which receiving facility may lawfully accept it.\n\nTypical scope: waste stream sampling and classification; hazardous property assessment; segregation and storage advice; identification of licensed disposal routes; documentation and consignment note support; reconciliation and reporting of quantities disposed.",
      imagePublicId: "elatronics/gallery/i23ixlixrwf4cpmvbz91",
      order: 6,
    },
  ],
  "oilfield-support-services": [
    {
      slug: "drilling-completion-support",
      title: "Drilling & Completion Support",
      summary:
        "Support to drilling and completion operations, covering equipment provision, handling and the personnel needed at the well site.",
      body: "Support to drilling is measured on availability rather than volume. Equipment and personnel are staged to the rig programme so the operation is never waiting, and equipment is inspected and certified before it is mobilised rather than on arrival at the well site.\n\nTypical scope: equipment provision and handling at the well site; personnel supporting drilling and completion operations; tubular handling and inspection support; rig-up and rig-down assistance; certification and inspection records supplied with each item mobilised.",
      imagePublicId: "elatronics/gallery/pgnoy2zhkhxww9qrxhia",
      order: 1,
    },
    {
      slug: "oilfield-manpower-supply",
      title: "Personnel & Manpower Supply",
      summary:
        "Supply of qualified oilfield personnel on a call-off or campaign basis, with competence and certification verified before mobilisation.",
      body: "Personnel are supplied against a stated competence, not a job title. Certification, medical status and survival training are verified and in date before mobilisation, because someone turned back at the heliport costs the same as someone who never travelled.\n\nTypical scope: technicians, operators, supervisors and specialist trades; call-off and campaign-length placements; verification of competence, certification and medicals; travel, accommodation and rotation arrangements; timesheet, reporting and replacement cover.",
      imagePublicId: "elatronics/gallery/r2jrcz7rcvxmwmuqeuhv",
      order: 2,
    },
    {
      slug: "equipment-rental-provision",
      title: "Equipment Rental & Provision",
      summary:
        "Provision of oilfield equipment on rental, delivered inspected and certified, with support for the duration of the hire.",
      body: "Rental equipment arrives inspected, certified and function tested, and is supported for the duration of the hire. The value in a rental is availability across the whole campaign, not the rate quoted on the day it is delivered.\n\nTypical scope: provision of oilfield and support equipment on hire; pre-mobilisation inspection, certification and function test; delivery, installation and demobilisation; operator and maintenance support during hire; off-hire inspection and condition reporting.",
      imagePublicId: "elatronics/gallery/fkqw6sghekanhltfch82",
      order: 3,
    },
    {
      slug: "site-logistics-camp-support",
      title: "Site Logistics & Camp Support",
      summary:
        "Logistics, accommodation and catering support that keeps a remote or offshore work site running through the length of a campaign.",
      body: "Remote operations are limited by the supply line, so logistics are planned to hold a defined stock at site rather than resupplying on demand, and accommodation and catering are arranged to a consistent standard for the length of the campaign.\n\nTypical scope: transport and material movement to remote and offshore locations; warehousing and stock control at site; accommodation, catering and camp management; waste handling and site services; personnel movement and rotation coordination.",
      imagePublicId: "elatronics/general/tq2a4ytgyampnrkl0xfb",
      order: 4,
    },
    {
      slug: "well-site-services",
      title: "Well Site Services",
      summary:
        "Services delivered at the well site during drilling, workover and intervention, coordinated around the operator's programme.",
      body: "Work at the well site is sequenced by the operator's programme and constrained by whatever else is happening at the same time, so scopes are planned around the permit-to-work regime and simultaneous operations rather than run independently.\n\nTypical scope: services delivered during drilling, workover and intervention; equipment operation and supervision at the well site; support to rig-up, testing and rig-down; coordination under simultaneous operations; daily reporting against the operator's programme.",
      imagePublicId: "elatronics/gallery/qg2arrnost23tc5bv63a",
      order: 5,
    },
  ],
  "rotating-equipment-repair": [
    {
      slug: "pump-overhaul-repair",
      title: "Pump Overhaul & Repair",
      summary:
        "Strip, inspect and rebuild of centrifugal and positive-displacement pumps, including wear part replacement and performance testing.",
      body: "A pump is overhauled back to its duty point, not merely reassembled. Clearances, wear ring gaps and impeller condition decide whether performance can be restored at all, and the pump is tested against its curve before it is accepted back.\n\nTypical scope: strip, clean and dimensional inspection; impeller, wear ring and shaft assessment; mechanical seal replacement and seal support review; bearing and coupling renewal; reassembly to recorded clearances; performance and vibration testing before return to service.",
      imagePublicId: "elatronics/gallery/g7qfgnnshsnnhlmey1bb",
      order: 1,
    },
    {
      slug: "compressor-maintenance",
      title: "Compressor Maintenance",
      summary:
        "Overhaul and routine maintenance of reciprocating, screw and centrifugal compressors, with clearances and running checks recorded.",
      body: "Compressor condition is governed by clearances and valve wear, both of which appear in the running data well before they appear as a failure. As-found readings are taken and compared against the machine's own history rather than a generic figure.\n\nTypical scope: reciprocating, screw and centrifugal machines; valve inspection and replacement; piston, rod and ring measurement; bearing and seal renewal; clearance setting and recording; running checks, capacity verification and vibration measurement on restart.",
      imagePublicId: "elatronics/gallery/fkqw6sghekanhltfch82",
      order: 2,
    },
    {
      slug: "turbine-inspection-repair",
      title: "Turbine Inspection & Repair",
      summary:
        "Inspection and repair of gas and steam turbine components, covering blades, bearings, seals and the associated control elements.",
      body: "Turbine work is planned around access. What can be established in place, through borescope inspection and vibration data, decides whether a unit needs opening at all, which keeps the outage matched to actual condition rather than to the calendar.\n\nTypical scope: borescope inspection and condition assessment; blade, nozzle and diaphragm examination; bearing and seal replacement; rotor removal and workshop repair where required; control and protection system checks; alignment and commissioning on reinstatement.",
      imagePublicId: "elatronics/gallery/ubhph0u4giprilm1nxac",
      order: 3,
    },
    {
      slug: "gearbox-rebuild",
      title: "Gearbox Rebuild",
      summary:
        "Rebuild of industrial gearboxes, including gear and bearing replacement, backlash setting and load testing before return to service.",
      body: "A gearbox is rebuilt to its tooth contact pattern and backlash figures, and both are set and recorded during assembly. A box put together without them runs quietly off load and fails once it is asked to carry the duty.\n\nTypical scope: strip, clean and inspection of gears, shafts and housings; gear and bearing replacement; backlash and tooth contact setting; housing repair and bore restoration; oil system cleaning and seal renewal; no-load run and load testing where facilities allow.",
      imagePublicId: "elatronics/general/vkqborajqadpz7bnh0no",
      order: 4,
    },
    {
      slug: "laser-shaft-alignment",
      title: "Laser Shaft Alignment",
      summary:
        "Precision alignment of driver and driven machines using laser equipment, with as-found and as-left readings recorded.",
      body: "Alignment is recorded as found and as left, so the correction is evidenced rather than asserted. Soft foot is measured and corrected first, since aligning a machine standing on an uneven base only moves the problem somewhere less visible.\n\nTypical scope: soft foot measurement and correction; horizontal and vertical alignment by laser measurement; thermal growth allowance where the duty requires it; shimming and repositioning; coupling condition assessment; as-found and as-left reports with tolerances stated.",
      imagePublicId: "elatronics/divisions/ah32g5aqlq1vczjelrkh",
      order: 5,
    },
    {
      slug: "dynamic-balancing",
      title: "Dynamic Balancing",
      summary:
        "In-situ and workshop balancing of rotors and impellers to reduce vibration to within the acceptance limits for the machine.",
      body: "Balancing is carried out to a stated grade rather than until the vibration feels acceptable, and the residual unbalance is recorded, so the result can be checked against the standard the machine is required to meet.\n\nTypical scope: workshop balancing of rotors, impellers and fans; in-situ balancing where removal is impractical; single and two-plane correction; trial weight runs and correction weight fitting; residual unbalance measured against the specified grade; before-and-after vibration record.",
      imagePublicId: "elatronics/general/pava3zyf5fx41xhnwa1d",
      order: 6,
    },
    {
      slug: "vibration-analysis-condition-monitoring",
      title: "Vibration Analysis & Condition Monitoring",
      summary:
        "Vibration measurement and trending that identifies bearing, alignment and imbalance faults before they progress to failure.",
      body: "Vibration data earns its value as a trend. Readings are taken at fixed points and under comparable running conditions, so a change can be attributed to the machine rather than to how it happened to be measured that day.\n\nTypical scope: route-based data collection at fixed points; spectrum and waveform analysis; identification of imbalance, misalignment, looseness and bearing defects; severity assessment against the applicable standard; trend reporting and recommended intervention; baseline reset after overhaul.",
      imagePublicId: "elatronics/general/yfwexqk7czea4nmatni2",
      order: 7,
    },
  ],
  "heavy-lifting-transportation": [
    {
      slug: "lift-planning-engineering",
      title: "Lift Planning & Engineering",
      summary:
        "Lift studies, rigging arrangements and method statements prepared for complex and heavy lifts before any equipment is mobilised.",
      body: "The lift is settled on paper before equipment is mobilised. Weight, centre of gravity, rigging arrangement, ground bearing and exclusion zones are all established in advance, because a lift being reconsidered on the day is a lift being improvised.\n\nTypical scope: weight and centre of gravity determination; crane selection and load chart verification; rigging arrangement and sling angle calculation; ground bearing pressure assessment; lift category assignment and method statement; risk assessment documentation.",
      imagePublicId: "elatronics/gallery/ja0vmensnpnwspjvkbca",
      order: 1,
    },
    {
      slug: "crane-rigging-services",
      title: "Crane & Rigging Services",
      summary:
        "Provision of cranes, rigging crews and certified lifting gear for installation, maintenance and construction lifts.",
      body: "Crane work runs to the lift plan and to a single point of control. The appointed person, the slinger and the operator work to one agreed sequence and one signalling method, which is what keeps a lift predictable from start to set-down.\n\nTypical scope: mobile and crawler crane provision with certified operators; slinger and banksman crews; certified slings, shackles and lifting accessories; lift supervision by an appointed person; exclusion zone management; completion and off-hire records.",
      imagePublicId: "elatronics/gallery/fqiqfctbwo0gtma2ad0m",
      order: 2,
    },
    {
      slug: "heavy-haulage-abnormal-loads",
      title: "Heavy Haulage & Abnormal Loads",
      summary:
        "Road transport of oversized and overweight loads, including route survey, permitting and escorting where required.",
      body: "An abnormal load is planned as a route before it is planned as a vehicle. Bridge capacities, headroom, turning radii and the permits required all shape the trailer configuration that is eventually used.\n\nTypical scope: route survey and feasibility assessment; permit application and authority notification; trailer selection and load securing; escort and traffic management arrangements; loading, transport and offloading; delivery documentation and condition reporting.",
      imagePublicId: "elatronics/gallery/bql3bpzyapg1r7rag251",
      order: 3,
    },
    {
      slug: "load-out-roll-on-roll-off",
      title: "Load-out & Roll-on / Roll-off",
      summary:
        "Load-out of fabricated structures to barge or vessel by crane, skidding or self-propelled transporter, to an agreed load-out procedure.",
      body: "Load-out is timed against tide and ballast rather than the working day. Quay strength, vessel trim and ballasting are calculated in advance so the transfer happens inside a defined window and the structure never sees an unplanned load.\n\nTypical scope: load-out method statement and procedure; crane, skidding and self-propelled transporter options; quay and grillage capacity assessment; ballast planning and tide window calculation; seafastening design and installation; load-out supervision and completion record.",
      imagePublicId: "elatronics/general/hoqaynbgeravjtiixnr7",
      order: 4,
    },
    {
      slug: "jacking-skidding-positioning",
      title: "Jacking, Skidding & Positioning",
      summary:
        "Controlled jacking, skidding and final positioning of heavy equipment where crane access is restricted or unavailable.",
      body: "Where crane access is unavailable, load is moved in controlled increments with synchronised jacking and continuous monitoring. The risk in this work is differential movement between points rather than the total weight being carried.\n\nTypical scope: synchronised hydraulic jacking; skidding systems and track installation; climbing jacks and gantry arrangements; final positioning and setting to line and level; load monitoring throughout the move; grouting and securing in the final position.",
      imagePublicId: "elatronics/general/vkqborajqadpz7bnh0no",
      order: 5,
    },
    {
      slug: "lifting-gear-supply-certification",
      title: "Lifting Gear Supply & Certification",
      summary:
        "Supply of slings, shackles and lifting accessories with proof-load test and material certification for the intended working load.",
      body: "Every item supplied carries proof load test and material certification traceable to its own identity, and assemblies are made up to the working load limit and configuration the lift plan calls for rather than to whatever is nearest in the store.\n\nTypical scope: wire rope, chain and synthetic slings; shackles, hooks, swivels and master links; spreader beams and lifting frames; proof load testing and certification against unique identity; colour coding and register entry; periodic re-examination and quarantine of failed items.",
      imagePublicId: "elatronics/general/siwecfv0s5snxnpu11cj",
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


/**
 * Refuse to write to a database that is not obviously a local one.
 *
 * This seed upserts. It overwrites the title, summary, order and status of
 * every division and sub-page, and the whole SiteSetting row, so running it
 * against a live database silently discards anything edited through the admin
 * since the seed was last written. Nothing in the command distinguishes the
 * two, and .env in this project points at the hosted database, so the default
 * target is the one where a mistake costs the most.
 *
 * The opt-in names the host rather than being a generic --force, because the
 * failure this guards against is not knowing which database you are pointed
 * at. A flag you can memorise would be typed just as reflexively against the
 * wrong one; a hostname has to be read off the error before it can be used.
 */
function assertSafeTarget() {
  // Whatever lib/db would connect with, resolved the same way it resolves it.
  const connectionString =
    process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("No database connection string. Set DATABASE_URL_POOLED or DATABASE_URL.");
    process.exit(1);
  }

  let host: string;
  try {
    host = new URL(connectionString).hostname;
  } catch {
    console.error("DATABASE_URL is not a URL this script can read a host out of.");
    process.exit(1);
  }

  const LOCAL = new Set(["localhost", "127.0.0.1", "::1", "host.docker.internal"]);
  const isLocal = LOCAL.has(host);

  // Printed on every run, local or not. The point is that the target is never
  // something you have to infer.
  console.log(`  target          ${host}${isLocal ? " (local)" : " (REMOTE)"}`);

  if (isLocal) return;

  if (process.env.SEED_ALLOW_REMOTE === host) {
    console.log("  target          remote write allowed for this host");
    return;
  }

  console.error(
    [
      "",
      "Refusing to seed a remote database.",
      "",
      `  target host:  ${host}`,
      "",
      "  This seed overwrites the title, summary, order and status of every",
      "  division and sub-page, and the whole SiteSetting row. Anything edited",
      "  through the admin since the seed was last written would be lost.",
      "",
      "  If that is genuinely what you want, name the host:",
      "",
      `    SEED_ALLOW_REMOTE=${host} npx tsx prisma/seed.ts`,
      "",
    ].join("\n"),
  );
  process.exit(1);
}

async function main() {
  console.log("seeding:");
  assertSafeTarget();
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
