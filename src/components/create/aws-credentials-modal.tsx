"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AWSCredentialsModalProps {
  open: boolean;
  onClose: () => void;
  onAWSKeysSubmit: (accessKey: string, secretKey: string) => Promise<void>;
  onDummyAccount: () => Promise<void>;
}

export function AWSCredentialsModal({
  open,
  onClose,
  onAWSKeysSubmit,
  onDummyAccount,
}: AWSCredentialsModalProps) {
  const [option, setOption] = useState<"aws" | "dummy">("aws");
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (option === "aws") {
        if (!accessKey.trim() || !secretKey.trim()) {
          toast.error("Please enter both AWS Access Key and Secret Key");
          return;
        }
        await onAWSKeysSubmit(accessKey.trim(), secretKey.trim());
      } else {
        await onDummyAccount();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOption("aws");
      setAccessKey("");
      setSecretKey("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure AWS Credentials</DialogTitle>
          <DialogDescription>
            Choose how you want to deploy your application. You can use your own AWS credentials
            or use a dummy account for testing (runs for 5 minutes).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={option} onValueChange={(value) => setOption(value as "aws" | "dummy")}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="aws" id="aws" />
              <Label htmlFor="aws" className="cursor-pointer font-normal">
                Use my AWS credentials
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="dummy" id="dummy" />
              <Label htmlFor="dummy" className="cursor-pointer font-normal">
                Use dummy account (5 minutes test)
              </Label>
            </div>
          </RadioGroup>

          {option === "aws" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="accessKey">AWS Access Key ID</Label>
                <Input
                  id="accessKey"
                  type="text"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretKey">AWS Secret Access Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter your secret key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {option === "dummy" && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                A dummy AWS account will be used to deploy your instance. This instance will
                automatically stop after 5 minutes. This is useful for testing purposes.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

