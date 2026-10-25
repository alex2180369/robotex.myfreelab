# RoboSpark Academy — landing page

> **Update:** the Yandex Form and the modal window were replaced by a form in the last block of the page. Requests are sent to a Google Sheet through Google Apps Script (`SITE_CONFIG.googleSheetsUrl` in `js/main.js`, sheet `robotex`). The sections below that mention Yandex Forms describe the previous version.


A modern, responsive, conversion-focused single-page landing site for **RoboSpark
Academy**, a *fictional* children's robotics school in Kazan, Russia (ages 6–10).

> **Educational portfolio project.** The school does not exist. All business
> details, prices, offers and program details are fictional placeholders.

Tagline: **Imagine. Build. Discover.**

---

## Run it

No build step, no dependencies. Open the file directly:

```text
index.html
```

or serve the folder with any static server, e.g.:

```bash
npx serve .
python -m http.server 8000
```

---

## Page structure (exactly two main content sections)

| # | Section | Content blocks (nested) |
|---|---------|--------------------------|
| 1 | `#hero` — Hero | Navigation (logo, “Kazan, Russia”, anchor link `#program`), eyebrow, headline, subheadline, primary CTA, photo |
| 2 | `#program` — Benefits, learning process & offer | 1. Section heading + intro · 2. Four benefit cards · 3. Three-step learning process (`BUILD` → `CODE` → `EXPERIMENT`) · 4. Compact pricing · 5. Closing CTA |

A minimal `<footer>` (not a content section) carries the location, tagline and
the fictional-project disclaimer.

---

## Files

```text
index.html          Semantic markup, all copy, inline SVG icons
css/styles.css      Design tokens + all styles (mobile-first)
js/main.js          Form-URL config (SITE_CONFIG.formUrl) + modal + footer year
assets/img/         Optimised photography + favicon
```

---

## ⚙️ Editing guide

### 1. Contact form (both CTA buttons)

Both CTAs — **“Book a free trial class”** and **“Message us to get started”** —
open a modal window with an embedded **Yandex Form** (fields: name, surname,
email). The form URL is configured in ONE place:

```js
// js/main.js
var SITE_CONFIG = {
	formUrl: "https://forms.yandex.ru/u/6ad39c08852af3b798c7a1b8"  // ← change here
};
```

* The form iframe loads **only when the modal is opened** — no third-party
  request happens before that. It uses the official Yandex embed
  (`?iframe=1` + `forms.yandex.ru/_static/embed.js`, loaded on first open),
  so the frame auto-sizes to the full height of the form.
* The `href` attributes on the CTAs in `index.html` are no-JavaScript
  fallbacks (they open the form directly) — keep them in sync.
* If the frame is blocked by the browser, the modal offers an
  “Open it in a new tab” link that follows `SITE_CONFIG.formUrl`.
* Modal behaviour (`js/main.js`): `Esc` and the backdrop close it, focus is
  trapped inside the dialog and returned to the triggering button on close.

#### Getting the data (Yandex Forms → answers table)

Submissions are **not** stored on the site — they are collected by Yandex
Forms itself. To view and retrieve them:

1. Open [forms.yandex.ru](https://forms.yandex.ru) → select the form →
   tab **“Ответы”** (Answers).
2. Switch the view to **“Таблица”** (Table): each submission is a row, each
   column is a form field (Имя, Фамилия, почта) plus submission time.
3. Export: **“Скачать файл”** → `XLSX`, `CSV` or `JSON`. You can filter by
   date/period first, save answers to Yandex.Disk, or share a single answer.
4. Optional: form settings → **“Интеграция”** → enable e-mail notifications
   so every new answer is forwarded to your inbox.

> The current URL is a personal form (`/u/…`): it is viewed and exported
> through the web interface only. Moving the form to **Yandex 360 (Forms for
> Business)** (`/surveys/…`) unlocks scripted access via the
> [Yandex Forms API](https://yandex.ru/support/forms/ru/api-ref/about)
> (OAuth token required).

### 2. Prices and offers (all fictional)

Search `index.html` for `FICTIONAL PRICE`. Current placeholders:

| Offer | Price | Note under the price |
|-------|-------|----------------------|
| Free Trial Class | `0 RUB` | Your first class is completely free. |
| Single Class | `900 RUB` | One 60-minute session. |
| 4-Class Pack | `3,200 RUB` | Four sessions in one pack. |

The pricing block also carries a visible disclaimer:
*“All prices are fictional placeholders created for this educational project.”*

### 3. Other editable assumptions

* Ages: `6–10` (hero eyebrow + `meta description`)
* Session length: `60 minutes` (single-class note)
* Location label: `Kazan, Russia` (navigation + footer)
* Section / card copy lives in `index.html` with explanatory comments.

### 4. Photography

Images are served locally from `assets/img/` (optimised JPEG, ~370 KB total):

| File | Used for |
|------|----------|
| `hero-child-robot-1600.jpg` / `-800.jpg` | Hero photo (responsive `srcset`) |
| `step-build.jpg` | Learning step 1 — `BUILD` |
| `step-code.jpg` | Learning step 2 — `CODE` |
| `step-experiment.jpg` | Learning step 3 — `EXPERIMENT` |
| `favicon.svg` | Browser tab icon |

**Source:** free stock photography from [Pexels](https://www.pexels.com/)
(photo IDs `7869079`, `7868839`, `5665500`, `7869034`) — free to use under the
Pexels License, no attribution required. Replace them with your own photos of
children (6–10) building educational robots if you have them; keep the file
names or update the `src` / `srcset` attributes and the `alt` text.

---

## Design notes

* **Palette:** deep navy `#101C35`, bright yellow `#F6C453`, cobalt `#365CCB`,
  white and pale grey `#F5F7FB`.
* **Type:** Plus Jakarta Sans (Google Fonts) with a system-font fallback stack,
  so the page still renders correctly offline.
* **Components:** `.container`, `.eyebrow`, `.btn`, `.card`, `.block`, price
  cards, step cards — reused across the page.
* **Icons:** hand-drawn inline SVG (bolt logo, pin, arrows, lightbulb, gear,
  code brackets, spark) — no icon font or third-party script.

## Accessibility & performance

* Semantic landmarks (`header`, `main`, `section`, `footer`), one `h1`,
  logical `h2 → h3 → h4` heading order, `aria-labelledby` on both sections.
* Colour contrast: white/yellow on navy ≈ 10–15:1, cobalt on white ≈ 5.9:1,
  body grey on pale grey ≈ 6.8:1 (all above WCAG AA).
* Visible keyboard focus rings (cobalt on light surfaces, yellow on navy),
  skip link, 44 px+ touch targets, `:hover` / `:focus-visible` / `:active`
  button states.
* The contact modal is a real dialog: `role="dialog"` + `aria-modal`,
  labelled heading, focus trap, `Esc`/backdrop close, focus restored to the
  trigger, background scroll locked while open.
* `prefers-reduced-motion` disables smooth scrolling and transitions.
* Optimised images with explicit `width`/`height` (no layout shift),
  `fetchpriority="high"` on the hero, `loading="lazy"` below the fold,
  responsive `srcset` for the hero photo.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari (CSS Grid, `aspect-ratio`,
`:focus-visible`, `text-wrap: balance` are used; unsupported features degrade
gracefully).
