import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { FadeIn } from "./shared";

const X_PROFILE_URL = "https://x.com/mathchambaud";
const FOUNDER_IMAGE_URL = "/founder/mathieu-chambaud-linkedin.jpg";

export function BuiltByMathieu() {
  return (
    <FadeIn>
      <section
        id="founder"
        className="scroll-mt-24 rounded-3xl border border-gray-200/60 bg-white px-5 py-5 md:px-7 md:py-6"
      >
        <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <div className="flex items-center gap-4">
            <Image
              src={FOUNDER_IMAGE_URL}
              alt="Mathieu Chambaud"
              width={96}
              height={96}
              sizes="(max-width: 768px) 72px, 80px"
              className="size-18 rounded-2xl object-cover ring-1 ring-gray-200 md:size-20"
            />
            <div className="min-w-0 md:hidden">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-dunlo-deep">
                Founder story
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900">
                Built by Mathieu Chambaud.
              </h2>
            </div>
          </div>

          <div className="min-w-0">
            <p className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-dunlo-deep md:block">
              Founder story
            </p>
            <div className="mt-1 hidden items-baseline gap-3 md:flex">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Built by Mathieu Chambaud.
              </h2>
              <p className="text-sm font-medium text-gray-400">
                Solo founder of Dunlo
              </p>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-600 md:mt-3 md:text-[15px]">
              I lost my first SaaS users to silent churn. I didn't understand
              why until too late. That's why I built Dunlo, so founders can
              catch failed payments before good customers quietly disappear.
            </p>
          </div>

          <a
            href={X_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
          >
            @mathchambaud
            <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
    </FadeIn>
  );
}
