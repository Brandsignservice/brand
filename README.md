# Brand Sign — agency website

Premium minimalist website for **Brand Sign**, a creative marketing agency producing
**product photography**, **poster design** and **UGC ads**.

Aesthetic: white paper, near-black type, restrained ash-gold accents — editorial, quiet,
expensive, conversion-focused.

```
index.html                    # the whole site (semantic, single page)
assets/css/styles.css         # design system + layout + responsive rules
assets/js/main.js             # reveal, filters, mobile nav, form validation, image swap
assets/fonts/                 # self-hosted Inter + Instrument Serif (no external requests)
assets/img/logo-mark.png      # the studio's BS monogram (header, favicon)
assets/img/logo-lockup.png    # full BS lockup (footer, gold rule recoloured to the palette)
assets/og/brand-sign-og.jpg   # social share card
assets/projects/              # ← live image slots + library/ (the client's archive)
server.mjs                    # zero-dependency static preview server
```

## Run it locally

```bash
npm start          # → http://localhost:4173
# or
PORT=8080 npm run dev
```

No build step, no dependencies — `server.mjs` is plain Node (>= 18).

## What's already wired in

| Item | Value | Where |
|------|-------|-------|
| Instagram | `https://www.instagram.com/brandsign.products?dlrf=MW1sdDRuamZlZ2xyYQ==` | header, mobile menu, contact, footer |
| Facebook | `https://www.facebook.com/share/19dYk6CtXd.` | header, mobile menu, contact, footer |
| Email | `services.brandsign@gmail.com` | hero CTA, contact section, footer, mailto form fallback |
| Logo & work | pulled from the Google Drive folder **Brand** (36 files) | header, footer, hero, portfolio |

Social icons are marked `data-placeholder-link="facebook|instagram"`, so a single search
swaps a link everywhere:

```bash
grep -rn 'data-placeholder-link' index.html
```

## Portfolio images — live, replaceable slots

Every image area is a designed frame that shows the client's current work and swaps to
a new file the moment one is added. To replace a tile, overwrite the file in
`assets/projects/` with the **same name** (e.g. `work-01.jpg`) and refresh — no code
changes. If a file is missing, the slot falls back to a designed ash-gold placeholder
frame that prints the expected file name.

The full slot table, the library of all 35 client exports and the mapping back to the
Google Drive files live in
[`assets/projects/README.md`](assets/projects/README.md) and
[`assets/projects/manifest.json`](assets/projects/manifest.json).

## Sections

`Hero` → `Services` (3 disciplines) → `Work` (filterable portfolio, feature tile +
8 tiles) → `Process` (5 steps) → `Results` (inverted stats band) → `Testimonials` →
`CTA` → `Contact` (form + details) → `Footer`.

## Content to personalise before launch

* **Testimonials** — three placeholder quotes in `index.html` (`#testimonials`); swap in
  the client's real names, roles and results.
* **Stats** — the numbers in the `#cta` band (`data-count` attributes) are placeholders;
  update them to the client's real figures.
* **Hero badge** — the `3.2×` ROAS chip in the hero is a placeholder figure.
* **Portfolio captions** — project titles and categories in `index.html` describe the
  current images; update them if the work changes.
* **Domain** — set the real domain in a `<link rel="canonical">` and the `og:url` tag
  once hosting is decided.

## Contact form

Validation runs in the browser. With no endpoint configured the brief is handed to the
visitor's mail client (mailto → `services.brandsign@gmail.com`).

To post to a real endpoint, add a `data-endpoint` attribute to `#contact-form`:

```html
<form class="form" id="contact-form" data-endpoint="https://formspree.io/f/xxxx" novalidate>
```

…or use Netlify Forms by adding `netlify` + `name="brief"` to the `<form>` tag.

## Accessibility & performance notes

* Semantic landmarks, skip link, visible focus rings, `aria` labels on all icon links,
  `aria-pressed` on the portfolio filters.
* `prefers-reduced-motion` disables reveals, the marquee and the stat counters.
* Fonts are self-hosted (172 KB total) — no Google Fonts request, no FOUT, works offline.
* Lazy-loaded images, `aspect-ratio` frames (no layout shift), progressive JPEGs.
* Zero JavaScript dependencies: one HTML file, one CSS file, one JS file.

## Deploy

Any static host works: Netlify, Vercel, GitHub Pages, Cloudflare Pages. Build command:
none. Publish directory: the repository root.
