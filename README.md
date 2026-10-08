# Studio Ford — 2026 theme work (Biglow Studio)

New, self-contained Shopify (Online Store 2.0) building blocks for the approved scope. Everything is prefixed
`sf-` so it drops into the `Studio Ford - 2026` **preview** theme without overwriting existing theme files.
Nothing here touches the live theme: pushing is always `--theme <preview id>`, never the live theme.

> Status: built and `shopify theme check`-clean against Dawn. **Not yet run on the real store/theme** — see "Integrating".

## Scope map

| Scope item | What was built | Where |
|---|---|---|
| 1 Homepage | Framed hero video (adjustable width/ratio), featured collection rows, shoppable editorial | `sections/sf-hero-video`, `sf-featured-collections`, `sf-shoppable`, `templates/index.sf.json` |
| 2 PLP | 3-col desktop / 2-col tablet+mobile grid, hover alt image, Quick Add | `snippets/sf-product-card`, `sections/sf-collection`, `assets/sf-base.css`, `sf-quick-add.js` |
| 3 Filtering | Chip filters (Print, Product type, any others), print swatches, mobile filter panel, sort | `sections/sf-collection` |
| 4 Editorial layouts | Repeatable 1×1 / 1×2 / 2×1 tiles (image or video) slotted between product rows | `sf-collection` blocks + `snippets/sf-editorial-tile` |
| 5 PDP | Mobile sticky Add to Cart; Same Print + Shopify Recommendations | `sections/sf-sticky-atc`, `sf-related-same-print`, `sf-related-shopify` |
| 6 Archive | Editorial accordion index, repeatable block per past collection (cover image/video + gallery) | `sections/sf-archive`, `templates/page.archive.json` |
| 7 Checkout | Draft black/white branding mutation (not applied) | `docs/checkout-branding.graphql` |
| 8 Klaviyo | Not done — see below | — |
| 9 Analytics | PostHog (or GA4) snippet + funnel events | `snippets/sf-analytics.liquid` |
| 10 Responsive/QA | Mobile-first CSS; QA still needed on real theme/devices | — |

## Integrating into the real theme
1. `shopify theme pull --theme <Studio Ford - 2026 id>` into this repo (on a branch), then merge these files in. No existing file needs editing except step 4–5.
2. New templates are *alternates* (`collection.sf`, `index.sf`, `page.archive`) so you can assign them per collection/page and compare against the existing ones.
3. Product page: in the theme editor add **SF Sticky Add to Cart**, **SF Same Print**, **SF Recommendations** to the product template. If the theme's add-to-cart button isn't `form[action*='/cart/add'] [name='add']`, set the selector in the sticky section.
4. Analytics: add `{% render 'sf-analytics' %}` before `</head>` in `layout/theme.liquid`; fill in the key at the top of the snippet.
5. If the theme has a cart drawer, listen for the `sf:cart-updated` event in `assets/sf-quick-add.js` to refresh it (themes differ, so this is the one bit of glue to confirm).

## Store configuration these sections rely on (Admin, not code)
- **Filters**: install/open *Shopify Search & Discovery* → Filters; add *Product type* and a *Print* filter. For print swatches, make the print a **metafield/metaobject with swatch** (colour or image) and use the same label as the section setting "Print" (default).
- **Hover image**: optional product metafield `custom.hover_image` (File → image) for a chosen lifestyle/detail shot; otherwise the 2nd product image is used.
- **Same Print**: product metafield `custom.print` (text) *or* tag `print:<Name>`; plus one automated collection per print with handle `print-<name>` (e.g. `print-wildflower`), condition = print equals that name. Or set `custom.same_print` (list of products) per product to override.
- **Recommendations**: Shopify generates these; optionally add complementary products in Search & Discovery.
- **Archive**: create a page, assign template `page.archive`, add one block per archived collection (newest first).

## Not done, and why
- **Klaviyo (item 8)**: the Klaviyo connector available in this session is Biglow Studio's *own* account (org "Biglow", sender hello@biglow.com), not Studio Ford's. Nothing was read or changed for the client. Needs Studio Ford's Klaviyo access (private API key, or a connector authorised on their account) — then: diagnose the welcome flow, build Abandoned Cart + Browse Abandonment as drafts, review the signup form/SMS config.
- **Checkout (item 7)**: file is a draft only; needs the plan (Plus vs not) confirmed.
- **No live testing**: no Shopify store access in this session, so nothing was previewed or pushed.
