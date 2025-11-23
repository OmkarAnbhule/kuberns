import { apiClientJson, apiClient } from "@/lib/apiClient";

export interface CreateInstancePayload {
  project_id: string;
  credential_mode: "demo" | "user";
  aws_access_key: string;
  aws_secret_key: string;
  region: string;
  port: number;
}

export interface CreateInstanceResponse {
  id: number;
  [key: string]: any;
}

export interface InstanceLog {
  id: number;
  status: string;
  output: string;
  timestamp: string;
}

export interface Instance {
  id: number;
  project_id: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// Create infrastructure instance
export async function createInstance(
  payload: CreateInstancePayload
): Promise<CreateInstanceResponse> {
  try {
    const data = await apiClientJson<CreateInstanceResponse>(
      "infra/instances/create",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    // Handle both direct object and wrapped responses
    if ((data as any).data) {
      return (data as any).data;
    }

    return data;
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to create instance";
    throw new Error(errorMessage);
  }
}

// Get instance logs
export async function getInstanceLogs(
  instanceId: number,
  limit: number = 50
): Promise<InstanceLog[]> {
  try {
    const data = await apiClientJson<InstanceLog[] | { data: InstanceLog[] }>(
      `infra/instances/${instanceId}/logs?limit=${limit}`,
      {
        method: "GET",
      }
    );

    // Handle both array and wrapped responses
    if (Array.isArray(data)) {
      return data;
    }

    if ((data as any).data) {
      return (data as any).data;
    }

    if ((data as any).logs) {
      return (data as any).logs;
    }

    return [];
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to fetch instance logs";
    throw new Error(errorMessage);
  }
}

// Get all instances by project ID
export async function getInstancesByProjectId(
  projectId: string
): Promise<Instance[]> {
  try {
    const data = await apiClientJson<Instance[] | { data: Instance[] } | { instances: Instance[] }>(
      `infra/instances?project_id=${projectId}`,
      {
        method: "GET",
      }
    );

    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    }

    if ((data as any).data && Array.isArray((data as any).data)) {
      return (data as any).data;
    }

    if ((data as any).instances && Array.isArray((data as any).instances)) {
      return (data as any).instances;
    }

    return [];
  } catch (error: any) {
    // Instances might not exist yet, return empty array
    return [];
  }
}

// Get the latest instance ID by project ID
export async function getInstanceIdByProjectId(
  projectId: string
): Promise<number | null> {
  try {
    const instances = await getInstancesByProjectId(projectId);
    
    if (instances.length === 0) {
      return null;
    }

    // Sort by created_at or id to get the latest (most recent)
    const sortedInstances = instances.sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : a.id;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : b.id;
      return bDate - aDate; // Descending order (latest first)
    });

    const latestInstance = sortedInstances[0];
    return latestInstance.id || null;
  } catch (error: any) {
    // Instance might not exist yet, return null
    return null;
  }
}

