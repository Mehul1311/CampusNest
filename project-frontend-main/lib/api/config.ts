/**
 * Campus OLX API Configuration
 * Base URL: http://localhost:5000/api/v1 (dev) or your-domain (prod)
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  API_PREFIX: "/api/v1",
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/api/v1/auth/signup",
    LOGIN: "/api/v1/auth/login",
    ME: "/api/v1/auth/me",
    FIREBASE_LOGIN: "/api/v1/auth/firebase-login",
    GOOGLE_SIGNUP: "/api/v1/auth/google-signup",
  },
  CATEGORIES: {
    LIST: "/api/v1/categories",
    GET: (id: string) => `/api/v1/categories/${id}`,
    CREATE: "/api/v1/categories",
    UPDATE: (id: string) => `/api/v1/categories/${id}`,
    DELETE: (id: string) => `/api/v1/categories/${id}`,
  },
  ITEMS: {
    LIST: "/api/v1/items",
    HOME_FEED: "/api/v1/items/home/feed",
    GET: (id: string) => `/api/v1/items/${id}`,
    CREATE: "/api/v1/items",
    UPDATE: (id: string) => `/api/v1/items/${id}`,
    DELETE: (id: string) => `/api/v1/items/${id}`,
    MY_LIST: "/api/v1/items/my/list",
  },
  UPLOAD: "/api/v1/upload",
  CART: {
    ROOT: "/api/v1/cart",
    ADD: "/api/v1/cart/add",
    UPDATE_QUANTITY: (itemId: string) => `/api/v1/cart/${itemId}/quantity`,
    REMOVE: (itemId: string) => `/api/v1/cart/${itemId}`,
  },
  ORDERS: {
    CREATE: "/api/v1/orders/create",
    VERIFY_PAYMENT: "/api/v1/orders/verify-payment",
    MY: "/api/v1/orders/my",
    GET: (id: string) => `/api/v1/orders/${id}`,
  },
  ADMIN: {
    STATS: "/api/v1/admin/stats",
    USERS: "/api/v1/admin/users",
    USER_ROLE: (uid: string) => `/api/v1/admin/users/${uid}/role`,
    ORDERS: "/api/v1/admin/orders",
    ACTIVITY_LOGS: "/api/v1/admin/activity-logs",
    ACTIVITY_LOGS_STATS: "/api/v1/admin/activity-logs/stats",
  },
} as const;

export function getApiUrl(endpoint: string): string {
  const base = API_CONFIG.BASE_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}
