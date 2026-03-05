# Organization Feature - Frontend Implementation Spec

## Overview

This document covers the frontend implementation for the Better Auth organization feature, including UI components, routing, state management, and user interactions using coss ui components.

## Design Decisions Summary

### Onboarding
- **Force org creation**: New users without an organization are immediately redirected to create one
- **No org limit**: Users can create unlimited organizations
- **Post-create redirect**: After creating an org, redirect to dashboard

### Navigation
- **Switcher position**: Header, left side after main nav items
- **Mobile switcher**: Collapsible header that expands to show org switcher
- **Settings nav**: Top tabs for General/Members sections

### Member Management
- **Single invite**: One email at a time (not bulk)
- **Pending display**: Inline with active members, pending badge, sorted first
- **Default sort**: Newest members first, pending invites above active

### Permissions (UI-level)
- **Owner/Admin split**: Owners and Admins can manage members; only Owner can change org settings
- **Owner protection**: Owner cannot change own role or leave without transferring ownership

---

## Routes Structure

### New Routes

```
/create-organization          # Full-page org creation (forced for new users)
/dashboard/org/settings       # Organization settings with tabs
/dashboard/org/members        # Member management (integrated via tabs)
```

### Route Guards

1. **No Organization Check**: In root route `beforeLoad`, check if user has organizations
   - If no orgs exist → redirect to `/create-organization`
   - Exception: Allow access to `/create-organization` and auth routes

2. **Organization Context**: Load active organization in dashboard routes
   - Use session's `activeOrganizationId` or first org in list

---

## Components

### 1. OrganizationSwitcher

**Location**: `apps/web/src/components/organization-switcher.tsx`

**Position**: Header, left side after main navigation, right before user menu area

**coss ui Components**:
- `Menu` (trigger, content, item)
- `Avatar`
- `Badge`

**Trigger UI**:
- Organization avatar (two initials fallback) + name + chevron icon
- Collapsible on mobile

**Dropdown Content**:
- List of user's organizations, each row showing:
  - Avatar (logo URL or two initials)
  - Organization name
  - Member count (e.g., "5 members")
  - Active badge for current org
- Separator
- "Create Organization" option (always visible)
- Separator
- "Organization Settings" link

**Behavior**:
- Immediate switch on click (updates session's `activeOrganizationId`)
- Load all orgs at once (no search needed)
- Mobile: Collapsible header that expands on tap

```tsx
// Structure
<Menu>
  <Menu.Trigger>
    <Avatar src={org.logo} fallback={getInitials(org.name)} />
    <span>{org.name}</span>
    <ChevronDown />
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Content>
      {orgs.map(org => (
        <Menu.Item key={org.id} onClick={() => switchOrg(org.id)}>
          <Avatar src={org.logo} fallback={getInitials(org.name)} size="sm" />
          <span>{org.name}</span>
          <span>{org.memberCount} members</span>
          {isActive && <Badge>Active</Badge>}
        </Menu.Item>
      ))}
      <Menu.Separator />
      <Menu.Item onClick={openCreateOrg}>Create Organization</Menu.Item>
    </Menu.Content>
  </Menu.Portal>
</Menu>
```

---

### 2. CreateOrganizationPage

**Location**: `apps/web/src/routes/create-organization.tsx`

**Layout**: Full-page centered form

**coss ui Components**:
- `Field`, `FieldLabel`, `FieldError`
- `Input`
- `Button`
- `Card` (optional container)

**Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | text | Yes | Min 2 chars |
| Slug | text | Yes | Real-time availability check |
| Logo URL | text | No | Valid URL format |
| Description | text | No | Max 500 chars |

**Slug Behavior**:
- Always visible field
- Auto-generated from name (lowercase, alphanumeric, hyphens)
- User can override
- Real-time validation with debounced API call (300ms)
- Warning state + suggestion when taken: "Taken, try: my-org-2"

**Error Handling**:
- Inline errors for field validation
- Toast for submit/network errors

**Success Flow**:
- Redirect to `/dashboard`

```tsx
// Slug validation state
type SlugState = 'idle' | 'checking' | 'available' | 'taken';

// Form structure
<form onSubmit={handleSubmit}>
  <Field name="name">
    <FieldLabel>Organization Name</FieldLabel>
    <Input />
    <FieldError />
  </Field>

  <Field name="slug">
    <FieldLabel>Slug</FieldLabel>
    <Input />
    {slugState === 'checking' && <Spinner />}
    {slugState === 'taken' && <Warning>suggestion: {suggestedSlug}</Warning>}
    <FieldError />
  </Field>

  <Field name="logo">
    <FieldLabel>Logo URL (optional)</FieldLabel>
    <Input type="url" />
  </Field>

  <Field name="description">
    <FieldLabel>Description (optional)</FieldLabel>
    <Textarea />
  </Field>

  <Button type="submit">Create Organization</Button>
</form>
```

---

### 3. OrganizationSettingsPage

**Location**: `apps/web/src/routes/dashboard/org/settings.tsx`

**Layout**: Dashboard layout with top tabs

**Tabs**:
1. **General** - Name, Slug, Logo URL, Description
2. **Members** - Member list and invites (same as `/members` route)

**coss ui Components**:
- `Tabs`
- `Field`, `FieldLabel`, `FieldError`
- `Input`, `Textarea`
- `Button`
- `Toast`

**General Tab Fields**:
- Same fields as creation form
- Slug editable by owners only (with warning dialog)
- Logo URL only (no file upload)

**Permissions**:
- Only owners can edit General settings
- Admins/members see read-only view

**Save Behavior**:
- Toast notification on successful save
- Optimistic UI update

```tsx
<Tabs defaultValue="general">
  <Tabs.List>
    <Tabs.Tab value="general">General</Tabs.Tab>
    <Tabs.Tab value="members">Members</Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="general">
    <GeneralSettingsForm />
  </Tabs.Panel>

  <Tabs.Panel value="members">
    <MembersTab />
  </Tabs.Panel>
</Tabs>
```

---

### 4. MembersTab (Member Management)

**Location**: `apps/web/src/components/organization/members-tab.tsx`

**Layout**: Member list with search/filter bar, inline pending invites

**coss ui Components**:
- `Table`
- `Input` (search)
- `Select` (role filter)
- `Button`
- `Badge`
- `Avatar`
- `Menu` (actions dropdown)
- `Dialog` (confirmations)
- `Spinner`, `Skeleton`
- `Empty` (empty state)

**Toolbar**:
- Search input (filter by name/email)
- Role filter dropdown (All, Owner, Admin, Member, Pending)
- Sort dropdown (Newest first, Alphabetical, By role)
- Refresh button (manual)
- Invite Member button

**Member Table Columns**:
| Column | Content |
|--------|---------|
| Member | Avatar + Name, Email on hover/tooltip |
| Role | Badge (Owner/Admin/Member/Pending) |
| Joined | Date (or "Invited by [name]" for pending) |
| Actions | Three-dot Menu (hidden for owner's own row) |

**Pending Invites**:
- Show inline with "Pending" badge
- Displayed above active members
- Show "Invited by [name]" in joined column
- Copy invite link button in actions
- Resend invite button in actions
- Cancel invite (immediate, no confirmation)

**Empty State**:
- Friendly illustration
- "No members yet" message
- "Invite your first member" CTA button

**Loading State**:
- Skeleton rows matching table structure

```tsx
// Member table row
<Table.Row>
  <Table.Cell>
    <Avatar src={member.image} fallback={getInitials(member.name)} />
    <div>
      <div>{member.name}</div>
      <div>{member.email}</div>
    </div>
  </Table.Cell>
  <Table.Cell>
    <Badge variant={getRoleVariant(member.role)}>{member.role}</Badge>
  </Table.Cell>
  <Table.Cell>
    {member.status === 'pending'
      ? `Invited by ${member.invitedBy}`
      : formatDate(member.joinedAt)}
  </Table.Cell>
  <Table.Cell>
    {canManage(member) && (
      <MemberActionsMenu member={member} />
    )}
  </Table.Cell>
</Table.Row>
```

---

### 5. InviteMemberDialog

**Location**: `apps/web/src/components/organization/invite-member-dialog.tsx`

**coss ui Components**:
- `Dialog`
- `Field`, `FieldLabel`, `FieldError`
- `Input`
- `Select`
- `Button`

**Fields**:
| Field | Type | Required |
|-------|------|----------|
| Email | email | Yes |
| Role | select | Yes (default: Member) |

**Role Select**:
- Simple dropdown with Owner/Admin/Member
- No descriptions (keep it simple)

**Success Behavior**:
- Show success toast
- Keep dialog open (for inviting more)
- Reset form fields

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Invite Member</Dialog.Title>
    </Dialog.Header>

    <form onSubmit={handleInvite}>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
        <FieldError />
      </Field>

      <Field name="role">
        <FieldLabel>Role</FieldLabel>
        <Select defaultValue="member">
          <Select.Item value="member">Member</Select.Item>
          <Select.Item value="admin">Admin</Select.Item>
          <Select.Item value="owner">Owner</Select.Item>
        </Select>
      </Field>

      <Dialog.Actions>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Send Invite</Button>
      </Dialog.Actions>
    </form>
  </Dialog.Content>
</Dialog>
```

---

### 6. MemberActionsMenu

**Location**: `apps/web/src/components/organization/member-actions-menu.tsx`

**coss ui Components**:
- `Menu`

**Actions by Role/Status**:

| Action | Owner | Admin | Member | Pending |
|--------|-------|-------|--------|---------|
| Change Role | - | ✓ | ✓ | - |
| Remove | - | ✓ | ✓ | - |
| Resend Invite | - | - | - | ✓ |
| Copy Invite Link | - | - | - | ✓ |
| Cancel Invite | - | - | - | ✓ |

**Note**: Owner row has no actions menu (badge only)

**Role Change Flow**:
1. Click "Change Role" → Opens confirmation dialog
2. Dialog shows Menu items for each role
3. Select role → Confirm button
4. On confirm → Update role, close dialog, show toast

```tsx
<Menu>
  <Menu.Trigger>
    <Button variant="ghost" size="icon">
      <MoreHorizontal />
    </Button>
  </Menu.Trigger>
  <Menu.Content>
    {member.status !== 'pending' && (
      <>
        <Menu.Item onClick={openRoleChangeDialog}>Change Role</Menu.Item>
        <Menu.Item onClick={openRemoveDialog}>Remove</Menu.Item>
      </>
    )}
    {member.status === 'pending' && (
      <>
        <Menu.Item onClick={resendInvite}>Resend Invite</Menu.Item>
        <Menu.Item onClick={copyInviteLink}>Copy Invite Link</Menu.Item>
        <Menu.Separator />
        <Menu.Item onClick={cancelInvite}>Cancel Invite</Menu.Item>
      </>
    )}
  </Menu.Content>
</Menu>
```

---

### 7. Confirmation Dialogs

**Location**: `apps/web/src/components/organization/confirmation-dialogs.tsx`

**coss ui Components**:
- `Dialog`
- `Button`

#### Remove Member Dialog
- Title: "Remove [name]?"
- Description: "They will lose access to all organization resources."
- Actions: Cancel / Remove

#### Leave Organization Dialog
- Triggered from user menu
- Title: "Leave [org name]?"
- Description: "You will lose access to all organization resources."
- Actions: Cancel / Leave
- Note: Not available for owners (must transfer first)

#### Transfer Ownership Dialog
- Triggered from danger zone
- Title: "Transfer Ownership"
- Description: "Select a member to become the new owner"
- Content: Member select dropdown
- Warning: "You will become an admin after transfer"
- Actions: Cancel / Transfer

#### Cancel Invite
- Immediate action, no confirmation
- Show toast: "Invitation cancelled"

---

### 8. Danger Zone

**Location**: Within OrganizationSettingsPage (General tab bottom)

**Contents**:
- Transfer Ownership section (owners only)
  - Button to open transfer dialog
- Leave Organization section (non-owners only)
  - Button to leave with confirmation

**Note**: Organization deletion is disabled in backend

```tsx
<Card className="border-destructive">
  <Card.Header>
    <Card.Title>Danger Zone</Card.Title>
  </Card.Header>
  <Card.Content>
    {isOwner && (
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Transfer Ownership</div>
          <div className="text-muted-foreground">
            Transfer this organization to another member
          </div>
        </div>
        <Button variant="outline" onClick={openTransferDialog}>
          Transfer
        </Button>
      </div>
    )}

    {!isOwner && (
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Leave Organization</div>
          <div className="text-muted-foreground">
            You will lose access to all resources
          </div>
        </div>
        <Button variant="destructive" onClick={openLeaveDialog}>
          Leave
        </Button>
      </div>
    )}
  </Card.Content>
</Card>
```

---

### 9. User Menu Updates

**Location**: `apps/web/src/components/user-menu.tsx`

**Additions**:
- Organization section header
- "Leave Organization" option (for non-owners)

```tsx
<Menu>
  {/* ... existing user items ... */}
  <Menu.Separator />
  <Menu.Group>
    <Menu.Label>Organization</Menu.Label>
    {!isOwner && (
      <Menu.Item onClick={openLeaveDialog}>
        Leave Organization
      </Menu.Item>
    )}
  </Menu.Group>
</Menu>
```

---

### 10. Dashboard Header

**Location**: `apps/web/src/routes/dashboard.tsx` (or layout)

**Updates**:
- Show current organization name and logo in header
- Use `Avatar` + text

```tsx
<header>
  <div className="flex items-center gap-2">
    <Avatar src={org.logo} fallback={getInitials(org.name)} size="sm" />
    <h1>{org.name}</h1>
  </div>
</header>
```

---

## State Management

### React Query Keys

```tsx
// Organization queries
['organizations']                    // List of user's organizations
['organization', orgId]              // Single organization details
['organization', orgId, 'members']   // Members list with pending invites

// Slug validation
['slug-available', slug]             // Real-time slug check
```

### Auth Client Extensions

```tsx
// In auth-client.ts
export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    organizationClient({
      // Client-side organization methods available:
      // - organization.create()
      // - organization.update()
      // - organization.delete()
      // - organization.getFullOrganization()
      // - organization.setActive()
      // - member.list()
      // - member.invite()
      // - member.remove()
      // - member.updateRole()
      // - invitation.create()
      // - invitation.cancel()
      // - invitation.accept()
      // - invitation.get()
      // - invitation.list()
    }),
  ],
});
```

---

## Utility Functions

### Avatar Initials

```tsx
// apps/web/src/lib/utils.ts
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
```

### Slug Generation

```tsx
// apps/web/src/lib/utils.ts
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

---

## Loading States

### Skeleton Patterns

```tsx
// Member list skeleton
<Table>
  {Array.from({ length: 5 }).map((_, i) => (
    <Table.Row key={i}>
      <Table.Cell><Skeleton className="h-10 w-10 rounded-full" /></Table.Cell>
      <Table.Cell><Skeleton className="h-4 w-32" /></Table.Cell>
      <Table.Cell><Skeleton className="h-4 w-16" /></Table.Cell>
      <Table.Cell><Skeleton className="h-4 w-24" /></Table.Cell>
      <Table.Cell><Skeleton className="h-8 w-8" /></Table.Cell>
    </Table.Row>
  ))}
</Table>
```

---

## Error Handling

### Form Errors
- **Inline**: Field validation errors under each field
- **Toast**: Network/submit errors

### Error Messages

| Scenario | Message |
|----------|---------|
| Slug taken | "This slug is already taken" |
| Invite failed | "Failed to send invitation. Please try again." |
| Remove failed | "Failed to remove member. Please try again." |
| Leave failed | "Failed to leave organization. Please try again." |
| Transfer failed | "Failed to transfer ownership. Please try again." |

---

## Responsive Design

### Breakpoints

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Org Switcher | Collapsible header | Avatar + name | Avatar + name |
| Member Table | Card list | Table | Table |
| Settings | Stacked sections | Stacked sections | Stacked sections |
| Create Form | Single column | Single column | Centered, max-width |

### Mobile Member Card

```tsx
// Mobile view: Cards instead of table
<div className="md:hidden space-y-2">
  {members.map(member => (
    <Card key={member.id}>
      <div className="flex items-center gap-3">
        <Avatar src={member.image} fallback={getInitials(member.name)} />
        <div className="flex-1">
          <div className="font-medium">{member.name}</div>
          <div className="text-sm text-muted-foreground">{member.email}</div>
        </div>
        <Badge>{member.role}</Badge>
        <MemberActionsMenu member={member} />
      </div>
    </Card>
  ))}
</div>
```

---

## Implementation Order

1. **Phase 1: Core Setup**
   - [ ] Add organization routes to router
   - [ ] Create `/create-organization` page
   - [ ] Add no-org redirect guard

2. **Phase 2: Navigation**
   - [ ] Create `OrganizationSwitcher` component
   - [ ] Update header to include switcher
   - [ ] Update dashboard header with org info

3. **Phase 3: Settings**
   - [ ] Create settings page with tabs
   - [ ] Implement General settings form
   - [ ] Add slug validation API

4. **Phase 4: Members**
   - [ ] Create `MembersTab` component
   - [ ] Implement member list with search/filter
   - [ ] Create `InviteMemberDialog`
   - [ ] Implement `MemberActionsMenu`

5. **Phase 5: Confirmations & Actions**
   - [ ] Create confirmation dialogs
   - [ ] Implement role change flow
   - [ ] Implement remove member flow
   - [ ] Implement leave organization

6. **Phase 6: Polish**
   - [ ] Add loading skeletons
   - [ ] Add empty states
   - [ ] Mobile responsive adjustments
   - [ ] Error handling refinements

---

## Files to Create/Modify

### New Files

```
apps/web/src/
├── routes/
│   └── create-organization.tsx       # Org creation page
├── components/
│   ├── organization-switcher.tsx     # Header org dropdown
│   └── organization/
│       ├── members-tab.tsx           # Member list component
│       ├── invite-member-dialog.tsx  # Invite modal
│       ├── member-actions-menu.tsx   # Row actions menu
│       └── confirmation-dialogs.tsx  # Reusable confirm dialogs
```

### Modified Files

```
apps/web/src/
├── routes/
│   ├── __root.tsx                    # Add no-org redirect
│   └── dashboard.tsx                 # Add org header
├── components/
│   ├── header.tsx                    # Add OrganizationSwitcher
│   └── user-menu.tsx                 # Add Leave Organization
├── lib/
│   ├── utils.ts                      # Add getInitials, generateSlug
│   └── auth-client.ts                # Already has organizationClient
```

---

## Testing Checklist

### Organization Creation
- [ ] Can create org with required fields
- [ ] Slug auto-generates from name
- [ ] Slug can be manually overridden
- [ ] Slug validation shows warning when taken
- [ ] Logo URL is optional
- [ ] Redirects to dashboard on success

### Organization Switching
- [ ] Switcher shows all orgs
- [ ] Active org has badge
- [ ] Switching updates active org immediately
- [ ] Create option always visible

### Member Management
- [ ] Can invite member with email and role
- [ ] Pending invites show with badge
- [ ] Can resend pending invite
- [ ] Can copy invite link
- [ ] Can cancel invite (immediate)
- [ ] Can change member role (with confirm)
- [ ] Can remove member (with confirm)
- [ ] Search filters members
- [ ] Role filter works
- [ ] Sorting works

### Settings
- [ ] Only owner can edit settings
- [ ] Slug change requires owner
- [ ] Save shows toast
- [ ] Leave org works for non-owners
- [ ] Transfer ownership works for owners

### Permissions
- [ ] Owner sees all actions
- [ ] Admin sees limited actions
- [ ] Member sees no admin actions
- [ ] Owner row has no actions menu
