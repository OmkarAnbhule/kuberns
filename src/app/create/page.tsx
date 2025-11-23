"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/page-transition";
import { LoadingSpinner } from "@/components/loading";
import { CreateHeader } from "@/components/create/create-header";
import { VCSSelection } from "@/components/create/vcs-selection";
import { AppDetails } from "@/components/create/app-details";
import { DatabaseSelection } from "@/components/create/database-selection";
import { PortConfiguration } from "@/components/create/port-configuration";
import { EnvironmentVariables } from "@/components/create/environment-variables";
import { AWSCredentialsModal } from "@/components/create/aws-credentials-modal";
import { formSchema, type FormData } from "@/components/create/types";
import { regions } from "@/lib/constants";
import { parseEnvText } from "@/lib/env-parser";
import { toast } from "sonner";
import { createInstance } from "@/lib/api/infrastructure";
import {
  getTemplates,
  getPlans,
  createProject,
  updateProject,
  type Template,
  type Plan
} from "@/lib/api/projects";
import {
  getGitHubOrganizations,
  getGitHubRepositories,
  getGitHubBranches
} from "@/lib/api/github";


export default function CreateAppPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Note: We don't access token from Redux since it's httpOnly and handled by proxy
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAWSCredentialsModal, setShowAWSCredentialsModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdProjectData, setCreatedProjectData] = useState<FormData | null>(null);

  // API data states
  const [templates, setTemplates] = useState<Array<{ value: string; label: string; slug: string; id?: number; icon?: React.ReactNode }>>([]);
  const [planTypes, setPlanTypes] = useState<Plan[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ value: string; label: string }>>([]);
  const [allRepositories, setAllRepositories] = useState<Array<{ value: string; label: string; owner: string; full_name: string; id?: number }>>([]);
  const [repositories, setRepositories] = useState<Array<{ value: string; label: string; owner: string; full_name: string; id?: number }>>([]);
  const [branches, setBranches] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Get project ID from URL if editing
  const projectId = searchParams?.get('id') || null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      vcs: "github",
      organization: "",
      repository: "",
      branch: "",
      appName: "",
      region: "",
      template: "",
      planType: "",
      connectDatabase: false,
      databaseConnectionUrl: "",
      portConfig: "random",
      customPort: "",
      environmentVariables: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "environmentVariables",
  });

  const selectedRepository = watch("repository");
  const selectedOrganization = watch("organization");
  const selectedVcs = watch("vcs");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      // Check if user_data cookie exists (user is authenticated)
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return null;
      };
      
      const userData = getCookie("user_data");
      if (!userData) {
        return;
      }

      setLoadingData(true);
      try {
        // Fetch templates, plans, organizations, and repositories in parallel
        // Token is handled automatically by proxy via httpOnly cookie
        // Each promise has individual error handling so one failure doesn't break the others
        const [templatesData, plansData, orgsData, reposData] = await Promise.allSettled([
          getTemplates(),
          getPlans(),
          getGitHubOrganizations(),
          getGitHubRepositories(),
        ]);

        // Extract data from settled promises, defaulting to empty array on rejection
        const templatesResult = templatesData.status === 'fulfilled' ? templatesData.value : [];
        const plansResult = plansData.status === 'fulfilled' ? plansData.value : [];
        const orgsResult = orgsData.status === 'fulfilled' ? orgsData.value : [];
        const reposResult = reposData.status === 'fulfilled' ? reposData.value : [];

        // Show toast notifications for errors
        if (templatesData.status === 'rejected') {
          toast.error("Failed to load templates. Please refresh the page.");
        }
        if (plansData.status === 'rejected') {
          toast.error("Failed to load plans. Please refresh the page.");
        }
        if (orgsData.status === 'rejected') {
          toast.error("Failed to load organizations. Please refresh the page.");
        }
        if (reposData.status === 'rejected') {
          toast.error("Failed to load repositories. Please refresh the page.");
        }

        // Transform templates with icons
        const transformedTemplates = (templatesResult || []).map((t: Template) => {
          // Create icon component - icons are in src/assets/templates, need to use dynamic import
          // Apply dark mode filter: brighten and saturate icons for better visibility
          // For black icons, this makes them visible; for colorful icons, it enhances them
          const icon = (
            <img
              src={`/assets/templates/${t.slug}.svg`}
              alt={t.name}
              className="w-5 h-5 object-contain dark:[filter:brightness(1.5)_contrast(1.1)_saturate(1.2)]"
              onError={(e) => {
                // Hide icon if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          );
          
          return {
            value: t.slug,
            label: t.name,
            slug: t.slug,
            id: t.id,
            icon,
          };
        });

        setTemplates(transformedTemplates);
        setPlanTypes(plansResult || []);
        setOrganizations(orgsResult || []);
        
        setAllRepositories(reposResult || []);
        setRepositories(reposResult || []); // Initially show all repositories

        // If editing, fetch project data
        if (projectId) {
          try {
            const { getProject } = await import("@/lib/api/projects");
            const project = await getProject(projectId);

            // Populate form with project data
            setValue("appName", project.name || "");
            setValue("region", project.aws_region || "");
            setValue("template", project.template?.slug || "");
            setValue("planType", String(project.plan?.id || ""));
            setValue("organization", project.organization || "");
            if (project.repository_name) {
              // Reconstruct full repository path if needed
              const fullRepo = project.organization 
                ? `${project.organization}/${project.repository_name}`
                : project.repository_name;
              setValue("repository", fullRepo);
            }
            if (project.branch_name) setValue("branch", project.branch_name);
            // Port configuration
            if (project.is_random_port) {
              setValue("portConfig", "random");
            } else {
              setValue("portConfig", "custom");
              if (project.selected_port) {
                setValue("customPort", `localhost:${project.selected_port}`);
              }
            }
            // Database configuration
            if (project.database_config?.connection_url) {
              setValue("connectDatabase", true);
              setValue("databaseConnectionUrl", project.database_config.connection_url);
            } else {
              setValue("connectDatabase", false);
            }
            // Environment variables
            if (project.env_vars && Array.isArray(project.env_vars)) {
              project.env_vars.forEach((env: any) => {
                append({ 
                  key: env.key || "", 
                  value: env.value || "", 
                  isSecret: env.is_secret || false 
                });
              });
            }
          } catch (error) {
            toast.error("Failed to load project data. Please try again.");
          }
        }
      } catch (error) {
        toast.error("Failed to load initial data. Please refresh the page.");
        setTemplates([]);
        setPlanTypes([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, [projectId, setValue, append]);

  // Organizations are now fetched with initial data
  // Only clear organizations if VCS is not github
  useEffect(() => {
    if (selectedVcs !== "github") {
      setOrganizations([]);
    }
  }, [selectedVcs]);

  // Repositories are now fetched with initial data
  // Filter repositories by organization when organization changes
  useEffect(() => {
    if (selectedVcs !== "github") {
      setRepositories([]);
      setBranches([]);
      setValue("repository", "");
      setValue("branch", "");
      return;
    }

    // Get current repository value before filtering (to preserve it if still valid)
    const currentRepoValue = selectedRepository;

    // Filter repositories by organization if one is selected
    // Use allRepositories (unfiltered) as the source
    const filteredRepos = selectedOrganization
      ? allRepositories.filter((repo) => repo.owner === selectedOrganization || repo.full_name.startsWith(selectedOrganization + "/"))
      : allRepositories;
    
    // Only clear repository if it doesn't belong to the selected organization
    if (currentRepoValue && selectedOrganization && filteredRepos.length > 0) {
      const repoStillValid = filteredRepos.some((repo) => repo.value === currentRepoValue);
      if (!repoStillValid) {
        setValue("repository", "");
        setValue("branch", "");
      }
    }
    
    // Update the repositories list with filtered results
    setRepositories(filteredRepos);
  }, [selectedVcs, selectedOrganization, selectedRepository, allRepositories, setValue]);

  // Fetch branches when repository is selected
  useEffect(() => {
    const fetchBranches = async () => {
      if (selectedVcs !== "github") {
        setBranches([]);
        setValue("branch", "");
        return;
      }

      if (!selectedRepository) {
        setBranches([]);
        setValue("branch", "");
        return;
      }

      // Get current branch value before fetching (to preserve it if still valid)
      const currentBranchValue = getValues("branch");

      try {
        // Extract owner and repo name from full_name (format: "owner/repo")
        const [owner, repoName] = selectedRepository.split("/");
        if (!owner || !repoName) {
          toast.error("Invalid repository format");
          setBranches([]);
          setValue("branch", "");
          return;
        }

        const branchData = await getGitHubBranches(owner, repoName);
        
        // Only clear branch if it doesn't exist in the new repository's branches
        // Check this BEFORE setting the branches list
        if (currentBranchValue) {
          const branchStillValid = branchData.some((branch) => branch.value === currentBranchValue);
          if (!branchStillValid) {
            setValue("branch", "");
          }
        }
        
        // Set the branches list
        setBranches(branchData);
      } catch (error) {
        toast.error("Failed to load branches. Please try again.");
        setBranches([]);
        // Only clear branch on error if we don't have a valid selection
        if (!currentBranchValue) {
          setValue("branch", "");
        }
      }
    };

    fetchBranches();
  }, [selectedRepository, selectedVcs, setValue, getValues]);

  // Environment variables editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function handlePasteEnv(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text');
    if (!text) return;

    const parsed = parseEnvText(text);
    if (parsed.length === 0) return;

    // prevent the default paste into an input (we're handling it)
    e.preventDefault();

    // optional: dedupe based on existing keys
    const existing = getValues('environmentVariables') || [];
    const existingKeys = new Set(existing.map((v: any) => String(v.key || '').trim()));

    // decide behavior: skip duplicates, or overwrite — here we skip duplicates
    const toAppend = parsed.filter(p => {
      const k = String(p.key || '').trim();
      return k && !existingKeys.has(k);
    });

    // append each (you can batch or append one by one)
    toAppend.forEach(p => {
      append({ key: p.key, value: p.value, isSecret: false });
    });

    // if duplicates were found, show a small toast / console message
    if (toAppend.length < parsed.length) {
      // replace with your toast system if you have one
      console.info('Some keys were skipped because they already exist.');
    }
  }

  const portConfig = watch("portConfig");
  const selectedPlan = watch("planType");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Filter out empty env vars
      const filteredEnvVars = data.environmentVariables
        .filter((env) => env.key && env.value)
        .map((env) => ({
          key: env.key,
          value: env.value,
          is_secret: env.isSecret || false,
        }));

      // Find selected template and plan to get their IDs
      const selectedTemplate = templates.find((t) => t.value === data.template);
      const selectedPlan = planTypes.find((p) => String(p.id) === String(data.planType));
      const selectedRepo = allRepositories.find((r) => r.value === data.repository);

      // Validate required selections
      if (!selectedTemplate || !selectedTemplate.id) {
        toast.error("Please select a valid template");
        setIsSubmitting(false);
        return;
      }

      if (!selectedPlan || !selectedPlan.id) {
        toast.error("Please select a valid plan");
        setIsSubmitting(false);
        return;
      }

      // Extract port number from customPort if custom, otherwise 0 for random
      let selectedPort = 0;
      let isRandomPort = true;
      if (data.portConfig === "custom" && data.customPort) {
        const portMatch = data.customPort.match(/localhost:(\d+)/);
        if (portMatch) {
          selectedPort = parseInt(portMatch[1], 10);
          isRandomPort = false;
        }
      }

      // Build the API payload according to the new structure
      const payload: any = {
        name: data.appName,
        organization: data.organization && data.organization.trim() !== "" ? data.organization : "",
        repository_name: data.repository ? data.repository.split("/").pop() || "" : "",
        branch_name: data.branch || "",
        aws_region: data.region,
        template_id: Number(selectedTemplate.id),
        plan_id: Number(selectedPlan.id),
        selected_port: selectedPort,
        is_random_port: isRandomPort,
        env_vars: filteredEnvVars,
      };

      // Only include github_repo_id if repository is selected (not demo mode)
      if (data.vcs !== "demo" && selectedRepo?.id) {
        payload.github_repo_id = Number(selectedRepo.id);
      } else if (data.vcs !== "demo" && !selectedRepo?.id) {
        toast.error("Please select a valid repository");
        setIsSubmitting(false);
        return;
      }

      // Add database_config only if connectDatabase is true
      if (data.connectDatabase && data.databaseConnectionUrl) {
        payload.database_config = {
          connection_url: data.databaseConnectionUrl,
        };
      }

      if (projectId) {
        // Update existing project
        await updateProject(projectId, payload);
        toast.success("Project updated successfully!");
      router.push("/");
      } else {
        // Create new project
        const createdProject = await createProject(payload);
        toast.success("Project created successfully!");
        // Store project ID and form data for instance creation
        setCreatedProjectId(createdProject.id);
        setCreatedProjectData(data);
        // Show AWS credentials modal after successful creation
        setShowAWSCredentialsModal(true);
      }
    } catch (error: any) {
      // Extract more detailed error message
      let errorMessage = `Failed to ${projectId ? 'update' : 'create'} project`;
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAWSKeysSubmit = async (accessKey: string, secretKey: string) => {
    if (!createdProjectId || !createdProjectData) {
      toast.error("Project data not found");
      return;
    }

    try {
      // Extract port from form data
      let port = 80; // default
      if (createdProjectData.portConfig === "custom" && createdProjectData.customPort) {
        const portMatch = createdProjectData.customPort.match(/localhost:(\d+)/);
        if (portMatch) {
          port = parseInt(portMatch[1], 10);
        }
      }

      // Create instance with AWS credentials
      const instanceResponse = await createInstance({
        project_id: createdProjectId,
        credential_mode: "user",
        aws_access_key: accessKey,
        aws_secret_key: secretKey,
        region: createdProjectData.region,
        port: port,
      });

      // Store instance_id in localStorage for the project detail page
      if (instanceResponse.id) {
        localStorage.setItem(`instance_id_${createdProjectId}`, String(instanceResponse.id));
      }

      toast.success("Instance creation started!");
      setShowAWSCredentialsModal(false);
      // Navigate to project detail page
      setTimeout(() => {
        router.push(`/projects/${createdProjectId}`);
      }, 300);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create instance");
    }
  };

  const handleDummyAccount = async () => {
    if (!createdProjectId || !createdProjectData) {
      toast.error("Project data not found");
      return;
    }

    try {
      // Extract port from form data
      let port = 80; // default
      if (createdProjectData.portConfig === "custom" && createdProjectData.customPort) {
        const portMatch = createdProjectData.customPort.match(/localhost:(\d+)/);
        if (portMatch) {
          port = parseInt(portMatch[1], 10);
        }
      }

      // Create instance with demo mode
      const instanceResponse = await createInstance({
        project_id: createdProjectId,
        credential_mode: "demo",
        aws_access_key: "",
        aws_secret_key: "",
        region: createdProjectData.region,
        port: port,
      });

      // Store instance_id in localStorage for the project detail page
      if (instanceResponse.id) {
        localStorage.setItem(`instance_id_${createdProjectId}`, String(instanceResponse.id));
      }

      toast.success("Demo instance creation started! It will run for 5 minutes.");
      setShowAWSCredentialsModal(false);
      // Navigate to project detail page
      setTimeout(() => {
        router.push(`/projects/${createdProjectId}`);
      }, 300);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create demo instance");
    }
  };

  const onNext = async () => {
    // Validate step 1 before proceeding
    if (step === 1) {
      const vcs = watch("vcs");
      const appName = watch("appName");
      const region = watch("region");
      const template = watch("template");
      const planType = watch("planType");

      // Check required fields
      if (!vcs || !appName || !region || !template || !planType) {
        // Trigger validation to show errors
          handleSubmit(() => { }, () => {})();
        return;
      }

      // Only check VCS fields if not demo
      if (vcs !== "demo") {
        const repository = watch("repository");
        const branch = watch("branch");

          // Organization is optional, but repository and branch are required
          if (!repository || !branch) {
          // Trigger validation to show errors
            handleSubmit(() => { }, () => {})();
          return;
        }
      }
    }

    setStep(2);
  };

  const onBack = () => {
    setStep(1);
  };

  const addEnvVar = () => {
    const newIndex = fields.length;
    append({ key: "", value: "", isSecret: false });
    setEditingIndex(newIndex);
  };

  const removeEnvVar = (index: number) => {
    remove(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const saveEnvVar = (index: number) => {
    const currentKey = watch(`environmentVariables.${index}.key`);
    const currentValue = watch(`environmentVariables.${index}.value`);
    if (currentKey && currentValue) {
      setEditingIndex(null);
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <CreateHeader currentStep={step} isEditing={!!projectId} />

          <form onSubmit={handleSubmit(onSubmit, (errors) => {
            // Show validation errors as toast
            // Helper function to extract error message
            const getErrorMessage = (error: any): string | null => {
              if (!error) return null;
              
              // Direct message
              if (typeof error === 'string') return error;
              if (error.message) return error.message;
              
              // Nested errors
              if (error.root?.message) return error.root.message;
              
              // Array of errors
              if (Array.isArray(error) && error.length > 0) {
                const firstError = error[0];
                if (firstError?.message) return firstError.message;
              }
              
              return null;
            };

            // Find the first error with a message
            for (const [field, error] of Object.entries(errors)) {
              const message = getErrorMessage(error);
              if (message) {
                toast.error(message);
                return;
              }
            }
            
            // Fallback message
            toast.error("Please fill in all required fields correctly");
          })}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <VCSSelection
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    organizations={organizations}
                    repositories={repositories}
                    branches={branches}
                    isLoadingOrganizations={loadingData && organizations.length === 0}
                    isLoadingRepositories={loadingData && repositories.length === 0}
                    isLoadingBranches={false}
                  />

                  <AppDetails
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    regions={regions}
                    templates={templates}
                    planTypes={planTypes}
                    isLoadingTemplates={loadingData && templates.length === 0}
                    isLoadingPlans={loadingData && planTypes.length === 0}
                  />

                  <DatabaseSelection
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                  />

                  <div className="flex justify-end">
                    <Button type="button" onClick={onNext} size="lg" className="bg-primary hover:bg-primary/90">
                      Set Up Env Variables
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  className="space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <PortConfiguration
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                  />

                  <EnvironmentVariables
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    fields={fields}
                    append={append}
                    remove={remove}
                    editingIndex={editingIndex}
                    setEditingIndex={setEditingIndex}
                    saveEnvVar={saveEnvVar}
                    startEdit={startEdit}
                    removeEnvVar={removeEnvVar}
                    handlePasteEnv={handlePasteEnv}
                  />

                  <motion.div
                    className="flex justify-between items-center pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                      <Button
                        type="button"
                        variant="outline"
                      size="lg" 
                      onClick={onBack}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Step 1
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting} 
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner />
                          <span className="ml-2">Submitting...</span>
                        </>
                      ) : (
                        <>
                          Finish my Setup
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </main>
      </div>
      <AWSCredentialsModal
        open={showAWSCredentialsModal}
        onClose={() => {
          // Only close modal, redirect is handled by submit handlers
          setShowAWSCredentialsModal(false);
        }}
        onAWSKeysSubmit={handleAWSKeysSubmit}
        onDummyAccount={handleDummyAccount}
      />
    </PageTransition>
  );
}

