# Campus OLX Backend

OLX clone for college campus - Node.js backend. Students can buy/sell items within their campus.

## Tech Stack

- **Node.js** + **Express**
- **PostgreSQL**
- **JWT** for auth
- **Razorpay** for payments
- **bcryptjs**, **express-validator**

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Configure PostgreSQL and create database:
   ```sql
   CREATE DATABASE campus_olx;
   ```

4. Update `.env` with your DB credentials and JWT secret.

5. Run the server:
   ```bash
   npm run dev
   ```

6. Create first admin (after signing up a user):
   ```bash
   npm run setup-admin your@email.com yourpassword
   ```

## API Endpoints

### Auth
- `POST /api/v1/auth/signup` - Signup (email, name, college, phone, password)
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get profile (Auth required)

### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create (Admin)
- `PUT /api/v1/categories/:id` - Update (Admin)
- `DELETE /api/v1/categories/:id` - Delete (Admin)

### Items
- `GET /api/v1/items` - List items (query: category, college, search, limit, offset)
- `GET /api/v1/items/:id` - Get item
- `POST /api/v1/items` - Create item (Auth)
- `GET /api/v1/items/my/list` - My listings (Auth)
- `PUT /api/v1/items/:id` - Update my item (Auth)
- `DELETE /api/v1/items/:id` - Delete my item (Auth)

### Cart
- `POST /api/v1/cart/add` - Add to cart (body: itemId, quantity)
- `GET /api/v1/cart` - Get cart
- `PUT /api/v1/cart/:itemId/quantity` - Update quantity (body: quantity)
- `DELETE /api/v1/cart/:itemId` - Remove from cart
- `DELETE /api/v1/cart` - Clear cart

### Orders & Payment
- `POST /api/v1/orders/create` - Create order (creates Razorpay order)
- `POST /api/v1/orders/verify-payment` - Verify Razorpay payment
- `GET /api/v1/orders/my` - My orders
- `GET /api/v1/orders/:id` - Order details

### Admin
- `GET /api/v1/admin/stats` - Dashboard stats
- `GET /api/v1/admin/users` - All users
- `PUT /api/v1/admin/users/:uid/role` - Update user role
- `GET /api/v1/admin/items` - All items
- `GET /api/v1/admin/orders` - All orders
- `GET /api/v1/admin/activity-logs` - Activity logs
- `GET /api/v1/admin/activity-logs/stats` - Activity stats

## Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Get Key ID and Secret from Dashboard
3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret
   ```

## Default Categories

Books, Electronics, Furniture, Clothing, Sports, Bikes, Stationery, Others
