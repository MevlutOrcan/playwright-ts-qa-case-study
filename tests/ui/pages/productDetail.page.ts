import { Page, Locator } from "@playwright/test";

export class ProductDetailPage {
  readonly page: Page;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator('h2.name');
    this.productPrice = page.locator('h3.price-container');
    this.addToCartButton = page.locator('text=Add to cart');
  }

  async addToCartAndAcceptAlert() {
    // Handle browser alert triggered by "Add to cart"
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await this.addToCartButton.click();
  }


}
