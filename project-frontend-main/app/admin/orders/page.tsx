// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { getAdminOrders } from "@/lib/api/admin";
// import type { Order } from "@/lib/api/types";
// import { ArrowLeft, Shield, ShoppingBag } from "lucide-react";

// export default function AdminOrdersPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getAdminOrders({ limit: 100 })
//       .then((res) => {
//         if (res.success && res.data?.orders) setOrders(res.data.orders);
//       })
//       .catch(() => setOrders([]))
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <div className="min-h-screen bg-muted/30">
//       <header className="sticky top-0 z-40 border-b bg-background">
//         <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
//           <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
//             <ArrowLeft className="h-4 w-4" />
//             Back to Admin
//           </Link>
//           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
//             <Shield className="h-4 w-4" />
//             Admin
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto max-w-6xl px-4 py-8">
//         <h1 className="text-2xl font-bold mb-6">All Orders</h1>

//         {loading ? (
//           <p className="text-muted-foreground">Loading...</p>
//         ) : orders.length === 0 ? (
//           <p className="text-muted-foreground">No orders found.</p>
//         ) : (
//           <div className="space-y-4">
//             {orders.map((order) => (
//               <Card key={order.id}>
//                 <CardContent className="p-4">
//                   <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
//                     <span className="text-sm text-muted-foreground">
//                       {new Date(order.created_at).toLocaleString()} · Order #{order.id.slice(0, 8)}
//                     </span>
//                     <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
//                       {order.payment_status}
//                     </Badge>
//                   </div>
//                   <ul className="space-y-1 text-sm">
//                     {order.items?.map((oi, i) => (
//                       <li key={i}>
//                         {oi.title} × {oi.quantity} — ₹{oi.price * oi.quantity}
//                       </li>
//                     ))}
//                   </ul>
//                   <p className="font-semibold text-primary mt-3">Total: ₹{order.total_amount}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOrders } from "@/lib/api/admin";
import type { Order } from "@/lib/api/types";
import { ArrowLeft, Shield } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOrders({ limit: 100 })
      .then((res) => {
        if (res.success && res.data?.orders) setOrders(res.data.orders);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold mb-6">All Orders</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()} · Order #{order.id.slice(0, 8)}
                    </span>
                    <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                      {order.payment_status}
                    </Badge>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {order.items?.map((oi, i) => (
                      <li key={i}>
                        {oi.title} × {oi.quantity} — ₹{(oi.price ?? 0) * oi.quantity}
                      </li>
                    ))}
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