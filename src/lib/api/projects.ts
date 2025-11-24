import { apiClientJson, apiClient } from "@/lib/apiClient";

export interface ProjectPlan {
  id: number;
  name: string;
  cpu_cores: number;
  ram_mb: number;
  bandwidth_gb: number;
  price_monthly: number;
  price_hourly: number;
  storage_gb: number;
  description: string;
}

export interface ProjectTemplate {
  id: number;
  name: string;
  category: string;
  slug: string;
}

export interface ProjectEnvVar {
  id?: number;
  key: string;
  value?: string;
  is_secret: boolean;
}

export interface Project {
  id: string;
  name: string;
  owner: number;
  aws_region: string;
  organization: string;
  repository_name: string;
  branch_name: string;
  selected_port: number;
  is_random_port: boolean;
  plan: ProjectPlan;
  template: ProjectTemplate;
  env_vars: ProjectEnvVar[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  status?: "running" | "stopped" | "deploying" | "failed"; // Optional for backward compatibility
  [key: string]: any; // Allow additional fields
}

export interface CreateProjectPayload {
  name: string;
  organization?: string;
  repository_name?: string;
  branch_name?: string;
  aws_region: string;
  template_id: number;
  plan_id: number;
  github_repo_id?: number;
  selected_port: number;
  is_random_port: boolean;
  env_vars?: Array<{
    key: string;
    value: string;
    is_secret?: boolean;
  }>;
  database_config?: {
    connection_url: string;
  };
}

export interface Template {
  id?: number;
  name: string;
  slug: string;
  category: string;
  svg?: string;
}

export interface Plan {
  id: string;
  name: string;
  storage_gb: number;
  bandwidth_gb: number;
  ram_mb: number;
  cpu_cores: number;
  price_monthly: number;
  price_hourly: number;
  description: string;
}

// List all projects
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function getProjects(): Promise<Project[]> {
  const data = await apiClientJson<Project[] | { data: Project[] }>("projects", {
    method: "GET",
  });
  
  // Handle both array and object responses
  if (Array.isArray(data)) {
    return data;
  }
  
  return (data as any).data || (data as any).items || [];
}

// Get a single project by ID
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function getProject(
  id: string,
): Promise<Project> {
  const data = await apiClientJson<Project | { data: Project }>(`projects/${id}`, {
    method: "GET",
  });
  
  // Handle both direct object and wrapped responses
  if ((data as any).data) {
    return (data as any).data;
  }
  
  return data as Project;
}

// Create a new project
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function createProject(
  payload: CreateProjectPayload,
): Promise<Project> {
  try {
    const data = await apiClientJson<Project | { data: Project }>("projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    // Handle both direct object and wrapped responses
    if ((data as any).data) {
      return (data as any).data;
    }
    
    return data as Project;
  } catch (error: any) {
    // Re-throw with more context
    const errorMessage = error?.message || "Failed to create project";
    throw new Error(errorMessage);
  }
}

// Update a project
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function updateProject(
  id: string,
  payload: Partial<CreateProjectPayload>,
): Promise<Project> {
  const data = await apiClientJson<Project | { data: Project }>(`projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  
  // Handle both direct object and wrapped responses
  if ((data as any).data) {
    return (data as any).data;
  }
  
  return data as Project;
}

// Delete a project
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function deleteProject(
  id: string,
): Promise<void> {
  try {
    await apiClient(`projects/${id}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to delete project";
    throw new Error(errorMessage);
  }
}

// Get all templates
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function getTemplates(): Promise<Template[]> {
  try {
    const data = await apiClientJson<any>("projects/templates", {
      method: "GET",
    });
    
    // Transform to match our format - handle both array and object responses
    let items: any[] = [];
    
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      // Try various possible response structures - check for 'templates' first (most common)
      items = data.templates || data.data || data.items || data.results || [];
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn("No templates found in response:", data);
      return [];
    }
    
    return items;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
}

// Get all plans
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function getPlans(): Promise<Plan[]> {
  try {
    const data = await apiClientJson<any>("projects/plans", {
      method: "GET",
    });
    
    // Transform to match our format - handle both array and object responses
    let items: any[] = [];
    
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      // Try various possible response structures - check for 'plans' first (most common)
      items = data.plans || data.data || data.items || data.results || [];
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn("No plans found in response:", data);
      return [];
    }
    
    return items;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
}

