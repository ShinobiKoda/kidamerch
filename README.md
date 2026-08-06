# Pixel Drop

Lovable Prompt: Anime Merch Store (Frontend Only, Mock Data)

Project Overview

Build a single-page-app style e-commerce site for anime merchandise. This is a frontend-only prototype — no backend, no real API calls, no real payment processing. Use mock/static JSON data for products, events, and orders. Cart, wishlist, and "checkout" state should persist using React state (and localStorage if needed for session persistence), not a database.

Design Direction

Aesthetic: Premium, clean, minimal — NOT gradient-heavy, NOT "generic AI startup" looking. Think more editorial/streetwear-drop energy (like a limited sneaker release site) than a typical SaaS template.

No unnecessary gradients. Use solid colors, subtle borders, and shadow/elevation instead of gradient fills. Gradients only allowed sparingly for accents (e.g. a glow behind the hero logo), never on buttons/cards/backgrounds by default.

Typography-led design: strong, confident type hierarchy. Pair a bold display font for headings (something with anime/manga edge but still legible — e.g. a condensed sans or a sharp geometric sans) with a clean neutral sans for body text.

Do NOT use Inter. It's overused and reads as generic/default AI-site typography — avoid it entirely, including as a fallback. For headings, use something with more character and confidence, e.g. Space Grotesk, General Sans, Clash Display, Bricolage Grotesque, or Archivo Black/Expanded — anything with distinct personality, tighter letter-spacing options, and a bit of edge. For body text, pair with something warmer/more refined than a default system sans, e.g. General Sans, Satoshi, Manrope, or Public Sans. Load fonts via Google Fonts or Fontshare. Headings and body font should be visibly distinct from each other, not just different weights of the same family.

Light & Dark mode: full theme support with a toggle in the nav. Dark mode should feel like the "default"/hero mode (moody, premium) — light mode should feel crisp and airy, not just an inverted dark theme.

Color system: neutral base (near-black / near-white) with ONE confident accent color (e.g. a saturated red, electric indigo, or crimson — anime-poster energy) used sparingly for CTAs, price tags, active states, and wishlist hearts.

Motion: sleek, purposeful, never gimmicky. Favor easing curves like cubic-bezier(0.16, 1, 0.3, 1), short durations (150–400ms for micro-interactions, up to 800ms for page transitions). Use Framer Motion.

Intro / Loader

On first load, show a brief animated loader (1.5–2.5s max) before revealing the site.

Concept: a katana/brushstroke line-draw animation, or a manga-style "impact frame" (speed lines + logo snap-in), or ink-splash reveal — pick one and execute it cleanly, not busy.

Loader background matches current theme (dark/light). Skip-on-click or skip-on-scroll allowed.

After loader, hero content should fade/slide in staggered (logo → headline → CTA → nav).

Site Structure / Pages (single app, route-based)

1. Landing Page (/)

Hero section: full viewport height (or close to it), bold headline, short subtext, primary CTA ("Shop the Drop" or similar), secondary CTA ("View Events"). Include one large product/character illustration or hero image placeholder with subtle parallax or float animation on scroll.

Featured/New Arrivals strip: horizontally scrollable or grid of 4–6 featured products, each as a card with hover-lift animation and quick "add to wishlist" icon.

Category tiles: e.g. Apparel, Figures, Accessories, Prints — animated on scroll-into-view (fade + slight translate-y).

Events teaser section: 2–3 upcoming event cards linking to the full Events page.

Newsletter/CTA footer band and full footer (links, socials, mock legal links).

Use scroll-triggered reveal animations throughout (IntersectionObserver-based, staggered children), but keep them subtle — no bouncing or overshoot on content blocks.

2. Shop / All Items (/shop)

Filter sidebar (desktop) / filter drawer (mobile): category, price range, availability, sort (Newest, Price low-high, Price high-low, Popularity).

Product grid (see breakpoint spec below).

Each product card: image (with hover swap to a second image or subtle zoom), name, category tag, price, wishlist heart icon (fills with a satisfying micro-animation on click), "Add to Cart" button that appears on hover (desktop) or is always visible (mobile).

Empty state and "no results" state designed, not default browser text.

3. Product Detail Page (/product/:id)

Image gallery (main image + thumbnails, swipeable on mobile) with smooth crossfade transitions.

Product info: name, price, description, size/variant selector (animated selection state), quantity stepper.

"Add to Cart" with a satisfying confirmation micro-animation (e.g. button morphs to a checkmark briefly, or item flies toward cart icon).

"Add to Wishlist" toggle.

Related products carousel at the bottom.

4. Events Gallery (/events)

Grid/masonry gallery of anime-related events: conventions, cosplay meetups, signing events, pop-up shops.

Each event card: cover image, event name, date, location, short blurb, "Details" expand (modal or inline accordion with animation).

Filter by upcoming/past.

Consider a lightbox/gallery mode for cosplay photo highlights within an event detail modal.

5. Wishlist (/wishlist)

Grid of saved items, same card style as shop, with "Move to Cart" and "Remove" (animate item removal with a fade + collapse, not an abrupt disappearance).

Empty state with a friendly illustration/CTA back to shop.

6. Cart (/cart or slide-out drawer accessible from any page)

Recommend a slide-out cart drawer (opens from the right) for quick access, PLUS a dedicated /cart page for full review.

Line items with thumbnail, name, variant, quantity stepper, remove button, line total.

Order summary: subtotal, mock shipping estimate, mock tax, total.

Animated quantity changes and totals (numbers should tween/count up-down, not just snap).

"Proceed to Checkout" CTA.

7. Mock Checkout (/checkout)

Multi-step flow (Shipping Info → Payment → Confirmation) with an animated step indicator/progress bar.

Shipping form: name, address, email (mock validation only, no real submission).

Payment step: mock card input UI (styled like a real card form — animated card number formatting, a flipping card preview if you want to go the extra mile) — clearly no real payment processor is wired up, just simulate a 1–2s "processing" state with a loading animation.

Confirmation step: success animation (checkmark draw-in, confetti or subtle particle burst), mock order number, order summary recap.

Navigation & Global Elements

Sticky/floating nav bar with logo, links (Shop, Events, Wishlist, Cart with item count badge), theme toggle, and a search icon (mock search with client-side filtering over mock data is fine).

Nav should condense/shrink on scroll (reduce height, add background blur/solid bg) rather than staying static.

Cart icon badge should animate (pulse/pop) when an item is added.

Toast/snackbar notifications for "Added to cart," "Added to wishlist," etc. — animated in/out from a corner, auto-dismiss.

Responsive Breakpoints (be strict about these)

Design and test explicitly at these widths:

Mobile (base): 375px–639px

Single-column layouts everywhere.

Bottom nav bar OR hamburger menu (your call, but be consistent) — recommend a slide-in full-screen menu with staggered link animations.

Product grid: 2 columns.

Filters: drawer/bottom-sheet, not sidebar.

Hero: stacked (image below or behind text), reduced type scale.

Small tablet: 640px–767px (sm)

Product grid: 2 columns, larger cards.

Nav: hamburger still likely, more breathing room.

Tablet: 768px–1023px (md)

Product grid: 3 columns.

Filters can move to a collapsible inline panel instead of a full sidebar.

Hero: can start introducing side-by-side layout.

Desktop: 1024px–1279px (lg)

Product grid: 4 columns.

Full sidebar filters visible on Shop page.

Nav: full horizontal link list visible.

Hero: side-by-side text + image layout.

Large desktop: 1280px+ (xl / 2xl)

Product grid: 4–5 columns, max content width constrained (e.g. max-w-7xl) and centered — don't let content stretch edge-to-edge on ultra-wide screens.

Increase whitespace/margins rather than stretching cards.

At every breakpoint, verify: cart drawer width adapts (full-screen on mobile, fixed ~400–480px panel on desktop), modals/lightboxes are full-screen on mobile and centered dialogs on desktop, and touch targets are at least 44px on mobile.

Animation Library / Technical Notes

Use Framer Motion for React-based transitions (page transitions, staggered reveals, hover states, drawer slide-ins).

Use CSS transitions for simple hover/state changes (color, shadow) to keep things performant.

Respect prefers-reduced-motion — provide a reduced-motion fallback (fades instead of complex movement).

All animations should feel snappy, not sluggish — avoid anything over ~600ms except the initial intro loader.

Mock Data

Create a mockProducts.json-style dataset: ~16–24 products across categories (Apparel, Figures, Accessories, Prints), each with id, name, category, price, description, images (array), variants (sizes/colors where relevant), stock status.

Create a mockEvents.json-style dataset: 6–8 events with id, name, date, location, cover image, description, gallery images.

All images can be placeholder/stock imagery relevant to anime/streetwear aesthetics — no real copyrighted anime character art or franchise logos.

Tone Reminder

Premium but approachable — like a well-designed indie merch drop, not a cluttered fan site. Prioritize whitespace, confident typography, and restraint over decoration. Every animation should feel intentional, never distracting from the products themselves.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://drop-showcase-ui.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b344d5a7-01b6-4f52-996c-764600b8fbc6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
