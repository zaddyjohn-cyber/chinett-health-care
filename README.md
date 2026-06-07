# Chinett HealthCare Inc. — Website

Marketing website for **Chinett HealthCare Inc.** — a nurse/patient care-matching service.
_"Connecting the right nurse to the right patient at the right time."_

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Homepage — hero, stats, mission, services, who-we-serve, testimonials, CTA |
| `services.html` | Full services deep-dive, who we serve, how it works, FAQ |
| `about.html` | Story, values, president's message, professionals, testimonials, trust |
| `contact.html` | Request form, contact info, map, alternative contact options |
| `privacy.html` | Privacy Policy (template) |
| `terms.html` | Terms of Service (template) |

## Tech

- Plain **static HTML / CSS / JS** — no build step required
- Shared `styles.css` and `scripts.js` across all pages
- [AOS](https://github.com/michalsnik/aos) for scroll animations (via CDN)
- Google Fonts: Cormorant Garamond, DM Sans, Montserrat
- Brand palette set in `styles.css` `:root` (orange / blue / navy / green / teal — from the logo)

## Run locally

It's static — just open `index.html` in a browser. Or serve the folder with any static server, e.g.:

```bash
# Python
python -m http.server 5577
# Node
npx serve .
```

## Deploy

Drag the folder to **Netlify** / **Vercel**, or upload via cPanel. No build step.
See `GOING-LIVE.md` for the full pre-launch checklist and remaining placeholders to replace.
