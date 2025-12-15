// tests/ui/specs/US_01_ShowAddToCart.spec.ts
import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../pages/productDetail.page';
import { HomePage } from '../pages/home.page';

test('Should display correct product details and enabled Add to Cart button', async ({ page }) => {
  const homePage = new HomePage(page);
  const productDetailPage = new ProductDetailPage(page);

  await test.step('Navigate to Laptops category', async () => {
    await homePage.goto();
    await homePage.navigateToCategory('Laptops');
  });

  const { expectedName, expectedPrice } = await test.step('Read product name and price from home page', async () => {
    const expectedName = await homePage.getProductNameAt(0);
    const expectedPrice = await homePage.getProductPriceAt(0);
    return { expectedName, expectedPrice };
  });

  await test.step('Open product detail page', async () => {
    await homePage.openProductAt(0);
  });

  await test.step('Verify product details and Add to Cart button', async () => {

    await expect(productDetailPage.productName).toBeVisible();
    await expect(productDetailPage.productName).toHaveText(expectedName);

    await expect(productDetailPage.productPrice).toBeVisible();
    await expect(productDetailPage.productPrice).toContainText(expectedPrice);

    await expect(productDetailPage.addToCartButton).toBeVisible();
    await expect(productDetailPage.addToCartButton).toBeEnabled();
  });
});