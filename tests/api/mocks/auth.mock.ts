import { Page } from "@playwright/test";
import { AUTH_CONSTANTS } from "../api-utils/api.constants";

export async function mockAuth(page: Page) {
  await page.route("**/auth/login", async route => {
    const request = route.request();
    const body = request.postDataJSON?.();

    // SUCCESS
    if (
      body?.username === AUTH_CONSTANTS.validUsername &&
      body?.password === AUTH_CONSTANTS.validPassword
    ) {
      return route.fulfill({
        status: AUTH_CONSTANTS.successStatus,
        contentType: "application/json",
        body: JSON.stringify({
          token: AUTH_CONSTANTS.successToken,
        }),
      });
    }

    // FAILURE
    return route.fulfill({
      status: AUTH_CONSTANTS.unauthorizedStatus,
      contentType: "application/json",
      body: JSON.stringify({
        message: AUTH_CONSTANTS.authErrorMessage,
      }),
    });
  });
}
