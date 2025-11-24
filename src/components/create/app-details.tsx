"use client";

import { UseFormRegister, UseFormWatch, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/searchable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2 } from "lucide-react";
import { FormData } from "./types";
import { Separator } from "@/components/ui/separator";
import { Plan } from "@/lib/api/projects";

interface AppDetailsProps {
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  errors: FieldErrors<FormData>;
  regions: { value: string; label: string }[];
  templates: { value: string; label: string; slug?: string; icon?: React.ReactNode }[];
  planTypes: Plan[];
  isLoadingTemplates?: boolean;
  isLoadingPlans?: boolean;
}

export function AppDetails({
  register,
  watch,
  setValue,
  errors,
  regions,
  templates,
  planTypes,
  isLoadingTemplates = false,
  isLoadingPlans = false,
}: AppDetailsProps) {
  const selectedPlan = watch("planType");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between px-1">
          <CardTitle className="text-xl">Fill in the details of your App</CardTitle>
          <div className="flex flex-col gap-2 items-end">
            <div className="text-sm text-muted-foreground text-right max-w-md">
              <span className="font-medium">Need Help?</span>
              <br />
              <span className="text-xs flex w-2/3 w-full items-end pl-24">
                Refer to our brilliant support resources for a smoother experience.
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="px-4 -mt-5">
        <Separator variant="dotted" className="" />
      </div>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Basic Details</h3>
          <CardDescription className="mb-4">
            Enter the basic details of your application such as the name, region of
            deployment and the framework or the template for your application.
          </CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2" htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                {...register("appName")}
                placeholder="Choose a name"
                className={errors.appName ? "border-destructive" : ""}
              />
              {errors.appName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.appName.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2" htmlFor="region">Region</Label>
              <SearchableSelect
                options={regions}
                value={watch("region")}
                onValueChange={(value) => setValue("region", value)}
                placeholder="Choose Region"
                className={errors.region ? "border-destructive" : ""}
              />
              {errors.region && (
                <p className="text-sm text-destructive mt-1">
                  {errors.region.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2" htmlFor="template">Template</Label>
              <SearchableSelect
                options={templates}
                value={watch("template")}
                onValueChange={(value) => setValue("template", value)}
                placeholder="Choose Template"
                className={errors.template ? "border-destructive" : ""}
              />
              {errors.template && (
                <p className="text-sm text-destructive mt-1">
                  {errors.template.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Plan Type</h3>
              <CardDescription>
                Select the plan type that best suits your application's needs. Each plan
                offers different features, resources, and limitations. Choose the plan that
                aligns with your requirements and budget.
              </CardDescription>
            </div>
            <Button type="button" variant="outline">
              Upgrade Plan
            </Button>
          </div>

          {isLoadingPlans ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan type</TableHead>
                    <TableHead className="text-center">Storage</TableHead>
                    <TableHead className="text-center">Bandwidth</TableHead>
                    <TableHead className="text-center">Memory (RAM)</TableHead>
                    <TableHead className="text-center">CPU</TableHead>
                    <TableHead className="text-center">Monthly Cost</TableHead>
                    <TableHead className="text-center">Price per hour</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan type</TableHead>
                    <TableHead className="text-center">Storage</TableHead>
                    <TableHead className="text-center">Bandwidth</TableHead>
                    <TableHead className="text-center">Memory (RAM)</TableHead>
                    <TableHead className="text-center">CPU</TableHead>
                    <TableHead className="text-center">Monthly Cost</TableHead>
                    <TableHead className="text-center">Price per hour</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planTypes.map((plan) => (
                    <TableRow
                      key={plan.id}
                      className={`
                      cursor-pointer
                      ${selectedPlan === plan.id ? "bg-primary/10" : ""}
                    `}
                      onClick={() => setValue("planType", plan.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            {...register("planType")}
                            value={plan.id}
                            checked={selectedPlan === plan.id}
                            onChange={() => setValue("planType", plan.id)}
                            className="sr-only"
                          />
                          <span className="font-semibold">{plan.name}</span>
                          {selectedPlan === plan.id && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">{plan.storage_gb} GB</TableCell>
                      <TableCell className="text-center">{plan.bandwidth_gb} GB</TableCell>
                      <TableCell className="text-center">
                        {Number(plan.ram_mb) < 1000
                          ? `${plan.ram_mb} MB`
                          : `${(Number(plan.ram_mb) / 1024).toFixed(0)} GB`}
                      </TableCell>
                      <TableCell className="text-center">{plan.cpu_cores}</TableCell>
                      <TableCell className="text-center">{plan.price_monthly} INR</TableCell>
                      <TableCell className="text-center">{plan.price_hourly} INR</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {errors.planType && (
            <p className="text-sm text-destructive mt-2">
              {errors.planType.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

