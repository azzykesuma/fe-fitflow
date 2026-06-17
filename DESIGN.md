# FitFlow Design Guide

## Product

FitFlow is a habit and workout tracking frontend for people building consistent fitness routines. The UI should feel focused, energetic, and mobile-first without becoming noisy.

Primary use cases:

- Register and log in
- Review today's habit and workout status
- Create and complete habits
- Create workout plans
- Start workout sessions
- Review progress snapshots

## Design Principles

- Mobile-first and PWA-friendly.
- Clear hierarchy over decorative complexity.
- Dark fitness dashboard aesthetic with bright success accents.
- Inputs and forms should feel stable; validation feedback must not cause distracting layout jumps.
- Avoid exposing sensitive auth details in UI copy.
- Keep screens practical for real backend integration.

## Visual Style

Theme:

- Dark, glassy, athletic, high-contrast.
- Use layered dark backgrounds with subtle radial gradients.
- Cards can use translucent panels, soft borders, and mild blur.
- Avoid generic white SaaS dashboards.

Background:

- Base: near-black green/slate.
- Suggested colors:
  - Page background: `#07110d`
  - Deep slate: `#0f172a`
  - Panel: `rgba(255,255,255,0.06)`
  - Border: `rgba(255,255,255,0.10)`

Accent colors:

- Primary lime: `#bef264` or `#8cff7a`
- Secondary teal: `#2dd4bf`
- Error red: `#fca5a5`
- Muted text: `#94a3b8`
- Main text: `#f8fafc`

## Typography

Use a modern sans-serif typeface.

Recommended:

- Headings: Inter, Geist, or Plus Jakarta Sans
- Body: Inter, Geist, or system sans-serif

Text style:

- Headings should be bold or black weight.
- Use tight tracking on large marketing/dashboard titles.
- Body text should be readable and calm.
- Labels should be compact, bold, and clear.

## Shape And Spacing

Corners:

- Use rounded cards and controls.
- Main cards: `24px` to `32px`
- Inputs/buttons: `16px` to `24px`
- Pills: fully rounded

Spacing:

- Mobile page padding: `16px` to `20px`
- Desktop max width: roughly `1120px` to `1280px`
- Card padding: `20px` to `28px`
- Form vertical spacing: consistent and stable

## Components

### App Shell

- Top navigation with FitFlow brand and route pills.
- Must work horizontally on mobile with overflow-safe nav.
- Include logout action when authenticated.
- Keep shell compact and dashboard-like.

### Buttons

Primary button:

- Lime background.
- Dark text.
- Bold label.
- Rounded rectangle.

Secondary button:

- Transparent or translucent panel.
- Soft border.
- Light text.

Danger/logout button:

- Red-tinted border/text.
- Avoid oversized destructive styling.

### Forms

- Use dark input surfaces.
- Use custom Formik validation, not browser-native validation.
- Error messages should animate subtly with fade/slide.
- Reserve space for error messages so inputs do not move.
- Password rules should be visible as a checklist for registration.
- Auth errors should be generic and secure.

Auth error copy examples:

- `Login failed. Check your details and try again.`
- `We could not create your account with those details. Please try again.`
- `We could not reach FitFlow. Check your connection and try again.`

### Cards

- Use translucent dark panels.
- Use subtle white borders.
- Use strong number/stat typography.
- Cards should be scannable and tap-friendly.

### Toasts

- Use shadcn/Sonner-style toast placement.
- Success messages should be concise.
- Avoid repeating the same success toast multiple times.

## Screen Guidance

### Landing Page

- Hero should communicate habit + workout consistency.
- Include direct actions to dashboard/auth.
- Use a visual preview card showing today's workout and habits.

### Login

- Keep simple and secure.
- Fields: email, password.
- Show temporary success feedback after registration/logout.
- Do not display sensitive backend details.

### Register

- Fields: name, email, password.
- Include password rule checklist.
- On success, redirect to login and show success feedback.
- Do not reveal whether an account already exists.

### Dashboard

- Show today's habits, workout streak, workouts this month, and latest weight.
- Use stat cards at the top.
- Main content should include habit checklist and today's workout plan.

### Habits

- Show daily habits as tappable cards.
- Each habit should display completion state and streak.
- Create habit flow should be simple.

### Workouts

- Show workout plans grouped by scheduled day.
- Plan cards should show exercise count and day.
- Detail page should support starting a workout session.

### Progress

- Use simple chart cards.
- Show habit completion, workouts per week, body weight, and exercise progression.
- Charts should be readable on mobile.

## Motion

Use subtle animation only.

Good motion:

- Page sections fade and rise slightly.
- Validation errors fade/slide gently.
- Cards can have small hover transitions.

Avoid:

- Bouncy fitness gimmicks.
- Constant moving backgrounds.
- Large layout shifts during form validation.

## Accessibility

- Maintain strong contrast on dark backgrounds.
- Inputs need visible focus states.
- Buttons need clear disabled states.
- Touch targets should be at least 44px tall.
- Feedback should not depend only on color.

## Implementation Stack

Frontend stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Motion React
- Formik
- TanStack Query
- shadcn/Sonner-style toast

Backend is separate. Do not design backend admin screens unless requested.

## Stitch Instructions

When generating screens in Stitch:

- Use a dark PWA/mobile-first design language.
- Preserve FitFlow's lime/teal accent identity.
- Prefer practical app screens over marketing-heavy layouts.
- Generate responsive layouts that work on mobile and desktop.
- Keep forms stable when errors appear.
- Keep auth feedback secure and generic.
- Use rounded, translucent cards and strong stat typography.
