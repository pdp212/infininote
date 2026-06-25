const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://infininote-kappa.vercel.app/', { waitUntil: 'networkidle0' });
  // find elements with "tlui"
  const tluiClasses = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).map(el => el.className).filter(c => typeof c === 'string' && c.includes('tlui')).slice(0, 20);
  });
  console.log('TLUI CLASSES:', tluiClasses);
  await browser.close();
})();
