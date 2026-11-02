# Sai Pranay Enterprises — HTML/CSS/JavaScript Clone

A responsive, multi-page front-end recreation inspired by the publicly accessible Sai Pranay Enterprises website.

## Stack
- HTML5
- CSS3
- Vanilla JavaScript
- Optional PHP can be added later for server-side form processing; this version does not require PHP.

## Run locally
1. Extract the ZIP.
2. Open `index.html` in your browser.
3. For best testing, use VS Code with the Live Server extension.
4. Service pages are inside `services/`; article pages are inside `articles/`.

## Responsive checks

Run `node --test tests/booking.test.cjs tests/feedback.test.cjs` for form validation tests.
Run `node tests/responsive-audit.cjs` with Playwright installed for the browser audit.
If Playwright is installed outside this project, set `PLAYWRIGHT_MODULE` to its module path.
Optionally set `CHROMIUM_PATH` to an existing Chromium executable.
The audit checks all 11 pages at 15 widths from 320 to 1920 pixels, plus mobile and landscape menus, booking validation, feedback and FAQ interactions.
External resources are blocked by default to test fallbacks; set `AUDIT_ONLINE=1` to enable them.
Screenshots and the JSON report are saved in `tmp/responsive-audit/` (ignored by Git).

## Included
- Responsive homepage
- Six service detail pages
- Three appliance-care article pages
- Responsive navigation menu
- FAQ accordions
- Call and WhatsApp links
- Service request form that opens a prefilled WhatsApp message
- Review form demo (does not store or publish reviews)
- Map embed
- Responsive mobile styles

## Before publishing
- Verify the business phone number, address, hours, pricing, claims and WhatsApp number.
- Replace remote Unsplash images with owned/licensed images or assets supplied by the business.
- Replace sample testimonials with real reviews used with permission.
- Update the design after comparing against the live reference in desktop and mobile browsers.
- If you need actual booking storage, email notifications, or an admin dashboard, add PHP endpoints and a database. Do not collect personal data without an appropriate privacy notice and secure handling.
- The color palette and imagery are an implementation approximation, not extracted original source CSS/assets.

## Suggested PHP extension (optional)
A PHP backend is only needed if booking requests should be stored, emailed, or managed by an admin. Static call/WhatsApp actions work without PHP.
"# testrepo" 
"# testrepo" 
"# testrepo" 
"# nsenterprises" 
"# nsenterprises" 
