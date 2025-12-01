import { test, expect } from '@playwright/test';

.png`, fullPage: true });
}

test.use({
  viewport: {
    height: 720,
    width: 1280
  }
});

test('test', async ({ page }) => {
  await page.goto('https://my-stage.reya.net/');
  // Screenshot step-1.png
  await expect(page.getByRole('button', { name: 'Toggle Clinical Laboratory' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Enter Email Address' }).click();
  // Screenshot step-2.png
  await page.getByRole('textbox', { name: 'Enter Email Address' }).fill('recording@test2');
  // Screenshot step-3.png
  await page.getByRole('textbox', { name: 'Enter Email Address' }).press('Tab');
  // Screenshot step-4.png
  await page.getByRole('textbox', { name: 'Enter Password' }).press('Shift+Tab');
  // Screenshot step-5.png
  await page.getByRole('textbox', { name: 'Enter Email Address' }).press('ArrowRight');
  // Screenshot step-6.png
  await page.getByRole('textbox', { name: 'Enter Email Address' }).fill('recording@test2.com');
  // Screenshot step-7.png
  await page.getByRole('textbox', { name: 'Enter Email Address' }).press('Tab');
  // Screenshot step-8.png
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('fews4vs4r5e');
  // Screenshot step-9.png
  await page.getByRole('button', { name: 'Login' }).click();
  // Screenshot step-10.png
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  // Screenshot step-11.png
});