"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin Items CRUD was removed from the backend.
 * Redirect to admin dashboard.
 */
export default function AdminItemsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to admin...</p>
    </div>
  );
}
