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
- **UI Components**: coss ui (Base UI React components), Lucide icons
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
│       │   │   ├── ui/         # coss ui components
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
│   │       ├── auth.ts         # Better-Auth setup (createAuth, createAuthOptions)
│   │       ├── auth.config.ts  # Auth configuration
│   │       ├── schema.ts       # Database schema
│   │       ├── http.ts         # HTTP actions
│   │       └── betterAuth/     # Local Better Auth component
│   │           ├── adapter.ts  # Auth API (create, findOne, findMany, etc.)
│   │           ├── auth.ts     # Static auth instance for schema generation
│   │           ├── convex.config.ts  # Local component definition
│   │           └── schema.ts   # Auto-generated auth tables
│   ├── config/                 # Shared TypeScript configs
│   ├── env/                    # Environment variable schemas
│   │   └── src/web.ts          # Web app env (VITE_CONVEX_URL, VITE_CONVEX_SITE_URL)
│   └── infra/                  # Infrastructure (Alchemy deployment)
├── docs/                       # Documentation
│   └── better-auth/            # Better Auth guides
│       ├── convex-triggers.md  # Convex triggers setup
│       ├── local-install.md    # Local component installation
│       ├── rate-limit.md       # Rate limiting configuration
│       └── tanstack-guide.md   # TanStack integration guide
├── .claude/commands/           # Claude Code custom commands
│   ├── coss-ui.md              # coss ui component patterns
│   ├── simple-ask.md           # Interactive interview command
│   └── update-memory.md        # Memory update workflow
├── .zed/settings.json          # Zed editor configuration
└── turbo.json                  # Turborepo configuration
```

## Available Scripts

```bash
bun dev              # Start all services in dev mode
bun dev:web          # Start web frontend via infra package
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

## Generated Files (gitignored)
- `packages/backend/convex/_generated/*` - Convex backend generated files
- `packages/backend/convex/betterAuth/_generated/*` - Better Auth component generated files
- `apps/web/src/routeTree.gen.ts` - TanStack Router auto-generated route tree

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
- Uses `@convex-dev/better-auth` with local component setup
- Local component in `convex/betterAuth/` for schema control
- `createAuthOptions()` - reusable auth configuration function
- `createAuth(ctx)` - creates auth instance with adapter
- Client: `authClient` from `better-auth/react` with Convex plugin
- Server: `convexBetterAuthReactStart` handler for SSR
- Protected routes via `beforeLoad` in root route

### Better Auth Schema Tables
- **user**: name, email, emailVerified, image, createdAt, updatedAt, userId
- **session**: expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId
- **account**: accountId, providerId, userId, tokens, password, createdAt, updatedAt
- **verification**: identifier, value, expiresAt, createdAt, updatedAt
- **jwks**: publicKey, privateKey, createdAt, expiresAt

### Routing
- File-based routing with TanStack Router
- Route tree auto-generated in `routeTree.gen.ts`
- Auth state passed through route context

### UI Patterns
- coss ui components in `components/ui/` (based on Base UI React)
- Field, FieldLabel, FieldError for form fields
- Menu components (replaces DropdownMenu)
- Custom Toast using `@base-ui/react/toast`

## Recent Changes

1. **4f4b5b5** - Add Better Auth Convex documentation (triggers, local-install, tanstack-guide)
2. **5d517d4** - Add rate limit documentation
3. **30f56b9** - Migrate from shadcn/ui to coss ui components (Field, Menu, Toast)
4. **b514ad0** - Update @tanstack/store dependency and enable auth verbose logging
