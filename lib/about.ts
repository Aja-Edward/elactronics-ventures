import { cacheLife, cacheTag } from "next/cache";

import type { Crumb } from "@/components/site/PageHero";

import { tags } from "./cache-tags";
import { db } from "./db";

/** Breadcrumb ancestors shared by every page under /about. */
export const ABOUT_TRAIL: Crumb[] = [{ label: "About Us", href: "/about" }];

/**
 * Readers for the About section.
 *
 * One function per subject rather than one `getAboutData()` that fetches all
 * seven, because each is now its own page and should pay for its own query
 * only. Each tags itself with the matching entry from `tags`, so an edit to a
 * milestone invalidates the history page and nothing else.
 *
 * These replace a single `cacheTag("about-page")` that only the Page editor
 * ever invalidated — so an edit to a team member or an award could sit unseen
 * behind `cacheLife("days")`. Note that the admin has no screens for these
 * seven models yet, so nothing invalidates these tags today either; wiring
 * `updateTag(tags.team())` and friends into those screens is what makes the
 * correct tag pay off.
 */

export async function getTeam() {
  "use cache";
  cacheTag(tags.team());
  cacheLife("days");

  return db.teamMember.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isBoard: "desc" }, { order: "asc" }],
    select: {
      id: true, name: true, role: true, bio: true, isBoard: true, linkedin: true,
      photo: { select: { secureUrl: true, alt: true } },
    },
  });
}

export async function getMilestones() {
  "use cache";
  cacheTag(tags.history());
  cacheLife("days");

  return db.historyMilestone.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ year: "asc" }, { order: "asc" }],
    select: { id: true, year: true, title: true, description: true },
  });
}

export async function getAwards() {
  "use cache";
  cacheTag(tags.awards());
  cacheLife("days");

  return db.award.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ year: "desc" }, { order: "asc" }],
    select: { id: true, title: true, awardedBy: true, year: true, description: true },
  });
}

export async function getGroupEntities() {
  "use cache";
  cacheTag(tags.groupEntities());
  cacheLife("days");

  return db.groupEntity.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: { id: true, name: true, description: true, website: true },
  });
}

export async function getLocations() {
  "use cache";
  cacheTag(tags.locations());
  cacheLife("days");

  return db.location.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isHeadOffice: "desc" }, { order: "asc" }],
    select: {
      id: true, name: true, city: true, state: true, country: true,
      addressLine: true, phone: true, email: true, isHeadOffice: true,
    },
  });
}

export async function getClients() {
  "use cache";
  cacheTag(tags.clients());
  cacheLife("days");

  return db.client.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: {
      id: true, name: true, sector: true, website: true,
      logo: { select: { secureUrl: true, alt: true } },
    },
  });
}

export async function getFaqs() {
  "use cache";
  cacheTag(tags.faqs());
  cacheLife("days");

  return db.faq.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: { id: true, question: true, answer: true, category: true },
  });
}
