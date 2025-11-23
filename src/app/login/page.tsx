"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorAlert } from "@/components/error-alert";
import { Logo } from "@/components/logo";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const sessionExpired = searchParams.get("session") === "expired";
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [dismissedSessionExpired, setDismissedSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = () => {
    setIsLoading(true);
    // Clear error from URL when retrying
    router.push("/api/auth/github");
  };

  const handleDismissError = () => {
    setDismissedError(error);
    // Remove error from URL
    router.replace("/login");
  };

  const handleDismissSessionExpired = () => {
    setDismissedSessionExpired(true);
    // Remove session param from URL
    router.replace("/login");
  };

  const displayError = error && error !== dismissedError ? error : null;
  const displaySessionExpired = sessionExpired && !dismissedSessionExpired;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue to Kuberns
            </p>
          </div>
        </div>
        
        {displaySessionExpired && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-400">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">Session Expired</p>
                <p className="mt-1 text-muted-foreground">
                  Your session has expired. Please sign in again to continue.
                </p>
              </div>
              <button
                onClick={handleDismissSessionExpired}
                className="ml-4 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {displayError && (
          <ErrorAlert error={displayError} onDismiss={handleDismissError} />
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleGitHubLogin}
            size="lg"
            className="w-full max-w-xs"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in with GitHub"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

