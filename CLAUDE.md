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


# TanStack Router Guidelines

## Type Safety Guidelines

### Register router type for global inference
- CRITICAL: Register your router instance with TypeScript's module declaration to enable type inference across your entire application. Without registration, hooks like `useNavigate`, `useParams`, and `useSearch` won't know your route structure.
- Example:
```tsx
// router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({ routeTree })

// Register the router instance for type inference
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```
- After registration, all hooks get full type inference:
```tsx
// 1. Navigation
const navigate = useNavigate()
avigate({ to: '/posts/$postId', params: { postId: '123' } })

// 2. Link component
<Link to="/posts/$postId" params={{ postId: '123' }}>View Post</Link>

// 3. useParams hook
const { postId } = useParams({ from: '/posts/$postId' })  // postId: string

// 4. useSearch hook
const search = useSearch({ from: '/posts' })  // Knows search param types

// 5. useLoaderData hook
const data = useLoaderData({ from: '/posts/$postId' })  // Knows loader return type
```

### Use `from` parameter for type narrowing
- CRITICAL: When using hooks like `useParams`, `useSearch`, or `useLoaderData`, provide the `from` parameter to get exact types for that route. Without it, TypeScript returns a union of all possible types across all routes.
- Bad: Without 'from' - TypeScript doesn't know which route's types to use
```tsx
function PostDetail() {
  const params = useParams()
  // params: { postId?: string; userId?: string; categoryId?: string; ... }
  console.log(params.postId)  // postId: string | undefined
}
```
- Good: With 'from' - exact types for this specific route
```tsx
function PostDetail() {
  const params = useParams({ from: '/posts/$postId' })
  // params: { postId: string } - exactly what this route provides
  console.log(params.postId)  // postId: string (guaranteed)
}
```
- Good: Using Route.fullPath for type safety within route files
```tsx
function PostComponent() {
  const params = useParams({ from: Route.fullPath })
  const { post } = useLoaderData({ from: Route.fullPath })

  // Or use route-specific helper (preferred in same file)
  const { postId } = Route.useParams()
  const data = Route.useLoaderData()
}
```
- Good: Using getRouteApi for code-split components
```tsx
// components/PostDetail.tsx (separate file from route)
import { getRouteApi } from '@tanstack/react-router'

const postRoute = getRouteApi('/posts/$postId')

export function PostDetail() {
  const params = postRoute.useParams()  // params: { postId: string }
  const data = postRoute.useLoaderData()  // Exact loader return type
  const search = postRoute.useSearch()  // Exact search param types
}
```
- Use `strict: false` only in shared components that work across multiple routes:
```tsx
function Breadcrumbs() {
  const params = useParams({ strict: false })
  const location = useLocation()
  return (
    <nav>
      {params.userId && <span>User: {params.userId}</span>}
      {params.postId && <span>Post: {params.postId}</span>}
    </nav>
  )
}
```

## Data Loading Guidelines

### Use route loaders for data fetching
- HIGH: Route loaders execute before the route renders, enabling data to be ready when the component mounts. This prevents loading waterfalls, enables preloading, and integrates with the router's caching layer.
- Bad: Fetching in component - creates waterfall
```tsx
function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts().then((data) => {
      setPosts(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Loading />
  return <PostList posts={posts} />
}
```
- Good: Using route loader
```tsx
// routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: async () => {
    const posts = await fetchPosts()
    return { posts }
  },
  component: PostsPage,
})

function PostsPage() {
  const { posts } = Route.useLoaderData()
  return <PostList posts={posts} />
}
```
- Good: With TanStack Query
```tsx
const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
  })

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData(postQueryOptions(params.postId))
  },
  component: PostDetailPage,
})

function PostDetailPage() {
  const { postId } = Route.useParams()
  const { data: post } = useSuspenseQuery(postQueryOptions(postId))
  return <PostContent post={post} />
}
```

### Use ensureQueryData with TanStack Query
- HIGH: When integrating TanStack Router with TanStack Query, use `queryClient.ensureQueryData()` in loaders instead of `prefetchQuery()`. This respects the cache, awaits data if missing, and returns the data for potential use.
- Bad: Using prefetchQuery - doesn't return data, can't await stale check
```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params, context: { queryClient } }) => {
    queryClient.prefetchQuery({
      queryKey: ['posts', params.postId],
      queryFn: () => fetchPost(params.postId),
    })
  },
})
```
- Good: Using ensureQueryData
```tsx
const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
    staleTime: 5 * 60 * 1000,
  })

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params, context: { queryClient } }) => {
    // ensureQueryData:
    // - Returns cached data if fresh
    // - Fetches and caches if missing or stale
    // - Awaits completion
    // - Throws on error (caught by error boundary)
    await queryClient.ensureQueryData(postQueryOptions(params.postId))
  },
  component: PostPage,
})

function PostPage() {
  const { postId } = Route.useParams()
  const { data: post } = useSuspenseQuery(postQueryOptions(postId))
  return <PostContent post={post} />
}
```
- Good: Multiple parallel queries
```tsx
export const Route = createFileRoute('/dashboard')({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(statsQueries.overview()),
      queryClient.ensureQueryData(activityQueries.recent()),
      queryClient.ensureQueryData(notificationQueries.unread()),
    ])
  },
})
```
- Comparison table:
| Method | Returns | Throws | Awaits | Use Case |
|--------|---------|--------|--------|----------|
| `ensureQueryData` | Data | Yes | Yes | Route loaders (recommended) |
| `prefetchQuery` | void | No | Yes | Background prefetching |
| `fetchQuery` | Data | Yes | Yes | When you need data immediately |

### Leverage parallel route loading
- MEDIUM: TanStack Router loads nested route data in parallel, not sequentially. Structure your routes and loaders to maximize parallelization.
- Bad: Creating waterfall with dependent beforeLoad
```tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await fetchUser()        // 200ms
    const permissions = await fetchPermissions(user.id)  // 200ms
    const preferences = await fetchPreferences(user.id)  // 200ms
    // Total: 600ms (sequential)
    return { user, permissions, preferences }
  },
})
```
- Good: Parallel in single loader
```tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const [user, config] = await Promise.all([
      fetchUser(),
      fetchAppConfig(),
    ])
    return { user, config }
  },
})
```
- Good: Parallel nested routes (parent and child loaders run in PARALLEL)
```tsx
// routes/posts.tsx
export const Route = createFileRoute('/posts')({
  loader: async () => {
    const categories = await fetchCategories()
    return { categories }
  },
})

// routes/posts/$postId.tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    const comments = await fetchComments(params.postId)
    return { post, comments }
  },
})
// Navigation to /posts/123: Both loaders start simultaneously
```
- Good: Streaming non-critical data
```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params, context: { queryClient } }) => {
    // Critical data - await
    const post = await queryClient.ensureQueryData(
      postQueries.detail(params.postId)
    )
    // Non-critical - start but don't await
    queryClient.prefetchQuery(commentQueries.forPost(params.postId))
    return { post }
  },
})
```

## Search Params Guidelines

### Always validate search params
- HIGH: Search params come from the URL - user-controlled input that must be validated. Use `validateSearch` to parse, validate, and provide defaults.
- Bad: No validation - trusting URL input directly
```tsx
function ProductsPage() {
  const searchParams = new URLSearchParams(window.location.search)
  const page = parseInt(searchParams.get('page') || '1')
  const sort = searchParams.get('sort') as 'asc' | 'desc'
  return <ProductList page={page} sort={sort} />
}
```
- Good: Manual validation
```tsx
export const Route = createFileRoute('/products')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      sort: search.sort === 'desc' ? 'desc' : 'asc',
      category: typeof search.category === 'string' ? search.category : undefined,
    }
  },
  component: ProductsPage,
})

function ProductsPage() {
  const { page, sort, category } = Route.useSearch()
  // page: number (default 1)
  // sort: 'asc' | 'desc' (default 'asc')
  // category: string | undefined
}
```
- Good: With Zod
```tsx
import { z } from 'zod'

const productSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  limit: z.number().min(1).max(100).catch(20),
  sort: z.enum(['name', 'price', 'date']).catch('name'),
  order: z.enum(['asc', 'desc']).catch('asc'),
  category: z.string().optional(),
})

type ProductSearch = z.infer<typeof productSearchSchema>

export const Route = createFileRoute('/products')({
  validateSearch: (search) => productSearchSchema.parse(search),
  component: ProductsPage,
})
```
- Good: Updating search params
```tsx
function ProductFilters() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  const updateFilters = (newFilters: Partial<ProductSearch>) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        ...newFilters,
        page: 1,
      }),
    })
  }
}
```

## Navigation Guidelines

### Prefer Link component for navigation
- MEDIUM: Use the `<Link>` component for navigation instead of `useNavigate()` when possible. Links render proper `<a>` tags with valid `href` attributes.
- Bad: Using onClick with navigate - loses standard link behavior
```tsx
function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate({ to: '/posts/$postId', params: { postId: post.id } })}>
      <h2>{post.title}</h2>
    </div>
  )
}
```
- Good: Using Link component
```tsx
function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to="/posts/$postId"
      params={{ postId: post.id }}
      className="post-card"
    >
      <h2>{post.title}</h2>
    </Link>
  )
}
```
- Good: With search params and active states
```tsx
function SortLink({ sort }: { sort: 'asc' | 'desc' }) {
  return (
    <Link
      to="."
      search={(prev) => ({ ...prev, sort })}
      activeProps={{
        className: 'nav-link-active',
        'aria-current': 'page',
      }}
    >
      Sort {sort === 'asc' ? 'Ascending' : 'Descending'}
    </Link>
  )
}
```
- Good: With preloading
```tsx
<Link
  to="/posts/$postId"
  params={{ postId: post.id }}
  preload="intent"
  preloadDelay={100}
>
  {post.title}
</Link>
```
- Use `useNavigate` for programmatic navigation (after form submission, auth, redirects):
```tsx
const createPost = useMutation({
  mutationFn: submitPost,
  onSuccess: (data) => {
    navigate({ to: '/posts/$postId', params: { postId: data.id } })
  },
})
```

## Code Splitting Guidelines

### Use .lazy.tsx for code splitting
- MEDIUM: Split route components into `.lazy.tsx` files to reduce initial bundle size. The main route file keeps critical configuration (path, loaders, search validation), while lazy files contain components that load on-demand.
- Bad: Everything in one file
```tsx
// routes/dashboard.tsx
import { HeavyChartLibrary } from 'heavy-chart-library'
import { ComplexDataGrid } from 'complex-data-grid'

export const Route = createFileRoute('/dashboard')({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(dashboardQueries.stats())
  },
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div>
      <HeavyChartLibrary data={useLoaderData()} />
      <ComplexDataGrid />
    </div>
  )
}
```
- Good: Split into lazy file
```tsx
// routes/dashboard.tsx - Only critical config
export const Route = createFileRoute('/dashboard')({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(dashboardQueries.stats())
  },
})

// routes/dashboard.lazy.tsx - Lazy-loaded component
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard')({
  component: DashboardPage,
  pendingComponent: DashboardSkeleton,
  errorComponent: DashboardError,
})
```
- What goes where:
  - Main route file (routes/example.tsx): path configuration, validateSearch, beforeLoad, loader, loaderDeps, context manipulation
  - Lazy file (routes/example.lazy.tsx): component, pendingComponent, errorComponent, notFoundComponent
- Good: Using getRouteApi in lazy components
```tsx
// routes/posts/$postId.lazy.tsx
const route = getRouteApi('/posts/$postId')

export const Route = createLazyFileRoute('/posts/$postId')({
  component: PostPage,
})

function PostPage() {
  const { postId } = route.useParams()
  const data = route.useLoaderData()
  return <article>{/* ... */}</article>
}
```

### Understand virtual file routes
- LOW: Virtual routes are automatically generated placeholder routes when you have a `.lazy.tsx` file without a corresponding main route file.
- Good: Let virtual routes handle simple pages
```tsx
// Delete routes/settings.tsx entirely!

// routes/settings.lazy.tsx - Only file needed
export const Route = createLazyFileRoute('/settings')({
  component: SettingsPage,
  pendingComponent: SettingsLoading,
  errorComponent: SettingsError,
})
```
- Decision guide:
| Route Has... | Need Main File? | Use Virtual? |
|--------------|-----------------|--------------|
| Only component | No | Yes |
| loader | Yes | No |
| beforeLoad | Yes | No |
| validateSearch | Yes | No |
| loaderDeps | Yes | No |
| Just pendingComponent/errorComponent | No | Yes |

## Preloading Guidelines

### Enable intent-based preloading
- MEDIUM: Configure `defaultPreload: 'intent'` to preload routes when users hover or focus links.
- Bad: No preloading configured
```tsx
const router = createRouter({
  routeTree,
  // No defaultPreload - user waits after every navigation
})
```
- Good: Enable preloading by default
```tsx
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadDelay: 50,
})
```
- Preload strategies:
| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `'intent'` | Preload on hover/focus | Default for most links |
| `'render'` | Preload when Link mounts | Critical next pages |
| `'viewport'` | Preload when Link enters viewport | Below-fold content |
| `false` | No preloading | Heavy, rarely-visited pages |

## Error Handling Guidelines

### Handle not-found routes properly
- HIGH: Configure `notFoundComponent` to handle 404 errors gracefully. Use `notFound()` for programmatic 404 handling.
- Good: Route-specific not found
```tsx
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    if (!post) {
      throw notFound()
    }
    return post
  },
  notFoundComponent: PostNotFound,
  component: PostPage,
})

function PostNotFound() {
  const { postId } = Route.useParams()
  return (
    <div>
      <h1>Post Not Found</h1>
      <p>No post exists with ID: {postId}</p>
      <Link to="/posts">Browse all posts</Link>
    </div>
  )
}
```
- Good: Catch-all route
```tsx
// routes/$.tsx - Catch-all splat route
export const Route = createFileRoute('/$')({
  component: CatchAllNotFound,
})

function CatchAllNotFound() {
  const { _splat } = Route.useParams()
  return (
    <div>
      <h1>Page Not Found</h1>
      <p>No page exists at: /{_splat}</p>
    </div>
  )
}
```

## Route Context Guidelines

### Define context at root route
- LOW: Use `createRootRouteWithContext` to define typed context that flows through your entire route tree.
- Good: Defining context
```tsx
// routes/__root.tsx
interface RouterContext {
  queryClient: QueryClient
  auth: {
    user: User | null
    isAuthenticated: boolean
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})
```
- Good: Providing context when creating router
```tsx
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth,
  },
})
```
- Good: Auth-protected routes
```tsx
// routes/_authenticated.tsx - Layout route for protected pages
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
```

## Router Configuration Guidelines

### Configure router defaults
- HIGH: Set up router with sensible defaults for scroll restoration, error handling, and preloading.
- Example configuration:
```tsx
const router = createRouter({
  routeTree,
  context: { queryClient },

  // Preloading
  defaultPreload: 'intent',
  defaultPreloadDelay: 50,
  defaultPreloadStaleTime: 30000,

  // Scroll restoration
  scrollRestoration: true,

  // Error handling
  defaultErrorComponent: DefaultErrorBoundary,
  defaultNotFoundComponent: NotFoundPage,
})
```

## Custom Search Param Serializers

### Configure custom search param serializers (optional)
- LOW: By default, TanStack Router serializes search params as JSON. For cleaner URLs, use custom serializers.
- Good: Using JSURL for compact URLs
```tsx
import JSURL from 'jsurl2'

const router = createRouter({
  routeTree,
  search: {
    serialize: (search) => JSURL.stringify(search),
    parse: (searchString) => JSURL.parse(searchString) || {},
  },
})
// URL: /products?~(category~'electronics~inStock~true)
```
- Good: Using query-string for flat params
```tsx
import queryString from 'query-string'

const router = createRouter({
  routeTree,
  search: {
    serialize: (search) =>
      queryString.stringify(search, {
        arrayFormat: 'bracket',
        skipNull: true,
      }),
    parse: (searchString) =>
      queryString.parse(searchString, {
        arrayFormat: 'bracket',
        parseBooleans: true,
        parseNumbers: true,
      }),
  },
})
```

## Route Masks

### Use route masks for modal URLs (optional)
- LOW: Route masks let you display one URL while internally routing to another. Useful for modals and overlays.
- Good: Route mask for modal
```tsx
function PostList() {
  return (
    <div>
      {posts.map(post => (
        <Link
          key={post.id}
          to="/posts/$postId"
          params={{ postId: post.id }}
          mask={{
            to: '/posts',
          }}
        >
          {post.title}
        </Link>
      ))}
      <Outlet />
    </div>
  )
}
// User clicks post:
// - URL stays /posts (masked)
// - PostModal renders
// - Share link goes to /posts/$postId (real URL)
```

# Examples:

## Example: Basic File-Based Routing Setup

### Task
Set up a TanStack Router application with file-based routing, including:
- Home page
- Posts list page with search params
- Post detail page with loader
- About page (lazy loaded)

### Implementation

#### router.tsx
```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

#### routes/__root.tsx
```tsx
import { createRootRouteWithContext, Outlet, Link } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/posts">Posts</Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </>
  )
}
```

#### routes/index.tsx
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <h1>Welcome</h1>
}
```

#### routes/posts.tsx
```tsx
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(postsQueries.list())
  },
  component: PostsPage,
})

function PostsPage() {
  const posts = Route.useLoaderData()

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to="/posts/$postId" params={{ postId: post.id }}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
      <Outlet />
    </div>
  )
}
```

#### routes/posts/$postId.tsx
```tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { queryOptions } from '@tanstack/react-query'

const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
  })

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params, context: { queryClient } }) => {
    const post = await queryClient.ensureQueryData(postQueryOptions(params.postId))
    if (!post) throw notFound()
    return post
  },
  notFoundComponent: PostNotFound,
  component: PostDetailPage,
})

function PostDetailPage() {
  const { postId } = Route.useParams()
  const post = Route.useLoaderData()

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}

function PostNotFound() {
  const { postId } = Route.useParams()
  return <div>Post {postId} not found</div>
}
```

#### routes/about.lazy.tsx
```tsx
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <h1>About Us</h1>
}
```

# Convex guidelines
## Function guidelines
### New function syntax
- ALWAYS use the new function syntax for Convex functions. For example:
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
export const f = query({
    args: {},
    handler: async (ctx, args) => {
    // Function body
    },
});
```

### Http endpoint syntax
- HTTP endpoints are defined in `convex/http.ts` and require an `httpAction` decorator. For example:
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
const http = httpRouter();
http.route({
    path: "/echo",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
    const body = await req.bytes();
    return new Response(body, { status: 200 });
    }),
});
```
- HTTP endpoints are always registered at the exact path you specify in the `path` field. For example, if you specify `/api/someRoute`, the endpoint will be registered at `/api/someRoute`.

### Validators
- Below is an example of an array validator:
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
args: {
    simpleArray: v.array(v.union(v.string(), v.number())),
},
handler: async (ctx, args) => {
    //...
},
});
```
- Below is an example of a schema with validators that codify a discriminated union type:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    results: defineTable(
        v.union(
            v.object({
                kind: v.literal("error"),
                errorMessage: v.string(),
            }),
            v.object({
                kind: v.literal("success"),
                value: v.number(),
            }),
        ),
    )
});
```
- Here are the valid Convex types along with their respective validators:
Convex Type  | TS/JS type  |  Example Usage         | Validator for argument validation and schemas  | Notes                                                                                                                                                                                                 |
| ----------- | ------------| -----------------------| -----------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Id          | string      | `doc._id`              | `v.id(tableName)`                              |                                                                                                                                                                                                       |
| Null        | null        | `null`                 | `v.null()`                                     | JavaScript's `undefined` is not a valid Convex value. Functions the return `undefined` or do not return will return `null` when called from a client. Use `null` instead.                             |
| Int64       | bigint      | `3n`                   | `v.int64()`                                    | Int64s only support BigInts between -2^63 and 2^63-1. Convex supports `bigint`s in most modern browsers.                                                                                              |
| Float64     | number      | `3.1`                  | `v.number()`                                   | Convex supports all IEEE-754 double-precision floating point numbers (such as NaNs). Inf and NaN are JSON serialized as strings.                                                                      |
| Boolean     | boolean     | `true`                 | `v.boolean()`                                  |
| String      | string      | `"abc"`                | `v.string()`                                   | Strings are stored as UTF-8 and must be valid Unicode sequences. Strings must be smaller than the 1MB total size limit when encoded as UTF-8.                                                         |
| Bytes       | ArrayBuffer | `new ArrayBuffer(8)`   | `v.bytes()`                                    | Convex supports first class bytestrings, passed in as `ArrayBuffer`s. Bytestrings must be smaller than the 1MB total size limit for Convex types.                                                     |
| Array       | Array       | `[1, 3.2, "abc"]`      | `v.array(values)`                              | Arrays can have at most 8192 values.                                                                                                                                                                  |
| Object      | Object      | `{a: "abc"}`           | `v.object({property: value})`                  | Convex only supports "plain old JavaScript objects" (objects that do not have a custom prototype). Objects can have at most 1024 entries. Field names must be nonempty and not start with "$" or "_". |
| Record      | Record      | `{"a": "1", "b": "2"}` | `v.record(keys, values)`                       | Records are objects at runtime, but can have dynamic keys. Keys must be only ASCII characters, nonempty, and not start with "$" or "_".                                                               |

### Function registration
- Use `internalQuery`, `internalMutation`, and `internalAction` to register internal functions. These functions are private and aren't part of an app's API. They can only be called by other Convex functions. These functions are always imported from `./_generated/server`.
- Use `query`, `mutation`, and `action` to register public functions. These functions are part of the public API and are exposed to the public Internet. Do NOT use `query`, `mutation`, or `action` to register sensitive internal functions that should be kept private.
- You CANNOT register a function through the `api` or `internal` objects.
- ALWAYS include argument validators for all Convex functions. This includes all of `query`, `internalQuery`, `mutation`, `internalMutation`, `action`, and `internalAction`.
- If the JavaScript implementation of a Convex function doesn't have a return value, it implicitly returns `null`.

### Function calling
- Use `ctx.runQuery` to call a query from a query, mutation, or action.
- Use `ctx.runMutation` to call a mutation from a mutation or action.
- Use `ctx.runAction` to call an action from an action.
- ONLY call an action from another action if you need to cross runtimes (e.g. from V8 to Node). Otherwise, pull out the shared code into a helper async function and call that directly instead.
- Try to use as few calls from actions to queries and mutations as possible. Queries and mutations are transactions, so splitting logic up into multiple calls introduces the risk of race conditions.
- All of these calls take in a `FunctionReference`. Do NOT try to pass the callee function directly into one of these calls.
- When using `ctx.runQuery`, `ctx.runMutation`, or `ctx.runAction` to call a function in the same file, specify a type annotation on the return value to work around TypeScript circularity limitations. For example,
```
export const f = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return "Hello " + args.name;
  },
});

export const g = query({
  args: {},
  handler: async (ctx, args) => {
    const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
    return null;
  },
});
```

### Function references
- Function references are pointers to registered Convex functions.
- Use the `api` object defined by the framework in `convex/_generated/api.ts` to call public functions registered with `query`, `mutation`, or `action`.
- Use the `internal` object defined by the framework in `convex/_generated/api.ts` to call internal (or private) functions registered with `internalQuery`, `internalMutation`, or `internalAction`.
- Convex uses file-based routing, so a public function defined in `convex/example.ts` named `f` has a function reference of `api.example.f`.
- A private function defined in `convex/example.ts` named `g` has a function reference of `internal.example.g`.
- Functions can also registered within directories nested within the `convex/` folder. For example, a public function `h` defined in `convex/messages/access.ts` has a function reference of `api.messages.access.h`.

### Api design
- Convex uses file-based routing, so thoughtfully organize files with public query, mutation, or action functions within the `convex/` directory.
- Use `query`, `mutation`, and `action` to define public functions.
- Use `internalQuery`, `internalMutation`, and `internalAction` to define private, internal functions.

### Pagination
- Paginated queries are queries that return a list of results in incremental pages.
- You can define pagination using the following syntax:

```ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
export const listWithExtraArg = query({
    args: { paginationOpts: paginationOptsValidator, author: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
        .query("messages")
        .withIndex("by_author", (q) => q.eq("author", args.author))
        .order("desc")
        .paginate(args.paginationOpts);
    },
});
```
Note: `paginationOpts` is an object with the following properties:
- `numItems`: the maximum number of documents to return (the validator is `v.number()`)
- `cursor`: the cursor to use to fetch the next page of documents (the validator is `v.union(v.string(), v.null())`)
- A query that ends in `.paginate()` returns an object that has the following properties:
- page (contains an array of documents that you fetches)
- isDone (a boolean that represents whether or not this is the last page of documents)
- continueCursor (a string that represents the cursor to use to fetch the next page of documents)


## Validator guidelines
- `v.bigint()` is deprecated for representing signed 64-bit integers. Use `v.int64()` instead.
- Use `v.record()` for defining a record type. `v.map()` and `v.set()` are not supported.

## Schema guidelines
- Always define your schema in `convex/schema.ts`.
- Always import the schema definition functions from `convex/server`.
- System fields are automatically added to all documents and are prefixed with an underscore. The two system fields that are automatically added to all documents are `_creationTime` which has the validator `v.number()` and `_id` which has the validator `v.id(tableName)`.
- Always include all index fields in the index name. For example, if an index is defined as `["field1", "field2"]`, the index name should be "by_field1_and_field2".
- Index fields must be queried in the same order they are defined. If you want to be able to query by "field1" then "field2" and by "field2" then "field1", you must create separate indexes.

## Typescript guidelines
- You can use the helper typescript type `Id` imported from './_generated/dataModel' to get the type of the id for a given table. For example if there is a table called 'users' you can use `Id<'users'>` to get the type of the id for that table.
- If you need to define a `Record` make sure that you correctly provide the type of the key and value in the type. For example a validator `v.record(v.id('users'), v.string())` would have the type `Record<Id<'users'>, string>`. Below is an example of using `Record` with an `Id` type in a query:
```ts
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const exampleQuery = query({
    args: { userIds: v.array(v.id("users")) },
    handler: async (ctx, args) => {
        const idToUsername: Record<Id<"users">, string> = {};
        for (const userId of args.userIds) {
            const user = await ctx.db.get("users", userId);
            if (user) {
                idToUsername[user._id] = user.username;
            }
        }

        return idToUsername;
    },
});
```
- Be strict with types, particularly around id's of documents. For example, if a function takes in an id for a document in the 'users' table, take in `Id<'users'>` rather than `string`.
- Always use `as const` for string literals in discriminated union types.
- When using the `Array` type, make sure to always define your arrays as `const array: Array<T> = [...];`
- When using the `Record` type, make sure to always define your records as `const record: Record<KeyType, ValueType> = {...};`

## Full text search guidelines
- A query for "10 messages in channel '#general' that best match the query 'hello hi' in their body" would look like:

const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);

## Query guidelines
- Do NOT use `filter` in queries. Instead, define an index in the schema and use `withIndex` instead.
- Convex queries do NOT support `.delete()`. Instead, `.collect()` the results, iterate over them, and call `ctx.db.delete(row._id)` on each result.
- Use `.unique()` to get a single document from a query. This method will throw an error if there are multiple documents that match the query.
- When using async iteration, don't use `.collect()` or `.take(n)` on the result of a query. Instead, use the `for await (const row of query)` syntax.
### Ordering
- By default Convex always returns documents in ascending `_creationTime` order.
- You can use `.order('asc')` or `.order('desc')` to pick whether a query is in ascending or descending order. If the order isn't specified, it defaults to ascending.
- Document queries that use indexes will be ordered based on the columns in the index and can avoid slow table scans.


## Mutation guidelines
- Use `ctx.db.replace` to fully replace an existing document. This method will throw an error if the document does not exist. Syntax: `await ctx.db.replace('tasks', taskId, { name: 'Buy milk', completed: false })`
- Use `ctx.db.patch` to shallow merge updates into an existing document. This method will throw an error if the document does not exist. Syntax: `await ctx.db.patch('tasks', taskId, { completed: true })`

## Action guidelines
- Always add `"use node";` to the top of files containing actions that use Node.js built-in modules.
- Never add `"use node";` to a file that also exports queries or mutations. Only actions can run in the Node.js runtime; queries and mutations must stay in the default Convex runtime. If you need Node.js built-ins alongside queries or mutations, put the action in a separate file.
- `fetch()` is available in the default Convex runtime. You do NOT need `"use node";` just to use `fetch()`.
- Never use `ctx.db` inside of an action. Actions don't have access to the database.
- Below is an example of the syntax for an action:
```ts
import { action } from "./_generated/server";

export const exampleAction = action({
    args: {},
    handler: async (ctx, args) => {
        console.log("This action does not return anything");
        return null;
    },
});
```

## Scheduling guidelines
### Cron guidelines
- Only use the `crons.interval` or `crons.cron` methods to schedule cron jobs. Do NOT use the `crons.hourly`, `crons.daily`, or `crons.weekly` helpers.
- Both cron methods take in a FunctionReference. Do NOT try to pass the function directly into one of these methods.
- Define crons by declaring the top-level `crons` object, calling some methods on it, and then exporting it as default. For example,
```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const empty = internalAction({
  args: {},
  handler: async (ctx, args) => {
    console.log("empty");
  },
});

const crons = cronJobs();

// Run `internal.crons.empty` every two hours.
crons.interval("delete inactive users", { hours: 2 }, internal.crons.empty, {});

export default crons;
```
- You can register Convex functions within `crons.ts` just like any other file.
- If a cron calls an internal function, always import the `internal` object from '_generated/api', even if the internal function is registered in the same file.


## File storage guidelines
- Convex includes file storage for large files like images, videos, and PDFs.
- The `ctx.storage.getUrl()` method returns a signed URL for a given file. It returns `null` if the file doesn't exist.
- Do NOT use the deprecated `ctx.storage.getMetadata` call for loading a file's metadata.

Instead, query the `_storage` system table. For example, you can use `ctx.db.system.get` to get an `Id<"_storage">`.
```
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

type FileMetadata = {
    _id: Id<"_storage">;
    _creationTime: number;
    contentType?: string;
    sha256: string;
    size: number;
}

export const exampleQuery = query({
    args: { fileId: v.id("_storage") },
    handler: async (ctx, args) => {
        const metadata: FileMetadata | null = await ctx.db.system.get("_storage", args.fileId);
        console.log(metadata);
        return null;
    },
});
```
- Convex storage stores items as `Blob` objects. You must convert all items to/from a `Blob` when using Convex storage.


# Examples:
## Example: chat-app

### Task
```
Create a real-time chat application backend with AI responses. The app should:
- Allow creating users with names
- Support multiple chat channels
- Enable users to send messages to channels
- Automatically generate AI responses to user messages
- Show recent message history

The backend should provide APIs for:
1. User management (creation)
2. Channel management (creation)
3. Message operations (sending, listing)
4. AI response generation using OpenAI's GPT-4

Messages should be stored with their channel, author, and content. The system should maintain message order
and limit history display to the 10 most recent messages per channel.

```

### Analysis
1. Task Requirements Summary:
- Build a real-time chat backend with AI integration
- Support user creation
- Enable channel-based conversations
- Store and retrieve messages with proper ordering
- Generate AI responses automatically

2. Main Components Needed:
- Database tables: users, channels, messages
- Public APIs for user/channel management
- Message handling functions
- Internal AI response generation system
- Context loading for AI responses

3. Public API and Internal Functions Design:
Public Mutations:
- createUser:
  - file path: convex/index.ts
  - arguments: {name: v.string()}
  - returns: v.object({userId: v.id("users")})
  - purpose: Create a new user with a given name
- createChannel:
  - file path: convex/index.ts
  - arguments: {name: v.string()}
  - returns: v.object({channelId: v.id("channels")})
  - purpose: Create a new channel with a given name
- sendMessage:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels"), authorId: v.id("users"), content: v.string()}
  - returns: v.null()
  - purpose: Send a message to a channel and schedule a response from the AI

Public Queries:
- listMessages:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.array(v.object({
    _id: v.id("messages"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
    }))
  - purpose: List the 10 most recent messages from a channel in descending creation order

Internal Functions:
- generateResponse:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.null()
  - purpose: Generate a response from the AI for a given channel
- loadContext:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.array(v.object({
    _id: v.id("messages"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }))
- writeAgentResponse:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels"), content: v.string()}
  - returns: v.null()
  - purpose: Write an AI response to a given channel

4. Schema Design:
- users
  - validator: { name: v.string() }
  - indexes: <none>
- channels
  - validator: { name: v.string() }
  - indexes: <none>
- messages
  - validator: { channelId: v.id("channels"), authorId: v.optional(v.id("users")), content: v.string() }
  - indexes
    - by_channel: ["channelId"]

5. Background Processing:
- AI response generation runs asynchronously after each user message
- Uses OpenAI's GPT-4 to generate contextual responses
- Maintains conversation context using recent message history


### Implementation

#### package.json
```typescript
{
  "name": "chat-app",
  "description": "This example shows how to build a chat app without authentication.",
  "version": "1.0.0",
  "dependencies": {
    "convex": "^1.31.2",
    "openai": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

#### tsconfig.json
```typescript
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "exclude": ["convex"],
  "include": ["**/src/**/*.tsx", "**/src/**/*.ts", "vite.config.ts"]
}
```

#### convex/index.ts
```typescript
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";

/**
 * Create a user with a given name.
 */
export const createUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", { name: args.name });
  },
});

/**
 * Create a channel with a given name.
 */
export const createChannel = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("channels", { name: args.name });
  },
});

/**
 * List the 10 most recent messages from a channel in descending creation order.
 */
export const listMessages = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
    return messages;
  },
});

/**
 * Send a message to a channel and schedule a response from the AI.
 */
export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    authorId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    const user = await ctx.db.get(args.authorId);
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: args.authorId,
      content: args.content,
    });
    await ctx.scheduler.runAfter(0, internal.index.generateResponse, {
      channelId: args.channelId,
    });
    return null;
  },
});

const openai = new OpenAI();

export const generateResponse = internalAction({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(internal.index.loadContext, {
      channelId: args.channelId,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: context,
    });
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }
    await ctx.runMutation(internal.index.writeAgentResponse, {
      channelId: args.channelId,
      content,
    });
    return null;
  },
});

export const loadContext = internalQuery({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);

    const result = [];
    for (const message of messages) {
      if (message.authorId) {
        const user = await ctx.db.get(message.authorId);
        if (!user) {
          throw new Error("User not found");
        }
        result.push({
          role: "user" as const,
          content: `${user.name}: ${message.content}`,
        });
      } else {
        result.push({ role: "assistant" as const, content: message.content });
      }
    }
    return result;
  },
});

export const writeAgentResponse = internalMutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      content: args.content,
    });
    return null;
  },
});
```

#### convex/schema.ts
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  channels: defineTable({
    name: v.string(),
  }),

  users: defineTable({
    name: v.string(),
  }),

  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }).index("by_channel", ["channelId"]),
});
```

#### convex/tsconfig.json
```typescript
{
  /* This TypeScript project config describes the environment that
   * Convex functions run in and is used to typecheck them.
   * You can modify it, but some settings required to use Convex.
   */
  "compilerOptions": {
    /* These settings are not required by Convex and can be modified. */
    "allowJs": true,
    "strict": true,
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,

    /* These compiler options are required by Convex */
    "target": "ESNext",
    "lib": ["ES2021", "dom"],
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["./**/*"],
  "exclude": ["./_generated"]
}
```

#### src/App.tsx
```typescript
export default function App() {
  return <div>Hello World</div>;
}
```
