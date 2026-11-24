# Ns Enterprises website

Static website for Ns Enterprises, kitchen appliance repair, Hyderabad: https://nsenterprices.in/

Plain HTML, CSS and JavaScript. Vercel deploys the `main` branch.

## Structure
- `index.html`, `about.html`, `contact.html`, `privacy-policy.html`, `terms.html`, `404.html`
- `services/`: nine service pages
- `areas/`: seven area pages
- `articles/`: six appliance-care articles
- `assets/`: styles, scripts, images and social preview images (`og/`)
- `sitemap.xml`, `robots.txt`, `vercel.json` and the Google verification file
- `signage/`: shop signboard artwork (not published)

## Run locally
Serve the folder, for example with VS Code Live Server, and open the root URL. Links use folder addresses, so opening the files directly will not navigate correctly.

## Checks
- `node --test tests/booking.test.cjs tests/feedback.test.cjs`
- `node tests/responsive-audit.cjs` (needs Playwright; set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` if installed elsewhere)
