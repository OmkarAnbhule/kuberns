# Kuberns Frontend

A modern, full-featured Next.js application for managing cloud deployments and infrastructure. Built with TypeScript, Redux Toolkit, and shadcn/ui components.

## Table of Contents

- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Design Decisions](#design-decisions)
- [API Structure and Payloads](#api-structure-and-payloads)
- [Architecture Overview](#architecture-overview)
- [Time Taken & Limitations](#time-taken--limitations)
- [Deployment](#deployment)

## Features

- **Next.js 16** with TypeScript and App Router
- **shadcn/ui** components for modern, accessible UI
- **Redux Toolkit** for state management with persistence
- **GitHub OAuth** authentication with httpOnly cookies
- **API Proxy Layer** to handle CORS and authentication
- **Real-time Instance Logs** with polling
- **Project Management** (Create, Read, Update, Delete)
- **Infrastructure Management** (Instance creation, logs, status tracking)
- **Responsive Design** with dark mode support
- **Form Validation** with Zod and React Hook Form
- **Toast Notifications** for user feedback

## Setup Instructions

### Prerequisites

- **Node.js** 18+ 
- **npm** (or yarn/pnpm)
- **Backend API** running (see backend documentation)

### Installation

1. **Clone the repository** (if applicable):
```bash
git clone <repository-url>
cd kubern-frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
Create a `.env.local` file in the root directory:

```env
# Backend API Configuration
API_BASE_URL=https://kuberns-backend.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://kuberns-backend.onrender.com

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_OAUTH_URL=https://github.com/login/oauth/authorize

# Base URL (for production)
BASE_URL=https://your-frontend-domain.com
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Design Decisions

### 1. **Authentication Architecture**

**Decision**: Use httpOnly cookies for token storage instead of localStorage.

**Rationale**:
- Enhanced security: httpOnly cookies prevent XSS attacks
- Automatic token management: Cookies are sent automatically with requests
- Server-side token handling: Backend can validate tokens without exposing them to client JavaScript

**Implementation**:
- Access tokens stored in httpOnly cookies
- User data stored in non-httpOnly cookie for client-side access
- Redux state synced with cookies via `AuthSync` component
- Automatic 401 handling redirects to login

### 2. **API Proxy Layer**

**Decision**: Implement a Next.js API route proxy (`/api/proxy/[...path]`) instead of direct backend calls.

**Rationale**:
- CORS handling: Avoids CORS issues by proxying through same origin
- Token injection: Automatically adds httpOnly cookie tokens to requests
- Centralized error handling: 401 responses trigger logout and redirect
- Request/response transformation: Can modify payloads if needed

**Implementation**:
- All backend API calls route through `/api/proxy/`
- Proxy extracts `access_token` from httpOnly cookie
- Adds `Authorization: Bearer <token>` header
- Forwards request to backend API
- Returns response to client

### 3. **State Management**

**Decision**: Redux Toolkit with redux-persist for state management.

**Rationale**:
- Centralized state: Single source of truth for authentication
- Persistence: User data persists across page refreshes
- Type safety: TypeScript integration with typed hooks
- DevTools: Easy debugging with Redux DevTools

**Implementation**:
- `authSlice` manages user authentication state
- `AuthSync` component syncs cookies with Redux
- Typed hooks (`useAppSelector`, `useAppDispatch`) for type safety

### 4. **Form Management**

**Decision**: React Hook Form with Zod validation.

**Rationale**:
- Performance: Uncontrolled components reduce re-renders
- Validation: Schema-based validation with Zod
- Type safety: Automatic TypeScript types from Zod schemas
- User experience: Real-time validation feedback

**Implementation**:
- Multi-step form with step validation
- Field arrays for dynamic environment variables
- Custom validation rules with Zod refinements

### 5. **UI Component Library**

**Decision**: shadcn/ui components built on Radix UI.

**Rationale**:
- Accessibility: Radix UI provides excellent a11y out of the box
- Customization: Copy components to project for full control
- Modern design: Beautiful, consistent component library
- Dark mode: Built-in theme support

### 6. **Real-time Updates**

**Decision**: Polling for instance logs instead of WebSockets.

**Rationale**:
- Simplicity: No need for WebSocket infrastructure
- Reliability: Works with standard HTTP
- Cost-effective: No additional server resources
- Sufficient: 5-second polling provides near real-time updates

**Implementation**:
- Polls `/api/infra/{instance_id}/logs` every 5 seconds
- Stops polling when status is "completed" or "running"
- Only shows loading on initial fetch, not during polling

## API Structure and Payloads

### Authentication APIs

#### GitHub OAuth Flow

**Initiate Login**:
```
GET /api/auth/github
```
Redirects to GitHub OAuth authorization page.

**Callback**:
```
GET /api/auth/github/callback?code=<code>&state=<state>
```
- Exchanges code for tokens
- Stores `access_token` in httpOnly cookie
- Stores `user_data` in non-httpOnly cookie
- Redirects to home page

**Logout**:
```
POST /api/auth/logout
```
- Clears all authentication cookies
- Returns success response

### Project APIs

#### Get All Projects
```
GET /api/proxy/projects
```

**Response**:
```typescript
Array<{
  id: string;
  name: string;
  owner: number;
  aws_region: string;
  organization?: string;
  repository_name?: string;
  branch_name?: string;
  selected_port: number;
  is_random_port: boolean;
  plan: {
    id: number;
    name: string;
    cpu_cores: number;
    ram_mb: number;
    bandwidth_gb: number;
    price_monthly: number;
    price_hourly: number;
    storage_gb: number;
    description: string;
  };
  template: {
    id: number;
    name: string;
    category: string;
    slug: string;
  };
  env_vars: Array<{
    id?: number;
    key: string;
    value?: string;
    is_secret: boolean;
  }>;
  database_config?: {
    connection_url: string;
  };
  status?: "running" | "stopped" | "deploying" | "failed";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}>
```

#### Get Single Project
```
GET /api/proxy/projects/{id}
```

**Response**: Same as single project object above.

#### Create Project
```
POST /api/proxy/projects
```

**Request Body**:
```typescript
{
  name: string;
  organization?: string; // Optional, defaults to empty string
  repository_name?: string;
  branch_name?: string;
  aws_region: string; // e.g., "us-east-1"
  template_id: number;
  plan_id: number;
  github_repo_id?: number; // Required if not demo mode
  selected_port: number; // 0 if random port
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
```

**Response**: Project object (same as Get Single Project).

#### Update Project
```
PUT /api/proxy/projects/{id}
```

**Request Body**: Same as Create Project.

**Response**: Updated project object.

#### Delete Project
```
DELETE /api/proxy/projects/{id}
```

**Response**: 204 No Content or success message.

### Infrastructure APIs

#### Create Instance
```
POST /api/proxy/infra/instances/create
```

**Request Body**:
```typescript
{
  project_id: string; // UUID
  credential_mode: "demo" | "aws"; // Use "aws" for user credentials, "demo" for demo mode
  aws_access_key: string; // Empty string if demo mode
  aws_secret_key: string; // Empty string if demo mode
  region: string; // AWS region, e.g., "us-east-1"
  port: number; // Port number (80 if random port selected)
}
```

**Response**:
```typescript
{
  id: number; // Instance ID
  // ... other fields
}
```

#### Get Instance Logs
```
GET /api/proxy/infra/{instance_id}/logs?limit=50
```

**Response**:
```typescript
Array<{
  id: number;
  status: string; // "completed", "running", "pending", "failed", etc.
  output: string; // Log output text
  timestamp: string; // ISO 8601 timestamp
}>
```

#### Get Instances by Project
```
GET /api/proxy/infra/instances?project_id={project_id}
```

**Response**:
```typescript
Array<{
  id: number;
  project_id: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  // ... other fields
}>
```

### GitHub Integration APIs

#### Get Organizations
```
GET /api/proxy/github/organizations
```

**Response**:
```typescript
Array<{
  value: string; // Organization login
  label: string; // Organization name
}>
```

#### Get Repositories
```
GET /api/proxy/github/repositories
```

**Response**:
```typescript
Array<{
  value: string; // Full repository name (owner/repo)
  label: string; // Repository name
  full_name: string;
  owner: string;
  id?: number; // GitHub repository ID
}>
```

#### Get Branches
```
GET /api/proxy/github/branches/{owner}/{repo}
```

**Response**:
```typescript
Array<{
  value: string; // Branch name
  label: string; // Branch name
}>
```

### Templates and Plans APIs

#### Get Templates
```
GET /api/proxy/templates
```

**Response**:
```typescript
{
  templates: Array<{
    id: number;
    name: string;
    slug: string;
    category: string;
  }>
}
```

#### Get Plans
```
GET /api/proxy/plans
```

**Response**:
```typescript
Array<{
  id: string;
  name: string;
  cpu: string; // e.g., "2 cores"
  memory: string; // e.g., "2048 MB"
  storage: string; // e.g., "50 GB"
  bandwidth: string; // e.g., "100 GB"
  monthlyCost: string; // e.g., "500 INR"
  pricePerHour: string; // e.g., "10 INR"
  description: string;
}>
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React      │  │   Redux      │  │   Cookies    │     │
│  │  Components  │  │    Store     │  │  (httpOnly)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Next.js Frontend                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Proxy Layer                         │   │
│  │  /api/proxy/[...path]                                │   │
│  │  - Extracts access_token from httpOnly cookie        │   │
│  │  - Adds Authorization header                          │   │
│  │  - Forwards to backend                                │   │
│  │  - Handles 401 responses                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Authentication Routes                      │   │
│  │  /api/auth/github - Initiate OAuth                    │   │
│  │  /api/auth/github/callback - Handle callback          │   │
│  │  /api/auth/logout - Clear cookies                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Pages & Components                       │   │
│  │  - / (Dashboard)                                      │   │
│  │  - /create (Project Creation/Edit)                    │   │
│  │  - /projects/[id] (Project Details)                   │   │
│  │  - /login (Authentication)                            │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ API Calls
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend API                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/accounts/auth/github/callback                   │   │
│  │  /api/projects (GET, POST, PUT, DELETE)                │   │
│  │  /api/templates                                        │   │
│  │  /api/plans                                            │   │
│  │  /api/github/organizations                             │   │
│  │  /api/github/repositories                              │   │
│  │  /api/github/branches/{owner}/{repo}                  │   │
│  │  /api/infra/instances/create                           │   │
│  │  /api/infra/{instance_id}/logs                         │   │
│  │  /api/infra/instances?project_id={id}                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication Flow**:
   - User clicks "Sign in with GitHub"
   - Redirects to GitHub OAuth
   - GitHub redirects back with code
   - Backend exchanges code for tokens
   - Tokens stored in httpOnly cookies
   - User data synced to Redux

2. **API Request Flow**:
   - Component calls API function (e.g., `getProjects()`)
   - API function uses `apiClient` which routes through `/api/proxy/`
   - Proxy extracts token from cookie
   - Proxy forwards request to backend with Authorization header
   - Backend validates token and returns data
   - Response returned to component
   - Component updates Redux state or local state

3. **Instance Creation Flow**:
   - User fills project creation form
   - Form validated with Zod
   - Project created via POST `/api/proxy/projects`
   - AWS credentials modal appears
   - User provides credentials or selects demo mode
   - Instance created via POST `/api/proxy/infra/instances/create`
   - User redirected to project detail page
   - Logs polled every 5 seconds until completed/running

## Time Taken & Limitations

### Time Taken

**Estimated Development Time**: ~40-50 hours

**Breakdown**:
- Initial setup and authentication: ~8 hours
- Project CRUD operations: ~10 hours
- Infrastructure and instance management: ~8 hours
- Form handling and validation: ~6 hours
- UI/UX improvements and polish: ~8 hours
- Testing and bug fixes: ~6 hours
- Documentation: ~4 hours

### Limitations

1. **Polling Instead of WebSockets**:
   - Real-time updates use polling (5-second intervals)
   - Not true real-time, slight delay possible
   - Could be improved with WebSocket implementation

2. **No Offline Support**:
   - Application requires active internet connection
   - No service worker or offline caching implemented

3. **Limited Error Recovery**:
   - Network errors show toast notifications
   - No automatic retry mechanism
   - User must manually retry failed operations

4. **No Image Upload**:
   - Currently no support for uploading custom images
   - Template icons are pre-defined SVG files

5. **Single Backend Instance**:
   - Assumes single backend API endpoint
   - No load balancing or failover handling

6. **Browser Compatibility**:
   - Modern browsers only (ES6+)
   - No IE11 support

7. **No Real-time Collaboration**:
   - Multiple users can't see each other's changes in real-time
   - No presence indicators

8. **Limited Analytics**:
   - No user analytics or tracking implemented
   - No performance monitoring

### Future Improvements

- [ ] WebSocket integration for real-time updates
- [ ] Offline support with service workers
- [ ] Automatic retry mechanism for failed requests
- [ ] Image upload functionality
- [ ] Real-time collaboration features
- [ ] Advanced analytics and monitoring
- [ ] Unit and integration tests
- [ ] E2E testing with Playwright/Cypress
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Internationalization (i18n) support

## Deployment

### Deploy on Kuberns Platform

1. **Prepare for Deployment**:
   - Ensure all environment variables are set
   - Run `npm run build` to verify build succeeds
   - Test all functionality in production mode

2. **Create Project on Kuberns**:
   - Log in to your Kuberns account
   - Click "Create New App"
   - Select "Next.js" template
   - Configure your project settings

3. **Set Environment Variables**:
   In your Kuberns project settings, add:
   ```
   API_BASE_URL=https://kuberns-backend.onrender.com
   NEXT_PUBLIC_API_BASE_URL=https://kuberns-backend.onrender.com
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_OAUTH_URL=https://github.com/login/oauth/authorize
   BASE_URL=https://your-kuberns-app-url.kuberns.app
   NODE_ENV=production
   ```

4. **Deploy**:
   - Connect your GitHub repository
   - Kuberns will automatically build and deploy
   - Or use Kuberns CLI:
   ```bash
   kuberns deploy
   ```

5. **Verify Deployment**:
   - Check that the app loads correctly
   - Test authentication flow
   - Verify API connections
   - Test project creation and management

### Alternative Deployment Options

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Project Structure

```
kubern-frontend/
├── public/
│   ├── assets/
│   │   └── templates/          # Template SVG icons
│   └── favicon.svg             # Favicon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication routes
│   │   │   │   ├── github/
│   │   │   │   └── logout/
│   │   │   └── proxy/         # API proxy routes
│   │   ├── create/            # Project creation page
│   │   ├── login/             # Login page
│   │   ├── projects/
│   │   │   └── [id]/          # Project detail page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard/home
│   │   ├── not-found.tsx      # 404 page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── create/            # Form components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth-sync.tsx      # Auth state sync
│   │   ├── logo.tsx           # Logo component
│   │   └── navbar.tsx         # Navigation bar
│   └── lib/
│       ├── api/
│       │   ├── projects.ts    # Project API functions
│       │   ├── github.ts     # GitHub API functions
│       │   └── infrastructure.ts # Infrastructure API
│       ├── apiClient.ts      # API client with proxy
│       ├── hooks.ts          # Typed Redux hooks
│       ├── store.ts          # Redux store config
│       ├── slices/
│       │   └── authSlice.ts  # Auth Redux slice
│       └── utils.ts          # Utility functions
├── .env.local                 # Environment variables
├── middleware.ts              # Next.js middleware
├── package.json
├── tsconfig.json
└── README.md
```

## Technology Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0
- **State Management**: Redux Toolkit 2.10.1
- **Form Management**: React Hook Form 7.66.1
- **Validation**: Zod 4.1.12
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 4.1.17
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.554.0
- **Notifications**: Sonner 2.0.7
- **HTTP Client**: Native Fetch API

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Add your license here]

## Support

For support, email support@kuberns.com or open an issue in the repository.

---

**Built with ❤️ using Next.js and TypeScript**
