# Admin User Management and Scanner Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure Admin-only CRUD for Scanner accounts and route Scanner users to a minimal Check In & Scanner experience instead of the event dashboard.

**Architecture:** Laravel role middleware is the security boundary: shared profile/logout routes remain authenticated, event and user-management APIs become Admin-only, and managed accounts are constrained to the Scanner role. The Next.js client centralizes role destinations in a tested pure helper, uses a reusable role gate to prevent protected-content flashes, and adds separate `/manage-users` and `/scanner` routes that reuse role-aware dashboard chrome.

**Tech Stack:** Laravel 12, Sanctum session authentication, Pest/PHPUnit, Next.js 16 App Router, React 19, SWR, Axios, Radix/shadcn-style UI primitives, Tailwind CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-25-admin-user-management-and-scanner-routing.md`

## Global Constraints

- Use the existing `users` table; do not add a Scanner table or database migration.
- Supported stored roles are exactly `Admin` and `Scanner`.
- Accounts created through Manage Users always receive `Scanner`; never accept role assignment from the browser.
- Admin records cannot be updated or deleted through Scanner-account CRUD.
- Scanner users cannot access the dashboard, event-management APIs, or Manage Users.
- The initial Scanner page content is exactly `hello`; QR scanning is outside this implementation.
- Use JavaScript in the Next.js project and existing shadcn/Radix UI primitives.
- Use the standard project dialog for delete confirmation; do not use SweetAlert for confirmation.
- Preserve all unrelated uncommitted user changes in both repositories.

## Review Focus

- A user with a null, lowercase, or unknown role must be denied protected APIs and redirected without briefly rendering protected content; Task 1 and Task 3 test this.
- A crafted request targeting an Admin ID must not update or delete the Admin even when sent by another Admin; Task 2 tests both mutations.
- An edit request with an empty password must preserve the existing password hash; Task 2 tests this exact input.
- Duplicate email addresses must return field-level validation while allowing a Scanner to keep their own email during edit; Task 2 tests both branches.
- A failed create/update/delete request must leave the dialog open with the selected record and an actionable error; Task 5 tests the state reducer that controls this outcome.

---

### Task 1: Backend Role Boundary

**Files:**
- Create: `../event-api/app/Http/Middleware/EnsureUserHasRole.php`
- Modify: `../event-api/app/Models/User.php`
- Modify: `../event-api/bootstrap/app.php`
- Modify: `../event-api/routes/api.php`
- Modify: `../event-api/database/factories/UserFactory.php`
- Create: `../event-api/tests/Feature/RoleAuthorizationTest.php`

**Interfaces:**
- Consumes: Sanctum-authenticated `Request::user()` and Laravel middleware parameters.
- Produces: `User::ROLE_ADMIN`, `User::ROLE_SCANNER`, `User::isAdmin()`, `User::isScanner()`, middleware alias `role`, factory state `scanner()`, and Admin-only event routes.

- [ ] **Step 1: Write failing role-authorization tests**

Create `tests/Feature/RoleAuthorizationTest.php` with real HTTP requests:

```php
<?php

use App\Models\User;

test('an admin can access event management routes', function () {
    $admin = User::factory()->create(['role' => 'Admin']);

    $this->actingAs($admin)->getJson('/api/events')->assertOk();
});

test('a scanner cannot access event management routes', function () {
    $scanner = User::factory()->create(['role' => 'Scanner']);

    $this->actingAs($scanner)->getJson('/api/events')->assertForbidden();
});

test('unknown and null roles cannot access admin routes', function (string|null $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)->getJson('/api/events')->assertForbidden();
})->with([null, 'admin', 'Operator']);

test('both supported roles can read their profile and log out', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('role', $role);
})->with(['Admin', 'Scanner']);
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run from `event-api`:

```bash
php artisan test tests/Feature/RoleAuthorizationTest.php
```

Expected: the Scanner and invalid-role event requests incorrectly return `200`, proving the missing authorization boundary.

- [ ] **Step 3: Add role constants, middleware, alias, and route grouping**

Add to `User`:

```php
public const ROLE_ADMIN = 'Admin';
public const ROLE_SCANNER = 'Scanner';

public function isAdmin(): bool
{
    return $this->role === self::ROLE_ADMIN;
}

public function isScanner(): bool
{
    return $this->role === self::ROLE_SCANNER;
}
```

Create `EnsureUserHasRole.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        abort_unless($request->user() && in_array($request->user()->role, $roles, true), 403);

        return $next($request);
    }
}
```

Register `'role' => \App\Http\Middleware\EnsureUserHasRole::class` in `bootstrap/app.php`. In `routes/api.php`, keep `/user` and `/logout` in the outer `auth:sanctum` group and nest all existing `/events` routes in `Route::middleware('role:Admin')->group(...)`.

Update `UserFactory::definition()` with `'role' => User::ROLE_ADMIN`, and add:

```php
public function scanner(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => User::ROLE_SCANNER,
    ]);
}
```

- [ ] **Step 4: Run focused and existing backend tests**

```bash
php artisan test tests/Feature/RoleAuthorizationTest.php tests/Feature/EventManagementTest.php tests/Feature/Auth/AuthenticationTest.php
```

Expected: all selected tests pass; event tests remain valid because the factory defaults to Admin.

- [ ] **Step 5: Commit the backend role boundary**

```bash
git add app/Http/Middleware/EnsureUserHasRole.php app/Models/User.php bootstrap/app.php routes/api.php database/factories/UserFactory.php tests/Feature/RoleAuthorizationTest.php
git commit -m "feat: enforce admin and scanner roles"
```

### Task 2: Admin Scanner-Account CRUD API

**Files:**
- Create: `../event-api/app/Http/Controllers/UserController.php`
- Create: `../event-api/app/Http/Requests/StoreScannerUserRequest.php`
- Create: `../event-api/app/Http/Requests/UpdateScannerUserRequest.php`
- Modify: `../event-api/routes/api.php`
- Create: `../event-api/tests/Feature/UserManagementTest.php`

**Interfaces:**
- Consumes: Task 1's `role:Admin` middleware and `User::ROLE_SCANNER`.
- Produces: `GET /api/users`, `POST /api/users`, `PUT /api/users/{user}`, and `DELETE /api/users/{user}` with `{ data, message? }` JSON responses.

- [ ] **Step 1: Write failing CRUD, validation, and authorization tests**

Create `UserManagementTest.php`. Use `Hash::check()` for the create password and capture `getAuthPassword()` before the blank-password update. Include these scenarios as separate tests:

```php
test('an admin lists only scanner accounts', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $scanner = User::factory()->scanner()->create(['email' => 'scanner@example.com']);

    $this->actingAs($admin)
        ->getJson('/api/users')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $scanner->id);
});

test('an admin creates a scanner and the server controls its role', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)->postJson('/api/users', [
        'name' => 'Gate Scanner',
        'email' => 'SCANNER@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => User::ROLE_ADMIN,
    ])->assertCreated()
        ->assertJsonPath('data.role', User::ROLE_SCANNER);

    $scanner = User::where('email', 'scanner@example.com')->firstOrFail();
    expect(Hash::check('password123', $scanner->password))->toBeTrue();
});

test('an admin updates scanner details without replacing a blank password', function () {
    $admin = User::factory()->create();
    $scanner = User::factory()->scanner()->create();
    $originalPassword = $scanner->getAuthPassword();

    $this->actingAs($admin)->putJson('/api/users/'.$scanner->id, [
        'name' => 'Updated Scanner',
        'email' => $scanner->email,
        'password' => '',
        'password_confirmation' => '',
    ])->assertOk()->assertJsonPath('data.name', 'Updated Scanner');

    expect($scanner->refresh()->getAuthPassword())->toBe($originalPassword);
});

test('an admin deletes a scanner account', function () {
    $admin = User::factory()->create();
    $scanner = User::factory()->scanner()->create();

    $this->actingAs($admin)->deleteJson('/api/users/'.$scanner->id)->assertOk();
    $this->assertDatabaseMissing('users', ['id' => $scanner->id]);
});
```

Also add literal tests for duplicate create email (`422` on `email`), unchanged email on edit (`200`), missing required values (`422`), Scanner access to all four endpoints (`403`), and Admin-target update/delete (`403`, database unchanged).

- [ ] **Step 2: Run the CRUD test file and verify RED**

```bash
php artisan test tests/Feature/UserManagementTest.php
```

Expected: all requests return `404` because the routes do not exist.

- [ ] **Step 3: Implement request validation and controller behavior**

`StoreScannerUserRequest::rules()`:

```php
return [
    'name' => ['required', 'string', 'max:255'],
    'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)],
    'password' => ['required', 'confirmed', Rules\Password::defaults()],
];
```

Both request classes normalize email before validation:

```php
protected function prepareForValidation(): void
{
    $this->merge([
        'email' => is_string($this->email) ? strtolower(trim($this->email)) : $this->email,
    ]);
}
```

`UpdateScannerUserRequest::rules()`:

```php
return [
    'name' => ['required', 'string', 'max:255'],
    'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->route('user'))],
    'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
];
```

Both request classes return `true` from `authorize()` because route middleware already enforces Admin access.

Implement `UserController` with:

```php
public function index(): JsonResponse
{
    return response()->json([
        'data' => User::query()->where('role', User::ROLE_SCANNER)->latest()->get(),
    ]);
}

public function store(StoreScannerUserRequest $request): JsonResponse
{
    $user = User::create([
        ...$request->validated(),
        'role' => User::ROLE_SCANNER,
    ]);

    return response()->json(['data' => $user, 'message' => 'Scanner created successfully.'], 201);
}

private function ensureScanner(User $user): void
{
    abort_unless($user->isScanner(), 403);
}
```

In `update()`, call `ensureScanner()`, remove `password` when blank, update the record, and return refreshed data. In `destroy()`, call `ensureScanner()`, delete the Scanner, and return `['message' => 'Scanner deleted successfully.']`. Register `Route::apiResource('users', UserController::class)->except(['show'])` inside the Admin-only route group.

- [ ] **Step 4: Run focused CRUD and authorization tests**

```bash
php artisan test tests/Feature/UserManagementTest.php tests/Feature/RoleAuthorizationTest.php
```

Expected: all tests pass, including duplicate email, self-email edit, blank password, forged role, and protected Admin target cases.

- [ ] **Step 5: Commit the user API**

```bash
git add app/Http/Controllers/UserController.php app/Http/Requests/StoreScannerUserRequest.php app/Http/Requests/UpdateScannerUserRequest.php routes/api.php tests/Feature/UserManagementTest.php
git commit -m "feat: add admin scanner user management api"
```

### Task 3: Frontend Role Routing Contract

**Files:**
- Create: `lib/role-routing.mjs`
- Create: `tests/role-routing.test.mjs`
- Create: `components/auth/role-gate.js`
- Modify: `app/page.js`

**Interfaces:**
- Consumes: `useAuth()` returning `{ user, error, isLoading }` and Next.js `useRouter()`.
- Produces: `getRoleHome(role): '/' | '/scanner' | null`, `canAccessRoute(role, pathname): boolean`, and `<RoleGate allowedRole>{({ user, logout }) => ReactNode}</RoleGate>`.

- [ ] **Step 1: Write failing pure routing tests**

Create `tests/role-routing.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { canAccessRoute, getRoleHome } from "../lib/role-routing.mjs";

test("role homes are exact and unknown roles have no protected destination", () => {
  assert.equal(getRoleHome("Admin"), "/");
  assert.equal(getRoleHome("Scanner"), "/scanner");
  assert.equal(getRoleHome("admin"), null);
  assert.equal(getRoleHome(null), null);
});

test("admin and scanner routes are mutually exclusive", () => {
  assert.equal(canAccessRoute("Admin", "/"), true);
  assert.equal(canAccessRoute("Admin", "/manage-users"), true);
  assert.equal(canAccessRoute("Admin", "/scanner"), false);
  assert.equal(canAccessRoute("Scanner", "/scanner"), true);
  assert.equal(canAccessRoute("Scanner", "/"), false);
  assert.equal(canAccessRoute("Scanner", "/manage-users"), false);
  assert.equal(canAccessRoute("Operator", "/scanner"), false);
});
```

- [ ] **Step 2: Run routing tests and verify RED**

```bash
node --test tests/role-routing.test.mjs
```

Expected: module-not-found failure for `lib/role-routing.mjs`.

- [ ] **Step 3: Implement the routing helper and role gate**

Create `lib/role-routing.mjs` with literal role comparisons and explicit pathname rules:

```js
export function getRoleHome(role) {
  if (role === "Admin") return "/";
  if (role === "Scanner") return "/scanner";
  return null;
}

export function canAccessRoute(role, pathname) {
  if (role === "Admin") return pathname === "/" || pathname === "/manage-users";
  if (role === "Scanner") return pathname === "/scanner";
  return false;
}
```

Implement `RoleGate` as a client component. It calls `useAuth()`, redirects unauthenticated visitors to `/`, redirects wrong roles to `getRoleHome(user.role) || '/'`, renders the existing centered `LoaderCircle` while authentication/redirect is pending, and invokes its render-prop child only when `user.role === allowedRole`.

Modify `app/page.js` to import `useRouter` and `getRoleHome`. In an unconditional effect, replace Scanner and unsupported-role sessions before returning `EventDashboard`; render the centered loader while the authenticated user is not Admin. Preserve the existing Login screen for unauthenticated users and the existing Admin dashboard behavior.

- [ ] **Step 4: Run the routing test and frontend lint**

```bash
node --test tests/role-routing.test.mjs
npm run lint
```

Expected: routing tests and ESLint pass with no hook-order violations.

- [ ] **Step 5: Commit the routing contract**

```bash
git add lib/role-routing.mjs tests/role-routing.test.mjs components/auth/role-gate.js app/page.js
git commit -m "feat: route authenticated users by role"
```

### Task 4: Role-Aware Navigation and Scanner Page

**Files:**
- Modify: `components/dashboard/top-header.js`
- Modify: `components/dashboard/sidebar.js`
- Modify: `app/page.js`
- Create: `app/scanner/layout.js`
- Create: `app/scanner/page.js`

**Interfaces:**
- Consumes: Task 3's `RoleGate`, the existing `TopHeader` logout callback, and exact roles from `/api/user`.
- Produces: `getNavigationForRole(role): Array<{ label: string, href: string }>` plus Admin-only Manage Users dropdown navigation and the Scanner-only `/scanner` page.

- [ ] **Step 1: Write a failing role-navigation test**

Add `getNavigationForRole` to the import from `lib/role-routing.mjs`, then add this test before changing production code:

```js
test("each supported role receives only its own navigation", () => {
  assert.deepEqual(getNavigationForRole("Admin"), [
    { label: "Dashboard", href: "/" },
  ]);
  assert.deepEqual(getNavigationForRole("Scanner"), [
    { label: "Check In & Scanner", href: "/scanner" },
  ]);
  assert.deepEqual(getNavigationForRole("Operator"), []);
});
```

- [ ] **Step 2: Run the focused test**

```bash
node --test tests/role-routing.test.mjs
```

Expected: FAIL because `getNavigationForRole` is not exported yet.

- [ ] **Step 3: Implement role-aware dashboard chrome**

Update `TopHeader` to import `Link` and `Users`. Render this item only when `user?.role === "Admin"`:

```jsx
<DropdownMenuItem asChild>
  <Link href="/manage-users">
    <Users />
    Manage Users
  </Link>
</DropdownMenuItem>
```

Add this pure helper to `lib/role-routing.mjs`:

```js
export function getNavigationForRole(role) {
  if (role === "Admin") return [{ label: "Dashboard", href: "/" }];
  if (role === "Scanner") return [{ label: "Check In & Scanner", href: "/scanner" }];
  return [];
}
```

Make `Sidebar` and its internal content accept `role` and `activeItem`, consume `getNavigationForRole(role)`, and map labels to the existing `LayoutDashboard` and `ScanQrCode` icons. Use Next.js `Link`, calculate active state from `activeItem`, and pass `role={user.role}` from every shell. Remove the old hash-only Check-In link so Admin users cannot navigate into the Scanner-only route.

- [ ] **Step 4: Create the Scanner route and metadata**

Create `app/scanner/layout.js`:

```js
export const metadata = {
  title: "Check In & Scanner | Hype Event Hub",
};

export default function ScannerLayout({ children }) {
  return children;
}
```

Create `app/scanner/page.js` as a client component using `RoleGate allowedRole="Scanner"`. Keep local mobile-sidebar state, render `Sidebar role="Scanner" activeItem="Check In & Scanner"`, render `TopHeader`, and place exactly this main content inside the shell:

```jsx
<main className="min-h-screen px-4 pt-[72px] pb-8 sm:px-6 lg:px-8">
  hello
</main>
```

Use the existing `getApiErrorMessage()` convention if logout fails, but do not add dashboard cards or scanner behavior.

- [ ] **Step 5: Verify navigation and Scanner compilation**

```bash
node --test tests/role-routing.test.mjs
npm run lint
npm run build
```

Expected: all commands pass and the build output includes `/scanner`.

- [ ] **Step 6: Commit Scanner navigation**

```bash
git add lib/role-routing.mjs components/dashboard/top-header.js components/dashboard/sidebar.js app/page.js app/scanner/layout.js app/scanner/page.js tests/role-routing.test.mjs
git commit -m "feat: add scanner-only application route"
```

### Task 5: Manage Users Interface

**Files:**
- Create: `functions/users.js`
- Create: `lib/user-management-state.mjs`
- Create: `tests/user-management-state.test.mjs`
- Create: `components/users/user-form-dialog.js`
- Create: `components/users/delete-user-dialog.js`
- Create: `components/users/users-table.js`
- Create: `app/manage-users/layout.js`
- Create: `app/manage-users/page.js`

**Interfaces:**
- Consumes: Task 2's `/api/users` responses, Task 3's `RoleGate`, and Task 4's Admin shell components.
- Produces: `useUsers()` with `{ users, error, isLoading, createUser, updateUser, deleteUser }`, dialog components, and Admin-only `/manage-users`.

- [ ] **Step 1: Write failing state-transition tests**

Create `tests/user-management-state.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { finishUserMutation } from "../lib/user-management-state.mjs";

const openState = { open: true, submitting: true, error: "", user: { id: 7 } };

test("a successful mutation closes the dialog and clears transient state", () => {
  assert.deepEqual(finishUserMutation(openState, { ok: true }), {
    open: false,
    submitting: false,
    error: "",
    user: null,
  });
});

test("a failed mutation keeps the dialog and selected user open", () => {
  assert.deepEqual(finishUserMutation(openState, { ok: false, error: "Email is already in use." }), {
    open: true,
    submitting: false,
    error: "Email is already in use.",
    user: { id: 7 },
  });
});
```

- [ ] **Step 2: Run the state test and verify RED**

```bash
node --test tests/user-management-state.test.mjs
```

Expected: module-not-found failure for `lib/user-management-state.mjs`.

- [ ] **Step 3: Implement mutation state and SWR data access**

Implement `finishUserMutation` exactly around the tested states. Create `functions/users.js` with SWR key `/api/users`, a fetcher that returns `response.data.data`, and mutations:

```js
const createUser = async (payload) => {
  const response = await api.post("/api/users", payload);
  await mutate();
  return response.data.data;
};

const updateUser = async (id, payload) => {
  const response = await api.put(`/api/users/${id}`, payload);
  await mutate();
  return response.data.data;
};

const deleteUser = async (id) => {
  await api.delete(`/api/users/${id}`);
  await mutate();
};
```

Return an empty list before SWR data arrives and preserve SWR's load error for the page.

- [ ] **Step 4: Build the form, delete confirmation, and responsive table**

`UserFormDialog` accepts `{ open, onOpenChange, user, onSubmit }`. Initialize controlled fields from `user` when editing and empty values when creating. Submit `{ name, email, password, password_confirmation }`, use `getApiErrorMessage()`, keep the dialog open on failure, and make password required only for create. Display Role as a disabled `Scanner` field so role behavior is explicit but not editable.

`DeleteUserDialog` accepts `{ user, open, onOpenChange, onConfirm }`, uses the existing Radix `Dialog`, names the selected Scanner, and disables both actions while deleting. It does not import SweetAlert.

`UsersTable` accepts `{ users, onEdit, onDelete }` and renders name, email, a Scanner badge, formatted `created_at`, and icon buttons with `aria-label` and `title`. On narrow screens, retain horizontal scrolling and a table minimum width instead of clipping actions.

- [ ] **Step 5: Build the Admin-only Manage Users route**

Create metadata in `app/manage-users/layout.js`:

```js
export const metadata = {
  title: "Manage Users | Hype Event Hub",
};

export default function ManageUsersLayout({ children }) {
  return children;
}
```

Create `page.js` as a client component wrapped by `RoleGate allowedRole="Admin"`. Reuse `Sidebar role="Admin"`, `TopHeader`, and the existing orange/cream palette. The page owns selected-user, form-open, delete-open, and mobile-sidebar state. It renders:

- heading `Manage Users`;
- `Add Scanner` button;
- loading spinner, load-error panel, or empty state;
- `UsersTable` when records exist;
- `UserFormDialog` for create/edit;
- `DeleteUserDialog` for deletion.

After successful mutations, close only the relevant dialog. After failure, use `finishUserMutation()` so the selected record and error remain visible.

- [ ] **Step 6: Run focused and complete frontend verification**

```bash
node --test tests/user-management-state.test.mjs tests/role-routing.test.mjs tests/invitations.test.mjs tests/attendee-export.test.mjs tests/attendee-workbook.test.mjs tests/registration-answers.test.mjs
npm run lint
npm run build
```

Expected: all tests and lint pass; the build includes `/manage-users` and `/scanner`.

- [ ] **Step 7: Commit Manage Users**

```bash
git add functions/users.js lib/user-management-state.mjs tests/user-management-state.test.mjs components/users/user-form-dialog.js components/users/delete-user-dialog.js components/users/users-table.js app/manage-users/layout.js app/manage-users/page.js
git commit -m "feat: add admin scanner user management"
```

### Task 6: Cross-Stack Regression Verification

**Files:**
- Modify only files required by failures directly caused by Tasks 1–5.

**Interfaces:**
- Consumes: all backend and frontend deliverables.
- Produces: verified Admin and Scanner flows with no known regressions.

- [ ] **Step 1: Run the complete Laravel suite**

From `event-api`:

```bash
php artisan test
```

Expected: zero failed tests. If an existing event test fails due to role setup, make its user explicitly Admin rather than weakening middleware.

- [ ] **Step 2: Run the complete frontend suite**

From `event-management`:

```bash
node --test tests/invitations.test.mjs tests/attendee-export.test.mjs tests/attendee-workbook.test.mjs tests/registration-answers.test.mjs tests/role-routing.test.mjs tests/user-management-state.test.mjs
npm run lint
npm run build
```

Expected: zero failed tests, zero ESLint errors, and a successful production build containing `/`, `/manage-users`, and `/scanner`.

- [ ] **Step 3: Manually verify the role journeys against running local apps**

Use the seeded Admin and one API-created Scanner:

1. Admin login lands on `/`, shows Dashboard, and has Manage Users in the profile dropdown.
2. Admin can create, edit, and delete a Scanner; a blank edit password leaves login credentials unchanged.
3. Scanner login replaces `/` with `/scanner`, sidebar shows only Check In & Scanner, and content reads `hello`.
4. Scanner navigation to `/` or `/manage-users` replaces the URL with `/scanner` without dashboard/user-table content appearing.
5. Direct Scanner requests to `/api/events` and `/api/users` return `403`.
6. Logout returns both roles to the login experience.

- [ ] **Step 4: Commit only verification-driven corrections, if any**

If verification required code corrections, stage only those files and commit:

```bash
git commit -m "fix: resolve role flow verification issues"
```

If no corrections were needed, do not create an empty commit.
