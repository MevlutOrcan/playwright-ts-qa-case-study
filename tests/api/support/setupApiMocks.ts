import { Page } from "@playwright/test";
import { mockAuth } from "../mocks/auth.mock";
import { mockOrders } from "../mocks/orders.mock";

export async function setupApiMocks(page: Page) {
  await mockAuth(page);
  await mockOrders(page);
}
