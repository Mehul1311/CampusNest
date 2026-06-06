// test
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyOrders } from "@/lib/api/orders";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@/lib/api/types";
import { Package, ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getMyOrders({ limit: 50 })
      .then((res) => {
        if (res.success && res.data) {
          setOrders(res.data.orders);
          setTotal(res.data.total);
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user && !authLoading) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/">
              <Button>Browse items</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} · Order #{order.id.slice(0, 8)}
                    </span>
                    <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                      {order.payment_status}
                    </Badge>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {order.items?.map((oi, i) => {
                      const lineTotal = oi.buyer_paid ?? (oi.price ?? 0) * oi.quantity;
                      return (
                        <li key={i}>
                          {oi.title} × {oi.quantity} — ₹{lineTotal}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="font-semibold text-primary mt-3">Total: ₹{order.total_amount}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
