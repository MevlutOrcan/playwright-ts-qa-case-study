// tests/api/specs/AUS_01_auth.spec.ts

import { test, expect } from "@playwright/test";
import { setupApiMocks } from "../support/setupApiMocks";
import { endpoints } from "../support/endpoints";
import { AuthService } from "../services/auth.service";
import { AUTH_CONSTANTS } from "../api-utils/api.constants";

/* =========================================================
   LOGIN – SUCCESS
========================================================= */

test("Mock Login API - Success (200)", async ({ page }) => {

  await test.step("Setup API mocks", async () => {
    await setupApiMocks(page);
  });

  await test.step("Open blank page", async () => {
    await page.goto("about:blank");
  });

  let response: { status: number; body: Record<string, any> };

  await test.step("Send login request", async () => {
    response = await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return {
        status: res.status,
        body: await res.json(),
      };
    }, {
      url: endpoints.login,
      payload: AuthService.loginPayload(),
    });
  });

  await test.step("Parse login response", async () => {
    const parsed = AuthService.parseLoginResponse(response!.body);
    expect(parsed.token).toBe(AUTH_CONSTANTS.successToken);
  });

  await test.step("Verify response status", async () => {
    expect(response!.status).toBe(AUTH_CONSTANTS.successStatus);
  });

});


/* =========================================================
   LOGIN – FAILURE
========================================================= */
test("Mock Login API - Failure (401)", async ({ page }) => {

  await test.step("Setup API mocks", async () => {
    await setupApiMocks(page);
  });

  await test.step("Open blank page", async () => {
    await page.goto("about:blank");
  });

  let response: { status: number; body: Record<string, any> };

  await test.step("Send login request with invalid credentials", async () => {
    response = await page.evaluate<
      { status: number; body: Record<string, any> },
      { url: string; payload: Record<string, any> }
    >(async ({ url, payload }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return {
        status: res.status,
        body: await res.json(),
      };
    }, {
      url: endpoints.login,
      payload: AuthService.loginPayload(
        AUTH_CONSTANTS.invalidUsername,
        AUTH_CONSTANTS.invalidPassword,
      ),
    });
  });

  await test.step("Verify unauthorized response (401)", async () => {
    expect(response!.status).toBe(AUTH_CONSTANTS.unauthorizedStatus);
  });

  await test.step("Verify error message", async () => {
    expect(response!.body.message).toBe(AUTH_CONSTANTS.authErrorMessage);
  });

});

