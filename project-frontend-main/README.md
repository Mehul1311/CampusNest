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

## Getting Started (dev)

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
