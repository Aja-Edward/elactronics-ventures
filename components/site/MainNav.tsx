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
 * The hover-open is gated on `pointerType === "mouse"`. A tap on a touch
 * screen fires a synthetic pointerenter before the click, so without the gate
 * the menu opened on enter and the click immediately toggled it shut again —
 * leaving every dropdown unopenable on a landscape tablet, which is exactly
 * the width where this nav rather than the hamburger is shown.
 *
 * The parent's own page stays reachable — its link is repeated as the first
 * item in the menu, which is also what the reference site does.
 */
export default function MainNav({ items }: { items: NavItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

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

  // Following a link must not leave the menu hanging open over the new page.
  // Done on the click rather than in an effect on `pathname`, so it also fires
  // for a link to the page already showing, where no navigation happens.
  const close = () => setOpenIndex(null);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      // Wraps rather than scrolls if it ever has to. It must not be a scroll
      // container: `overflow-x: auto` forces the computed `overflow-y` to
      // `auto` as well, which clipped the open dropdown to the 48px nav band.
      //
      // Nine top-level items measure ~920px, so they only just clear the
      // 976px available at the lg breakpoint where this band first appears.
      // The gap closes up to buy that margin and reopens at xl; the items
      // carry their own padding, so they never actually touch.
      className="mx-auto flex max-w-6xl flex-wrap items-center gap-0 px-6 py-1.5 xl:gap-1"
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
              className={`whitespace-nowrap px-2.5 py-2 text-sm font-medium uppercase tracking-wide transition-colors hover:text-accent-600 xl:px-3 ${
                active ? "text-accent-600" : "text-brand-900"
              }`}
            >
              {item.label}
            </Link>
          );
        }

        // Thirteen divisions stacked in one 16rem column ran 565px tall — off
        // the bottom of a 768px laptop screen. Long menus go two-up in a wider
        // panel instead, which is also how the reference site lays this out.
        const wide = item.children.length > 8;

        return (
          <div
            key={item.label}
            className="relative"
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setOpenIndex(i);
            }}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpenIndex(open ? null : i)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-sm font-medium uppercase tracking-wide transition-colors hover:text-accent-600 xl:px-3 ${
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
              <div
                className={`absolute left-0 top-full z-50 rounded-b border border-t-0 border-brand-100 bg-white py-1.5 shadow-lg ${
                  wide ? "w-[38rem]" : "min-w-[16rem]"
                }`}
              >
                {/* The parent's own page, repeated so it stays reachable. */}
                <Link
                  href={item.href}
                  onClick={close}
                  className="block px-4 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-surface hover:text-accent-600"
                >
                  {item.label}
                </Link>
                <div className="my-1 border-t border-brand-50" />
                <div className={wide ? "grid grid-cols-2" : undefined}>
                  {item.children.map((child) => (
                    <Link
                      key={child.href + child.label}
                      href={child.href}
                      onClick={close}
                      className="block px-4 py-2 text-sm leading-snug text-steel-800 transition-colors hover:bg-surface hover:text-accent-600"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
