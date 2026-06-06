// testing

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCart } from "@/lib/api/cart";
import { updateCartQuantity, removeFromCart } from "@/lib/api/cart";
import { createOrder, verifyPayment } from "@/lib/api/orders";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { CartItem } from "@/lib/api/types";
import Script from "next/script";
import { Package, Trash2, Minus, Plus } from "lucide-react";
import { ApiError } from "@/lib/api/client";

interface RazorpayInstance {
  open: () => void;
  on?: (event: string, handler: () => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: { closed: (handler: () => void) => void };
    }) => RazorpayInstance;
  }
}

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const loadCart = async () => {
    try {
      const res = await getCart();
      if (res.success && res.data) {
        setCartItems(res.data.items);
        setTotal(res.data.total);
      }
    } catch {
      setCartItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadCart();
  }, [user]);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const updateQty = async (itemId: string, quantity: number) => {
    setUpdatingId(itemId);
    try {
      await updateCartQuantity(itemId, quantity);
      await loadCart();
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setUpdatingId(null);
    }
  };

  const remove = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      await removeFromCart(itemId);
      await loadCart();
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await createOrder();
      if (!res.success || !res.data) {
        toast.error("Could not create order");
        setCheckoutLoading(false);
        return;
      }
      const { orderId, razorpayOrderId, amount, currency, keyId } = res.data;

      if (typeof window === "undefined" || !window.Razorpay) {
        toast.error("Payment gateway not loaded. Please refresh and try again.");
        setCheckoutLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: amount * 100,
        currency,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful!");
            await loadCart();
            router.push("/orders");
            router.refresh();
          } catch (err) {
            toast.error(err instanceof ApiError ? err.errorMessage : "Payment verification failed");
          } finally {
            setCheckoutLoading(false);
          }
        },
      });
      if (rzp.on) {
        rzp.on("payment.failed", () => {
          toast.error("Payment failed");
          setCheckoutLoading(false);
        });
      }
      rzp.open();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400) toast.error(err.errorMessage || "Cart is empty");
        else if (err.statusCode === 503) toast.error("Payment gateway not configured");
        else toast.error("Could not create order");
      } else {
        toast.error("Could not create order");
      }
      setCheckoutLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link href="/">
              <Button>Browse items</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map((ci) => {
                const unitPrice = ci.buyer_price ?? (typeof ci.price === "number" ? ci.price : parseFloat(String(ci.price)) || 0);
                const lineTotal = unitPrice * ci.quantity;
                return (
                <Card key={ci.id} className="overflow-hidden">
                  <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-24 bg-muted rounded-lg overflow-hidden relative shrink-0">
                      {ci.images?.[0] ? (
                        <Image
                          src={ci.images[0]}
                          alt={ci.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2">{ci.title}</h3>
                      <p className="text-sm text-muted-foreground">{ci.category_name}</p>
                      <p className="font-semibold text-primary mt-1">₹{lineTotal} ({ci.quantity} × ₹{unitPrice})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQty(ci.item_id, Math.max(0, ci.quantity - 1))}
                        disabled={updatingId === ci.item_id || ci.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{ci.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQty(ci.item_id, ci.quantity + 1)}
                        disabled={updatingId === ci.item_id}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => remove(ci.item_id)}
                        disabled={updatingId === ci.item_id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">₹{total}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? "Opening payment..." : "Proceed to Pay (Razorpay)"}
              </Button>
            </Card>
          </>
        )}
      </main>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}