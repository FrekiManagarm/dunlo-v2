"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function FadeIn({
  children,
  i = 0,
  className = "",
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={i}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionPill({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  if (dark) {
    return (
      <span className="inline-block rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/60">
        {children}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-dunlo px-4 py-1.5 text-sm font-medium text-white">
      {children}
    </span>
  );
}
