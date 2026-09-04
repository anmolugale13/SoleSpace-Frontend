# SoleSpace — Shoe E-Commerce Frontend

A fully responsive, frontend-only build of the SoleSpace homepage, styled to match
the provided reference design (navy/orange, white nav, circular category tiles,
live deal countdown) and built with the stack recommended in the project
documentation: **React + React Router + Context API + Tailwind CSS**.

**This pass focused on the homepage** — it's fully built out, interactive and
uses real product photography. Every other route (shop, product detail, cart,
checkout, login, account, admin, etc.) is included as a working but intentionally
light demo so the whole app is click-through-able, without the same level of
visual polish as the homepage.

This is a UI/UX layer only — there is no backend. Cart, wishlist, auth, orders and
the admin console run on mock data and `localStorage`, structured so each piece maps
cleanly onto the REST API described in the spec (`/api/products`, `/api/cart`,
`/api/orders`, etc.) when you're ready to wire up Express/MongoDB.

## Stack

- **React 19** + **Vite** — component UI, fast dev server
- **React Router v6** — public, customer and protected admin routes
- **Context API** — cart, wishlist, auth (mock), toast notifications
- **Tailwind CSS** — utility-first styling, fully responsive (mobile → desktop)

## Getting started

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build      # production build to /dist
npm run preview    # preview the production build
```

## What's implemented

### Homepage (the focus of this build)
- Sticky navbar: utility bar, split-color logo, live search, **Home / Account / Wishlist / Cart** icons with live counts and running cart total, and a category row with **hover dropdowns for Men / Women / Kids** (each linking to real filtered results by gender + category) and **Brands**
- Auto-playing hero carousel (3 slides) with clickable dots, prev/next arrows and
  real shoe photography
- Two promo banner tiles
- **New Arrivals** and **Best Sellers** — horizontal scrollable product rails with
  arrow controls, each card showing badges, star rating, color swatches, a
  size/variant selector, and working **Quick View** + **Add to Cart**
- **Quick View** modal: color/size selection and add-to-cart without leaving the page
- **Shop by Category** — circular photo tiles for Running, Sneakers, Basketball,
  Formal, Casual, Boots
- **Deal of the Day** — live, real-time countdown timer (updates every second)
- **Recently Viewed Products** — genuinely tracks products you open (persisted to
  `localStorage`), with a sensible fallback before you've viewed anything
- Trust badges (secure payment, 30-day returns, authentic products, free delivery
  threshold) and a newsletter signup in the footer
- Fully responsive from small mobile widths up to large desktop, with visible
  keyboard focus states and `prefers-reduced-motion` support

### Catalog (now gender-aware)
- 24 products spread across **Men / Women / Kids**, each with 2–3 colorways and
  real photography, covering Running, Sneakers, Basketball, Formal, Casual and Boots
- The Men / Women / Kids nav dropdowns actually filter the shop page
  (`/shop?gender=women&category=running`, etc.) — the "shop for" filter is also
  available directly in the Shop sidebar
- Listing page: category/gender/brand/size/price/rating filters, sort, grid/list
  view, mobile filter drawer, Quick View on every card

### Everything else (light demo pages, click-through but intentionally simple)
- **Product detail**: color/size variants with per-SKU stock, gallery, PIN-code
  delivery check, tabs, related products
- **Cart & wishlist**: persistent (localStorage), coupon codes (`WELCOME10`,
  `FREESHIP`), free-shipping threshold
- **Checkout**: 4-step guest-friendly flow ending in an order confirmation screen
- **Auth (mock)**: login / register, guest checkout supported throughout
- **Customer account**: overview, order history, saved addresses, settings
- **Admin console** (log in with an email containing "admin"): KPI dashboard,
  product table, order status management, coupon list
- **Static pages**: size guide, FAQ, returns, about, contact, privacy, terms

## Design system

Custom design tokens live in `tailwind.config.js`: deep navy (`track`) as the
primary brand color, a warm orange (`traction`) as the accent/CTA color, plus
soft card shadows (`shadow-card` / `shadow-cardHover`) for the rounded product
cards seen throughout.

Fonts: **Poppins** (display/headings), **Inter** (body), **Space Mono** (the
countdown timer & a few small labels).

Product photography is real, license-free shoe photography from Unsplash
(`src/data/shoeImages.js` centralizes the photo IDs) — swap in Cloudinary URLs
here once a real product catalog exists.

## Project structure

```
src/
  components/     Navbar, Footer, ProductCard, filters, shared UI
  context/        CartContext, WishlistContext, AuthContext, ToastContext
  data/           Mock product catalog & mock order history
  pages/          Route-level pages (Home, Shop, ProductDetail, Cart, Checkout, ...)
  index.css       Design tokens & signature styles
  App.jsx         Route table
```

## Connecting a real backend

Every context (`CartContext`, `AuthContext`, etc.) is the seam to swap mock logic
for real `fetch` calls to the Express API described in the project spec — the
component tree and UI won't need to change.
