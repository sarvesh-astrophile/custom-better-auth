# coss ui Migration Specification

## Overview

This document outlines the complete migration plan from the current shadcn/ui + Base UI hybrid setup to coss ui components in the `apps/web` application.

## Current State

### Component Inventory
| Component | Location | Primitive | Notes |
|-----------|----------|-----------|-------|
| Button | `components/ui/button.tsx` | `@base-ui/react/button` | Uses CVA for variants |
| Input | `components/ui/input.tsx` | `@base-ui/react/input` | Simple wrapper |
| Label | `components/ui/label.tsx` | Native `<label>` | No primitive |
| Card | `components/ui/card.tsx` | Native `<div>` | Compound component |
| Checkbox | `components/ui/checkbox.tsx` | `@base-ui/react/checkbox` | Uses CheckIcon |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | `@base-ui/react/menu` | Full compound API |
| Skeleton | `components/ui/skeleton.tsx` | Native `<div>` | Simple animate-pulse |
| Sonner | `components/ui/sonner.tsx` | `sonner` package | Toast notifications |

### Usage Locations
- `sign-in-form.tsx`: Button, Input, Label
- `sign-up-form.tsx`: Button, Input, Label
- `user-menu.tsx`: Button, DropdownMenu (full compound)
- `header.tsx`: No UI components

## Migration Decisions

| Aspect | Decision |
|--------|----------|
| Styling | Full coss ui patterns (CSS variables, data attributes) |
| Form library | Keep TanStack Form + integrate coss Field |
| Notifications | Replace Sonner with coss Toast |
| Menu naming | Adopt `Menu` naming (drop "Dropdown" prefix) |
| Migration pace | All at once |
| Theme | Adopt coss ui theme structure |
| Error display | Use coss Alert for validation errors |
| File structure | Update in place at `@/components/ui/` |
| Dependencies | Remove `shadcn`, `next-themes`; Keep `class-variance-authority` |

---

## Phase 1: Dependencies & Theme Setup

### 1.1 Update Dependencies

**Remove:**
```bash
bun remove shadcn next-themes sonner
```

**Keep:**
- `@base-ui/react` (already installed)
- `class-variance-authority` (for custom components)

### 1.2 Update CSS Variables

Update `apps/web/src/index.css` with coss ui color tokens:

```css
@import "tailwindcss";

@theme inline {
  /* coss ui additional tokens */
  --color-destructive-foreground: var(--destructive-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}

:root {
  /* Existing tokens remain */
  --destructive-foreground: var(--color-red-700);
  --info: var(--color-blue-500);
  --info-foreground: var(--color-blue-50);
  --success: var(--color-green-500);
  --success-foreground: var(--color-green-50);
  --warning: var(--color-amber-500);
  --warning-foreground: var(--color-amber-50);
}

.dark {
  --destructive-foreground: var(--color-red-400);
  --info: var(--color-blue-400);
  --info-foreground: var(--color-blue-950);
  --success: var(--color-green-400);
  --success-foreground: var(--color-green-950);
  --warning: var(--color-amber-400);
  --warning-foreground: var(--color-amber-950);
}
```

### 1.3 Remove Theme Provider

Remove `next-themes` usage from root layout if present.

---

## Phase 2: Component Migration

### 2.1 Button

**Before (`components/ui/button.tsx`):**
```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        outline: "border-border bg-background hover:bg-muted...",
        // ...
      },
      size: {
        default: "h-8 gap-1.5 px-2.5...",
        // ...
      },
    },
  }
);

function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

**After (coss ui Button):**
```tsx
import type { ButtonHTMLAttributes } from "react";

import { useRender } from "@base-ui/react/utils/use-render";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "destructive-outline" | "ghost" | "link" | "outline" | "secondary";
  size?: "default" | "icon" | "icon-lg" | "icon-sm" | "icon-xl" | "icon-xs" | "lg" | "sm" | "xl" | "xs";
  render?: React.ReactElement;
};

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: ButtonProps) {
  const { renderElement } = useRender({
    render: render ?? <button />,
    props: {
      className: cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-none text-xs font-medium",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-all [&_svg]:pointer-events-none [&_svg]:shrink-0",
        // Variant styles
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/80",
        variant === "outline" && "border border-input bg-background hover:bg-muted",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "hover:bg-muted hover:text-foreground",
        variant === "destructive" && "bg-destructive/10 text-destructive hover:bg-destructive/20",
        variant === "destructive-outline" && "border border-destructive/50 text-destructive hover:bg-destructive/10",
        variant === "link" && "text-primary underline-offset-4 hover:underline",
        // Size styles
        size === "default" && "h-8 px-2.5",
        size === "sm" && "h-7 px-2.5 text-xs",
        size === "lg" && "h-9 px-3",
        size === "xl" && "h-10 px-4",
        size === "xs" && "h-6 px-2 text-xs",
        size === "icon" && "size-8",
        size === "icon-sm" && "size-7",
        size === "icon-lg" && "size-9",
        size === "icon-xl" && "size-10",
        size === "icon-xs" && "size-6",
        className
      ),
      ...props,
    },
  });

  return renderElement;
}

export { Button };
export type { ButtonProps };
```

**Usage Change:**
```tsx
// Before
<Button variant="outline" className="w-full">

// After (same API, different internals)
<Button variant="outline" className="w-full">
```

---

### 2.2 Input

**Before (`components/ui/input.tsx`):**
```tsx
import { Input as InputPrimitive } from "@base-ui/react/input";

function Input({ className, type, ...props }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "dark:bg-input/30 border-input focus-visible:border-ring...",
        className
      )}
      {...props}
    />
  );
}
```

**After (coss ui Input):**
```tsx
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<typeof InputPrimitive> & {
  size?: "sm" | "default" | "lg" | number;
  unstyled?: boolean;
};

function Input({
  className,
  size: sizeProp = "default",
  unstyled = false,
  ...props
}: InputProps) {
  const size = typeof sizeProp === "number" ? sizeProp : undefined;
  const sizeClass = typeof sizeProp === "string"
    ? sizeProp === "sm" && "h-7"
    : sizeProp === "lg" && "h-9"
    : "h-8";

  return (
    <InputPrimitive
      data-slot="input"
      size={size}
      className={cn(
        !unstyled && [
          "border-input bg-transparent px-2.5 py-1 text-xs",
          "rounded-none border transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-muted-foreground",
          "dark:bg-input/30",
          sizeClass,
        ],
        className
      )}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
```

---

### 2.3 Field (replaces Label pattern)

**New file: `components/ui/field.tsx`**

```tsx
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "text-xs font-medium leading-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn("text-xs text-destructive-foreground", className)}
      {...props}
    />
  );
}

export { Field, FieldLabel, FieldDescription, FieldError };
```

**Usage in Forms (Before):**
```tsx
<div className="space-y-2">
  <Label htmlFor={field.name}>Email</Label>
  <Input
    id={field.name}
    name={field.name}
    type="email"
    value={field.state.value}
    onBlur={field.handleBlur}
    onChange={(e) => field.handleChange(e.target.value)}
  />
  {field.state.meta.errors.map((error) => (
    <p key={error?.message} className="text-red-500">
      {error?.message}
    </p>
  ))}
</div>
```

**Usage in Forms (After):**
```tsx
<Field
  name={field.name}
  invalid={field.state.meta.errors.length > 0}
>
  <FieldLabel>Email</FieldLabel>
  <Input
    type="email"
    value={field.state.value}
    onBlur={field.handleBlur}
    onChange={(e) => field.handleChange(e.target.value)}
  />
  {field.state.meta.errors.map((error) => (
    <FieldError key={error?.message}>
      {error?.message}
    </FieldError>
  ))}
</Field>
```

---

### 2.4 Menu (replaces DropdownMenu)

**Before (`components/ui/dropdown-menu.tsx`):**
- Uses `Menu` from `@base-ui/react/menu`
- Compound pattern: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, etc.

**After (`components/ui/menu.tsx`):**
```tsx
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Menu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="menu" {...props} />;
}

function MenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />;
}

function MenuPopup({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="menu-popup"
          className={cn(
            "bg-popover text-popover-foreground min-w-32 rounded-none shadow-md",
            "ring-1 ring-foreground/10",
            "data-open:animate-in data-closed:animate-out",
            "data-closed:fade-out-0 data-open:fade-in-0",
            "data-closed:zoom-out-95 data-open:zoom-in-95",
            "origin-(--transform-origin) z-50",
            "max-h-(--available-height) overflow-x-hidden overflow-y-auto",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function MenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />;
}

function MenuGroupLabel({ className, inset, ...props }: MenuPrimitive.GroupLabel.Props & { inset?: boolean }) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menu-group-label"
      data-inset={inset}
      className={cn(
        "text-muted-foreground px-2 py-2 text-xs",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

function MenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs",
        "outline-hidden select-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        inset && "pl-8",
        variant === "destructive" && [
          "text-destructive-foreground",
          "focus:bg-destructive/10 focus:text-destructive",
        ],
        className
      )}
      {...props}
    />
  );
}

function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="menu-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

// Aliases for backward compatibility during transition
const DropdownMenu = Menu;
const DropdownMenuTrigger = MenuTrigger;
const DropdownMenuContent = MenuPopup;
const DropdownMenuGroup = MenuGroup;
const DropdownMenuLabel = MenuGroupLabel;
const DropdownMenuItem = MenuItem;
const DropdownMenuSeparator = MenuSeparator;

export {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  // Aliases
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
```

**Usage Change (user-menu.tsx):**

```tsx
// Before
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// After
import {
  Menu,
  MenuPopup,
  MenuGroup,
  MenuItem,
  MenuGroupLabel,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";

// Component usage
<Menu>
  <MenuTrigger render={<Button variant="outline" />}>
    {user?.name}
  </MenuTrigger>
  <MenuPopup className="bg-card">
    <MenuGroup>
      <MenuGroupLabel>My Account</MenuGroupLabel>
      <MenuSeparator />
      <MenuItem>{user?.email}</MenuItem>
      <MenuItem
        variant="destructive"
        onClick={() => {
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                location.reload();
              },
            },
          });
        }}
      >
        Sign Out
      </MenuItem>
    </MenuGroup>
  </MenuPopup>
</Menu>
```

---

### 2.5 Toast (replaces Sonner)

**New file: `components/ui/toast.tsx`**

```tsx
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { createContext, useContext, useState } from "react";

import { cn } from "@/lib/utils";

// Toast Manager
type ToastData = {
  id: string;
  title?: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
};

type ToastContextType = {
  toasts: ToastData[];
  add: (toast: Omit<ToastData, "id">) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

function ToastProvider({
  children,
  position = "bottom-right",
}: {
  children: React.ReactNode;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const add = (toast: Omit<ToastData, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-center": "top-0 left-1/2 -translate-x-1/2",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      <ToastPrimitive.Provider>
        {children}
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          className={cn(
            "fixed z-50 flex flex-col gap-2 p-4",
            positionClasses[position]
          )}
        >
          {toasts.map((toast) => (
            <ToastPrimitive.Root
              key={toast.id}
              data-slot="toast"
              data-type={toast.type}
              className={cn(
                "bg-card text-card-foreground rounded-none shadow-lg",
                "ring-1 ring-foreground/10",
                "data-open:animate-in data-closed:animate-out",
                "data-closed:fade-out-0 data-open:fade-in-0",
                "data-closed:slide-out-to-right data-open:slide-in-from-right",
                "p-4 pr-8 relative"
              )}
            >
              {toast.title && (
                <ToastPrimitive.Title className="text-sm font-medium">
                  {toast.title}
                </ToastPrimitive.Title>
              )}
              {toast.description && (
                <ToastPrimitive.Description className="text-xs text-muted-foreground">
                  {toast.description}
                </ToastPrimitive.Description>
              )}
              <ToastPrimitive.Close
                className="absolute right-2 top-2 opacity-50 hover:opacity-100"
                onClick={() => remove(toast.id)}
              >
                ×
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          ))}
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Convenience functions matching sonner API
const toast = {
  success: (message: string, options?: { description?: string }) => {
    // This will be called via useToast hook in components
  },
  error: (message: string, options?: { description?: string }) => {
    // This will be called via useToast hook in components
  },
};

export { ToastProvider, useToast, toast };
```

**Usage Change (sign-in-form.tsx):**

```tsx
// Before
import { toast } from "sonner";

toast.success("Sign in successful");
toast.error(error.error.message || error.error.statusText);

// After
import { useToast } from "@/components/ui/toast";

function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const { add } = useToast();

  // In onSubmit:
  add({
    title: "Sign in successful",
    type: "success",
  });

  add({
    title: error.error.message || error.error.statusText,
    type: "error",
  });
}
```

**Root Layout Update:**
```tsx
// Add ToastProvider to __root.tsx
import { ToastProvider } from "@/components/ui/toast";

export default function RootComponent() {
  return (
    <ToastProvider position="bottom-right">
      {/* existing content */}
    </ToastProvider>
  );
}
```

---

### 2.6 Card

**Before (`components/ui/card.tsx`):**
- Custom compound component with `data-slot` attributes

**After (coss ui Card):**
```tsx
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground rounded-none shadow-sm",
        "ring-1 ring-foreground/10",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("self-start", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-4 pt-0", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-4 pt-0", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
```

---

### 2.7 Skeleton

**After (coss ui Skeleton):**
```tsx
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse bg-muted rounded-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
```

---

### 2.8 Checkbox

**After (coss ui Checkbox):**
```tsx
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "size-4 shrink-0 rounded-none border border-input",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary",
        "dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
```

---

## Phase 3: Delete Old Components

After all migrations are complete:

1. Delete `components/ui/dropdown-menu.tsx` (replaced by `menu.tsx`)
2. Delete `components/ui/sonner.tsx`
3. Delete `components.json` (shadcn config)

---

## Phase 4: Update Application Components

### 4.1 sign-in-form.tsx

```tsx
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";

import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({ from: "/" });
  const { add: toast } = useToast();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({ to: "/dashboard" });
            toast({ title: "Sign in successful", type: "success" });
          },
          onError: (error) => {
            toast({
              title: error.error.message || error.error.statusText,
              type: "error",
            });
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="email">
          {(field) => (
            <Field
              name={field.name}
              invalid={field.state.meta.errors.length > 0}
            >
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError key={error?.message}>{error?.message}</FieldError>
              ))}
            </Field>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field
              name={field.name}
              invalid={field.state.meta.errors.length > 0}
            >
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <FieldError key={error?.message}>{error?.message}</FieldError>
              ))}
            </Field>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Submitting..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Need an account? Sign Up
        </Button>
      </div>
    </div>
  );
}
```

### 4.2 sign-up-form.tsx

Same pattern as sign-in-form.tsx with additional name field.

### 4.3 user-menu.tsx

```tsx
import { api } from "@custom-better-auth/backend/convex/_generated/api";
import { useQuery } from "convex/react";

import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";

export default function UserMenu() {
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>
        {user?.name}
      </MenuTrigger>
      <MenuPopup className="bg-card">
        <MenuGroup>
          <MenuGroupLabel>My Account</MenuGroupLabel>
          <MenuSeparator />
          <MenuItem>{user?.email}</MenuItem>
          <MenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    location.reload();
                  },
                },
              });
            }}
          >
            Sign Out
          </MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
```

---

## Phase 5: Root Layout Integration

Update `apps/web/src/routes/__root.tsx`:

```tsx
import { ToastProvider } from "@/components/ui/toast";

// Wrap the existing content with ToastProvider
export default function RootComponent() {
  return (
    <ToastProvider position="bottom-right">
      {/* existing root content */}
    </ToastProvider>
  );
}
```

---

## Component Mapping Summary

| Current Component | New Component | Import Path |
|-------------------|---------------|-------------|
| `Button` | `Button` | `@/components/ui/button` |
| `Input` | `Input` | `@/components/ui/input` |
| `Label` | `Field`, `FieldLabel` | `@/components/ui/field` |
| `DropdownMenu` | `Menu` | `@/components/ui/menu` |
| `DropdownMenuTrigger` | `MenuTrigger` | `@/components/ui/menu` |
| `DropdownMenuContent` | `MenuPopup` | `@/components/ui/menu` |
| `DropdownMenuItem` | `MenuItem` | `@/components/ui/menu` |
| `DropdownMenuLabel` | `MenuGroupLabel` | `@/components/ui/menu` |
| `DropdownMenuSeparator` | `MenuSeparator` | `@/components/ui/menu` |
| `Card`, `CardHeader`, etc. | Same names | `@/components/ui/card` |
| `Checkbox` | `Checkbox` | `@/components/ui/checkbox` |
| `Skeleton` | `Skeleton` | `@/components/ui/skeleton` |
| `toast` (sonner) | `useToast` | `@/components/ui/toast` |

---

## Files to Delete

- `apps/web/components.json`
- `apps/web/src/components/ui/dropdown-menu.tsx`
- `apps/web/src/components/ui/sonner.tsx`
- `apps/web/src/components/ui/label.tsx` (replaced by field.tsx)

---

## Testing Checklist

- [ ] Sign in form submits correctly
- [ ] Sign up form submits correctly
- [ ] Form validation errors display properly
- [ ] Toast notifications appear on success/error
- [ ] User menu opens and closes correctly
- [ ] Sign out works and reloads page
- [ ] All existing UI visual consistency maintained
- [ ] Dark mode still works (if applicable)
- [ ] Keyboard navigation works in menus
- [ ] Focus states are visible

---

## Rollback Plan

If issues arise, revert via git:
```bash
git checkout HEAD~1 -- apps/web/src/components/ui/
git checkout HEAD~1 -- apps/web/src/components/sign-in-form.tsx
git checkout HEAD~1 -- apps/web/src/components/sign-up-form.tsx
git checkout HEAD~1 -- apps/web/src/components/user-menu.tsx
bun add shadcn sonner next-themes
```
