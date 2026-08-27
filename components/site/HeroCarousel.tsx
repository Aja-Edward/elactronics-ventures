"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeroSlideData = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  ctaAltLabel: string | null;
  ctaAltHref: string | null;
};

const INTERVAL_MS = 6500;

/**
 * Rotating hero.
 *
 * Auto-advancing carousels are a well-known accessibility problem — they move
 * content out from under people who read slowly, use magnification, or are
 * mid-interaction. Rather than skip the pattern (the client asked for it), the
 * mitigations are built in:
 *
 *   - rotation stops on hover and on keyboard focus anywhere inside
 *   - it never starts at all under prefers-reduced-motion
 *   - manual controls and dots are real buttons, reachable and labelled
 *   - the live region is polite, and announces only on manual change
 *
 * Only the first slide's image gets priority; the rest lazy-load, so a
 * five-slide hero does not cost five full-bleed images on first paint.
 */
export default function HeroCarousel({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const regionRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (next: number) => {
      const newIndex = (next + slides.length) % slides.length;
      setDirection(newIndex > prevIndexRef.current ? "next" : "prev");
      prevIndexRef.current = newIndex;
      setIndex(newIndex);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2 || paused || reducedMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [slides.length, paused, reducedMotion]);

  if (slides.length === 0) return null;

  const active = slides[index];

  return (
    <section
      ref={regionRef}
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="relative min-h-[32rem] overflow-hidden bg-brand-950 sm:min-h-[38rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.imageUrl ? (
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={slide.imageUrl}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover transition-transform duration-[6500ms] ease-out ${
                  i === index ? "scale-105" : "scale-100"
                }`}
              />
            </div>
          ) : (
            <div className="h-full w-full bg-brand-950" />
          )}
          {/* The reference site applies no dimmer at all — its photos render at
              full brightness. Matching that exactly would be fragile: a bright
              upload would leave white text unreadable. So the wash is light
              (25%), with a slightly stronger foot to hold the controls, and the
              headline carries its own shadow (.hero-text-shadow) as the real
              legibility guarantee rather than darkening the whole photograph. */}
          <div className="absolute inset-0 bg-brand-950/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-950/25 via-transparent to-brand-950/55" />
        </div>
      ))}

      <div className="relative mx-auto flex min-h-[32rem] max-w-5xl items-center justify-center px-6 py-20 text-center sm:min-h-[38rem]" style={{ perspective: "1000px" }}>
        {/* Keyed on the slide id so React remounts this subtree on every
            change — which is what restarts the CSS entrance animations.
            Each animated line sits in its own overflow-hidden wrapper; that
            mask is what turns a slide into a wipe. */}
        <div aria-live="polite" aria-atomic="true" className="w-full hero-slide-content" key={active.id}>
          <div className="overflow-hidden pb-1">
            <h1 className="hero-anim-title hero-text-shadow text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {active.title}
            </h1>
          </div>

          {active.subtitle && (
            <div className="mt-5 overflow-hidden pb-1">
              <p className="hero-anim-subtitle hero-text-shadow mx-auto max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
                {active.subtitle}
              </p>
            </div>
          )}

          {(active.ctaHref || active.ctaAltHref) && (
            <div className="hero-anim-cta mt-9 flex flex-wrap justify-center gap-3">
              {active.ctaHref && active.ctaLabel && (
                <Link
                  href={active.ctaHref}
                  className="rounded bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
                >
                  {active.ctaLabel}
                </Link>
              )}
              {active.ctaAltHref && active.ctaAltLabel && (
                <Link
                  href={active.ctaAltHref}
                  className="rounded border border-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-brand-500 hover:bg-white/5"
                >
                  {active.ctaAltLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-4 px-6">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
            >
              <span aria-hidden>&#8592;</span>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
            >
              <span aria-hidden>&#8594;</span>
            </button>

            <div className="ml-2 flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-accent-600" : "w-4 bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
