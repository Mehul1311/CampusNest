"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getItem } from "@/lib/api/items";
import { addToCart } from "@/lib/api/cart";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Item } from "@/lib/api/types";
import { ShoppingCart, Package, ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api/client";

const PLATFORM_FEE_MULTIPLIER = 1.25;

function getBuyerPrice(price: string | number): number {
  const p = typeof price === "number" ? price : parseFloat(String(price));
  return Number.isNaN(p) ? 0 : Math.round(p * PLATFORM_FEE_MULTIPLIER);
}

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    getItem(id)
      .then((res) => {
        if (res.success && res.data?.item) setItem(res.data.item);
        else setItem(null);
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add to cart");
      router.push("/login");
      return;
    }
    if (!item) return;
    setAdding(true);
    try {
      await addToCart(item.id);
      toast.success("Added to cart");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.errorMessage);
      else toast.error("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              <div className="h-6 bg-muted rounded animate-pulse w-24" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-muted-foreground">Item not found.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to listings
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const isOwnItem = user?.uid === item.seller_id;
  const canAddToCart = item.status === "active" && !isOwnItem;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to listings
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square bg-muted rounded-xl overflow-hidden relative">
            {item.images?.[0] ? (
              <Image
                src={item.images[0]}
                alt={item.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="h-24 w-24" />
              </div>
            )}
            {item.status !== "active" && (
              <Badge variant="secondary" className="absolute top-4 right-4">
                {item.status}
              </Badge>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <p className="text-muted-foreground mt-1">
              {item.category_name} · {item.college}
            </p>
            <p className="text-2xl font-semibold text-primary mt-4">
              ₹{isOwnItem
                ? (typeof item.price === "number" ? item.price : parseFloat(String(item.price)) || 0)
                : getBuyerPrice(item.price)}
            </p>
            {item.description && (
              <p className="text-muted-foreground mt-4 whitespace-pre-wrap">{item.description}</p>
            )}
            <Card className="mt-6">
              <CardContent className="p-4">
                <p className="text-sm font-medium">Seller</p>
                <p className="font-medium">{item.seller_name}</p>
                <p className="text-sm text-muted-foreground">{item.seller_college}</p>
                {item.contact_phone && (
                  <p className="text-sm mt-2">Contact: {item.contact_phone}</p>
                )}
              </CardContent>
            </Card>
            {canAddToCart && (
              <Button className="w-full mt-6" size="lg" onClick={handleAddToCart} disabled={adding}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {adding ? "Adding..." : "Add to cart"}
              </Button>
            )}
            {isOwnItem && (
              <p className="text-sm text-muted-foreground mt-4">This is your listing.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
