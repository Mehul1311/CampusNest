/**
 * API Client - fetch with Bearer token and error handling
 */

import { API_CONFIG, getApiUrl } from "./config";
import type { ApiResponse } from "./types";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorMessage: string,
    public response?: ApiResponse
  ) {
    super(errorMessage);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = getApiUrl(endpoint);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);

    const data = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || "An error occurred",
        data
      );
    }

    // Backend returns { success, data }; return the inner data
    if (data.data !== undefined) return data.data as T;
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error) {
      if (err.name === "AbortError") throw new ApiError(408, "Request timeout");
      throw new ApiError(500, err.message);
    }
    throw new ApiError(500, "An unexpected error occurred");
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: Record<string, unknown>) =>
    request<T>(endpoint, { method: "POST", body }),
  put: <T>(endpoint: string, body?: Record<string, unknown>) =>
    request<T>(endpoint, { method: "PUT", body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
