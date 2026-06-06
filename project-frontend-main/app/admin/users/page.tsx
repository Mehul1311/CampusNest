"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminUsers, updateUserRole } from "@/lib/api/admin";
import type { AdminUser } from "@/lib/api/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Shield, User } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const isSuperadmin = currentUser?.role === "superadmin";

  useEffect(() => {
    getAdminUsers({ limit: 100 })
      .then((res) => {
        if (res.success && res.data?.users) setUsers(res.data.users);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (uid: string, role: "user" | "admin" | "superadmin") => {
    setUpdatingUid(uid);
    try {
      await updateUserRole(uid, role);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            Admin
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Users</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground">No users found.</p>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <Card key={u.uid}>
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      {u.college && <p className="text-xs text-muted-foreground">{u.college}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "superadmin" ? "destructive" : u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                    {/* Only superadmin can change user roles */}
                    {isSuperadmin && (
                      <select
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as "user" | "admin" | "superadmin")}
                        disabled={updatingUid === u.uid}
                        title="Change role (superadmin only)"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
