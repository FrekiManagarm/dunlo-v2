import Link from "next/link";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { SubpageBackdrop } from "@/components/marketing/subpage-backdrop";
import { COMPARE_ROUTE_PAGES } from "@/components/compare/compare-page";

export function CompareIndex() {
  return (
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-14 pt-28 md:px-6 md:pt-36">
        <section className="relative overflow-hidden rounded-2xl border border-dunlo-line bg-dunlo-ink text-white">
          <SubpageBackdrop />
          <div className="relative px-5 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/75">
              <GitCompareArrows size={15} className="text-dunlo" />
              Neutral comparisons
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-none tracking-tight md:text-6xl">
              Two payment recovery tools, compared head to head.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/68 md:text-lg">
              These guides compare two third-party tools directly, without
              Dunlo in the mix — for the research phase before you have
              settled on a category. Looking for Dunlo against a specific
              competitor instead? See{" "}
              <Link href="/alternatives" className="font-semibold text-dunlo underline underline-offset-4">
                alternatives
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4">
            <p className="text-sm font-semibold text-dunlo-deep">
              Available comparisons
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Pick the two tools you are actually deciding between.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {COMPARE_ROUTE_PAGES.map((page) => (
              <Link
                key={page.slug}
                href={page.path}
                className="group overflow-hidden rounded-2xl border border-dunlo-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-dunlo/35"
              >
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo-ink/46">
                  {page.firstName} vs {page.secondName}
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-dunlo-ink">
                  {page.headline}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-dunlo-ink/68">
                  {page.intro}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-dunlo-deep transition-all group-hover:gap-3">
                  Read comparison
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
