/**
 * Admin API - stats, users, orders, activity logs
 * (Admin Item CRUD removed per backend)
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { AdminStats, AdminUser, Order, ActivityLog } from "./types";

export async function getAdminStats() {
  const data = await apiClient.get<AdminStats>(API_ENDPOINTS.ADMIN.STATS);
  return { success: true as const, data };
}

export async function getAdminUsers(params?: { limit?: number; offset?: number; role?: string }) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  if (params?.role) sp.set("role", params.role);
  const qs = sp.toString();
  const url = API_ENDPOINTS.ADMIN.USERS + (qs ? `?${qs}` : "");
  const data = await apiClient.get<{ users: AdminUser[] }>(url);
  return { success: true as const, data };
}

export async function updateUserRole(uid: string, role: "user" | "admin" | "superadmin") {
  await apiClient.put(API_ENDPOINTS.ADMIN.USER_ROLE(uid), { role });
  return { success: true as const };
}

export async function getAdminOrders(params?: { limit?: number; offset?: number; status?: string }) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  if (params?.status) sp.set("status", params.status);
  const qs = sp.toString();
  const url = API_ENDPOINTS.ADMIN.ORDERS + (qs ? `?${qs}` : "");
  const data = await apiClient.get<{ orders: Order[] }>(url);
  return { success: true as const, data };
}

export async function getActivityLogs(params?: {
  limit?: number;
  offset?: number;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  if (params?.userId) sp.set("userId", params.userId);
  if (params?.status) sp.set("status", params.status);
  if (params?.startDate) sp.set("startDate", params.startDate);
  if (params?.endDate) sp.set("endDate", params.endDate);
  if (params?.search) sp.set("search", params.search);
  const qs = sp.toString();
  const url = API_ENDPOINTS.ADMIN.ACTIVITY_LOGS + (qs ? `?${qs}` : "");
  const data = await apiClient.get<{ logs: ActivityLog[] }>(url);
  return { success: true as const, data };
}

export async function getActivityLogStats(params?: { startDate?: string; endDate?: string }) {
  const sp = new URLSearchParams();
  if (params?.startDate) sp.set("startDate", params.startDate);
  if (params?.endDate) sp.set("endDate", params.endDate);
  const qs = sp.toString();
  const url = API_ENDPOINTS.ADMIN.ACTIVITY_LOGS_STATS + (qs ? `?${qs}` : "");
  const data = await apiClient.get<unknown>(url);
  return { success: true as const, data };
}
