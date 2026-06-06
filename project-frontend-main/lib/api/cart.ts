/**
 * Cart API
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { CartData } from "./types";

export async function getCart() {
  const data = await apiClient.get<CartData>(API_ENDPOINTS.CART.ROOT);
  return { success: true as const, data };
}

export async function addToCart(itemId: string, quantity = 1) {
  const data = await apiClient.post<{ cartItem: unknown }>(API_ENDPOINTS.CART.ADD, {
    itemId,
    quantity,
  });
  return { success: true as const, data };
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  if (quantity === 0) {
    await apiClient.delete(API_ENDPOINTS.CART.REMOVE(itemId));
    return { success: true as const, message: "Item removed from cart" };
  }
  const data = await apiClient.put<{ cartItem: unknown }>(
    API_ENDPOINTS.CART.UPDATE_QUANTITY(itemId),
    { quantity }
  );
  return { success: true as const, data };
}

export async function removeFromCart(itemId: string) {
  await apiClient.delete(API_ENDPOINTS.CART.REMOVE(itemId));
  return { success: true as const };
}

export async function clearCart() {
  await apiClient.delete(API_ENDPOINTS.CART.ROOT);
  return { success: true as const };
}
