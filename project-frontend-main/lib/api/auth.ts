// /**
//  * Auth API - signup, login, profile
//  */

// import { apiClient } from "./client";
// import { API_ENDPOINTS } from "./config";
// import type { User } from "./types";

// const AUTH_TOKEN_KEY = "authToken";

// export function setAuthToken(token: string): void {
//   if (typeof window !== "undefined") {
//     localStorage.setItem(AUTH_TOKEN_KEY, token);
//   }
// }

// export function removeAuthToken(): void {
//   if (typeof window !== "undefined") {
//     localStorage.removeItem(AUTH_TOKEN_KEY);
//   }
// }

// export function getStoredToken(): string | null {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem(AUTH_TOKEN_KEY);
// }

// /** Signup response: { user, token } */
// export interface SignupData {
//   user: User;
//   token: string;
// }

// /** Login response: { user, token } */
// export interface LoginData {
//   user: User;
//   token: string;
// }

// /** Normalize user from API (handles optional role or snake_case) so role is always set */
// export function normalizeUser(raw: Record<string, unknown> | User): User {
//   const role = (raw.role ?? (raw as Record<string, unknown>).role) as string | undefined;
//   const allowed: User["role"][] = ["user", "admin", "superadmin"];
//   const normalizedRole = role && allowed.includes(role as User["role"]) ? (role as User["role"]) : "user";
//   return {
//     uid: String(raw.uid ?? ""),
//     email: String(raw.email ?? ""),
//     name: String(raw.name ?? ""),
//     college: String(raw.college ?? ""),
//     phone: String(raw.phone ?? ""),
//     role: normalizedRole,
//     permissions: Array.isArray((raw as User).permissions) ? (raw as User).permissions : [],
//   };
// }

// export async function signup(payload: {
//   email: string;
//   name: string;
//   college: string;
//   phone: string;
//   password: string;
// }) {
//   const data = await apiClient.post<SignupData>(API_ENDPOINTS.AUTH.SIGNUP, payload);
//   if (data?.user) data.user = normalizeUser(data.user as Record<string, unknown>);
//   return { success: true as const, data };
// }

// export async function login(payload: { email: string; password: string }) {
//   const data = await apiClient.post<LoginData>(API_ENDPOINTS.AUTH.LOGIN, payload);
//   if (data?.user) data.user = normalizeUser(data.user as Record<string, unknown>);
//   return { success: true as const, data };
// }

// export async function getProfile() {
//   const data = await apiClient.get<{ user: Record<string, unknown> | User }>(API_ENDPOINTS.AUTH.ME);
//   const user = data?.user ? normalizeUser(data.user) : null;
//   return { success: true as const, data: user ? { user } : undefined };
// }

// export async function firebaseLogin(idToken: string) {
//   const data = await apiClient.post<LoginData>(API_ENDPOINTS.AUTH.FIREBASE_LOGIN, {
//     idToken,
//   });
//   if (data?.user) data.user = normalizeUser(data.user as Record<string, unknown>);
//   return { success: true as const, data };
// }

// export async function googleSignup(payload: {
//   idToken: string;
//   phone: string;
//   college: string;
//   password: string;
// }) {
//   const data = await apiClient.post<SignupData>(API_ENDPOINTS.AUTH.GOOGLE_SIGNUP, payload);
//   if (data?.user) data.user = normalizeUser(data.user as Record<string, unknown>);
//   return { success: true as const, data };
// }


/**
 * Auth API - signup, login, profile
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { User } from "./types";

const AUTH_TOKEN_KEY = "authToken";

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export interface SignupData {
  user: User;
  token: string;
}

export interface LoginData {
  user: User;
  token: string;
}

export function normalizeUser(raw: Record<string, unknown> | User): User {
  const role = (raw.role ?? (raw as Record<string, unknown>).role) as string | undefined;
  const allowed: User["role"][] = ["user", "admin", "superadmin"];
  const normalizedRole = role && allowed.includes(role as User["role"]) ? (role as User["role"]) : "user";
  return {
    uid: String(raw.uid ?? ""),
    email: String(raw.email ?? ""),
    name: String(raw.name ?? ""),
    college: String(raw.college ?? ""),
    phone: String(raw.phone ?? ""),
    role: normalizedRole,
    permissions: Array.isArray((raw as User).permissions) ? (raw as User).permissions : [],
  };
}

export async function signup(payload: {
  email: string;
  name: string;
  college: string;
  phone: string;
  password: string;
}) {
  const data = await apiClient.post<SignupData>(API_ENDPOINTS.AUTH.SIGNUP, payload);
  if (data?.user) data.user = normalizeUser(data.user as unknown as Record<string, unknown>); // ✅ fix
  return { success: true as const, data };
}

export async function login(payload: { email: string; password: string }) {
  const data = await apiClient.post<LoginData>(API_ENDPOINTS.AUTH.LOGIN, payload);
  if (data?.user) data.user = normalizeUser(data.user as unknown as Record<string, unknown>); // ✅ fix
  return { success: true as const, data };
}

export async function getProfile() {
  const data = await apiClient.get<{ user: Record<string, unknown> | User }>(API_ENDPOINTS.AUTH.ME);
  const user = data?.user ? normalizeUser(data.user) : null;
  return { success: true as const, data: user ? { user } : undefined };
}

export async function firebaseLogin(idToken: string) {
  const data = await apiClient.post<LoginData>(API_ENDPOINTS.AUTH.FIREBASE_LOGIN, {
    idToken,
  });
  if (data?.user) data.user = normalizeUser(data.user as unknown as Record<string, unknown>); // ✅ fix
  return { success: true as const, data };
}

export async function googleSignup(payload: {
  idToken: string;
  phone: string;
  college: string;
  password: string;
}) {
  const data = await apiClient.post<SignupData>(API_ENDPOINTS.AUTH.GOOGLE_SIGNUP, payload);
  if (data?.user) data.user = normalizeUser(data.user as unknown as Record<string, unknown>); // ✅ fix
  return { success: true as const, data };
}