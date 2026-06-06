"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCategories } from "@/lib/api/categories";
import { getHomeFeed } from "@/lib/api/items";
import { addToCart } from "@/lib/api/cart";
import { useAuth } from "@/contexts/AuthContext";
import { useLandingTheme } from "@/contexts/LandingThemeContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Category } from "@/lib/api/types";
import type { Item } from "@/lib/api/types";
import {
  ShoppingCart,
  Search,
  Package,
  BookOpen,
  Smartphone,
  Sofa,
  Shirt,
  Dumbbell,
  Bike,
  PenTool,
  Shield,
  Zap,
  ChevronDown,
} from "lucide-react";
import { ApiError } from "@/lib/api/client";

const ITEMS_PER_PAGE = 20;
const PLATFORM_FEE_MULTIPLIER = 1.25;

function getBuyerPrice(item: Item): number {
  if (item.buyer_price != null && item.buyer_price > 0) return item.buyer_price;
  const sellerPrice = typeof item.price === "number" ? item.price : parseFloat(String(item.price));
  return Number.isNaN(sellerPrice) ? 0 : Math.round(sellerPrice * PLATFORM_FEE_MULTIPLIER);
}

const LANDING_CATEGORIES = [
  { name: "Books", icon: BookOpen, color: "bg-amber-100 text-amber-800 border-amber-200" },
  { name: "Electronics", icon: Smartphone, color: "bg-red-50 text-red-700 border-red-200" },
  { name: "Furniture", icon: Sofa, color: "bg-sky-50 text-sky-700 border-sky-200" },
  { name: "Clothing", icon: Shirt, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "Sports", icon: Dumbbell, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Bikes", icon: Bike, color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Stationery", icon: PenTool, color: "bg-violet-50 text-violet-700 border-violet-200" },
];

const FEATURES = [
  {
    title: "Campus-only marketplace",
    description: "Buy and sell only with students from your college. Trusted, relevant, and safe.",
    icon: Shield,
  },
  {
    title: "Simple listing & checkout",
    description: "List in minutes. Secure payments with Razorpay. No hassle, no middlemen.",
    icon: Zap,
  },
  {
    title: "Categories that fit student life",
    description: "Books, electronics, furniture, bikes, and more. Find what you need at student-friendly prices.",
    icon: Package,
  },
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const forceLanding = searchParams.get("landing") === "1";
  const { theme } = useLandingTheme();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.success && res.data?.categories) setCategories(res.data.categories);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    getHomeFeed({
      category: selectedCategory || undefined,
      search: search || undefined,
      limit: ITEMS_PER_PAGE,
      offset: 0,
    })
      .then((res) => {
        if (res.success && res.data) {
          setItems(res.data.items);
          setTotal(res.data.total);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.statusCode === 400) {
          toast.error("Please set your college in profile to see items.");
        } else {
          toast.error("Failed to load items");
        }
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [user, selectedCategory, search]);

  const handleAddToCart = async (itemId: string) => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    setAddingId(itemId);
    try {
      await addToCart(itemId);
      toast.success("Added to cart");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400) toast.error(err.errorMessage);
        else toast.error("Could not add to cart");
      } else {
        toast.error("Could not add to cart");
      }
    } finally {
      setAddingId(null);
    }
  };

  const showLanding = !authLoading && (!user || (user && forceLanding));

  const landDark = theme === "dark";

  if (showLanding) {
    return (
      <div
        data-landing-theme={theme}
        className={cn(
          "min-h-screen flex flex-col bg-background text-foreground antialiased",
          /* Prefer dynamic viewport height on mobile browsers */
          "min-h-[100dvh]"
        )}
      >
        <Navbar />
        <main className="flex-1">
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-b pointer-events-none to-transparent",
                landDark ? "from-primary/15" : "from-primary/5"
              )}
            />
            <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
              <div className="max-w-2xl">
                <span
                  className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-medium mb-6",
                    landDark ? "bg-slate-800 text-slate-300" : "bg-muted text-muted-foreground"
                  )}
                >
                  Campus marketplace
                </span>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  India&apos;s trusted{" "}
                  <span className={landDark ? "text-teal-400" : "text-primary"}>
                    campus buy & sell
                  </span>{" "}
                  platform
                </h1>
                <p
                  className={cn(
                    "mt-4 text-lg",
                    landDark ? "text-slate-400" : "text-muted-foreground"
                  )}
                >
                  Buy and sell items within your college campus. Books, electronics, furniture, and more — simple, safe, and student-first.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/signup">
                    <Button size="lg" className="rounded-lg">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className={cn(
                        "rounded-lg",
                        landDark &&
                          "border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mt-12 md:mt-0 md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2 md:w-80">
                <div
                  className={cn(
                    "rounded-2xl border shadow-lg overflow-hidden p-4",
                    landDark ? "border-slate-800 bg-slate-900" : "border-border bg-card"
                  )}
                >
                  <div
                    className={cn(
                      "aspect-video rounded-lg flex items-center justify-center",
                      landDark ? "bg-slate-800" : "bg-muted"
                    )}
                  >
                    <Package
                      className={cn("h-16 w-16", landDark ? "text-slate-500" : "text-muted-foreground")}
                    />
                  </div>
                  <p className="text-sm font-medium mt-3">List once, reach your campus</p>
                  <p className={cn("text-xs", landDark ? "text-slate-500" : "text-muted-foreground")}>
                    No fees until you sell
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center pb-6">
              <a
                href="#products"
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  landDark
                    ? "text-slate-500 hover:text-slate-200"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-xs uppercase tracking-wider">Scroll</span>
                <ChevronDown className="h-5 w-5 animate-bounce" />
              </a>
            </div>
          </section>

          {/* Products / Categories */}
          <section
            id="products"
            className={cn(
              "border-t py-16 md:py-20 scroll-mt-16",
              landDark ? "border-slate-800 bg-slate-900/40" : "bg-muted/30"
            )}
          >
            <div className="mx-auto max-w-6xl px-4">
              <p
                className={cn(
                  "text-sm font-medium uppercase tracking-wider",
                  landDark ? "text-teal-400" : "text-primary"
                )}
              >
                Products
              </p>
              <h2 className="text-2xl font-bold mt-2 md:text-3xl">
                Explore by{" "}
                <span className={landDark ? "text-teal-400" : "text-primary"}>category</span>
              </h2>
              <p
                className={cn("mt-2 max-w-2xl", landDark ? "text-slate-400" : "text-muted-foreground")}
              >
                Browse listings by category. Sign in with your college email to see items from your campus.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {LANDING_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <span
                      key={cat.name}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${cat.color}`}
                    >
                      <Icon className="h-4 w-4" />
                      {cat.name}
                    </span>
                  );
                })}
              </div>
              <div className="mt-10 text-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className={cn(
                      "rounded-lg",
                      landDark &&
                        "border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    Sign up to browse listings
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-16 md:py-20 scroll-mt-16">
            <div className="mx-auto max-w-6xl px-4">
              <p
                className={cn(
                  "text-sm font-medium uppercase tracking-wider",
                  landDark ? "text-teal-400" : "text-primary"
                )}
              >
                Features
              </p>
              <h2 className="text-2xl font-bold mt-2 md:text-3xl">
                Everything you need to{" "}
                <span className={landDark ? "text-teal-400" : "text-primary"}>buy & sell</span> on
                campus
              </h2>
              <p
                className={cn("mt-2 max-w-2xl", landDark ? "text-slate-400" : "text-muted-foreground")}
              >
                A simple, secure marketplace built for students. List items in minutes and connect with buyers in your college.
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <Card
                      key={f.title}
                      className={cn(
                        "overflow-hidden shadow-md hover:shadow-lg transition-shadow",
                        landDark
                          ? "border border-slate-800 bg-slate-900 shadow-slate-950/50"
                          : "border-0"
                      )}
                    >
                      <CardContent className="p-6">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
                            landDark ? "bg-teal-950/80" : "bg-primary/10"
                          )}
                        >
                          <Icon
                            className={cn("h-5 w-5", landDark ? "text-teal-400" : "text-primary")}
                          />
                        </div>
                        <h3 className="font-semibold text-lg">{f.title}</h3>
                        <p
                          className={cn(
                            "text-sm mt-2",
                            landDark ? "text-slate-400" : "text-muted-foreground"
                          )}
                        >
                          {f.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  /* Signed-in: app home with feed */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 flex-1">
        <section className="mb-8">
          <h1 className="text-2xl font-bold mb-2">CampusNest</h1>
          <p className="text-muted-foreground mb-4">
            Buy and sell items within your college campus. Books, electronics, furniture, and more.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Items from your campus</h2>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items found. Try another category or search.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/item/${item.id}`} className="block">
                    <div className="aspect-video bg-muted relative">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="h-10 w-10" />
                        </div>
                      )}
                      {item.status !== "active" && (
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/item/${item.id}`}>
                      <h3 className="font-medium line-clamp-2 hover:text-primary">{item.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.category_name} · {item.college}
                    </p>
                    <p className="font-semibold text-primary mt-2">₹{getBuyerPrice(item)}</p>
                    {item.status === "active" && user?.uid !== item.seller_id && (
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(item.id);
                        }}
                        disabled={addingId === item.id}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {addingId === item.id ? "Adding..." : "Add to cart"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {user && !loading && total > items.length && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {items.length} of {total} items
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
