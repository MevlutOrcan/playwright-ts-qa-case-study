export const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8081";

export const endpoints = {
  login: `${API_BASE_URL}/auth/login`,
  orders: `${API_BASE_URL}/orders`,
  orderById: (id: string) => `${API_BASE_URL}/orders/${id}`,
  orderStatus: `${API_BASE_URL}/orders/status`,
};
