"use client";

import { UseFormRegister, UseFormWatch, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { FormData } from "./types";

interface PortConfigurationProps {
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  errors: FieldErrors<FormData>;
}

export function PortConfiguration({ register, watch, setValue, errors }: PortConfigurationProps) {
  const portConfig = watch("portConfig");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Port Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <div className="flex gap-6 md:flex-row flex-col">
            <CardDescription className="mb-6 md:w-1/4 w-full text-left">
              You can choose a specific port for your application, or we'll take care of it and
              assign one for you automatically.
            </CardDescription>
            <div className="flex-1 gap-2">
              <RadioGroup
                value={portConfig}
                onValueChange={(value) => setValue("portConfig", value as "random" | "custom")}
                className="flex flex-1 gap-2 px-1 items-center"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random" className="cursor-pointer text-base font-normal">
                    Assign a random port
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer text-base font-normal">
                    Set a custom port
                  </Label>
                </div>
              </RadioGroup>
              <div className="relative flex items-center gap-3 pt-3">
                <Input
                  id="portInput"
                  value={portConfig === "random" ? "localhost:3000" : watch("customPort") || ""}
                  disabled={portConfig === "random"}
                  placeholder="localhost:3000"
                  onChange={(e) => {
                    if (portConfig === "custom") {
                      setValue("customPort", e.target.value);
                    }
                  }}
                  className={`h-10 flex-1 ${portConfig === "custom" && errors.customPort ? "border-destructive" : ""} ${portConfig === "random" ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                {portConfig === "random" && (
                  <div className="absolute right-3 flex items-center gap-2 text-green-500">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Random Port Assigned</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {portConfig === "custom" && errors.customPort && (
            <p className="text-sm text-destructive mt-2">
              {errors.customPort.message}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

