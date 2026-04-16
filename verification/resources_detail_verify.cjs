const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to resources list page...');
    await page.goto('http://localhost:3000/resources');
    await page.waitForTimeout(2000); // Wait for animations
    await page.screenshot({ path: 'verification/screenshots/resources_list.png' });

    console.log('Clicking on a resource card...');
    const card = await page.locator('a[href^="/resources/"]').first();
    const slug = await card.getAttribute('href');
    await card.click();

    console.log(`Navigated to ${slug}. Waiting for content...`);
    await page.waitForURL(`**${slug}`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/screenshots/resource_detail_gated.png' });

    const gateVisible = await page.isVisible('text=Unlock the Full Resource');
    console.log('Gate visible:', gateVisible);

    if (gateVisible) {
      console.log('Entering email into gate...');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button:has-text("Continue Reading")');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'verification/screenshots/resource_detail_unlocked.png' });

      const unlocked = !(await page.isVisible('text=Unlock the Full Resource'));
      console.log('Content unlocked:', unlocked);
    }

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
})();
