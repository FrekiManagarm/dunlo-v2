import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { ChevronRight, Loader2, MailCheck } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { GoogleAuthButton } from "@/components/google-auth-button";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const posthog = usePostHog();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      posthog.capture("signup_started");
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/onboarding",
        },
        {
          onSuccess: () => {
            posthog.capture("signup_completed");
            setSubmittedEmail(value.email);
          },
          onError: (err) => {
            posthog.capture("signup_failed", {
              error: err.error.message || err.error.statusText,
            });
            toast.error(err.error.message || err.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "At least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Minimum 8 characters"),
      }),
    },
  });

  if (submittedEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-dunlo/15">
          <MailCheck className="size-6 text-dunlo-deep" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          We've sent a verification link to{" "}
          <span className="font-semibold text-gray-900">{submittedEmail}</span>.
          Click it to finish creating your Dunlo account.
        </p>
        <p className="mt-6 text-xs text-gray-400">
          Didn't get it? Check spam, or{" "}
          <button
            onClick={() => setSubmittedEmail(null)}
            className="font-semibold text-dunlo-dim hover:underline"
          >
            try another email
          </button>
          .
        </p>
        <p className="mt-8 text-center text-sm text-gray-500">
          Already verified?{" "}
          <button
            onClick={onSwitchToSignIn}
            className="font-semibold text-gray-900 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
      <p className="mt-1 text-sm text-gray-500">
        Free during beta — no credit card needed.
      </p>

      <div className="mt-8 space-y-5">
        <GoogleAuthButton source="signup" />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-5 space-y-5"
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700"
              >
                Full name
              </Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="name"
                placeholder="Jane Smith"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700"
              >
                Work email
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(s) => ({
            canSubmit: s.canSubmit,
            isSubmitting: s.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-dunlo text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  Create free account <ChevronRight size={15} />
                </>
              )}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-[11px] text-gray-400">
        By signing up you agree to our{" "}
        <a
          href="https://dunlo.io/terms"
          className="underline underline-offset-2 hover:text-gray-600"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="https://dunlo.io/privacy"
          className="underline underline-offset-2 hover:text-gray-600"
        >
          Privacy Policy
        </a>
        .
      </p>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button
          onClick={onSwitchToSignIn}
          className="font-semibold text-gray-900 hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
