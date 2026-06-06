"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyListings } from "@/lib/api/items";
import { deleteItem } from "@/lib/api/items";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Item } from "@/lib/api/types";
import { Package, Plus, Trash2, Edit } from "lucide-react";

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getMyListings()
      .then((res) => {
        if (res.success && res.data) setItems(res.data.items);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user && !authLoading) router.push("/login");
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    setDeletingId(id);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Listing deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <Link href="/sell">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Sell item
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You have no listings yet.</p>
            <Link href="/sell">
              <Button>Sell an item</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <Link href={`/item/${item.id}`}>
                  <div className="aspect-video bg-muted relative">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      {item.status}
                    </Badge>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/item/${item.id}`}>
                    <h3 className="font-medium line-clamp-2 hover:text-primary">{item.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.category_name} · ₹{item.price}</p>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/sell?edit=${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(item.id);
                      }}
                      disabled={deletingId === item.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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
