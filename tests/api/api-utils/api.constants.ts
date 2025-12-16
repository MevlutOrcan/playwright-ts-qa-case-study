// Shared constants for API tests and mocks

export const AUTH_CONSTANTS = {
  validUsername: "testuser",
  validPassword: "password123",
  invalidUsername: "wrong",
  invalidPassword: "wrong",
  successStatus: 200,
  unauthorizedStatus: 401,
  successToken: "mock_jwt_token",
  authErrorMessage: "Authentication failed",
} as const;

export const ORDER_CONSTANTS = {
  mockOrderId: "MOCK-ORDER-001",
  invalidOrderId: "INVALID-ORDER-999",
  createdStatus: "CREATED",
  updatedStatus: "UPDATED",
  shippedStatus: "SHIPPED",
  deleteNoContentStatus: 204,
  badRequestStatus: 400,
  notFoundStatus: 404,
  notFoundMessage: "Order not found",
  missingUserIdMessage: "userId is required",
  invalidQuantityMessage: "quantity must be greater than 0",
  productNotFoundMessage: "Product not found",
} as const;


