## QA Automation Case Study – API + UI (Playwright + TypeScript)

This project implements the given QA case study using **Playwright + TypeScript** with:
- **API tests** backed by **mocked responses** (no real backend required)
- **UI tests** against the real site `https://demoblaze.com/`
- Clean structure with page objects, test steps, and shared API constants

---

## 1. Tech Stack

- Node.js (LTS recommended)
- Playwright (`@playwright/test`)
- TypeScript

Install dependencies:

```bash
npm install
```

(Optional) Install browsers for Playwright (if not already installed):

```bash
npx playwright install
```

---

## 2. Project Structure

- `tests/ui/pages/` – Page Object Models for Demoblaze UI  
  - `home.page.ts`  
  - `productDetail.page.ts`  
  - `cart.page.ts`
- `tests/ui/specs/`  
  - `US_01_productDetail.spec.ts` – Category Navigation & Product Detail  
  - `US_02_cart.spec.ts` – Add to Cart & Cart Verification
- `tests/api/support/`  
  - `endpoints.ts` – base URL and endpoint definitions  
  - `setupApiMocks.ts` – attaches all API mocks to a Playwright `page`
- `tests/api/mocks/`  
  - `auth.mock.ts` – mock `/auth/login` success & failure  
  - `orders.mock.ts` – mock `/orders`, `/orders/{id}`, `/orders/status`
- `tests/api/services/`  
  - `auth.service.ts` – login payload & response parsing  
  - `order.service.ts` – order payloads, status update payload, helpers
- `tests/api/api-utils/`  
  - `api.constants.ts` – shared constants for tokens, IDs, messages, statuses
- `tests/api/specs/`  
  - `AUS_01_login.spec.ts` – API login tests (positive & negative)  
  - `AUS_02_order.spec.ts` – API order lifecycle tests (create, patch, delete & verify)

The HTML reporter is enabled in `playwright.config.ts`.

---

## 3. API Tests (Mocked Backend)

All API tests run **only against mocks** (no real backend).

Run only **API tests** (Playwright project: `API Tests`):

```bash
npm run test-api
```

---

## 4. UI Tests (Demoblaze)

Target website: `https://demoblaze.com/`

Run only **UI tests** (Playwright project: `UI Tests`):

```bash
npm run test-ui
```

---

## 5. Running All Tests & Viewing Reports

Run **all** tests (API + UI):

```bash
npm test
```

After any test run, open the **Playwright HTML report**:

```bash
npx playwright show-report
```

The tests are structured with `test.step(...)` so that in the **Trace Viewer** (inside the HTML report), you can see each high-level step (e.g. “Setup API mocks”, “Send login request”, “Verify product details and Add to Cart button”) clearly.

---

## 6. Design & Cleanliness

- **Mocks-first API testing**  
  - `setupApiMocks` wires `auth.mock` and `orders.mock` to the Playwright `page`.  
  - All status codes, tokens, order IDs, and messages are centralized in `api.constants.ts`.

- **Page Object Model for UI**  
  - UI specs call methods on `HomePage`, `ProductDetailPage`, and `CartPage` for clarity and reuse.

- **Readability**  
  - Test scenarios are broken into logical `test.step` blocks (Arrange / Act / Assert).  
  - Magic strings are avoided; shared constants and helpers are used instead.


