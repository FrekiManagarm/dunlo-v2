import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";

const searchSchema = z.object({
  token: z.string().min(1).optional(),
});

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Reset password — Dunlo" },
    ],
  }),
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = useSearch({ from: "/reset-password" });
  const navigate = useNavigate({ from: "/reset-password" });

  const form = useForm({
    defaultValues: { newPassword: "", confirmPassword: "" },
    onSubmit: async ({ value }) => {
      if (!token) return;
      await authClient.resetPassword(
        { newPassword: value.newPassword, token },
        {
          onSuccess: () => {
            toast.success("Password updated. Please sign in.");
            navigate({ to: "/login", search: { mode: "signin" } });
          },
          onError: (err) =>
            toast.error(err.error.message || err.error.statusText),
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          newPassword: z.string().min(8, "Minimum 8 characters"),
          confirmPassword: z.string().min(8, "Minimum 8 characters"),
        })
        .refine((v) => v.newPassword === v.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }),
    },
  });

  return (
    <div className="flex min-h-dvh flex-col bg-[#f7f8fa] font-sans">
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={22} />
        </Link>
        <Link
          to="/login"
          search={{ mode: "signin" }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={12} /> Back to sign in
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {!token ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Invalid reset link
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                This password reset link is missing or has expired. Request a
                new one from the sign-in page.
              </p>
              <Link
                to="/login"
                search={{ mode: "signin" }}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gray-900 px-6 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98]"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-dunlo/15">
                <CheckCircle2 className="size-6 text-dunlo-deep" />
              </div>
              <h1 className="mt-5 text-center text-2xl font-bold text-gray-900">
                Set a new password
              </h1>
              <p className="mt-1 text-center text-sm text-gray-500">
                Choose a strong password — at least 8 characters.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="mt-8 space-y-5"
              >
                <form.Field name="newPassword">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        New password
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
                        <p
                          key={error?.message}
                          className="text-xs text-red-500"
                        >
                          {error?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>

                <form.Field name="confirmPassword">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        Confirm password
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
                      />
                      {field.state.meta.errors.map((error) => (
                        <p
                          key={error?.message}
                          className="text-xs text-red-500"
                        >
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
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Updating…
                        </>
                      ) : (
                        "Update password"
                      )}
                    </button>
                  )}
                </form.Subscribe>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
