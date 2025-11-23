"use client";

import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  error: string;
  onDismiss?: () => void;
}

const errorMessages: Record<string, string> = {
  no_code: "Authentication code not received. Please try again.",
  auth_failed: "Authentication failed. Please try logging in again.",
  access_denied: "Access denied. You cancelled the authentication.",
  default: "An error occurred during authentication. Please try again.",
};

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  const message = errorMessages[error] || errorMessages.default;

  return (
    <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive mb-1">
            Authentication Error
          </h3>
          <p className="text-sm text-destructive/90">{message}</p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/20"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

