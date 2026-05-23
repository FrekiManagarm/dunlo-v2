import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { FadeIn } from "./shared";

export function CtaBanner() {
  const posthog = usePostHog();
  return (
    <FadeIn>
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-16 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 420,
            height: 420,
            background:
              "radial-gradient(circle, rgba(0,232,123,0.14) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <p className="relative mb-3 inline-flex items-center gap-2 rounded-full border border-dunlo/20 px-4 py-1.5 text-xs font-semibold text-dunlo-dim">
          <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
          Beta · Free to join
        </p>
        <h2 className="relative mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          Your next payment failure
          <br />
          doesn't have to be lost revenue.
        </h2>
        <p className="relative mt-4 text-base text-white/50">
          Join the beta. Free until launch. 5-minute setup.
        </p>
        <div className="relative mt-8">
          <Link
            to="/signup"
            onClick={() => posthog.capture("cta_clicked", { location: "cta_banner" })}
            className="inline-flex items-center gap-0 rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.97]"
          >
            <span className="px-4 text-sm font-semibold text-white">
              Get started now
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-sm font-semibold text-white">
              for free
              <ChevronRight size={14} />
            </span>
          </Link>
        </div>
      </section>
    </FadeIn>
  );
}
