"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { NavItem } from "./MainNav";

/**
 * The small-screen menu.
 *
 * Below `lg` the primary nav is hidden and reached through this hamburger
 * instead. Nine top-level items with thirteen children apiece cannot wrap into
 * a phone-width band — it pushed the page content below the fold — and the
 * desktop hover dropdowns have no equivalent on touch.
 *
 * Sections are an accordion rather than nested flyouts: everything stays in
 * one scrolling column, so a division buried three taps down is still one
 * thumb reach away. More than one section can be open at once, because
 * collapsing a section the reader just scrolled to would move the page under
 * them.
 *
 * The panel also carries the contact details and the search box, both of which
 * the masthead hides at this width — otherwise they are unreachable on a
 * phone.
 */
export default function MobileNav({
  items,
  phone,
  email,
  whatsapp,
}: {
  items: NavItem[];
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // Lock the page behind the drawer, or a scroll gesture that runs past the
    // end of the menu scrolls the article underneath instead.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const toggleSection = (label: string) =>
    setExpanded((current) =>
      current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label],
    );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  // Every link in the drawer closes it on the way out. Doing it here rather
  // than in an effect on `pathname` means the panel also closes when the link
  // points at the page already showing, where no navigation would fire.
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-brand-200 text-brand-900 transition-colors hover:border-brand-400"
      >
        <span aria-hidden className="flex w-5 flex-col gap-[5px]">
          <span className="h-0.5 w-full rounded-full bg-current" />
          <span className="h-0.5 w-full rounded-full bg-current" />
          <span className="h-0.5 w-full rounded-full bg-current" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop. A button rather than a bare div, so tap-to-close is a
              real control for assistive technology and not a mystery region. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-brand-950/60"
          />

          <div
            id="mobile-menu"
            className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-steel-600">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded text-2xl leading-none text-steel-600 transition-colors hover:bg-surface hover:text-brand-900"
              >
                <span aria-hidden>&times;</span>
              </button>
            </div>

            <form
              action="/search"
              method="get"
              role="search"
              className="flex border-b border-brand-100 px-5 py-4"
            >
              <label htmlFor="mobile-search" className="sr-only">
                Search this site
              </label>
              <input
                id="mobile-search"
                type="search"
                name="q"
                placeholder="Search..."
                className="w-full rounded-l border border-r-0 border-brand-200 px-3 py-2 text-sm text-brand-950 outline-none placeholder:text-steel-400 focus:border-brand-900"
              />
              <button
                type="submit"
                className="rounded-r bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
              >
                Go
              </button>
            </form>

            <nav aria-label="Primary" className="flex-1 px-2 py-2">
              <ul>
                {items.map((item) => {
                  const active = isActive(item.href);

                  if (!item.children?.length) {
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className={`block rounded px-3 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-surface ${
                            active ? "text-accent-600" : "text-brand-900"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }

                  const isExpanded = expanded.includes(item.label);

                  return (
                    <li key={item.label}>
                      {/* Two controls, not one: the label navigates to the
                          section's own page, the chevron opens the list.
                          Collapsing both into a single tap target is what makes
                          the parent page unreachable in most accordion menus. */}
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          onClick={close}
                          className={`flex-1 rounded px-3 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-surface ${
                            active ? "text-accent-600" : "text-brand-900"
                          }`}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleSection(item.label)}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? "Hide" : "Show"} ${item.label} pages`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-steel-600 transition-colors hover:bg-surface hover:text-brand-900"
                        >
                          <span
                            aria-hidden
                            className={`text-[10px] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          >
                            &#9660;
                          </span>
                        </button>
                      </div>

                      {isExpanded && (
                        <ul className="mb-1 ml-3 border-l border-brand-100 pl-2">
                          {item.children.map((child) => (
                            <li key={child.href + child.label}>
                              <Link
                                href={child.href}
                                onClick={close}
                                className="block rounded px-3 py-2.5 text-sm leading-snug text-steel-800 transition-colors hover:bg-surface hover:text-accent-600"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto border-t border-brand-100 bg-surface px-5 py-5">
              <Link
                href="/request-quote"
                onClick={close}
                className="block rounded bg-accent-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-700"
              >
                Request a Quote
              </Link>

              <ul className="mt-4 space-y-2 text-sm">
                {phone && (
                  <li>
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="text-steel-700 transition-colors hover:text-brand-900"
                    >
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="text-steel-700 transition-colors hover:text-brand-900"
                    >
                      {email}
                    </a>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-900 transition-opacity hover:opacity-80"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
