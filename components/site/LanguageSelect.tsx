"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Google Website Translator widget, as used on the reference site.
 *
 * Trade-offs worth knowing, since this is a third-party embed:
 *
 *   - It ships an external Google script with full access to the DOM, and the
 *     page text is sent to Google to be translated.
 *   - It sets its own `googtrans` cookie, which is a consent consideration.
 *   - It injects a banner iframe and shifts `body { top }`, which is why the
 *     CSS below neutralises both — without it the whole page jumps down.
 *   - Machine translation of technical copy ("hose management", "fitness for
 *     service") is unreliable, so this is a convenience, not localisation.
 *
 * Loaded with `lazyOnload` so it never competes with the page's own content
 * for bandwidth on first paint. Confined to this one file: deleting the
 * component and its two usages removes it completely.
 */

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement?: new (opts: object, el: string) => void } };
  }
}

export default function LanguageSelect() {
  useEffect(() => {
    // The Google script calls this by name once it loads.
    window.googleTranslateElementInit = () => {
      const Ctor = window.google?.translate?.TranslateElement;
      if (!Ctor) return;
      new Ctor(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element",
      );
    };
  }, []);

  return (
    <>
      <div
        id="google_translate_element"
        // The widget renders its own select; this wrapper only constrains it.
        className="gt-wrap inline-block align-middle"
      />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
      <style jsx global>{`
        /* Suppress the injected top banner and the body offset it forces. */
        .skiptranslate iframe {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        /* Make the widget's select look like part of the utility bar rather
           than a stock Google control. */
        .gt-wrap .goog-te-gadget {
          font-size: 0 !important;
          line-height: 0 !important;
          color: transparent !important;
        }
        .gt-wrap .goog-te-combo {
          margin: 0 !important;
          padding: 2px 6px;
          font-size: 12px;
          line-height: 1.4;
          color: var(--color-brand-200);
          background: transparent;
          border: 1px solid color-mix(in srgb, white 25%, transparent);
          border-radius: 3px;
          cursor: pointer;
        }
        .gt-wrap .goog-te-combo option {
          color: #111;
          background: #fff;
        }
      `}</style>
    </>
  );
}
