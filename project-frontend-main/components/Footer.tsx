"use client";

import Link from "next/link";
import { Phone, Mail, Linkedin, Instagram } from "lucide-react";
import { useLandingTheme } from "@/contexts/LandingThemeContext";

const currentYear = new Date().getFullYear();

export function Footer() {
  const { theme } = useLandingTheme();
  const lightFooter = theme === "light";

  if (lightFooter) {
    return (
      <footer className="bg-slate-950 text-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-2">CampusNest</h3>
              <p className="text-sm text-slate-400 mb-1">Your campus marketplace</p>
              <p className="text-sm text-slate-400">
                Buy and sell items within your college campus. Books, electronics, furniture, and more — trusted, simple, and student-first.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Product</h3>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/#products" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Company</h3>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Legal</h3>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Help and Support</h3>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <a href="tel:+917042694764" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4 shrink-0" />
                +91 90XXXXXXXX
              </a>
              <a href="mailto:support@campusolx.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4 shrink-0" />
                support@campusolx.com
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-slate-500">© {currentYear} CampusNest. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white text-slate-800 border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">CampusNest</h3>
            <p className="text-sm text-slate-600 mb-1">Your campus marketplace</p>
            <p className="text-sm text-slate-600">
              Buy and sell items within your college campus. Books, electronics, furniture, and more — trusted, simple, and student-first.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Product</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/#products" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Company</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Legal</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Help and Support</h3>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <a href="tel:+917042694764" className="flex items-center gap-2 hover:text-slate-900 transition-colors">
              <Phone className="h-4 w-4 shrink-0" />
              +91 90XXXXXXXX
            </a>
            <a href="mailto:support@campusolx.com" className="flex items-center gap-2 hover:text-slate-900 transition-colors">
              <Mail className="h-4 w-4 shrink-0" />
              support@campusolx.com
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-slate-500">© {currentYear} CampusNest. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
