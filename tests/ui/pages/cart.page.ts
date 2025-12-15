import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartRows: Locator;
  readonly totalPrice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartRows = page.locator('#tbodyid tr');
    this.totalPrice = page.locator('#totalp');
  }

  async navigateToCart() {
    await this.page.click('#cartur');
    await this.page.waitForURL('**/cart.html');
  }

  async getSumOfProductPrices(): Promise<number> {
    // Wait until at least one product exists in cart
    await expect(this.cartRows.first()).toBeVisible();

    const prices = await this.cartRows
      .locator('td:nth-child(3)')
      .allTextContents();

    return prices
      .map(p => Number(p.trim()))
      .reduce((acc, curr) => acc + curr, 0);
  }

  async getTotalPrice(): Promise<number> {
    const text = await this.totalPrice.textContent();
    return Number(text?.trim());
  }

  async expectSumEqualsTotal() {
    const sum = await this.getSumOfProductPrices();
    const total = await this.getTotalPrice();

    expect(sum).toBe(total);
  }
}
