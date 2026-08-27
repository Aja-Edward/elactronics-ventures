"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

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
 * How long the outgoing-image overlay stays mounted. Every transition below is
 * built to finish inside this window (longest is ~1130ms of stagger + travel);
 * the remainder is slack. Overshooting is harmless — by then the overlay is
 * fully transparent or fully off-frame — but undershooting would cut an
 * animation short, so the buffer only ever errs long.
 */
const TRANSITION_MS = 1300;

/**
 * The reference site sets `data-transition="random"` on every slide, letting
 * Slider Revolution draw a different image effect on each advance. This is the
 * pool it draws from, grouped the same way: box grids, strip ("slot") wipes,
 * whole-frame pans, and a plain dissolve.
 *
 * `cols`/`rows` describe how the outgoing frame is cut up; `stagger` is the
 * per-cell delay step, and `order` decides which cell goes when.
 */
type TransitionSpec = {
  name: string;
  cols: number;
  rows: number;
  stagger: number;
  /** Sweep order for staggered effects. Omitted means every cell fires at once. */
  order?: "diagonal" | "row" | "col" | "scatter";
};

const TRANSITIONS: TransitionSpec[] = [
  { name: "fade", cols: 1, rows: 1, stagger: 0 },
  { name: "boxfade", cols: 6, rows: 4, stagger: 26, order: "scatter" },
  { name: "boxslide", cols: 6, rows: 4, stagger: 55, order: "diagonal" },
  { name: "slotfade-vertical", cols: 1, rows: 8, stagger: 60, order: "row" },
  { name: "slotslide-vertical", cols: 1, rows: 8, stagger: 55, order: "row" },
  { name: "slotslide-horizontal", cols: 10, rows: 1, stagger: 45, order: "col" },
  { name: "slotzoom-horizontal", cols: 8, rows: 1, stagger: 55, order: "col" },
  { name: "curtain", cols: 2, rows: 1, stagger: 0 },
  { name: "slideleft", cols: 1, rows: 1, stagger: 0 },
  { name: "slideright", cols: 1, rows: 1, stagger: 0 },
  { name: "slideup", cols: 1, rows: 1, stagger: 0 },
  { name: "slidedown", cols: 1, rows: 1, stagger: 0 },
];

/**
 * Picks the next effect, refusing to repeat the previous one. Revolution's own
 * picker is a bare `Math.random()` and will happily play the same transition
 * twice; excluding the last one costs nothing and reads as more deliberate.
 */
function pickTransition(previous: string | null): TransitionSpec {
  const pool = previous ? TRANSITIONS.filter((t) => t.name !== previous) : TRANSITIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Deterministic-per-cell scatter. A real shuffle would need to be memoised to
 * survive re-renders; hashing the cell index instead gives a fixed, unordered-
 * looking sequence for free. The multiplier is coprime with typical grid sizes,
 * so cells that are adjacent on screen land far apart in time.
 */
function cellDelay(spec: TransitionSpec, c: number, r: number, i: number): number {
  if (!spec.stagger) return 0;
  switch (spec.order) {
    case "diagonal":
      return (c + r) * spec.stagger;
    case "row":
      return r * spec.stagger;
    case "col":
      return c * spec.stagger;
    case "scatter":
      return ((i * 7) % (spec.cols * spec.rows)) * spec.stagger;
    default:
      return 0;
  }
}

type OutgoingState = {
  slide: HeroSlideData;
  spec: TransitionSpec;
  /** Bumped on every advance so React remounts the overlay and restarts the CSS. */
  runId: number;
};

/**
 * The outgoing frame, cut into clip windows that animate out of the way.
 *
 * Each cell holds a full-frame `<Image>` offset so only its own slice shows.
 * That costs more nodes than tiling a single stretched background would, but it
 * keeps `object-cover` framing identical to the base layer — a stretched tile
 * grid distorts on any aspect ratio but the image's own. The `src` and `sizes`
 * match the base layer exactly, so every cell is a cache hit rather than a
 * fresh download.
 */
function TransitionOverlay({ slide, spec }: { slide: HeroSlideData; spec: TransitionSpec }) {
  if (!slide.imageUrl) return null;

  const cells = [];
  for (let r = 0; r < spec.rows; r++) {
    for (let c = 0; c < spec.cols; c++) {
      const i = r * spec.cols + c;
      cells.push(
        <div
          key={i}
          className="hero-tx-slot"
          style={
            {
              "--c": c,
              "--r": r,
              "--d": `${cellDelay(spec, c, r, i)}ms`,
            } as CSSProperties
          }
        >
          <div className="hero-tx-img">
            {/* Eager, not lazy. The overlay lives for barely a second, and
                `loading="lazy"` defers past that — the cells would animate out
                empty. The URL matches the base layer's, so this resolves
                against the cache rather than costing a second fetch. */}
            <Image
              src={slide.imageUrl}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              className="object-cover"
            />
            {/* The same wash the base layers carry. It lives inside the mover —
                which spans the whole frame, not just this cell — so the
                gradient stays registered with the one underneath instead of
                restarting inside every cell. */}
            <div className="absolute inset-0 bg-brand-950/25" />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-950/25 via-transparent to-brand-950/55" />
          </div>
        </div>,
      );
    }
  }

  return (
    <div
      aria-hidden
      className={`hero-tx hero-tx--${spec.name}`}
      style={{ "--cols": spec.cols, "--rows": spec.rows } as CSSProperties}
    >
      {cells}
    </div>
  );
}

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
  const [outgoing, setOutgoing] = useState<OutgoingState | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  // `go` reads the live index without taking it as a dependency, so the
  // auto-advance interval is not torn down and rebuilt on every slide.
  const indexRef = useRef(0);
  const runIdRef = useRef(0);
  const lastTransitionRef = useRef<string | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    reducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (next: number) => {
      const len = slides.length;
      const newIndex = ((next % len) + len) % len;
      if (newIndex === indexRef.current) return;

      // The incoming slide is swapped in underneath immediately; the departing
      // one is handed to the overlay to animate away over the top of it.
      if (!reducedMotionRef.current) {
        const spec = pickTransition(lastTransitionRef.current);
        lastTransitionRef.current = spec.name;
        runIdRef.current += 1;
        setOutgoing({ slide: slides[indexRef.current], spec, runId: runIdRef.current });
      }

      indexRef.current = newIndex;
      setIndex(newIndex);
    },
    [slides],
  );

  useEffect(() => {
    if (slides.length < 2 || paused || reducedMotion) return;
    const t = setInterval(() => go(indexRef.current + 1), INTERVAL_MS);
    return () => clearInterval(t);
  }, [slides.length, paused, reducedMotion, go]);

  // Tear the overlay down once its animation is spent. Keyed on runId so a
  // rapid second advance restarts the clock rather than letting the first
  // timer retire the newer overlay early.
  useEffect(() => {
    if (!outgoing) return;
    const runId = outgoing.runId;
    const t = setTimeout(() => {
      setOutgoing((current) => (current?.runId === runId ? null : current));
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [outgoing]);

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
          // The swap itself is instant: the overlay above is what the eye reads
          // as the transition, and a simultaneous cross-fade underneath would
          // wash it out. Under reduced motion no overlay mounts, so the layer
          // carries a plain dissolve on its own.
          className={`absolute inset-0 ${
            reducedMotion ? "transition-opacity duration-700" : ""
          } ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          {slide.imageUrl ? (
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={slide.imageUrl}
                alt=""
                fill
                priority={i === 0}
                // Only the first slide is preloaded, but the rest still load
                // eagerly: they are all above the fold and every one of them is
                // on screen within a few seconds. Left lazy, a slide could be
                // swapped in before its image had started fetching and show an
                // empty frame — which the instant swap would make obvious.
                loading={i === 0 ? undefined : "eager"}
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

      {outgoing && (
        <TransitionOverlay key={outgoing.runId} slide={outgoing.slide} spec={outgoing.spec} />
      )}

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
