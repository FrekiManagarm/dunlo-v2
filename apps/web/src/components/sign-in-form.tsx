import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { GoogleAuthButton } from "@/components/google-auth-button";
import { authClient } from "@/lib/auth-client";

type View = "signin" | "forgot" | "forgot-sent";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [view, setView] = useState<View>("signin");

  const signInForm = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            posthog.capture("login_success");
            navigate({ to: "/dashboard" });
            toast.success("Welcome back!");
          },
          onError: (err) => {
            posthog.capture("login_failed", {
              error: err.error.message || err.error.statusText,
            });
            toast.error(err.error.message || err.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Minimum 8 characters"),
      }),
    },
  });

  const forgotForm = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
        {
          onSuccess: () => setView("forgot-sent"),
          onError: () => setView("forgot-sent"),
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  if (view === "forgot-sent") {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-dunlo/15">
          <MailCheck className="size-6 text-dunlo-deep" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          If an account exists for that email, we've sent you a reset link.
        </p>
        <button
          onClick={() => setView("signin")}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline"
        >
          <ArrowLeft size={14} /> Back to sign in
        </button>
      </div>
    );
  }

  if (view === "forgot") {
    return (
      <div>
        <button
          onClick={() => setView("signin")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={12} /> Back to sign in
        </button>

        <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we'll send you a reset link.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            forgotForm.handleSubmit();
          }}
          className="mt-8 space-y-5"
        >
          <forgotForm.Field name="email">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  Email
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
          </forgotForm.Field>

          <forgotForm.Subscribe
            selector={(s) => ({
              canSubmit: s.canSubmit,
              isSubmitting: s.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            )}
          </forgotForm.Subscribe>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
      <p className="mt-1 text-sm text-gray-500">Sign in to your Dunlo account.</p>

      <div className="mt-8 space-y-5">
        <GoogleAuthButton source="signin" />
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
          signInForm.handleSubmit();
        }}
        className="mt-5 space-y-5"
      >
        <signInForm.Field name="email">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700"
              >
                Email
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
        </signInForm.Field>

        <signInForm.Field name="password">
          {(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-xs font-medium text-dunlo-dim hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
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
        </signInForm.Field>

        <signInForm.Subscribe
          selector={(s) => ({
            canSubmit: s.canSubmit,
            isSubmitting: s.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          )}
        </signInForm.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        No account?{" "}
        <button
          onClick={onSwitchToSignUp}
          className="font-semibold text-dunlo-dim hover:underline"
        >
          Create one free
        </button>
      </p>
    </div>
  );
}
