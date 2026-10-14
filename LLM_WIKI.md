# User instructions

Record instructions from the user in this file from now onward. Append new instructions and preserve earlier entries; when instructions change, note which earlier instruction is superseded.

## 2026-10-13

- After changing code, stop. Do not restart or run the build.
- Connect the login form in `src/app/pages/auth/login/login.html` to the functionality in `src/app/pages/auth/login/login.ts` using OptimusUI components.
- Keep the implementation simple.
- Store everything the user tells you now and henceforth in `LLM_WIKI.md` in the project root.
- Style the login page using SCSS. Keep the earlier simplicity and OptimusUI instructions, and stop after editing without running the build.
- Implement `register.ts` and `register.html` similarly to the login page, using the auth service's `register` method and a form based on the `RegisterData` interface.
- Add "New here? Register" to the login page linking to `/register`, and a corresponding login link on the register page.
- On successful login and registration, show a success toast using the existing `ToastService` in `src/app/services/toast.ts`.
- Save the login JWT and its expiry time in sessionStorage through `AuthService`; add logout to clear the stored authentication information.
- Automatically log out when the token expires and restore authentication on app startup when a valid saved JWT exists.
- Protect `/rooms` from unauthenticated users using `auth-guard.ts`.
- Use `auth-interceptor.ts` to add `Authorization: Bearer {token}` to subsequent requests to the server.
- All outgoing HTTP requests must contain the header `'ngrok-skip-browser-warning': 'true'`.
- Display the rooms retrieved in `rooms.ts` in a grid on `rooms.html`, with a button labelled `book` attached to each room.
- Clicking a room's Book button must prompt for a start date and end date, then call `BookingService.bookRoom` with the room ID and selected dates.
- Retrieve the customer's bookings from `/api/Bookings/MyBookings` on the bookings page and display the returned `BookingResult[]` in a list.
- After successful booking, use the returned `BookingResponse.id` as `bookingId` for `Payment.initialize`. Use the `PaymentInitializeResponse` to show a payment button that opens `authorizationUrl` in a new tab when clicked.
- After payment, the user returns to `/callback` with `txref` and `reference` query parameters. Use `reference` to call `Payment.verify`, display the returned result, and provide a link to the bookings page.
- Use localStorage instead of sessionStorage for the auth token and its expiry time. This supersedes the earlier sessionStorage instruction; startup restoration and logout must also use localStorage.
- On the callback page, give the payment status text a green background when `payment.status === 'success'`.
- Add a payment button for unpaid bookings in the bookings list, using the booking ID to initialize payment and providing a link to checkout.
- Position the Pay button on the same line as the booking information, at the rightmost side of each booking.
- If the login error is exactly `Email is not confirmed`, show a toast prompting the user to click the verification link in their email.

## 2026-10-14

- Store the user's role returned by the backend alongside the JWT in localStorage, restore it on startup, and clear it on logout or expiry.
- Admins can add rooms but cannot book rooms. Users can book rooms but cannot add rooms. Implement room creation using `AddRoom` and `RoomService.addRoom`, with a whole room number between 101 and 120 inclusive.
- Update room creation to match the revised `AddRoom` interface, which no longer includes `roomID`. Remove the room ID form field and omit it from the creation request.
- Match the latest `AddRoom` update: the image file field is now named `Images` (capital I). Update the form control, payload, and multipart field name accordingly.
- Match the latest `AddRoom` update: `Images` is now `File[]`. Allow multiple image selection and append each file under the `Images` multipart field.
- Give admins access to a guest list page with an option to elevate a guest to admin. Use the guest service methods (`retrieveGuests` and `elevateGuestToAdmin` in `guest.ts`; the referenced `guest.spec.ts` contains only a creation test).
- Match the updated `GuestResult` interface: use `userName` and `email` instead of `UserName` and `Email` throughout guest display and elevation logic.
- When an admin views the bookings page, retrieve all bookings using `BookingService.getAllBookings` and display the `AdminBookingResult` fields. Users continue to see their own bookings.
- Match the updated `AdminBookingResult` interface by displaying its new `roomNumber` and `roomId` fields in the admin bookings list.
- Match the latest `AdminBookingResult` update by displaying `guestId` and the Paid/Unpaid status from `isPaid` in the admin bookings list.
- Add search, filtering, and sorting to the bookings page for both admin and user views.
- Implement `/confirm-email` with `email` and `token` query parameters, calling `AuthService.confirmEmail` and displaying confirmation progress, success, or failure on the email confirmation page.
- Implement `/resetpassword` using `email` and `token` query parameters, a new-password and confirm-password form based on `ResetPasswordRequest`, and `AuthService.resetPassword`.
- Add a "Forgot password?" prompt that opens an email modal, calls `AuthService.forgotPassword`, and shows a success toast and dismisses the modal on a successful 200 response.
- Display the image URL from `Room.image` on each room card.
