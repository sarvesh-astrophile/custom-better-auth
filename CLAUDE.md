# Custom Better Auth - Project Memory

## Project Overview
A full-stack web application built with Better-T-Stack, featuring TanStack Start frontend, Convex backend, and Better-Auth for authentication.

## Tech Stack

### Frontend (apps/web)
- **Framework**: TanStack Start (React 19.2.3) with SSR
- **Router**: TanStack Router v1.141.1
- **State Management**: TanStack React Query v5.80.6
- **Forms**: TanStack React Form v1.28.0
- **Styling**: Tailwind CSS v4 with tailwind-merge, class-variance-authority
- **UI Components**: shadcn/ui with Base UI React, Lucide icons
- **Build Tool**: Vite v7
- **Deployment**: Cloudflare (via @cloudflare/vite-plugin)

### Backend (packages/backend)
- **Database**: Convex (serverless)
- **Auth**: Better-Auth v1.4.9 with @convex-dev/better-auth integration
- **Email/Password authentication enabled**

### Monorepo Tools
- **Package Manager**: Bun v1.2.23
- **Build System**: Turborepo v2.6.3
- **Linting/Formatting**: Biome v2.2.0

## Project Structure

```
custom-better-auth/
├── apps/
│   └── web/                    # TanStack Start frontend
│       ├── src/
│       │   ├── components/     # React components
│       │   │   ├── ui/         # shadcn/ui components
│       │   │   ├── header.tsx
│       │   │   ├── sign-in-form.tsx
│       │   │   ├── sign-up-form.tsx
│       │   │   └── user-menu.tsx
│       │   ├── lib/
│       │   │   ├── auth-client.ts   # Client-side auth
│       │   │   ├── auth-server.ts   # Server-side auth handlers
│       │   │   └── utils.ts         # Utility functions (cn, etc.)
│       │   ├── routes/
│       │   │   ├── __root.tsx       # Root layout with auth provider
│       │   │   ├── index.tsx        # Home page
│       │   │   ├── dashboard.tsx    # Protected dashboard
│       │   │   └── api/auth/$.ts    # Auth API route
│       │   ├── router.tsx           # Router configuration
│       │   └── index.css            # Global styles
│       └── vite.config.ts
├── packages/
│   ├── backend/                # Convex backend
│   │   └── convex/
│   │       ├── auth.ts         # Better-Auth setup
│   │       ├── auth.config.ts  # Auth configuration
│   │       ├── schema.ts       # Database schema
│   │       └── http.ts         # HTTP actions
│   ├── config/                 # Shared TypeScript configs
│   ├── env/                    # Environment variable schemas
│   │   └── src/web.ts          # Web app env (VITE_CONVEX_URL, VITE_CONVEX_SITE_URL)
│   └── infra/                  # Infrastructure (Alchemy deployment)
└── turbo.json                  # Turborepo configuration
```

## Available Scripts

```bash
bun dev              # Start all services in dev mode
bun dev:web          # Start only web frontend
bun dev:server       # Start Convex backend
bun dev:setup        # Setup Convex backend (first time)
bun build            # Build all packages
bun check-types      # Type check all packages
bun check            # Run Biome linter/formatter
bun deploy           # Deploy infrastructure
bun destroy          # Destroy infrastructure
```

## Environment Variables

### Web App (apps/web/.env)
- `VITE_CONVEX_URL` - Convex deployment URL
- `VITE_CONVEX_SITE_URL` - Convex site URL for auth

### Backend (packages/backend/.env.local)
- `SITE_URL` - Site URL for Better-Auth

## Code Conventions

### Biome Configuration
- **Indentation**: Tabs
- **Quotes**: Double quotes
- **Organize Imports**: Enabled
- **CSS**: Tailwind directives enabled
- **Sorted Classes**: Auto-fix enabled for Tailwind (clsx, cva, cn functions)

### Key Style Rules
- `noParameterAssign`: error
- `useAsConstAssertion`: error
- `useSelfClosingElements`: error
- `noUselessElse`: error

## Key Features

### Authentication Flow
- Uses `@convex-dev/better-auth` for seamless Convex integration
- Client: `authClient` from `better-auth/react` with Convex plugin
- Server: `convexBetterAuthReactStart` handler for SSR
- Protected routes via `beforeLoad` in root route

### Routing
- File-based routing with TanStack Router
- Route tree auto-generated in `routeTree.gen.ts`
- Auth state passed through route context

### UI Patterns
- shadcn/ui components in `components/ui/`
- Theme support via `next-themes`
- Toast notifications via Sonner

## Recent Changes

1. **e5697cf** - Add Zed editor configuration file
2. **b68117f** - Generate TanStack Router tree and update gitignore
3. **1bba3d2** - Initial commit with full Better-T-Stack setup
