"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading";
import { PageTransition } from "@/components/page-transition";
import { getProject, type Project } from "@/lib/api/projects";
import { getInstanceLogs, getInstanceIdByProjectId, getInstancesByProjectId, createInstance, type InstanceLog, type Instance } from "@/lib/api/infrastructure";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Copy, CheckCircle2, Clock, XCircle, Play } from "lucide-react";
import { AWSCredentialsModal } from "@/components/create/aws-credentials-modal";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<InstanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [instanceUrl, setInstanceUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [instanceId, setInstanceId] = useState<number | null>(null);
  const [allInstances, setAllInstances] = useState<Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);
  const [showAWSCredentialsModal, setShowAWSCredentialsModal] = useState(false);
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const projectData = await getProject(projectId);
        setProject(projectData);
        
        // Fetch all instances for this project
        const instances = await getInstancesByProjectId(projectId);
        setAllInstances(instances);
        
        // Get the latest instance ID
        let fetchedInstanceId: number | null = null;
        
        // 1. Check localStorage (stored after instance creation)
        const storedInstanceId = localStorage.getItem(`instance_id_${projectId}`);
        if (storedInstanceId) {
          fetchedInstanceId = parseInt(storedInstanceId, 10);
        }
        
        // 2. Get latest from instances array
        if (!fetchedInstanceId && instances.length > 0) {
          // Sort by created_at or id to get the latest
          const sortedInstances = [...instances].sort((a, b) => {
            const aDate = a.created_at ? new Date(a.created_at).getTime() : a.id;
            const bDate = b.created_at ? new Date(b.created_at).getTime() : b.id;
            return bDate - aDate; // Descending order (latest first)
          });
          const latestInstance = sortedInstances[0];
          fetchedInstanceId = latestInstance.id || null;
        }
        
        // 3. Check project data
        if (!fetchedInstanceId && (projectData as any).instance_id) {
          fetchedInstanceId = (projectData as any).instance_id;
        }
        
        // 4. Try to fetch from API as fallback
        if (!fetchedInstanceId) {
          const apiInstanceId = await getInstanceIdByProjectId(projectId);
          if (apiInstanceId) {
            fetchedInstanceId = apiInstanceId;
          }
        }
        
        if (fetchedInstanceId) {
          setInstanceId(fetchedInstanceId);
          setSelectedInstanceId(fetchedInstanceId);
        } else if (instances.length > 0) {
          // If no latest found but instances exist, use the first one
          const firstInstance = instances[0];
          const firstInstanceId = firstInstance.id || null;
          if (firstInstanceId) {
            setInstanceId(firstInstanceId);
            setSelectedInstanceId(firstInstanceId);
          }
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to load project");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, router]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchLogs = async (): Promise<string | null> => {
      const targetInstanceId = selectedInstanceId || instanceId;
      if (!targetInstanceId) return null;

      // Only show loading if we don't have any logs yet
      const hasExistingLogs = logs.length > 0;
      if (!hasExistingLogs) {
        setLoadingLogs(true);
      }

      try {
        const logsData = await getInstanceLogs(targetInstanceId, 50);
        setLogs(logsData);

        // Extract URL from completed or running logs
        const finishedLog = logsData.find((log) => log.status === "completed" || log.status === "running");
        if (finishedLog && finishedLog.output) {
          // Extract URL from output (format: http://IP:PORT)
          const urlMatch = finishedLog.output.match(/http:\/\/[\d.]+:\d+/);
          if (urlMatch) {
            setInstanceUrl(urlMatch[0]);
          }
        }

        // Return the latest log status for polling decision
        return logsData[0]?.status || null;
      } catch (error: any) {
        // Logs might not be available yet, that's okay
        // Don't show error toast for 404 or similar
        return null;
      } finally {
        setLoadingLogs(false);
      }
    };

    const targetInstanceId = selectedInstanceId || instanceId;
    if (targetInstanceId) {
      // Initial fetch
      fetchLogs().then((latestStatus) => {
        // Only start polling if status is not completed or running
        const isFinished = latestStatus === "completed" || latestStatus === "running";
        if (latestStatus && !isFinished) {
          intervalId = setInterval(async () => {
            const status = await fetchLogs();
            // Stop polling if status becomes completed or running
            if ((status === "completed" || status === "running") && intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }, 5000);
        }
      });
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedInstanceId, instanceId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAWSKeysSubmit = async (accessKey: string, secretKey: string) => {
    if (!project) {
      toast.error("Project data not found");
      return;
    }

    if (!project.aws_region) {
      toast.error("Project region is not set");
      return;
    }

    try {
      setIsCreatingInstance(true);
      // Get port from project
      const port = project.is_random_port ? 80 : (project.selected_port || 80);

      // Create instance with AWS credentials
      const instanceResponse = await createInstance({
        project_id: project.id,
        credential_mode: "user",
        aws_access_key: accessKey,
        aws_secret_key: secretKey,
        region: project.aws_region,
        port: port,
      });

      // Store instance_id in localStorage
      if (instanceResponse.id) {
        localStorage.setItem(`instance_id_${project.id}`, String(instanceResponse.id));
      }

      toast.success("Instance creation started!");
      setShowAWSCredentialsModal(false);
      
      // Refresh instances list and select the new instance
      const instances = await getInstancesByProjectId(project.id);
      setAllInstances(instances);
      
      if (instanceResponse.id) {
        setInstanceId(instanceResponse.id);
        setSelectedInstanceId(instanceResponse.id);
        // Clear logs and URL for new instance
        setLogs([]);
        setInstanceUrl(null);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create instance");
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const handleDummyAccount = async () => {
    if (!project) {
      toast.error("Project data not found");
      return;
    }

    if (!project.aws_region) {
      toast.error("Project region is not set");
      return;
    }

    try {
      setIsCreatingInstance(true);
      // Get port from project
      const port = project.is_random_port ? 80 : (project.selected_port || 80);

      // Create instance with demo mode
      const instanceResponse = await createInstance({
        project_id: project.id,
        credential_mode: "demo",
        aws_access_key: "",
        aws_secret_key: "",
        region: project.aws_region,
        port: port,
      });

      // Store instance_id in localStorage
      if (instanceResponse.id) {
        localStorage.setItem(`instance_id_${project.id}`, String(instanceResponse.id));
      }

      toast.success("Demo instance creation started! It will run for 5 minutes.");
      setShowAWSCredentialsModal(false);
      
      // Refresh instances list and select the new instance
      const instances = await getInstancesByProjectId(project.id);
      setAllInstances(instances);
      
      if (instanceResponse.id) {
        setInstanceId(instanceResponse.id);
        setSelectedInstanceId(instanceResponse.id);
        // Clear logs and URL for new instance
        setLogs([]);
        setInstanceUrl(null);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create demo instance");
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "running":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
      case "pending":
      case "deploying":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "failed":
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-2">Loading project...</span>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Project not found</p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Back to Projects
              </Button>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  const latestLog = logs[0];
  const isCompleted = latestLog?.status === "completed" || latestLog?.status === "running";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                  {project.status && (
                    <Badge variant="outline" className="capitalize">
                      {project.status}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowAWSCredentialsModal(true)}
                disabled={isCreatingInstance}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="mr-2 h-4 w-4" />
                {isCreatingInstance ? "Creating..." : "Re-run Instance"}
              </Button>
            </div>
          </div>

          {/* All Instances List */}
          {allInstances.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>All Instances</CardTitle>
                <CardDescription>
                  Select an instance to view its logs and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {allInstances
                    .sort((a, b) => {
                      const aDate = a.created_at ? new Date(a.created_at).getTime() : a.id;
                      const bDate = b.created_at ? new Date(b.created_at).getTime() : b.id;
                      return bDate - aDate; // Latest first
                    })
                    .map((instance) => {
                      const instId = instance.id;
                      const isLatest = instId === instanceId;
                      const isSelected = instId === selectedInstanceId;
                      
                      return (
                        <motion.div
                          key={instId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`
                            border rounded-lg p-4 cursor-pointer transition-all
                            ${isSelected 
                              ? "border-primary bg-primary/10 shadow-md" 
                              : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                            }
                            ${isLatest ? "ring-2 ring-primary/30" : ""}
                          `}
                          onClick={() => {
                            setSelectedInstanceId(instId);
                            setInstanceUrl(null); // Clear URL when switching instances
                            setLogs([]); // Clear logs when switching instances
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {isLatest && (
                                <Badge variant="default" className="text-xs">
                                  Latest
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge variant="outline" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            {getStatusIcon(instance.status || "unknown")}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">
                              Instance #{instId}
                            </p>
                            {instance.created_at && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(instance.created_at).toLocaleString()}
                              </p>
                            )}
                            {instance.status && (
                              <Badge 
                                variant="outline" 
                                className="text-xs capitalize mt-1"
                              >
                                {instance.status}
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Template</p>
                    <p className="font-semibold">{project.template?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-semibold">{project.plan?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p className="font-semibold">{project.aws_region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Port</p>
                    <p className="font-semibold">
                      {project.is_random_port ? "Random" : project.selected_port}
                    </p>
                  </div>
                  {project.organization && (
                    <div>
                      <p className="text-sm text-muted-foreground">Organization</p>
                      <p className="font-semibold">{project.organization}</p>
                    </div>
                  )}
                  {project.repository_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Repository</p>
                      <p className="font-semibold">{project.repository_name}</p>
                    </div>
                  )}
                  {project.branch_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="font-semibold">{project.branch_name}</p>
                    </div>
                  )}
                </div>

                {project.env_vars && project.env_vars.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Environment Variables</p>
                    <div className="space-y-1">
                      {project.env_vars.map((env, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-mono">{env.key}</span>
                          <Badge variant="outline" className="text-xs">
                            {env.is_secret ? "Secret" : "Public"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instance Status & URL */}
            <Card>
              <CardHeader>
                <CardTitle>Instance Status</CardTitle>
                <CardDescription>
                  {isCompleted
                    ? "Your instance is ready!"
                    : "Instance is being provisioned..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedInstanceId && !instanceId ? (
                  <p className="text-sm text-muted-foreground">
                    No instance created yet. Please configure AWS credentials to deploy.
                  </p>
                ) : latestLog ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(latestLog.status)}
                      <span className="font-semibold capitalize">{latestLog.status}</span>
                    </div>

                    {instanceUrl && isCompleted && (
                      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Instance URL</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(instanceUrl)}
                          >
                            {copied ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <a
                          href={instanceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-mono text-sm flex items-center gap-2"
                        >
                          {instanceUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : !loadingLogs ? (
                  <p className="text-sm text-muted-foreground">
                    No instance logs available yet.
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="text-sm text-muted-foreground">Loading logs...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instance Logs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Deployment Logs</CardTitle>
              <CardDescription>
                {selectedInstanceId || instanceId 
                  ? `Real-time logs from instance #${selectedInstanceId || instanceId}`
                  : "Real-time logs from your instance deployment"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2">Loading logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No logs available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 bg-muted/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="text-sm font-medium capitalize">
                            {log.status}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <pre className="text-xs font-mono whitespace-pre-wrap break-words text-muted-foreground bg-background/50 p-3 rounded border">
                        {log.output}
                      </pre>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <AWSCredentialsModal
        open={showAWSCredentialsModal}
        onClose={() => setShowAWSCredentialsModal(false)}
        onAWSKeysSubmit={handleAWSKeysSubmit}
        onDummyAccount={handleDummyAccount}
      />
    </PageTransition>
  );
}

