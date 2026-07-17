import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const X_PROFILE_URL = "https://x.com/mathchambaud";
const FOUNDER_IMAGE_URL = "/founder/mathieu-chambaud-linkedin.jpg";

export function BuiltByMathieu() {
  return (
    <section
      id="founder"
      className="mx-auto grid max-w-[1400px] scroll-mt-24 gap-7 border-b border-dunlo-line py-14 md:grid-cols-[auto_1fr_auto] md:items-center md:py-20"
    >
      <Image
        src={FOUNDER_IMAGE_URL}
        alt="Mathieu Chambaud, founder of Dunlo"
        width={96}
        height={96}
        className="size-24 rounded-xl object-cover grayscale transition duration-500 hover:grayscale-0"
      />
      <div>
        <p className="text-sm font-semibold text-dunlo-deep">
          Built and supported by Mathieu Chambaud
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-dunlo-ink md:text-3xl">
          A founder-led beta with a public standard for proof.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
          I built Dunlo to make failed-payment recovery more specific and less
          awkward for customers. Beta feedback goes directly to me.
        </p>
      </div>
      <Link
        href={X_PROFILE_URL}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-dunlo-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2"
      >
        Follow @mathchambaud
        <ArrowUpRight size={15} aria-hidden />
      </Link>
    </section>
  );
}
