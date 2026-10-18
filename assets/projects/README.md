# Project images — live slots, ready to be replaced

Every image area on the site is a **designed slot**. It currently shows the client's
own work (pulled from the Google Drive folder **Brand**), and it can be swapped for any
new file in one step — no code, no build, no CMS.

## How the swap works

Each frame in `index.html` is built like this:

```html
<figure class="ph" data-ratio="4/5">
  <img src="assets/projects/work-01.jpg" alt="Mystic Oud perfume bottle photographed on driftwood"
       loading="lazy" data-ph onerror="this.classList.add('is-missing')" />
  <span class="ph__fallback" aria-hidden="true"> … designed placeholder frame … </span>
</figure>
```

* If the file exists → the real image covers the frame.
* If the file is missing → the ash-gold placeholder frame (frame icon, label, file name)
  stays visible, so the layout never breaks and the slot is self-documenting.

The behaviour lives in `assets/js/main.js` (`img[data-ph]` error handling).

## Slots on the page

| Slot | File | Ratio | Where it appears | Currently shows |
|------|------|-------|------------------|-----------------|
| 1 | `hero-01.jpg` | 4:5 | Hero — large frame | Noir perfume, dramatic red light |
| 2 | `hero-02.jpg` | 1:1 | Hero — creator frame | Gold serum, warm studio light |
| 3 | `hero-03.jpg` | 3:4 | Hero — poster frame | Radiance cream campaign poster |
| 4 | `work-01.jpg` | 4:5 | Portfolio — **feature tile** (2×2) | Mystic Oud — Studio Still Life |
| 5 | `work-02.jpg` | 4:5 | Portfolio | Roots Rebooted — Creator Ad |
| 6 | `work-03.jpg` | 4:5 | Portfolio | Tropica Mango — Campaign Poster |
| 7 | `work-04.jpg` | 4:5 | Portfolio | Aloe Vera — Splash Catalogue Shot |
| 8 | `work-05.jpg` | 4:5 | Portfolio | Medikube — Routine Creator Cut |
| 9 | `work-06.jpg` | 4:5 | Portfolio | Freshgro — Launch Poster |
| 10 | `work-07.jpg` | 4:5 | Portfolio | Oud Vanilla — Editorial Still |
| 11 | `work-08.jpg` | 4:5 | Portfolio | Drygh — Lifestyle Ad Frame |
| 12 | `work-09.jpg` | 4:5 | Portfolio | Radiance — Cream Campaign |

## Replacing an image

1. Export the final work as JPG or WebP, sRGB, long edge ≈ 1400 px (≈ 150–250 KB).
2. Overwrite the file in `assets/projects/` using the **same name** (the name is printed
   on the placeholder, so matching is trivial).
3. Refresh the browser — done.

To change the order, the category filter (`data-category="photography | poster | ugc"`)
or the caption under a tile, edit the matching `<article class="work">` block in
`index.html`.

## `library/` — the full client archive

`assets/projects/library/` holds the studio's complete set (35 exports, max 1000 px,
named after the project). Drag any of them into `assets/projects/` and rename it to a
slot name to use it on the site.

`manifest.json` in this folder maps every slot and library file back to the original
Google Drive file name, file ID and link.

## Google Drive source

Folder **Brand** — <https://drive.google.com/drive/folders/1zlG0TzcEaW9Co2adT_T40T5DD_V1-c3a> (36 files).
The studio logo (`370754843_1792244123227068.jpg`) was extracted to
`assets/img/logo-mark.png` and `assets/img/logo-lockup.png` for the header, footer,
favicon and social share card.
