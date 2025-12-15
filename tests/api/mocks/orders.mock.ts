import { Page } from "@playwright/test";

interface OrderState {
  exists: boolean;
  orderId: string;
  status: string;
}

export async function mockOrders(page: Page) {
  const orderState: OrderState = {
    exists: false,
    orderId: "MOCK-ORDER-001",
    status: "CREATED",
  };

  // POST /orders
  await page.route("**/orders", route => {
    if (route.request().method() !== "POST") return route.continue();

    orderState.exists = true;
    orderState.status = "CREATED";

    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        orderId: orderState.orderId,
        status: orderState.status,
        quantity: 2,
      }),
    });
  });

  // GET /orders/{id}
  await page.route("**/orders/*", route => {
    const req = route.request();
    const orderId = req.url().split("/").pop();

    if (req.method() === "GET") {
      if (!orderState.exists || orderId !== orderState.orderId) {
        return route.fulfill({
          status: 404,
          body: JSON.stringify({ message: "Order not found" }),
        });
      }
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ order: { id: orderState.orderId, status: orderState.status } }),
      });
    }

    // PUT /orders/{id}
    if (req.method() === "PUT") {
      if (!orderState.exists || orderId !== orderState.orderId) {
        return route.fulfill({ status: 404 });
      }
      orderState.status = "UPDATED";
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ order: { id: orderState.orderId, status: orderState.status } }),
      });
    }

    // DELETE /orders/{id}
    if (req.method() === "DELETE") {
      if (!orderState.exists || orderId !== orderState.orderId) {
        return route.fulfill({ status: 404 });
      }
      orderState.exists = false;
      return route.fulfill({ status: 204, body: "" });
    }

    return route.continue();
  });

  // PATCH /orders/status
  await page.route("**/orders/status", route => {
    const req = route.request();
    if (req.method() !== "PATCH") return route.continue();

    if (!orderState.exists) {
      return route.fulfill({
        status: 404,
        body: JSON.stringify({ message: "Order not found" }),
      });
    }

    orderState.status = "SHIPPED";
    return route.fulfill({
      status: 200,
      body: JSON.stringify({ status: orderState.status }),
    });
  });
}
