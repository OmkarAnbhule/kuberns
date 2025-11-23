import { apiClientJson } from "@/lib/apiClient";

export interface GitHubOrganization {
  id: string;
  login: string;
  name?: string;
  avatar_url?: string;
}

export interface GitHubRepository {
  id: string;
  name: string;
  full_name: string;
  owner: {
    login: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface GitHubBranch {
  name: string;
  commit?: {
    sha: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Get list of GitHub organizations
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function getGitHubOrganizations(): Promise<Array<{ value: string; label: string }>> {
  try {
    const data = await apiClientJson<any>(
      "integrations/github/organizations",
      {
        method: "GET",
      }
    );
    
    // Debug: log the response structure
    console.log("GitHub Organizations API Response:", data);
    
    // Transform to match our format - handle both array and object responses
    let items: any[] = [];
    
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      // Try various possible response structures
      items = data.data || data.items || data.results || data.organizations || data.orgs || [];
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn("No organizations found in response:", data);
      return [];
    }
    
    return items.map((org: any) => {
      // Handle different possible field names
      const login = org.login || org.username || org.name || org.id;
      const name = org.name || org.display_name || login;
      
      if (!login) {
        console.warn("Organization missing login field:", org);
        return null;
      }
      
      return {
        value: String(login),
        label: String(name || login),
      };
    }).filter((item): item is { value: string; label: string } => item !== null);
  } catch (error) {
    console.error("Error fetching GitHub organizations:", error);
    throw error;
  }
}

// Get list of GitHub repositories
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function getGitHubRepositories(): Promise<Array<{ value: string; label: string; full_name: string; owner: string; id?: number }>> {
  try {
    const data = await apiClientJson<any>(
      "integrations/github/repos",
      {
        method: "GET",
      }
    );
    
    // Debug: log the response structure
    console.log("GitHub Repositories API Response:", data);
    
    // Transform to match our format - handle both array and object responses
    let items: any[] = [];
    
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      // Try various possible response structures - check for 'repos' first (most common)
      items = data.repos || data.data || data.items || data.results || data.repositories || [];
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn("No repositories found in response:", data);
      return [];
    }
    
    const mappedRepos = items.map((repo: any) => {
      // Handle different possible field names
      const fullName = repo.full_name || repo.fullName || `${repo.owner?.login || (typeof repo.owner === 'string' ? repo.owner : '') || ''}/${repo.name || ''}`;
      const name = repo.name || fullName.split("/").pop() || "";
      // Extract owner - handle both object with login property and string
      let owner = "";
      if (repo.owner) {
        if (typeof repo.owner === 'object' && repo.owner.login) {
          owner = repo.owner.login;
        } else if (typeof repo.owner === 'string') {
          owner = repo.owner;
        }
      }
      // Fallback to extracting from full_name if owner not found
      if (!owner && fullName) {
        owner = fullName.split("/")[0] || "";
      }
      
      if (!fullName || !name) {
        console.warn("Repository missing required fields:", repo);
        return null;
      }
      
      return {
        value: String(fullName),
        label: String(name),
        full_name: String(fullName),
        owner: String(owner),
        id: repo.id ? Number(repo.id) : undefined,
      };
    }).filter((item): item is { value: string; label: string; full_name: string; owner: string; id?: number } => item !== null);
    
    console.log("Mapped repositories:", mappedRepos);
    console.log("Mapped repositories count:", mappedRepos.length);
    
    return mappedRepos;
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    throw error;
  }
}

// Get list of branches for a specific repository
// Note: token parameter is deprecated - proxy handles httpOnly cookie automatically
export async function getGitHubBranches(
  owner: string,
  repoName: string,
): Promise<Array<{ value: string; label: string }>> {
  try {
    const data = await apiClientJson<any>(
      `integrations/github/repos/${owner}/${repoName}/branches`,
      {
        method: "GET",
      }
    );
    
    // Debug: log the response structure
    console.log("GitHub Branches API Response:", data);
    
    // Transform to match our format - handle both array and object responses
    let items: any[] = [];
    
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      // Try various possible response structures - check for 'branches' first (most common)
      items = data.branches || data.repos || data.data || data.items || data.results || [];
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn("No branches found in response:", data);
      return [];
    }
    
    return items.map((branch: any) => {
      // Handle different possible field names
      const name = branch.name || branch.branch || branch.ref?.replace('refs/heads/', '') || String(branch);
      
      if (!name) {
        console.warn("Branch missing name field:", branch);
        return null;
      }
      
      return {
        value: String(name),
        label: String(name),
      };
    }).filter((item): item is { value: string; label: string } => item !== null);
  } catch (error) {
    console.error("Error fetching GitHub branches:", error);
    throw error;
  }
}

