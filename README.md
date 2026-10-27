# CampusNest

A campus marketplace. Students list items, search by college, add to cart, and pay. The repo is two apps.

| Folder | App |
| --- | --- |
| `project-frontend-main` | Next.js storefront |
| `project-backend-main` | Express and PostgreSQL API |

## What it covers

- Signup and login
- Categories, search, and listings
- Cart and Razorpay checkout
- Seller listings
- Admin stats, users, items, orders, and activity logs

Route details are in `project-backend-main/README.md`.

## API

```bash
git clone https://github.com/Mehul1311/CampusNest.git
cd CampusNest/project-backend-main
npm install
copy .env.production.example .env
npm run dev
```

Create a PostgreSQL database named `campus_olx`, then fill `PGHOST`, `PGUSER`, `PGPASSWORD`, `JWT_SECRET`, and the Razorpay keys in `.env`. Do not commit `.env`.

## Site

```bash
cd project-frontend-main
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open `http://localhost:3000`. The API should already be running.

## Stack

Next.js 16, React 19, Tailwind CSS 4, Express, PostgreSQL, JWT, Razorpay, Firebase.

## Contact

- LinkedIn: https://www.linkedin.com/in/mehulsain/
- Email: mehulsain1603@gmail.com
