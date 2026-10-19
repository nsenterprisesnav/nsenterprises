# SEO and deployment checklist

## Included in this package
- `robots.txt`: permits public crawling and points to the sitemap.
- `sitemap.xml`: lists the current public HTML pages.
- Page-specific titles, descriptions, canonical links, Open Graph and Twitter metadata.
- JSON-LD structured data for the business, service pages, breadcrumbs and articles.
- `404.html`, `site.webmanifest`, and a simple SVG favicon.
- `.htaccess` for Apache hosting: HTTPS redirect, compression and browser caching (review host support before enabling).

## Before deployment — required
1. **Confirm the domain:** This package uses `https://saipranayenterprises.in/` as the intended canonical domain. If you deploy on another domain or use `www`, update every canonical URL, sitemap URL, robots.txt sitemap line, schema URL and social URL consistently.
2. **Verify business facts:** Confirm business name, phone, address, operating hours, service area, inspection price, years of experience, and every service/brand claim. The demo currently contains some sample/provisional claims and a phone number that must be checked.
3. **Replace sample reviews:** Do not publish fabricated testimonials. Use authentic reviews only with permission. The sample review cards are not marked up as review structured data.
4. **Images and rights:** Replace remote Unsplash images with genuine business/service images you own or have licensed. Compress them to WebP/AVIF where practical; give useful alt text.
5. **Forms:** Current booking form opens a WhatsApp message; the review form is only a demo and does not store reviews. Test the phone number and WhatsApp destination. If storing personal information, add a privacy notice and secure server-side handling.
6. **Content quality:** Ensure every service page has original, accurate content, real service coverage, useful FAQs, clear contact details and no copied/keyword-stuffed paragraphs.
7. **Check paths:** All URLs in `sitemap.xml` must return HTTP 200 and be canonical, indexable pages. Remove pages that are not published. Do not submit preview/staging URLs.
8. **HTTPS:** Configure a valid TLS certificate and redirect HTTP to the chosen HTTPS host. Confirm the site works with and without `www`, then redirect all variants to one preferred host.
9. **Performance:** Run PageSpeed Insights for mobile and desktop. Resize images, reduce unused code, avoid layout shifts, and test on a real phone.
10. **Accessibility/usability:** Check keyboard navigation, contrast, labels, alt text, heading order and tap target sizes.
11. **Google Search Console:** Verify domain ownership, submit `https://saipranayenterprises.in/sitemap.xml`, inspect the homepage and key service pages, and monitor indexing/CWV/security reports.
12. **Google Business Profile:** Claim/verify the legitimate profile if eligible. Keep name, address/phone, hours, service areas and website consistent. Do not create fake locations or keyword-stuff the business name.
13. **Analytics:** Set up GA4 only if needed and disclose tracking appropriately. Track call/WhatsApp clicks without collecting unnecessary personal data.
14. **Backups and security:** Keep a copy of the deployed files, update hosting credentials, and remove test forms/content.
15. **Post-launch:** Check Search Console after deployment and again over the following weeks. Indexing and ranking changes are not immediate or guaranteed.

## Structured data note
The JSON-LD in this project is guidance for search engines, not a ranking guarantee. Only keep properties that are accurate, visible to users, and supported by the actual business. Validate with Google's Rich Results Test and Schema Markup Validator. Google may choose not to show enhanced results even when markup is valid.

## Local SEO note
Structured data does not replace a verified Google Business Profile, genuine reviews, useful location/service content, real-world reputation, and consistent business details.

16. **Social preview image:** `/assets/og-image.jpg` is included at 1200×630. Replace it with brand-approved artwork if available and ensure the final image is accessible at the same public URL.
