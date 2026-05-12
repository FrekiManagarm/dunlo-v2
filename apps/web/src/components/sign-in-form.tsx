import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({ from: "/login" });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            navigate({ to: "/dashboard" });
            toast.success("Welcome back!");
          },
          onError: (err) => toast.error(err.error.message || err.error.statusText),
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

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-dunlo" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
      <p className="mt-1 text-sm text-gray-500">Sign in to your Dunlo account.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
        className="mt-8 space-y-5"
      >
        <form.Field name="email">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
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
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <a href="#" className="text-xs font-medium text-dunlo-dim hover:underline">
                  Forgot password?
                </a>
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
        </form.Field>

        <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="size-4 animate-spin" /> Signing in…</>
              ) : (
                "Sign in"
              )}
            </button>
          )}
        </form.Subscribe>
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
