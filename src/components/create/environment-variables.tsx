"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue, UseFieldArrayReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { FormData } from "./types";

interface EnvironmentVariablesProps {
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  fields: UseFieldArrayReturn<FormData, "environmentVariables">["fields"];
  append: UseFieldArrayReturn<FormData, "environmentVariables">["append"];
  remove: UseFieldArrayReturn<FormData, "environmentVariables">["remove"];
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
  saveEnvVar: (index: number) => void;
  startEdit: (index: number) => void;
  removeEnvVar: (index: number) => void;
  handlePasteEnv: (e: React.ClipboardEvent) => void;
}

export function EnvironmentVariables({
  register,
  watch,
  setValue,
  fields,
  append,
  remove,
  editingIndex,
  setEditingIndex,
  saveEnvVar,
  startEdit,
  removeEnvVar,
  handlePasteEnv,
}: EnvironmentVariablesProps) {
  const addEnvVar = () => {
    const newIndex = fields.length;
    append({ key: "", value: "", isSecret: false });
    setEditingIndex(newIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configure Environment Variables</CardTitle>
            <a href="#" className="text-sm text-primary hover:underline">
              Need Help?
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-6">
            Manage and customize environment variables for your application. Environment
            variables are key-value pairs that allow you to configure settings, API
            endpoints, and sensitive information specific to each environment. Add, edit,
            or delete variables to tailor your application's behavior and integration with
            external services.
          </CardDescription>

          <div className="border rounded-lg overflow-hidden mb-4" onPaste={handlePasteEnv} tabIndex={-1}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Key</TableHead>
                  <TableHead className="w-[40%]">Value</TableHead>
                  <TableHead className="w-[20%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const isEditing = editingIndex === index;
                  const currentKey = watch(`environmentVariables.${index}.key`) || field.key || "";
                  const currentValue = watch(`environmentVariables.${index}.value`) || field.value || "";
                  const isSecret = watch(`environmentVariables.${index}.isSecret`) || false;
                  const isNewRow = !currentKey && !currentValue;
                  
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        {isEditing || isNewRow ? (
                          <Input
                            {...register(`environmentVariables.${index}.key` as const)}
                            placeholder="Enter Key"
                            className="border-0 bg-transparent p-2 h-auto bg-white"
                            autoFocus={isNewRow}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && currentKey && currentValue) {
                                saveEnvVar(index);
                              }
                            }}
                          />
                        ) : (
                          <span>{currentKey}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing || isNewRow ? (
                          <Input
                            {...register(`environmentVariables.${index}.value` as const)}
                            placeholder="Enter Value"
                            type={isSecret ? "password" : "text"}
                            className="border-0 bg-transparent p-2 h-auto"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && currentKey && currentValue) {
                                saveEnvVar(index);
                              }
                            }}
                          />
                        ) : (
                          <span>{isSecret ? "••••••••" : currentValue}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {isEditing || isNewRow ? (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setValue(`environmentVariables.${index}.isSecret`, !isSecret, { shouldValidate: true });
                                }}
                                aria-label="Toggle secret"
                                title={isSecret ? "Hide secret" : "Show as secret"}
                              >
                                {isSecret ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                onClick={() => saveEnvVar(index)}
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeEnvVar(index)}
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setValue(`environmentVariables.${index}.isSecret`, !isSecret, { shouldValidate: true });
                                }}
                                aria-label="Toggle secret"
                                title={isSecret ? "Hide secret" : "Show as secret"}
                              >
                                {isSecret ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => startEdit(index)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeEnvVar(index)}
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addEnvVar}
              className="border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

