const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQ FAIL:', request.url(), request.failure().errorText));
  await page.goto('https://infininote-kappa.vercel.app/board/test', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
