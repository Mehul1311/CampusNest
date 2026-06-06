"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Shield,
  ShoppingCart,
  LayoutGrid,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLandingTheme } from "@/contexts/LandingThemeContext";
import { cn } from "@/lib/utils";

const navLinksSignedOut = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/#products" },
  { name: "Features", href: "/#features" },
];

const navLinksSignedIn = [
  { name: "Home", href: "/" },
  { name: "My Listings", href: "/my-listings" },
  { name: "My Orders", href: "/orders" },
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useLandingTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const isLandingChrome =
    pathname === "/" && (!user || searchParams.get("landing") === "1");
  const isDarkLanding = isLandingChrome && theme === "dark";
  const brandHref = user ? "/?landing=1" : "/";

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setIsOpen(false);
    router.push("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur",
        isDarkLanding
          ? "border-border bg-background/95 text-foreground supports-[backdrop-filter]:bg-background/80"
          : "border-border bg-background/95 supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href={brandHref} className="flex items-center gap-2 font-semibold">
          <span className={cn("text-xl", isDarkLanding ? "text-teal-400" : "text-primary")}>
            CampusNest
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {(user ? navLinksSignedIn : navLinksSignedOut).map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                isDarkLanding
                  ? "text-slate-400 hover:text-slate-50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isLandingChrome && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              className={cn(isDarkLanding && "text-slate-300 hover:bg-slate-800 hover:text-white")}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          )}
          {!loading && user ? (
            <>
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cart"
                  className={cn(isDarkLanding && "text-slate-300 hover:bg-slate-800 hover:text-white")}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded-lg transition-colors",
                    isDarkLanding ? "hover:bg-slate-800" : "hover:bg-accent"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isDarkLanding ? "text-slate-400" : "text-muted-foreground",
                      profileOpen && "rotate-180"
                    )}
                  />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div
                      className={cn(
                        "absolute right-0 mt-2 w-56 rounded-lg border shadow-lg z-20 overflow-hidden",
                        isDarkLanding
                          ? "border-slate-700 bg-slate-900 text-slate-100"
                          : "border bg-card text-card-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 border-b",
                          isDarkLanding ? "border-slate-700" : "border-border"
                        )}
                      >
                        <p className="font-medium text-sm truncate text-inherit">{user.name}</p>
                        <p
                          className={cn(
                            "text-xs truncate",
                            isDarkLanding ? "text-slate-400" : "text-muted-foreground"
                          )}
                        >
                          {user.email}
                        </p>
                        {user.college && (
                          <p
                            className={cn(
                              "text-xs truncate",
                              isDarkLanding ? "text-slate-400" : "text-muted-foreground"
                            )}
                          >
                            {user.college}
                          </p>
                        )}
                      </div>
                      <div className="p-1.5">
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md transition-colors border",
                              isDarkLanding
                                ? "border-teal-500/40 bg-teal-950/60 text-teal-300 hover:bg-teal-950"
                                : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                            )}
                          >
                            <Shield className="h-4 w-4 shrink-0" />
                            Switch to Admin
                          </Link>
                        )}
                        <Link
                          href="/my-listings"
                          onClick={() => setProfileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                            isDarkLanding
                              ? "text-slate-200 hover:bg-slate-800"
                              : "hover:bg-accent"
                          )}
                        >
                          <LayoutGrid className="h-4 w-4 shrink-0" />
                          My Listings
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setProfileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                            isDarkLanding
                              ? "text-slate-200 hover:bg-slate-800"
                              : "hover:bg-accent"
                          )}
                        >
                          <ShoppingCart className="h-4 w-4 shrink-0" />
                          My Orders
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                            isDarkLanding
                              ? "text-red-400 hover:bg-red-950/50"
                              : "text-destructive hover:bg-destructive/10"
                          )}
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    isDarkLanding && "text-slate-200 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "md:hidden p-2 rounded-lg",
            isDarkLanding ? "hover:bg-slate-800 text-slate-200" : "hover:bg-accent"
          )}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen && (
        <div
          className={cn(
            "md:hidden border-t px-4 py-3 flex flex-col gap-2",
            isDarkLanding && "border-border bg-background"
          )}
        >
          {isLandingChrome && (
            <button
              type="button"
              onClick={() => {
                toggleTheme();
              }}
              className={cn(
                "flex items-center gap-2 text-sm font-medium py-2 text-left",
                isDarkLanding ? "text-slate-200" : undefined
              )}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? "Dark theme" : "Light theme"}
            </button>
          )}
          {(user ? navLinksSignedIn : navLinksSignedOut).map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-sm font-medium py-2",
                isDarkLanding ? "text-slate-200" : undefined
              )}
            >
              {link.name}
            </Link>
          ))}
          {!loading && user ? (
            <>
              <Link href="/cart" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">
                Cart
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm font-medium py-2.5 px-3 rounded-md bg-primary/10 text-primary">
                  <Shield className="h-4 w-4" />
                  Switch to Admin
                </Link>
              )}
              <button onClick={handleLogout} className="text-sm text-destructive text-left py-2">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">
                Sign In
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
