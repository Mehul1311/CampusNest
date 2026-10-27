# Campus OLX – Frontend

OLX-style marketplace for college students. Buy and sell items within your campus. Built with Next.js, shadcn-style UI (Tailwind, Radix, Lucide), and JWT + Razorpay integration.

## Features

- **Auth:** Signup / Login (JWT). After login, redirect to main page.
- **Main page:** Categories, item listings, search, **Add to cart**.
- **Cart & checkout:** Razorpay payment gateway; verify payment and view **My Orders**.
- **Sell:** Create/edit listings (My Listings, Sell page).
- **Admin:** Switch to Admin (for admin/superadmin). Dashboard stats, Users, Items, Orders, Activity Logs.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, shadcn-style components (Button, Card, Input, Label, Badge, Separator)
- Lucide React, Sonner (toasts), Framer Motion (optional)
- API client with Bearer token; 401 handling and redirect to login

## Getting started

1. **Backend:** Ensure the Campus OLX backend is running (e.g. `http://localhost:5000`). See `project-backend/docs/API_DOCUMENTATION.md` for endpoints.

2. **Env:** Copy `.env.example` to `.env.local` and set:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Razorpay:** Payment works when the backend has Razorpay configured and returns `keyId`, `razorpayOrderId`, and `amount` from `POST /orders/create`. The frontend loads the Razorpay script and calls `POST /orders/verify-payment` after success.

The repo overview is in the root [README](../README.md).
