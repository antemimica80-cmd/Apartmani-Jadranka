# Aparmtani-Jadranka
Website for Apartmani Jadranka

## Site

The site lives at the repository root — a static, framework-free HTML/CSS/JS website
for the family's apartment rentals in Mimice, Croatia. It's set up this way so hosting
providers that Git-deploy the repo root directly (e.g. Hostinger) can serve it with no
extra build step.

- `index.html` — homepage (hero, unit overview, why-stay, contact/inquiry)
- `pages/stan.html`, `pages/istok.html` — individual unit pages
- `css/style.css` — shared styles
- `js/main.js` — mobile nav + inquiry form handling
- `images/` — drop real photos here (see `images/README.md` for how to wire them in)

To preview locally, open `index.html` in a browser, or serve the repo root with any
static file server (e.g. `npx serve .`).

Placeholders to edit before launch: contact email/phone in `index.html`'s contact section,
and the Airbnb/Booking.com/Vrbo links in the same section.
