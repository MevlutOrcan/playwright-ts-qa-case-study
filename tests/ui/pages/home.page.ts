import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly productCards: Locator;
  readonly homeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCards = page.locator('.card');
    this.homeLink = page.locator('a.nav-link', { hasText: 'Home' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async navigateToHome() {
    await this.homeLink.click();
  }

  async navigateToCategory(categoryName: string) {
    await this.page.click(`text=${categoryName}`);
  }

  getProductCardAt(index: number): Locator {
    return this.productCards.nth(index);
  }

  async getProductNameAt(index: number): Promise<string> {
    const card = this.getProductCardAt(index);
    const name = await card.locator('.card-title a').textContent();
    return name?.trim() ?? '';
  }

  async getProductPriceAt(index: number): Promise<string> {
    const card = this.getProductCardAt(index);
    const price = await card.locator('h5').textContent();
    return price?.trim() ?? '';
  }

  async openProductAt(index: number): Promise<void> {
    const card = this.getProductCardAt(index);
    await card.locator('.card-title a').click();
  }
}


