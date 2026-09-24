# Admin User Management and Scanner Routing Design

## Objective

Add Admin-only management of Scanner accounts and enforce a clear separation between the existing event dashboard and the new Scanner experience. Admin users keep the dashboard and gain a Manage Users entry in the profile dropdown. Scanner users are sent to a minimal Check In & Scanner page whose initial content is `hello` and cannot access dashboard or user-management functionality.

## Scope

This change includes:

- Admin-only CRUD for Scanner accounts stored in the existing `users` table.
- Role-aware Laravel API authorization.
- Role-aware frontend routing after login and on direct navigation.
- A Manage Users page integrated into the existing dashboard shell.
- A minimal Scanner page with only Check In & Scanner navigation and `hello` content.
- Automated backend authorization and CRUD tests plus frontend role-routing tests.

This change does not implement QR scanning or event check-in behavior on the Scanner page. It also does not introduce a general permissions framework or a separate scanner database table.

## Roles and Authorization

The application has two supported role values:

- `Admin`: may use the event dashboard and Manage Users.
- `Scanner`: may use only the Scanner experience.

Role strings remain stored in the existing nullable `users.role` column, so no database migration is required. The existing Admin seeder continues assigning `Admin`; accounts created through Manage Users always receive `Scanner` on the server regardless of submitted input.

Laravel role middleware is the authority for access control. Frontend redirects improve navigation but are not treated as a security boundary.

| Capability | Admin | Scanner |
| --- | --- | --- |
| Read authenticated profile / logout | Yes | Yes |
| Event dashboard APIs | Yes | No |
| Manage Scanner accounts | Yes | No |
| Scanner page | No; redirect to dashboard | Yes |

The existing check-in API remains under the dashboard's current Admin authorization for this initial blank Scanner page. Scanner API access for actual scanning will be designed when scanner functionality is implemented.

## Backend Design

### Role middleware

Add middleware that accepts one or more allowed roles and returns JSON `403` when the authenticated user's role is not allowed. Register it as a Laravel middleware alias.

API route groups:

- Authenticated for both roles: `GET /api/user`, `POST /api/logout`.
- Admin-only: existing event-management endpoints and all `/api/users` endpoints.

### User-management API

Add an Admin-only controller with these routes:

- `GET /api/users`: list Scanner accounts from the existing `users` table.
- `POST /api/users`: create a Scanner account.
- `PUT /api/users/{user}`: update a Scanner account.
- `DELETE /api/users/{user}`: delete a Scanner account.

The controller rejects any update or deletion target whose role is not `Scanner`, preventing the Admin account from being changed through this surface.

Create validation:

- `name`: required string, maximum 255 characters.
- `email`: required valid lowercase email, unique in `users`, maximum 255 characters.
- `password`: required, confirmed, using Laravel's standard password rule.

Update validation:

- `name`: required string, maximum 255 characters.
- `email`: required valid lowercase email, unique except for the current user.
- `password`: nullable; when absent or blank, the current password remains unchanged; when supplied, it must be confirmed and valid.

Responses use the project's existing JSON conventions. Lists are ordered predictably, and successful deletion returns a simple success message.

## Frontend Architecture

### Role routing

Centralize role-to-route decisions in a small testable helper:

- Admin destination: `/`.
- Scanner destination: `/scanner`.
- Unauthenticated users remain on the login experience.

Role-aware page guards prevent protected content from flashing while authentication is loading or a redirect is pending:

- A Scanner reaching `/` or `/manage-users` is replaced to `/scanner`.
- An Admin reaching `/scanner` is replaced to `/`.
- An unauthenticated visitor reaching either protected secondary route returns to `/` for login.

The existing authentication hook remains the shared source of authenticated-user state.

### Profile dropdown

For Admin users, add a Manage Users item with a users icon beneath Settings and link it to `/manage-users`. Scanner users do not receive this item. Logout remains available to both roles.

### Manage Users page

The page reuses the dashboard's visual language and authenticated shell. It contains:

- A heading and Add User action.
- A responsive table of Scanner accounts with name, email, role, created date, and actions.
- An Add User dialog with name, email, password, and password confirmation.
- An Edit User dialog with name, email, optional new password, and confirmation.
- A standard project confirmation dialog for deletion; SweetAlert is not used.
- Loading, empty, validation-error, submission, and request-failure states.

Create, update, and delete operations refresh the user list. Buttons are disabled during their operation to prevent duplicate requests.

### Scanner page

The `/scanner` route uses a minimal authenticated layout:

- Navigation exposes only Check In & Scanner.
- Profile and logout remain available.
- The main content initially contains exactly `hello`.
- Dashboard and Manage Users links are absent.

## Error Handling

- Laravel returns `422` validation details, `403` for role violations, and `404` for missing records.
- Frontend dialogs show validation and request errors within the dialog.
- Page-level load errors appear in the page rather than opening a separate alert.
- Unauthorized frontend responses trigger revalidation of the current user and navigation to the appropriate role destination when applicable.

## Testing Strategy

Backend feature tests will verify:

- Admin can list, create, update, and delete Scanner accounts.
- Created accounts always receive the Scanner role and a hashed password.
- Updating without a password preserves the existing password.
- Email uniqueness and required fields return validation errors.
- Scanner users receive `403` for every user-management endpoint.
- Admin records cannot be updated or deleted through Scanner management.
- Scanner users receive `403` from dashboard event-management endpoints.

Frontend tests will verify the pure role-routing decisions and any extracted user-form normalization. Existing frontend tests, ESLint, the production Next.js build, and the complete Laravel test suite will be run before completion.

## Security and Compatibility

- Role assignment is server-controlled; the create/update APIs never trust a client-provided role.
- Passwords continue using the User model's `hashed` cast.
- Admin accounts are protected from the Scanner CRUD surface.
- Existing authenticated dashboard behavior remains unchanged for Admin users.
- Existing test users that exercise Admin-only APIs must explicitly use the Admin role so authorization expectations remain clear.
