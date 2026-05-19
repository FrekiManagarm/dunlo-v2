"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DisplaySurveyType, SurveyPosition } from "posthog-js";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";
import { MessageSquareText, Send, Sparkles } from "lucide-react";

import { env } from "@dunlo-v2/env/web";
import { Button } from "@dunlo-v2/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@dunlo-v2/ui/components/dialog";
import { Textarea } from "@dunlo-v2/ui/components/textarea";

type FeedbackWidgetProps = {
  user?: {
    id?: string;
    email?: string;
    name?: string | null;
  };
  path: string;
};

const FEEDBACK_OPTIONS = [
  { value: "friction", label: "Friction" },
  { value: "bug", label: "Bug" },
  { value: "idea", label: "Idea" },
  { value: "praise", label: "Praise" },
] as const;

export function FeedbackWidget({ user, path }: FeedbackWidgetProps) {
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);
  const [category, setCategory] =
    useState<(typeof FEEDBACK_OPTIONS)[number]["value"]>("friction");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const feedbackSurveyId = env.VITE_POSTHOG_FEEDBACK_SURVEY_ID;

  const trimmedMessage = message.trim();
  const buttonLabel = useMemo(
    () => (feedbackSurveyId ? "Open survey" : "Feedback"),
    [feedbackSurveyId],
  );

  const openFeedback = () => {
    posthog.capture("feedback_widget_opened", {
      path,
      mode: feedbackSurveyId ? "posthog_survey" : "custom_form",
    });

    if (feedbackSurveyId) {
      posthog.displaySurvey(feedbackSurveyId, {
        displayType: DisplaySurveyType.Popover,
        ignoreConditions: true,
        ignoreDelay: true,
        position: SurveyPosition.Right,
        properties: {
          source: "dunlo_feedback_widget",
          path,
        },
      });
      return;
    }

    setOpen(true);
  };

  const submitFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (trimmedMessage.length < 8) {
      setError("Give me at least a sentence so the signal is useful.");
      return;
    }

    setError(null);

    const properties = {
      category,
      message: trimmedMessage,
      path,
      user_id: user?.id,
      user_email: user?.email,
      user_name: user?.name,
      source: "dunlo_feedback_widget",
    };

    posthog.capture("feedback_submitted", properties);

    if (feedbackSurveyId) {
      posthog.capture("survey sent", {
        $survey_id: feedbackSurveyId,
        $survey_completed: true,
        $survey_response: trimmedMessage,
        $survey_questions: [
          {
            id: "dunlo-feedback-message",
            question: "What should we improve in Dunlo?",
          },
        ],
        ...properties,
      });
    }

    toast.success("Feedback sent. Thank you.");
    setMessage("");
    setCategory("friction");
    setOpen(false);
  };

  return (
    <>
      <motion.button
        type="button"
        id="dunlo-feedback-button"
        onClick={openFeedback}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-[0_16px_40px_-24px_rgba(24,24,27,0.55)] backdrop-blur-xl transition-colors hover:border-dunlo/40 hover:text-dunlo-deep"
      >
        <span className="relative flex size-7 items-center justify-center rounded-full bg-zinc-950 text-white">
          <MessageSquareText size={14} strokeWidth={2} />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-dunlo ring-2 ring-white" />
        </span>
        <span className="hidden sm:inline">{buttonLabel}</span>
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-[0_24px_80px_-44px_rgba(24,24,27,0.65)] sm:max-w-md">
          <div className="border-b border-zinc-100 px-5 py-4">
            <DialogHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-dunlo/10 text-dunlo-deep">
                <Sparkles size={17} strokeWidth={2} />
              </div>
              <DialogTitle className="text-base font-semibold tracking-tight text-zinc-950">
                Send product feedback
              </DialogTitle>
              <DialogDescription className="max-w-sm text-xs leading-relaxed text-zinc-500">
                Tell us what felt confusing, broken, slow, or surprisingly good.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={submitFeedback} className="space-y-4 px-5 py-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FEEDBACK_OPTIONS.map((option) => {
                const active = option.value === category;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition-all active:scale-[0.98] ${
                      active
                        ? "border-dunlo/30 bg-dunlo/10 text-dunlo-deep"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dunlo-feedback-message"
                className="text-xs font-semibold text-zinc-800"
              >
                What should we know?
              </label>
              <Textarea
                id="dunlo-feedback-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="I got stuck when..."
                aria-invalid={Boolean(error)}
                className="min-h-32 resize-none rounded-xl border-zinc-200 bg-zinc-50/60 px-3 py-3 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus-visible:border-dunlo/60 focus-visible:ring-dunlo/20"
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    className="text-xs font-medium text-red-600"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Captured with the current page and signed-in user context.
              </p>
              <Button
                type="submit"
                className="h-10 rounded-full bg-zinc-950 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
              >
                Send
                <Send size={13} strokeWidth={2} />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
