const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully');
  } catch (err) {
    console.error('Navigation error:', err.message);
  }

  await browser.close();
})();
