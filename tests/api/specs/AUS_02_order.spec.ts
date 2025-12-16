// tests/api/specs/AUS_02_order.spec.ts

import { test, expect, Page } from "@playwright/test";
import { setupApiMocks } from "../support/setupApiMocks";
import { endpoints } from "../support/endpoints";
import { OrderService } from "../services/order.service";
import { ORDER_CONSTANTS } from "../api-utils/api.constants";

/* =========================================================
   CREATE ORDER
========================================================= */
test("Mock Create Order - Success (201)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  const response = await test.step("Send create order request", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { status: res.status, body: await res.json() };
    }, { url: endpoints.orders, payload: OrderService.createOrderPayload() });
  });

  await test.step("Parse and verify create order response", async () => {
    const parsed = OrderService.parseCreateOrderResponse(response.body);

    expect(response.status).toBe(201);
    expect(parsed.orderId).toBe(ORDER_CONSTANTS.mockOrderId);
    expect(parsed.status).toBe(ORDER_CONSTANTS.createdStatus);
    expect(response.body).toMatchObject({
      orderId: ORDER_CONSTANTS.mockOrderId,
      status: ORDER_CONSTANTS.createdStatus,
      quantity: expect.any(Number),
    });
  });
});

/* =========================================================
   CREATE ORDER – NEGATIVE
========================================================= */
test("Mock Create Order - Missing userId (400)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  const response = await test.step("Send create order request without userId", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { status: res.status, body: await res.json() };
    }, {
      url: endpoints.orders,
      payload: OrderService.createOrderPayloadWithoutUserId(),
    });
  });

  await test.step("Verify validation error response", async () => {
    expect(response.status).toBe(ORDER_CONSTANTS.badRequestStatus);
    expect(response.body).toMatchObject({
      message: ORDER_CONSTANTS.missingUserIdMessage,
    });
  });
});

test("Mock Create Order - Invalid quantity <= 0 (400)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  const response = await test.step("Send create order request with invalid quantity", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { status: res.status, body: await res.json() };
    }, {
      url: endpoints.orders,
      payload: OrderService.createOrderPayloadWithInvalidQuantity(0),
    });
  });

  await test.step("Verify validation error response", async () => {
    expect(response.status).toBe(ORDER_CONSTANTS.badRequestStatus);
    expect(response.body).toMatchObject({
      message: ORDER_CONSTANTS.invalidQuantityMessage,
    });
  });
});

test("Mock Create Order - Product not found (404)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  const response = await test.step("Send create order request with non-existent product", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { status: res.status, body: await res.json() };
    }, {
      url: endpoints.orders,
      payload: OrderService.createOrderPayloadWithNonExistentProduct(),
    });
  });

  await test.step("Verify product not found error response", async () => {
    expect(response.status).toBe(ORDER_CONSTANTS.notFoundStatus);
    expect(response.body).toMatchObject({
      message: ORDER_CONSTANTS.productNotFoundMessage,
    });
  });
});

/* =========================================================
   UPDATE ORDER (PUT)
========================================================= */
test("Mock Update Order - Success (PUT)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  // 🔹 Precondition: Create order
  await test.step("Create order as precondition", async () => {
    await page.evaluate<
      void,
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    }, { url: endpoints.orders, payload: OrderService.createOrderPayload() });
  });

  // 🔹 Update order (PUT)
  const putResponse = await test.step("Update order (PUT)", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { status: res.status, body: await res.json() };
    }, {
      url: OrderService.orderByIdUrl(
        endpoints.orders,
        ORDER_CONSTANTS.mockOrderId,
      ),
      payload: OrderService.updateOrderPayload(3),
    });
  });

  await test.step("Verify order update response", async () => {
    expect(putResponse.status).toBe(200);
    expect(putResponse.body.order.id).toBe(ORDER_CONSTANTS.mockOrderId);
    expect(putResponse.body.order.status).toBe(ORDER_CONSTANTS.updatedStatus);
    expect(putResponse.body).toMatchObject({
      order: {
        id: ORDER_CONSTANTS.mockOrderId,
        status: ORDER_CONSTANTS.updatedStatus,
      },
    });
  });
});

test("Mock Update Order - Not Found (PUT)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  const response = await test.step("Send PUT request for non-existent order", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { status: res.status, body: await res.json() };
    }, {
      url: OrderService.orderByIdUrl(
        endpoints.orders,
        ORDER_CONSTANTS.invalidOrderId,
      ),
      payload: OrderService.updateOrderPayload(2),
    });
  });

  await test.step("Verify not found response for PUT", async () => {
    expect(response.status).toBe(ORDER_CONSTANTS.notFoundStatus);
    expect(response.body).toMatchObject({
      message: ORDER_CONSTANTS.notFoundMessage,
    });
  });
});

/* =========================================================
   PATCH – STATUS UPDATE
========================================================= */
test("Mock Update Order Status (PATCH)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  // 🔹 Precondition: Create order
  await test.step("Create order as precondition", async () => {
    await page.evaluate<
      void,
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    }, { url: endpoints.orders, payload: OrderService.createOrderPayload() });
  });

  // 🔹 Patch order status
  const patchResponse = await test.step("Patch order status", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { status: res.status, body: await res.json() };
    }, {
      url: endpoints.orderStatus,
      payload: OrderService.updateStatusPayload(
        ORDER_CONSTANTS.mockOrderId,
        ORDER_CONSTANTS.shippedStatus,
      ),
    });
  });

  await test.step("Verify updated order status", async () => {
    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.status).toBe(ORDER_CONSTANTS.shippedStatus);
    expect(patchResponse.body).toMatchObject({
      status: ORDER_CONSTANTS.shippedStatus,
    });
  });
});

test("Mock Update Order Status - Not Found (PATCH)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  const response = await test.step("Send PATCH request without existing order", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { status: res.status, body: await res.json() };
    }, {
      url: endpoints.orderStatus,
      payload: OrderService.updateStatusPayload(
        ORDER_CONSTANTS.mockOrderId,
        ORDER_CONSTANTS.shippedStatus,
      ),
    });
  });

  await test.step("Verify not found response for PATCH", async () => {
    expect(response.status).toBe(ORDER_CONSTANTS.notFoundStatus);
    expect(response.body).toMatchObject({
      message: ORDER_CONSTANTS.notFoundMessage,
    });
  });
});

/* =========================================================
   DELETE ORDER & VERIFY
========================================================= */
test("Mock Delete Order – Success & Verify Not Found", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  // 🔹 Precondition: Create order
  await test.step("Create order as precondition", async () => {
    await page.evaluate<
      void,
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    }, { url: endpoints.orders, payload: OrderService.createOrderPayload() });
  });

  // 🔹 Delete order
  const delResponse = await test.step("Delete order", async () => {
    return await page.evaluate<
      { status: number },
      { url: string }
    >(async ({ url }) => {
      const res = await fetch(url, { method: "DELETE" });
      return { status: res.status };
    }, {
      url: OrderService.orderByIdUrl(
        endpoints.orders,
        ORDER_CONSTANTS.mockOrderId,
      ),
    });
  });

  await test.step("Verify delete response status", async () => {
    expect(delResponse.status).toBe(ORDER_CONSTANTS.deleteNoContentStatus);
    expect(delResponse).toMatchObject({ status: ORDER_CONSTANTS.deleteNoContentStatus });
  });

  // 🔹 Verify order no longer exists
  const getAfterDelete = await test.step("Verify order no longer exists", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string }
    >(async ({ url }) => {
      const res = await fetch(url);
      return { status: res.status, body: await res.json() };
    }, {
      url: OrderService.orderByIdUrl(
        endpoints.orders,
        ORDER_CONSTANTS.mockOrderId,
      ),
    });
  });

  await test.step("Verify 404 response after delete", async () => {
    expect(getAfterDelete.status).toBe(ORDER_CONSTANTS.notFoundStatus);
    expect(getAfterDelete.body.message).toBe(ORDER_CONSTANTS.notFoundMessage);
    expect(getAfterDelete.body).toMatchObject({
      message: ORDER_CONSTANTS.notFoundMessage,
    });
  });
});

/* =========================================================
   GET ORDER – SUCCESS & NOT FOUND
========================================================= */
test("Mock Get Order - Success (200)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  await test.step("Create order as precondition", async () => {
    await page.evaluate<
      void,
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    }, { url: endpoints.orders, payload: OrderService.createOrderPayload() });
  });

  const response = await test.step("Send GET request for existing order", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string }
    >(async ({ url }) => {
      const res = await fetch(url);
      return { status: res.status, body: await res.json() };
    }, {
      url: OrderService.orderByIdUrl(
        endpoints.orders,
        ORDER_CONSTANTS.mockOrderId,
      ),
    });
  });

  await test.step("Verify GET order response", async () => {
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      order: { id: ORDER_CONSTANTS.mockOrderId, status: ORDER_CONSTANTS.createdStatus },
      item: { productId: 555, quantity: 2 },
      shipping: { addressId: 3001 },
    });
  });
});

test("Mock Get Order - Not Found (404)", async ({ page }) => {
  await test.step("Setup API mocks and open blank page", async () => {
    await setupApiMocks(page);
    await page.goto("about:blank");
  });

  const response = await test.step("Send GET request for invalid orderId", async () => {
    return await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string }
    >(async ({ url }) => {
      const res = await fetch(url);
      return { status: res.status, body: await res.json() };
    }, {
      url: OrderService.orderByIdUrl(
        endpoints.orders,
        ORDER_CONSTANTS.invalidOrderId,
      ),
    });
  });

  await test.step("Verify GET not found response", async () => {
    expect(response.status).toBe(ORDER_CONSTANTS.notFoundStatus);
    expect(response.body).toMatchObject({
      message: ORDER_CONSTANTS.notFoundMessage,
    });
  });
});