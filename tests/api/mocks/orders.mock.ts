import { Page } from "@playwright/test";
import { ORDER_CONSTANTS } from "../api-utils/api.constants";

interface OrderState {
  exists: boolean;
  orderId: string;
  status: string;
}

export async function mockOrders(page: Page) {
  const orderState: OrderState = {
    exists: false,
    orderId: ORDER_CONSTANTS.mockOrderId,
    status: ORDER_CONSTANTS.createdStatus,
  };

  // POST /orders
  await page.route("**/orders", route => {
    if (route.request().method() !== "POST") return route.continue();

    const body = route.request().postDataJSON?.();

    // Validation: missing userId
    if (!body?.userId) {
      return route.fulfill({
        status: ORDER_CONSTANTS.badRequestStatus,
        contentType: "application/json",
        body: JSON.stringify({ message: ORDER_CONSTANTS.missingUserIdMessage }),
      });
    }

    // Validation: quantity <= 0
    if (body?.productDetails?.quantity <= 0) {
      return route.fulfill({
        status: ORDER_CONSTANTS.badRequestStatus,
        contentType: "application/json",
        body: JSON.stringify({ message: ORDER_CONSTANTS.invalidQuantityMessage }),
      });
    }

    // Validation: product not found (example productId 999)
    if (body?.productDetails?.productId === 999) {
      return route.fulfill({
        status: ORDER_CONSTANTS.notFoundStatus,
        contentType: "application/json",
        body: JSON.stringify({ message: ORDER_CONSTANTS.productNotFoundMessage }),
      });
    }

    orderState.exists = true;
    orderState.status = ORDER_CONSTANTS.createdStatus;

    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        orderId: orderState.orderId,
        status: orderState.status,
        quantity: body?.productDetails?.quantity ?? 2,
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
          status: ORDER_CONSTANTS.notFoundStatus,
          body: JSON.stringify({ message: ORDER_CONSTANTS.notFoundMessage }),
        });
      }
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          order: { id: orderState.orderId, status: orderState.status },
          item: { productId: 555, quantity: 2 },
          shipping: { addressId: 3001 },
        }),
      });
    }

    // PUT /orders/{id}
    if (req.method() === "PUT") {
      if (!orderState.exists || orderId !== orderState.orderId) {
        return route.fulfill({
          status: ORDER_CONSTANTS.notFoundStatus,
          body: JSON.stringify({ message: ORDER_CONSTANTS.notFoundMessage }),
        });
      }
      orderState.status = ORDER_CONSTANTS.updatedStatus;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ order: { id: orderState.orderId, status: orderState.status } }),
      });
    }

    // DELETE /orders/{id}
    if (req.method() === "DELETE") {
      if (!orderState.exists || orderId !== orderState.orderId) {
        return route.fulfill({
          status: ORDER_CONSTANTS.notFoundStatus,
          body: JSON.stringify({ message: ORDER_CONSTANTS.notFoundMessage }),
        });
      }
      orderState.exists = false;
      return route.fulfill({ status: ORDER_CONSTANTS.deleteNoContentStatus, body: "" });
    }

    return route.continue();
  });

  // PATCH /orders/status
  await page.route("**/orders/status", route => {
    const req = route.request();
    if (req.method() !== "PATCH") return route.continue();

    if (!orderState.exists) {
      return route.fulfill({
        status: ORDER_CONSTANTS.notFoundStatus,
        body: JSON.stringify({ message: ORDER_CONSTANTS.notFoundMessage }),
      });
    }

    orderState.status = ORDER_CONSTANTS.shippedStatus;
    return route.fulfill({
      status: 200,
      body: JSON.stringify({ status: orderState.status }),
    });
  });
}
