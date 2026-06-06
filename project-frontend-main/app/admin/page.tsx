"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminStats } from "@/lib/api/admin";
import type { AdminStats as AdminStatsType } from "@/lib/api/types";
import { Users, FolderTree, ShoppingBag, Activity, ArrowLeft, Shield } from "lucide-react";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => {
        if (res.success && res.data) setStats(res.data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              Admin
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading stats...</p>
        ) : stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.categories}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.orders?.totalOrders ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenue: ₹{stats.orders?.totalRevenue ?? 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {stats.orders?.byStatus && stats.orders.byStatus.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Orders by status</CardTitle>
                  <CardDescription>Payment status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stats.orders.byStatus.map((s) => (
                      <Badge key={s.payment_status} variant="secondary">
                        {s.payment_status}: {s.count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/users">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle className="text-lg">Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Manage users and roles (superadmin: change roles)</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/orders">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <CardTitle className="text-lg">Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>View all orders</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/activity-logs">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <CardTitle className="text-lg">Activity Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {stats.activityLogs?.total ?? 0} total logs
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Failed to load dashboard.</p>
        )}
      </main>
    </div>
  );
}
