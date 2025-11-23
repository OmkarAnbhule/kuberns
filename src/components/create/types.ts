import * as z from "zod";

export const envVarSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  isSecret: z.boolean().default(false),
});

export const formSchema = z
  .object({
    // Step 1
    vcs: z.enum(["github", "gitlab", "other", "demo"]),
    organization: z.string().optional(),
    repository: z.string().optional(),
    branch: z.string().optional(),
    appName: z.string().min(1, "App name is required"),
    region: z.string().min(1, "Region is required"),
    template: z.string().min(1, "Template is required"),
    planType: z.string().min(1, "Plan type is required"),
    connectDatabase: z.boolean().default(false),
    databaseConnectionUrl: z.string().optional(),
    // Step 2
    portConfig: z.enum(["random", "custom"]),
    customPort: z.string().optional(),
    environmentVariables: z.array(envVarSchema).min(0),
  })
  .refine(
    (data) => {
      if (data.connectDatabase) {
        return (
          data.databaseConnectionUrl &&
          data.databaseConnectionUrl.trim() !== ""
        );
      }
      return true;
    },
    {
      message: "Database connection URL is required when connecting a database",
      path: ["databaseConnectionUrl"],
    }
  )
  .refine(
    (data) => {
      if (data.vcs !== "demo") {
        // Organization is optional, but repository and branch are required
        return (
          data.repository &&
          data.repository.trim() !== "" &&
          data.branch &&
          data.branch.trim() !== ""
        );
      }
      return true;
    },
    {
      message: "Repository and branch are required",
      path: ["repository"],
    }
  )
  .refine(
    (data) => {
      if (data.portConfig === "custom") {
        return (
          data.customPort &&
          data.customPort.trim() !== "" &&
          /^localhost:\d+$/.test(data.customPort)
        );
      }
      return true;
    },
    {
      message: "Custom port must be in format localhost:PORT (e.g., localhost:3000)",
      path: ["customPort"],
    }
  );

export type FormData = z.infer<typeof formSchema>;

