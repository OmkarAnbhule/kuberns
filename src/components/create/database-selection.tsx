"use client";

import { UseFormWatch, UseFormSetValue, UseFormRegister, FieldErrors } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormData } from "./types";
import { Separator } from "../ui/separator";

interface DatabaseSelectionProps {
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  errors: FieldErrors<FormData>;
}

export function DatabaseSelection({ register, watch, setValue, errors }: DatabaseSelectionProps) {
  const connectDatabase = watch("connectDatabase");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Database Selection</CardTitle>
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
      <CardContent>
        <CardDescription className="mb-4">
          Please be informed that the proper functioning of our application is dependent
          on a valid database connection during deployment. Failing to establish a
          correct database connection will result in an inability to access or manipulate
          essential data, rendering the application non-functional. It's crucial to
          ensure a reliable database connection to guarantee the app's operational success.
        </CardDescription>
        <div className="flex gap-4 mb-4">
          <Button
            type="button"
            variant={connectDatabase ? "default" : "outline"}
            onClick={() => {
              setValue("connectDatabase", true);
              if (!connectDatabase) {
                setValue("databaseConnectionUrl", "");
              }
            }}
            className={connectDatabase ? "bg-green-600 hover:bg-green-700 text-white" : ""}
          >
            Connect Database
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setValue("connectDatabase", false);
              setValue("databaseConnectionUrl", "");
            }}
          >
            Maybe Later
          </Button>
        </div>
        {connectDatabase && (
          <div className="mt-4">
            <Label htmlFor="databaseConnectionUrl" className="mb-2">
              Database Connection URL
            </Label>
            <Input
              id="databaseConnectionUrl"
              {...register("databaseConnectionUrl")}
              placeholder="postgresql://user:password@host:port/database"
              className={errors.databaseConnectionUrl ? "border-destructive" : ""}
            />
            {errors.databaseConnectionUrl && (
              <p className="text-sm text-destructive mt-1">
                {errors.databaseConnectionUrl.message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

