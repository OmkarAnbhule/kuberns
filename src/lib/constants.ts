// Static data constants - can be used by both server and client components


export const regions = [
  { value: "us-east-1", label: "United States - Virginia" },
  { value: "us-east-2", label: "United States - Ohio" },
  { value: "us-west-1", label: "United States - California" },
  { value: "us-west-2", label: "United States - Oregon" },
  { value: "eu-west-1", label: "Europe - Ireland" },
  { value: "eu-west-2", label: "Europe - London" },
  { value: "eu-west-3", label: "Europe - Paris" },
  { value: "eu-central-1", label: "Europe - Frankfurt" },
  { value: "eu-north-1", label: "Europe - Stockholm" },
  { value: "ap-south-1", label: "Asia - Mumbai" },
  { value: "ap-northeast-1", label: "Asia - Tokyo" },
  { value: "ap-northeast-2", label: "Asia - Seoul" },
  { value: "ap-southeast-1", label: "Asia - Singapore" },
  { value: "ap-southeast-2", label: "Asia - Sydney" },
  { value: "ca-central-1", label: "Canada - Central" },
  { value: "sa-east-1", label: "South America - São Paulo" },
];

export const templates = [
  { value: "vue", label: "Vue.js" },
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "angular", label: "Angular" },
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "django", label: "Django" },
];

export const planTypes = [
  {
    id: "starter",
    name: "Starter",
    storage: "10 GB",
    bandwidth: "10 GB",
    memory: "10 GB",
    cpu: "2 GB",
    monthlyCost: "₹0",
    pricePerHour: "₹0",
    description: "Ideal for personal blogs and small websites.",
  },
  {
    id: "professional",
    name: "Professional",
    storage: "50 GB",
    bandwidth: "50 GB",
    memory: "20 GB",
    cpu: "4 GB",
    monthlyCost: "₹500",
    pricePerHour: "₹10",
    description: "Perfect for growing businesses and applications.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    storage: "100 GB",
    bandwidth: "100 GB",
    memory: "50 GB",
    cpu: "8 GB",
    monthlyCost: "₹2000",
    pricePerHour: "₹50",
    description: "For large-scale applications and enterprises.",
  },
];

// Mock data for VCS selection
export const organizations = [
  { value: "org1", label: "Adith Narein T" },
  { value: "org2", label: "My Organization" },
  { value: "org3", label: "Company Inc" },
  { value: "org4", label: "Dev Team" },
];

export const repositories = [
  { value: "repo1", label: "Kuberns Page" },
  { value: "repo2", label: "My Project" },
  { value: "repo3", label: "Web App" },
  { value: "repo4", label: "API Server" },
];

export const branches = [
  { value: "main", label: "main" },
  { value: "develop", label: "develop" },
  { value: "staging", label: "staging" },
  { value: "production", label: "production" },
];

