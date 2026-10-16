# JemeHotels interaction contract

## Business sources

`LLM_WIKI.md` records the user's role and workflow requirements. `src/app/interfaces` and `src/app/services` define the current API contracts. The API remains authoritative for authorization, room availability, payment status, and role changes. Local role values control presentation only.

## Navigation and roles

The `/` route is public. `App` owns the role-aware shell. All authenticated users receive the shared `AdminNavigation` component: Home (`/`), Bookings (`/bookings`), Rooms (`/rooms`), and logout. Only admins also receive Guests (`/guest`) and admin-specific descriptions. Non-admin labels describe their own stays and payments. Logged-out visitors receive no sidebar. The navigation list is shared between desktop and mobile. Mark active destinations through Angular RouterLinkActive, including an exact match for Home. Mobile uses the maintained OptimusUI Drawer for modal focus management, Escape, dismissal, and scroll blocking. Selecting a link or completing navigation closes the drawer. Route content retains natural document scrolling.

Existing auth and admin guards remain the access gates. Admins manage rooms and guests and view all bookings; users book rooms and pay for their own bookings. Navigation never exposes account-recovery routes as admin tasks because those require email/token context from external links. Login/register links remain available for visitors through the public page. Log out uses `AuthService.logout`, clears token/expiry/role, and navigates to login.

## Canonical UI map

| Capability | Owner | Source of truth | Variants / checks |
|---|---|---|---|
| Navigation shell | `App`, `AdminNavigation` | This contract, existing routes and guards | Desktop sidebar / modal mobile drawer; keyboard, role and viewport checks pending |
| Modal | OptimusUI Dialog / Drawer | Existing library APIs | Existing page dialogs; mobile admin menu |
| Form | Angular reactive forms + OptimusUI fields | Current interfaces and page validators | Existing auth and room workflows |
| Select/Listbox | OptimusUI Select | Existing form and filter components | Authored popup |
| Date | OptimusUI DatePicker | Existing room booking form | Authored calendar |
| Toast | `ToastService`, root `p-toast` | `src/app/services/toast.ts` | Success / warning / error |
| Scrollbar | `src/styles.scss` | `DESIGN.md`, shared `--jh-*` tokens | Application-wide, visible, forced-colors fallback |
| Booking and payment | Existing BookingService / Payment and page state | API methods and interfaces | No domain changes in landing/navigation work |

## Feedback and recovery

Preserve existing required-field validation, pending states, request duplicate prevention, inline errors, and success toasts. Never show payment success from query parameters alone. Role escalation retains its confirmation dialog. Adding a room refreshes rooms. The public landing page makes no requests for protected data and all call-to-action destinations correspond to existing routes.

## Verification

User instruction: stop after editing; do not run/restart the build. These contracts document intended behavior and do not claim executed runtime verification. Existing screen differences outside the touched navigation and landing scope remain for future review.
