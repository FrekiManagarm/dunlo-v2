import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const X_PROFILE_URL = "https://x.com/mathchambaud";
const FOUNDER_IMAGE_URL = "/founder/mathieu-chambaud-linkedin.jpg";

export function BuiltByMathieu() {
  return (
    <section
      id="founder"
      className="mx-auto grid max-w-7xl scroll-mt-24 gap-6 border-t border-dunlo-line py-10 md:grid-cols-[auto_1fr_auto] md:items-center"
    >
      <Image
        src={FOUNDER_IMAGE_URL}
        alt="Mathieu Chambaud, founder of Dunlo"
        width={80}
        height={80}
        className="size-20 rounded-xl object-cover"
      />
      <div>
        <p className="text-sm font-semibold text-dunlo-deep">
          Built and supported by Mathieu Chambaud
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-dunlo-ink">
          A founder-led beta with a public standard for proof.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
          I built Dunlo to make failed-payment recovery more specific and less
          awkward for customers. Beta feedback goes directly to me.
        </p>
      </div>
      <Link
        href={X_PROFILE_URL}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-dunlo-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2"
      >
        Follow @mathchambaud
        <ArrowUpRight size={15} aria-hidden />
      </Link>
    </section>
  );
}
