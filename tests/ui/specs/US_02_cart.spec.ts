import { test } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { ProductDetailPage } from '../pages/productDetail.page';
import { HomePage } from '../pages/home.page';

test('US_02: Add some products and verify total price', async ({ page }) => {
  const homePage = new HomePage(page);
  const cartPage = new CartPage(page);
  const productDetailPage = new ProductDetailPage(page);

  await test.step('Open first product and add to cart', async () => {
    await homePage.goto();
    await homePage.openProductAt(0);
    await productDetailPage.addToCartAndAcceptAlert();
  });

  await test.step('Go to cart, then return and add same product again', async () => {
    await cartPage.navigateToCart();
    await page.goBack();
    await productDetailPage.addToCartAndAcceptAlert();
  });

  await test.step('Go back to homepage and add a second product', async () => {
    await homePage.navigateToHome();
    await homePage.openProductAt(1);
    await productDetailPage.addToCartAndAcceptAlert();
  });

  await test.step('Verify sum of product prices equals total', async () => {
    await cartPage.navigateToCart();
    await cartPage.expectSumEqualsTotal();
  });
});
