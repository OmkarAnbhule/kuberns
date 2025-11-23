# Kubern Frontend

A Next.js TypeScript application with authentication, Redux state management, and API proxy layer for Kuberns management.

## Features

- **Next.js 16** with TypeScript and App Router
- **shadcn/ui** components for modern UI
- **Redux Toolkit** for state management
- **Authentication** with GitHub OAuth
- **Middleware** for route protection
- **API Proxy Layer** to avoid CORS issues

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm (or yarn/pnpm)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_OAUTH_URL=https://github.com/login/oauth/authorize
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication routes
│   │   └── proxy/        # API proxy routes
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── providers.tsx    # Redux provider
├── lib/                 # Utility functions
│   ├── apiClient.ts     # API client with proxy support
│   ├── hooks.ts         # Typed Redux hooks
│   ├── store.ts         # Redux store configuration
│   ├── slices/          # Redux slices
│   │   └── authSlice.ts # Authentication slice
│   └── utils.ts         # Utility functions
└── middleware.ts         # Next.js middleware (at root)
```

## Authentication Flow

1. User visits `/login` page
2. Clicks "Sign in with GitHub" button
3. Redirects to `/api/auth/github` which initiates GitHub OAuth
4. After successful authentication, user is redirected back
5. Auth token is stored in cookies and Redux state
6. Middleware protects routes based on authentication status

## API Proxy

The application includes a generalized proxy layer at `/api/proxy/[...path]` that:

- Forwards requests to your backend API
- Handles CORS issues
- Automatically injects authentication tokens
- Supports GET, POST, PUT, DELETE methods

Usage example:
```typescript
// Instead of calling backend directly
fetch('/api/proxy/users', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
})
```

## State Management

Redux Toolkit is configured with:

- **Auth Slice**: Manages user authentication state
- **Typed Hooks**: `useAppDispatch` and `useAppSelector` for type-safe Redux usage

Example:
```typescript
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setUser, clearUser } from '@/lib/slices/authSlice';

const user = useAppSelector((state) => state.auth.user);
const dispatch = useAppDispatch();
```

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (default: http://localhost:3001)
- `GITHUB_CLIENT_ID`: GitHub OAuth application client ID
- `GITHUB_OAUTH_URL`: GitHub OAuth authorization URL (default: https://github.com/login/oauth/authorize)

## Build

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
