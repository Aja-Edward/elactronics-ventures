import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";

/**
 * Chrome for the public marketing site only.
 *
 * This used to live in the root layout, which meant the admin rendered inside
 * the public header and footer — "Request a Quote" sat above the login form.
 * Keeping the public chrome in its own route group keeps the two surfaces
 * genuinely separate.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
