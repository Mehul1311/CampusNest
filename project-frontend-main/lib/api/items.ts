/**
 * Items API
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { Item } from "./types";

interface ListParams {
  category?: string;
  college?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/** Home feed: same-college items only, excludes current user's listings. Auth required. Returns buyer_price. */
export async function getHomeFeed(params: { category?: string; search?: string; limit?: number; offset?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.search) sp.set("search", params.search ?? "");
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.offset != null) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  const url = API_ENDPOINTS.ITEMS.HOME_FEED + (qs ? `?${qs}` : "");
  const data = await apiClient.get<{ items: Item[]; total: number }>(url);
  return { success: true as const, data };
}

export async function getItems(params: ListParams = {}) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.college) sp.set("college", params.college);
  if (params.search) sp.set("search", params.search);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.offset != null) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  const url = API_ENDPOINTS.ITEMS.LIST + (qs ? `?${qs}` : "");
  const data = await apiClient.get<{ items: Item[]; total: number }>(url);
  return { success: true as const, data };
}

export async function getItem(id: string) {
  const data = await apiClient.get<{ item: Item }>(API_ENDPOINTS.ITEMS.GET(id));
  return { success: true as const, data };
}

export async function getMyListings(params?: { limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  const url = API_ENDPOINTS.ITEMS.MY_LIST + (qs ? `?${qs}` : "");
  const data = await apiClient.get<{ items: Item[]; total: number }>(url);
  return { success: true as const, data };
}

export async function createItem(payload: {
  title: string;
  categoryId: string;
  price: number;
  description?: string;
  images?: string[];
  college?: string;
  contactPhone?: string;
}) {
  const data = await apiClient.post<{ item: Item }>(API_ENDPOINTS.ITEMS.CREATE, payload as Record<string, unknown>);
  return { success: true as const, data };
}

export async function updateItem(
  id: string,
  payload: Partial<{
    title: string;
    price: number;
    description: string;
    images: string[];
    status: "active" | "sold" | "inactive";
  }>
) {
  const data = await apiClient.put<{ item: Item }>(API_ENDPOINTS.ITEMS.UPDATE(id), payload as Record<string, unknown>);
  return { success: true as const, data };
}

export async function deleteItem(id: string) {
  await apiClient.delete(API_ENDPOINTS.ITEMS.DELETE(id));
  return { success: true as const };
}
