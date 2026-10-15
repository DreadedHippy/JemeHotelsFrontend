---
version: alpha
name: JemeHotels
description: Green hospitality identity with an uncluttered guest journey and an operational admin workspace.
colors:
  primary: "#164c38"
  accent: "#cee59a"
  background: "#ffffff"
  surface: "#f1f6f2"
  text: "#18382b"
  muted: "#5b6e64"
  border: "#dce5de"
typography:
  sans:
    fontFamily: "Manrope, sans-serif"
  display:
    fontFamily: "DM Sans, Manrope, sans-serif"
rounded:
  DEFAULT: "0.5rem"
  card: "1rem"
spacing:
  page-max: "100rem"
  section-gap: "5.5rem"
---

# JemeHotels design context

## Overview

A welcoming hotel room and its key card ground the public page: the photographic hero and tilted JH key are the signature. The supplied Jeme globe/wordmark informs the forest green identity. Existing Manrope typography, green OptimusUI actions, white panels, and rounded cards remain the application baseline.

The public home page is a hospitality landing page; the authenticated routes are product screens. English UI, responsive desktop and phone layouts. No property location, amenities, availability, ratings, price claims, or customer testimonials are invented.

## Colors and runtime ownership

`src/styles.scss` owns the `--jh-*` tokens above. Landing page and admin navigation consume these shared variables; this document mirrors runtime values, rather than generating them. Existing application fields, dialogs, toasts, and buttons continue to use the Nora OptimusUI theme configured in `app.config.ts`; their `--p-*` tokens remain canonical for those components.

## Typography

Manrope is the established body and utility face. DM Sans, already loaded globally, provides the home display headings. Use restrained tracking on headings, legible body line heights, and small uppercase labels only for short context. No extra font dependency.

## Layout and shape

Home: split hero, real interior photography, a clearly decorative key card, two room-category previews, an actual three-step booking sequence, and one closing call to action. Green on white with pale mint supporting surfaces; no gradients. Photography is illustrative and labeled accordingly. Images reserve geometry.

Admin shell: a 16.5rem sticky desktop sidebar beside naturally scrolling route content. At 64rem and below, it becomes a compact menu bar and a modal OptimusUI drawer. The shell does not constrain route height or hide document scrolling. Landing layout stacks at 48rem, room previews at 32rem. Long identifiers and page content remain available.

## Components and behavior

Use native links for navigation, native buttons for actions, and existing OptimusUI dialogs/drawers for modal behavior. `.jeme-button` in `styles.scss` is the shared public call-to-action recipe. Preserve existing application service, toast, form, and role contracts. Current route indication uses RouterLinkActive and `aria-current`. Keyboard focus stays visible; reduced motion disables new transitions. Global scrollbar styles include standards-based behavior and engine fallbacks with forced-color support.

## Assets and references

- Brand reference: user-provided green Jeme logo. The bundled white variant of the same official globe/wordmark was retrieved from [Jeme Technologies](https://jemetechnologies.ng/assets/jemelogowhite.png) and is used on forest-green backgrounds.
- `public/images/hotel-room.jpg`: [Unsplash source](https://images.unsplash.com/photo-1611892440504-42a792e24d32).
- `public/images/ensuite-room.jpg`: [Unsplash source](https://images.unsplash.com/photo-1618773928121-c32242e63f39).
- All images are bundled locally. Landing imagery represents a mood, not a claim about an actual available room. Booking actions lead to the existing authenticated room workflow.

## Verification constraints

The user explicitly requires stopping after edits without running the build. No build, test, audit, or browser-verification result is claimed for this change. Runtime keyboard, mobile drawer, role transitions, and visual layout still need verification when the user authorizes checks.
