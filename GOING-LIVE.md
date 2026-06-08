# 🚀 Chinett Health Care — Going-Live Reference

Developer reference only — not part of the live site.

## File structure (as built)

```
/CHINETT HEALTH CARE
  ├── index.html          ← Part 1 (Homepage)
  ├── services.html       ← Part 2 (Services / Who We Serve / How It Works / FAQ)
  ├── about.html          ← Part 3 (Story / Values / President / Testimonials / Trust)
  ├── contact.html        ← Part 4 (Request form / Map / Final CTA)
  ├── privacy.html        ← Privacy Policy (template)
  ├── terms.html          ← Terms of Service (template)
  ├── favicon.svg         ← Browser tab icon (orange "C" logo mark)
  ├── styles.css          ← Global styles (shared by all pages)
  ├── scripts.js          ← Global JS (shared by all pages)
  └── .claude/            ← local preview helper (serve.ps1, launch.json) — do NOT deploy
```

> Note: `styles.css` / `scripts.js` live at the project root (flat), not in `css/` and `js/`
> subfolders. This works as-is. If you prefer the nested structure, move the files and update
> the `<link>` / `<script>` paths in all four HTML files to `css/styles.css` and `js/scripts.js`.

## External libraries (loaded via CDN in each page `<head>` / before `</body>`)

- **Google Fonts** — Cormorant Garamond, DM Sans, Montserrat
- **AOS** (Animate On Scroll) — `unpkg.com/aos@2.3.1`
- **`hero-bg.js`** (homepage only) — pure Canvas 2D animation: a rotating 3D sphere of nurse
  photos that change as it spins. No WebGL/library; honors prefers-reduced-motion. Works on
  mobile (the hero grows with its content on small screens so the sphere isn't clipped).
  Images are **self-hosted real photos** in `assets/images/photo-1..10.jpg` (downloaded from
  Unsplash, whose licence permits commercial use). **Best practice before launch:** replace
  these with photos of your *own* staff (or your licensed stock) by dropping files in
  `assets/images/` and updating the `NURSE_PHOTOS` array at the top of `hero-bg.js`.
  (The original copyright-free SVG illustrations are still in `assets/images/nurse-1..8.svg`
  if you ever want the illustrated look back.)

Differences from the original spec, by intention (fewer dependencies, same result):
- **CountUp.js** not used — the stat counters use a small custom `requestAnimationFrame`
  counter in `scripts.js` (section 4). No library needed.
- **Font Awesome** not used — icons are inline SVG (logo, social, chevrons) + emoji
  (service/value icons). No icon-font request, faster load.

## Pre-launch QA — status

| Check | Status |
|---|---|
| All 4 pages link to each other | ✅ nav + footer identical across pages |
| Navbar active state per page | ✅ Home / Services / About / Contact set correctly |
| CTA buttons point to correct pages/sections | ✅ `contact.html#request-form`, `#phone`, service anchors |
| Contact form validation (required fields) | ✅ verified — 6 required fields, inline errors |
| Form success state | ✅ verified — hides form, shows card, interpolates first name |
| Mobile menu open/close | ✅ hamburger → full-screen overlay |
| Images load & sized | ✅ Unsplash (needs internet — see below) |
| Google Maps iframe | ✅ embedded (Victoria Island, Lagos placeholder) |
| Fonts load | ✅ verified in preview |
| AOS animations on scroll | ✅ `data-aos="fade-up"` with stagger |
| Stat counters animate on scroll | ✅ IntersectionObserver, custom counter |
| Meta title + description per page | ✅ all 4 pages |
| Phone numbers clickable `tel:` | ✅ |
| WhatsApp uses `wa.me/` format | ✅ `wa.me/14435637693` |

## ⚠️ Before you publish — replace placeholders

Real details now in place:
- ✅ **Phone**: `(443) 563-7693` (main + emergency line), clickable `tel:+14435637693`
- ✅ **WhatsApp**: `wa.me/14435637693`
- ✅ **Address**: 5207 Plainfield Avenue, Baltimore, MD 21206 (+ Google Maps `q=` updated)
- ✅ **Email**: `chinetthealthcare@gmail.com` everywhere (temporary Gmail until a domain email exists)
- ✅ **Testimonials**: Americanized to US names + Maryland locations (still placeholder quotes —
  replace with real, approved client testimonials when available)

Still invented stand-ins — swap before publishing:
- **President name/quote/signature** (about.html): "Dr. Chinwe Ett"
- **Social links**: footer icons currently point to `#`
- **Stats** (index.html): 500+, 1,200+, 6, 100% — confirm real numbers
- **Images**: currently hot-linked from Unsplash (requires internet, not guaranteed permanent).
  For production, download approved photos into `assets/images/` and update `src` paths.

## Brand / colors
The site is themed to the **Chinett HealthCare Inc. logo** palette (set in `styles.css` `:root`):
- **Orange `#F47A1F`** — primary CTAs, highlights, dividers, the italic hero accent
- **Blue `#1C82C4`** — main structural color (links, icon circles, stats/values sections)
- **Deep Navy `#0F2A3D`** — footer, testimonial, hero/page-hero overlays
- **Green `#6FB13C` / Teal `#14A3A3`** — supporting (audience bars, logo mark, success)

> The nav/footer logo now uses the real artwork: **`chinett-logo.jpeg`**. Because the file has a
> black background, it's displayed on a black rounded "plate" (`.logo img` / `.footer-logo-img`
> in `styles.css`) so it reads cleanly over the dark hero, the white scrolled navbar, and the navy
> footer. If you later get a **transparent-background PNG**, just replace `chinett-logo.jpeg` (keep
> the name) and remove `background:#000` from those two CSS rules for a seamless look.
> The `favicon.svg` approximates the logo's orange "C" with green/blue swooshes.

## Done in this build
- ✅ Privacy Policy (`privacy.html`) + Terms of Service (`terms.html`) — footer links now point to them
- ✅ Favicon (`favicon.svg`) linked in every page `<head>`
- ✅ Full rebrand to logo colors across all pages
- ✅ Contact form now **delivers to `chinetthealthcare@gmail.com`** via FormSubmit
  (`https://formsubmit.co/ajax/...` in `scripts.js`) — no backend/signup, keeps the in-page
  success animation. ⚠️ **Activation:** the FIRST submission triggers a one-time confirmation
  email from FormSubmit to that Gmail — open it and click "Activate" once, then all future
  submissions arrive in the inbox. When you move to a domain email, change the address in the
  `fetch(...)` URL in `scripts.js` (and the displayed `mailto:` links).

## Still to do before launch
- Replace remaining placeholders (see list above): president name, social links, stats, testimonial quotes.
- **Activate FormSubmit** by submitting the contact form once and clicking the confirmation email.
- Swap `chinetthealthcare@gmail.com` for the domain email once you have it.
- Privacy/Terms are **templates** — have a lawyer review for the U.S./Maryland laws (e.g. HIPAA) that apply.

## Local preview
No Node/Python on this machine, so a PowerShell static server is included:
`.claude/serve.ps1` serves the folder on `http://localhost:5577`. Just open any `.html`
file directly in a browser too — everything is static.

## Deploy
Drag the folder (minus `.claude/`) to Netlify/Vercel, or upload via cPanel. Connect a custom
domain and enable SSL. No build step required — it's plain static HTML/CSS/JS.
