"use client";

import { UseFormRegister, UseFormWatch, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { FormData } from "./types";
import { Globe, GitBranch, Settings } from "lucide-react";
import { SearchableField } from "./searchable-field";
import { Separator } from "../ui/separator";

interface VCSSelectionProps {
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  errors: FieldErrors<FormData>;
  organizations?: { value: string; label: string }[];
  repositories?: { value: string; label: string }[];
  branches?: { value: string; label: string }[];
  isLoadingOrganizations?: boolean;
  isLoadingRepositories?: boolean;
  isLoadingBranches?: boolean;
}

export function VCSSelection({
  register,
  watch,
  setValue,
  errors,
  organizations = [],
  repositories = [],
  branches = [],
  isLoadingOrganizations = false,
  isLoadingRepositories = false,
  isLoadingBranches = false,
}: VCSSelectionProps) {
  const selectedVcs = watch("vcs");
  const organization = watch("organization");
  const repository = watch("repository");
  const branch = watch("branch");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="grid grid-cols-3 w-full">
          <CardTitle className="w-2/3 text-xl">Choose your Version Control System</CardTitle>
          {/* VCS Options */}
          <div className="flex gap-4 flex-wrap">
            {/* GitHub Option */}
            <label
              className={`
                relative flex-1 flex items-center justify-between gap-1 h-fit py-2 px-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedVcs === "github"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <input
                type="radio"
                {...register("vcs")}
                value="github"
                className="sr-only"
              />
              <div className="flex flex-col">
                <div className={`text-lg font-semibold ${selectedVcs === "github" ? "text-primary" : "text-muted-foreground"}`}>Github</div>
                <span className="text-xs text-green-500 font-medium">CONNECTED</span>
              </div>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
            </label>

            {/* GitLab Option */}
            <label
              className={`
                relative flex-1 flex items-center gap-3 h-fit py-2 px-4 border-2 rounded-lg cursor-pointer transition-all justify-between
                ${selectedVcs === "gitlab"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <input
                type="radio"
                {...register("vcs")}
                value="gitlab"
                className="sr-only"
              />
              <div className="flex flex-col">
                <div className={`text-lg font-semibold ${selectedVcs === "gitlab" ? "text-primary" : "text-muted-foreground"}`}>Gitlab</div>
                <span className="text-xs text-muted-foreground font-medium">NOT CONNECTED</span>
              </div>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <polygon points="16 28.896 16 28.896 21.156 13.029 10.844 13.029 16 28.896" fill="#e24329" />
                  <polygon points="16 28.896 10.844 13.029 3.619 13.029 16 28.896" fill="#fc6d26" />
                  <path d="M3.619,13.029h0L2.052,17.851a1.067,1.067,0,0,0,.388,1.193L16,28.9,3.619,13.029Z" fill="#fca326" />
                  <path d="M3.619,13.029h7.225L7.739,3.473a.534.534,0,0,0-1.015,0L3.619,13.029Z" fill="#e24329" />
                  <polygon points="16 28.896 21.156 13.029 28.381 13.029 16 28.896" fill="#fc6d26" />
                  <path d="M28.381,13.029h0l1.567,4.822a1.067,1.067,0,0,1-.388,1.193L16,28.9,28.381,13.029Z" fill="#fca326" />
                  <path d="M28.381,13.029H21.156l3.105-9.557a.534.534,0,0,1,1.015,0l3.105,9.557Z" fill="#e24329" />
                </svg>
              </div>
            </label>
          </div>
          {/* Help Section - positioned to the right */}
          <div className="flex flex-col gap-2 items-end">
            <div className="text-sm text-muted-foreground text-right max-w-md">
              <span className="font-medium">Need Help?</span>
              <br />
              <span className="text-xs flex w-2/3 w-full items-end pl-24">
                Refer to our brilliant support resources for a smoother experience.
              </span>
            </div>
          </div>
        </CardHeader>
        <div className="px-4 -mt-5">
          <Separator variant="dotted" className="" />
        </div>
        <CardContent className="space-y-2">
          {/* Repository Details */}
          {selectedVcs && selectedVcs !== "demo" && (
            <div className="mt-2">
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                  {/* Organization */}
                  {isLoadingOrganizations ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <SearchableField
                      id="organization"
                      label="Select Organization"
                      placeholder="Organization Name"
                      icon={<Globe className="w-4 h-4" />}
                      options={organizations}
                      value={organization}
                      onValueChange={(value) => setValue("organization", value)}
                      error={errors.organization?.message}
                      required={false}
                    />
                  )}

                  {/* Repository */}
                  {isLoadingRepositories ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <SearchableField
                      id="repository"
                      label="Select Repository"
                      placeholder="Repository Name"
                      icon={
                        selectedVcs === "github" ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                          </svg>
                        )
                      }
                      options={repositories}
                      value={repository}
                      onValueChange={(value) => setValue("repository", value)}
                      error={errors.repository?.message}
                      required
                    />
                  )}

                  {/* Branch */}
                  {isLoadingBranches ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <SearchableField
                      id="branch"
                      label="Select Branch"
                      placeholder="Branch Name"
                      icon={<GitBranch className="w-4 h-4" />}
                      options={branches}
                      value={branch}
                      onValueChange={(value) => setValue("branch", value)}
                      error={errors.branch?.message}
                      required
                      disabled={!repository}
                    />
                  )}
                </div>
                <div className="flex">
                  {selectedVcs === "github" && (
                    <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Github
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedVcs === "demo" && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Demo mode selected. You can skip repository configuration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

