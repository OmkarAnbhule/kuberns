"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/loading";
import { PageTransition } from "@/components/page-transition";
import { getProjects, deleteProject, type Project } from "@/lib/api/projects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";


export default function Home() {
  const router = useRouter();
  // Note: Token is httpOnly and handled automatically by proxy
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
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
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Token is handled automatically by proxy via httpOnly cookie
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setError("Failed to load projects. Please try again.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      toast.success("Project deleted successfully!");
      // Remove project from list
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-gray-500";
      case "deploying":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            className="mb-8 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
              <p className="text-muted-foreground">
                Manage and deploy your applications
              </p>
            </div>
            <Button onClick={() => router.push("/create")} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create New App
            </Button>
          </motion.div>

          {loading ? (
            <motion.div
              className="flex items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center space-y-4">
                <LoadingSpinner />
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              className="flex flex-col items-center justify-center py-12 border-2 border-destructive rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </motion.div>
          ) : projects.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-muted-foreground mb-4">
                No projects yet. Create your first app to get started!
              </p>
              <Button onClick={() => router.push("/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create New App
              </Button>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="group relative border rounded-xl p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out bg-card/50 backdrop-blur-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Gradient Background Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Decorative Corner Element */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {project.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {project.template?.slug && (
                            <img
                              src={`/assets/templates/${project.template.slug}.svg`}
                              alt={project.template.name}
                              className="w-5 h-5 object-contain dark:[filter:brightness(1.5)_contrast(1.1)_saturate(1.2)]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <p className="text-sm font-medium text-muted-foreground">
                            {project.template?.name || project.template?.slug || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                        {project.status && (
                          <>
                            <motion.div
                              className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                                project.status
                              )} shadow-lg`}
                              animate={{
                                scale: [1, 1.3, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                              }}
                            />
                            <span className="text-xs font-medium text-foreground capitalize">
                              {project.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div 
                      className="space-y-3 text-sm cursor-pointer mb-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Region</span>
                        <span className="font-semibold">{project.aws_region}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Plan</span>
                        <span className="font-semibold text-primary">{project.plan?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Created</span>
                        <span className="font-semibold">
                          {new Date(project.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/create?id=${project.id}`);
                        }}
                        className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(project);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
