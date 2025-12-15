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
  });
});
