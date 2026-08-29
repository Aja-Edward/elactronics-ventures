"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

/**
 * Primary navigation with dropdowns.
 *
 * Hover-only menus fail two whole groups of users: touch devices have no
 * hover, and keyboard users cannot reach the children at all. So each parent
 * is a real <button> that toggles on click, opens on hover for mouse users,
 * closes on Escape, on outside click, and on route change.
 *
 * The parent's own page stays reachable — its link is repeated as the first
 * item in the menu, which is also what the reference site does.
 */
export default function MainNav({ items }: { items: NavItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Navigating away must not leave a menu hanging open.
  useEffect(() => setOpenIndex(null), [pathname]);

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openIndex]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      // Wraps rather than scrolls on narrow screens. It must not be a scroll
      // container: `overflow-x: auto` forces the computed `overflow-y` to
      // `auto` as well, which clipped the open dropdown to the 48px nav band.
      className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-6 py-1.5"
      onMouseLeave={() => setOpenIndex(null)}
    >
      {items.map((item, i) => {
        const open = openIndex === i;
        const active = isActive(item.href);

        if (!item.children?.length) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors hover:text-accent-600 ${
                active ? "text-accent-600" : "text-brand-900"
              }`}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => setOpenIndex(i)}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpenIndex(open ? null : i)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors hover:text-accent-600 ${
                active || open ? "text-accent-600" : "text-brand-900"
              }`}
            >
              {item.label}
              <span
                aria-hidden
                className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {open && (
              <div className="absolute left-0 top-full z-50 min-w-[16rem] rounded-b border border-t-0 border-brand-100 bg-white py-1.5 shadow-lg">
                {/* The parent's own page, repeated so it stays reachable. */}
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-surface hover:text-accent-600"
                >
                  {item.label}
                </Link>
                <div className="my-1 border-t border-brand-50" />
                {item.children.map((child) => (
                  <Link
                    key={child.href + child.label}
                    href={child.href}
                    className="block px-4 py-2 text-sm text-steel-800 transition-colors hover:bg-surface hover:text-accent-600"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
