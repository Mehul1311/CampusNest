/**
 * Categories API
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { Category } from "./types";

export async function getCategories() {
  const data = await apiClient.get<{ categories: Category[] }>(API_ENDPOINTS.CATEGORIES.LIST);
  return { success: true as const, data };
}

export async function getCategory(id: string) {
  const data = await apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.GET(id));
  return { success: true as const, data };
}
