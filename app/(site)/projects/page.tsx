import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected engineering, construction, maintenance and inspection projects delivered for clients in the energy and industrial sectors.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-steel-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-steel-500">/</span>
            <span className="text-white">Projects</span>
          </nav>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Projects
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-200">
            Work delivered across offshore and onshore facilities.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-brand-200 bg-surface p-12 text-center">
              <p className="text-sm text-steel-700">
                Project case studies will be published here shortly.
              </p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-brand-100 bg-white transition-colors hover:border-brand-300"
                  >
                    <div className="relative aspect-[16/10] bg-surface">
                      {project.heroImage ? (
                        <Image
                          src={project.heroImage.secureUrl}
                          alt={project.heroImage.alt || project.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-steel-400">
                          {project.industry ?? "Project"}
                        </span>
                      )}
                      {project.isFeatured && (
                        <span className="absolute left-3 top-3 rounded bg-accent-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="font-display text-base font-semibold leading-snug text-brand-900 group-hover:text-accent-600">
                        {project.title}
                      </h2>
                      {project.scope && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-700">
                          {project.scope}
                        </p>
                      )}
                      <p className="mt-4 text-xs text-steel-500 tabular-nums">
                        {[project.clientName, project.location, project.year]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
