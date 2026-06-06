/**
 * Upload item image - returns public URL for the uploaded file.
 */

import { getApiUrl } from "./config";
import { API_ENDPOINTS } from "./config";
import type { ApiResponse } from "./types";

export async function uploadItemImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(getApiUrl(API_ENDPOINTS.UPLOAD), {
    method: "POST",
    body: formData,
    headers,
  });

  const data = (await response.json()) as ApiResponse<{ url: string }>;
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "Upload failed");
  }
  const url = data.data?.url;
  if (!url) throw new Error("No URL returned");
  return url.startsWith("http") ? url : getApiUrl(url.startsWith("/") ? url : `/${url}`);
}
