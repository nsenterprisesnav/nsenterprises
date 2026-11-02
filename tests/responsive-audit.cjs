// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright module if needed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'tmp', 'responsive-audit');
fs.mkdirSync(out, {recursive:true});
const pages = ['index.html', ...['services','articles'].flatMap(dir => fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.html')).map(f=>`${dir}/${f}`)), '404.html'];
const widths = [320,360,390,440,600,760,768,820,960,1024,1025,1100,1280,1440,1920];
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'));
  if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || undefined});
  const page = await browser.newPage({reducedMotion:'reduce'});
  const errors=[]; const results=[]; const interactions=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Default to offline external resources to also check font and logo fallbacks.
  await page.route('**/*',route=>new URL(route.request().url()).origin===base || process.env.AUDIT_ONLINE ? route.continue() : route.abort());
  try {
    for(const file of pages) {
      await page.goto(`${base}/${file}`);
      await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});
      for(const width of widths) {
        await page.setViewportSize({width,height:900});
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const result=await page.evaluate(()=>{
          const width=innerWidth;
          const visible=e=>e.getClientRects().length && getComputedStyle(e).visibility!=='hidden';
          const overflow=[...document.body.querySelectorAll('*')].filter(e=>visible(e)&&!e.closest('.review-marquee,.brand-marquee')).filter(e=>{const r=e.getBoundingClientRect();return r.right>width+1||r.left < -1;}).map(e=>`${e.tagName}.${e.className}`).slice(0,16);
          const brokenImages=[...document.images].filter(i=>visible(i)&&(!i.complete||!i.naturalWidth)).map(i=>i.getAttribute('src'));
          return {documentWidth:document.documentElement.scrollWidth,overflow,brokenImages};
        });
        results.push({file,width,...result});
        if(['index.html','services/cooking-range.html','articles/chimney-care.html'].includes(file)&&[320,768,1025,1440].includes(width)) {
          await page.screenshot({path:path.join(out,`${file.replaceAll('/','-')}-${width}.png`),fullPage:true});
          await page.screenshot({path:path.join(out,`${file.replaceAll('/','-')}-${width}-viewport.png`)});
        }
      }
      await page.setViewportSize({width:320,height:568});
      if(await page.locator('.menu-toggle').count()) {
        await page.locator('.menu-toggle').click();
        const nav=await page.locator('.main-nav').evaluate(e=>({bottom:e.getBoundingClientRect().bottom,height:innerHeight,scrollable:e.scrollHeight>e.clientHeight}));
        interactions.push({file,type:'menu',...nav});
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
        await page.setViewportSize({width:844,height:390});
        await page.locator('.menu-toggle').click();
        const landscape=await page.locator('.main-nav').evaluate(e=>({bottom:e.getBoundingClientRect().bottom,height:innerHeight,scrollable:e.scrollHeight>e.clientHeight}));
        assert.ok(landscape.bottom<=landscape.height,`${file}: landscape menu exceeds viewport`);
        interactions.push({file,type:'landscape-menu',...landscape});
        await page.keyboard.press('Escape');
        await page.setViewportSize({width:320,height:568});
      }
      if(await page.locator('[data-book-service]').count()) {
        await page.locator('[data-book-service]:visible').first().click();
        const dialog=await page.locator('#service-booking-dialog').evaluate(e=>({width:e.clientWidth,scrollWidth:e.scrollWidth,open:e.open}));
        interactions.push({file,type:'booking',...dialog});
        assert.ok(dialog.open && dialog.scrollWidth<=dialog.width,`${file}: booking dialog overflows`);
        if(file.startsWith('services/')) assert.notEqual(await page.locator('#booking-appliance').inputValue(),'Other',`${file}: service not preselected`);
        await page.locator('#service-booking-form button[type=submit]').click();
        assert.equal(await page.locator('#booking-name').getAttribute('aria-invalid'),'true');
        await page.keyboard.press('Escape');
        await page.waitForFunction(()=>!document.body.classList.contains('booking-dialog-open'));
      }
      if(file==='index.html') {
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.waitForFunction(()=>document.querySelector('.main-nav .active')?.getAttribute('href')==='index.html');
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>document.querySelector('.main-nav .active')?.getAttribute('href')==='#services');
        await page.locator('[data-open-review]').click();
        assert.equal(await page.locator('#feedback-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
        await page.locator('#reviewForm button[type=submit]').click();
        assert.equal(await page.locator('#feedback-name').getAttribute('aria-invalid'),'true');
        await page.locator('#feedback-name').fill('Audit Customer');
        await page.locator('#feedback-appliance').selectOption('Cooking range');
        await page.locator('#feedback-review').fill('Responsive form check');
        await page.evaluate(()=>{window.open=()=>null;});
        await page.locator('#reviewForm button[type=submit]').click();
        assert.match(await page.locator('#reviewForm .booking-fallback').getAttribute('href'),/^https:\/\/wa.me\/919493984204\?text=/);
        await page.locator('#feedback-dialog .booking-close').click();
        await page.locator('.accordion summary').first().click();
        assert.equal(await page.locator('.accordion details').first().getAttribute('open'),'');
        interactions.push({file,type:'navigation-feedback-faq',passed:true});
      }
    }
    const report={results,interactions,errors};
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
    const failures=results.filter(r=>r.documentWidth>r.width+1||r.overflow.length||r.brokenImages.length);
    console.log(JSON.stringify({checks:results.length,failures,interactionChecks:interactions.length,errors},null,2));
    assert.equal(failures.length,0,'Responsive layout or image failures; see report.json');
    assert.equal(errors.length,0,'Browser JavaScript errors');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
