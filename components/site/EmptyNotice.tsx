/**
 * Placeholder for a section whose content has not been published yet.
 *
 * The About pages are driven entirely by the database, and every one of those
 * tables is empty until an editor fills it. An empty page that says nothing
 * reads as broken; this says "not yet" instead. Same dashed treatment the
 * certifications page already used.
 */
export default function EmptyNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-brand-200 bg-surface p-12 text-center">
      <p className="text-sm text-steel-700">{children}</p>
    </div>
  );
}
