/**
 * Orders & Payment API - create order, Razorpay, verify, my orders
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { CreateOrderData, Order } from "./types";

export async function createOrder() {
  const data = await apiClient.post<CreateOrderData>(API_ENDPOINTS.ORDERS.CREATE);
  return { success: true as const, data };
}

export async function verifyPayment(payload: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const data = await apiClient.post<{ order: Order }>(API_ENDPOINTS.ORDERS.VERIFY_PAYMENT, payload);
  return { success: true as const, data };
}

export async function getMyOrders(params?: { limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  const url = API_ENDPOINTS.ORDERS.MY + (qs ? `?${qs}` : "");
  const data = await apiClient.get<{ orders: Order[]; total: number }>(url);
  return { success: true as const, data };
}

export async function getOrder(id: string) {
  const data = await apiClient.get<{ order: Order }>(API_ENDPOINTS.ORDERS.GET(id));
  return { success: true as const, data };
}
