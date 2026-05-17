import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, RefreshCw, Send, X } from "lucide-react";
import { FadeIn, SectionPill } from "./shared";

function EscalationDraft() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-gray-200/70 bg-white shadow-[0_24px_70px_-52px_rgba(17,24,39,0.45)]">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              High-value failure
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-lg font-bold tracking-tight text-gray-900">
                Lucas Fontaine
              </h3>
              <span className="text-sm font-medium text-gray-400">
                Northstar Ledger
              </span>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/10 px-3 py-1.5">
            <motion.span
              animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.24, 1] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="size-1.5 rounded-full bg-dunlo"
            />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dunlo-deep">
              draft ready
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <p className="font-mono text-2xl font-bold text-dunlo">€956</p>
            <p className="text-xs font-medium text-gray-400">failed payment</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <p className="font-mono text-2xl font-bold text-gray-900">€500</p>
            <p className="text-xs font-medium text-gray-400">threshold</p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            AI-drafted founder email
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Ready to review
          </h3>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Subject
          </p>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900">
            Quick note about your Northstar Ledger payment
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-gray-200 bg-white p-5 text-sm leading-7 text-gray-700">
          <p>Hi Lucas,</p>
          <p className="mt-3">
            I saw that the{" "}
            <span className="rounded-md bg-dunlo/10 px-1.5 py-0.5 font-semibold text-dunlo-deep">
              €956 payment
            </span>{" "}
            for Northstar Ledger did not go through today. I wanted to reach out
            personally instead of sending the usual automated reminder.
          </p>
          <p className="mt-3">
            Here is the secure link if you want to update the payment method.
          </p>
          <p className="mt-3">Mathieu</p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_1.15fr]">
          <button className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 active:scale-[0.98]">
            <X size={14} />
            Dismiss
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]">
            <RefreshCw size={14} />
            Regenerate
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-full bg-dunlo px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]">
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export function Escalation() {
  return (
    <FadeIn>
      <section
        id="escalation"
        className="scroll-mt-24 overflow-hidden rounded-3xl border border-gray-200/60 bg-white"
      >
        <div className="grid gap-8 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
          <div>
            <SectionPill>Escalate</SectionPill>
            <h2 className="mt-6 max-w-3xl text-4xl font-bold leading-[0.98] tracking-tight text-gray-900 md:text-6xl">
              Automated recovery for the small ones. Your personal touch,
              drafted by AI, for the ones that matter.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-gray-500">
              Set a threshold. When a failed payment crosses it, Dunlo stops
              the automation and drafts a founder email from you instead.
              Review, regenerate, dismiss, or send in one click.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-gray-700 active:scale-[0.98]"
              >
                Try escalation drafts
                <ChevronRight size={14} />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
              >
                See Growth plan
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <EscalationDraft />
          </motion.div>
        </div>
      </section>
    </FadeIn>
  );
}
