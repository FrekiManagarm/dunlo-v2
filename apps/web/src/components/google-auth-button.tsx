import { Loader2 } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

type GoogleAuthSource = "signin" | "signup";

export function GoogleAuthButton({ source }: { source: GoogleAuthSource }) {
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(false);

  const label =
    source === "signup" ? "Sign up with Google" : "Sign in with Google";

  async function handleGoogleAuth() {
    setIsLoading(true);
    posthog.capture("google_auth_started", { source });

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        newUserCallbackURL: "/onboarding",
        errorCallbackURL: source === "signup" ? "/signup" : "/login",
      });
    } catch (error) {
      posthog.capture("google_auth_failed", {
        source,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      toast.error("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <span aria-hidden className="text-base font-bold leading-none">
          G
        </span>
      )}
      {isLoading ? "Redirecting..." : label}
    </button>
  );
}
