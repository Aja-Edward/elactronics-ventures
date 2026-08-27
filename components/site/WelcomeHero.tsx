"use client";

interface WelcomeHeroProps {
  companyName: string;
  description: string;
  highlightedText?: string;
}

export default function WelcomeHero({
  companyName,
  description,
  highlightedText,
}: WelcomeHeroProps) {
  // Split text by [br] delimiter to create line breaks
  const renderTextWithBreaks = (text: string) => {
    const parts = text.split("[br]");
    return parts.map((part, index) => (
      <span key={`text-${index}`}>
        {part.trim()}
        {index < parts.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-4">
          {/* Left: Welcome heading */}
          <div className="flex-shrink-0">
            <h1 className="font-display text-4xl font-semibold text-brand-900 sm:text-5xl leading-tight">
              Welcome
              <br />
              to <span className="text-accent-600 font-bold">{companyName}</span>
            </h1>
          </div>

          {/* Right: Description text with left border */}
          <div className="border-l-4 border-accent-600 pl-4 sm:pl-5">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-steel-700">
                {renderTextWithBreaks(description)}
              </p>

              {highlightedText && (
                <p className="text-sm leading-relaxed text-brand-900">
                  {renderTextWithBreaks(highlightedText)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
