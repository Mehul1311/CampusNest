# Campus OLX – Backend API Documentation

Backend API for a college-campus marketplace. **Authentication is assumed done.** This doc covers Home feed, My Listings, My Orders, college-based visibility, and the 25% platform fee flow.

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL & Auth](#base-url--auth)
3. [Business Rules](#business-rules)
4. [Endpoints](#endpoints)
5. [Platform Fee & Pricing](#platform-fee--pricing)
6. [Order & Payment Flow](#order--payment-flow)
7. [Error Responses](#error-responses)

---

## Overview

- **Home page**: User sees only items **they can buy** from **sellers in the same college**. Their **own listings do not appear** on Home (they appear only in My Listings).
- **My Listings**: Items the **logged-in user is selling** (seller_id = user).
- **My Orders**: Orders **placed by the logged-in user** (buyer).
- **College**: New users sign up with a **college name**. All visibility (who sees what on Home, who can add to cart) is **scoped by same college**.
- **Pricing**: Seller lists at **seller price** (e.g. ₹800). Buyers see **buyer price = seller price + 25%** (e.g. ₹1000). On payment, **₹800 goes to seller**, **₹200 (25%) stays with platform.

---

## Base URL & Auth

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:5000/api/v1` |
| Production  | `https://your-domain.com/api/v1` |

All endpoints that require login expect:

```
Authorization: Bearer <jwt_token>
```

---

## Business Rules

| Rule | Description |
|------|-------------|
| Home feed | Items from **same college** only; **excludes current user’s own listings**. |
| My Listings | Items where **seller_id = current user**. |
| My Orders | Orders where **user_id = current user** (buyer). |
| Add to cart | Allowed only if item is from **same college** as buyer; cannot add own item. |
| Price to buyer | **buyer_price = seller price × (1 + 25%)** (configurable via `PLATFORM_FEE_PERCENT`). |
| Payment split | Buyer pays **buyer_price**; backend stores **seller_amount** and **platform_fee** per line for payouts. |

---

## Endpoints

### 1. Home Feed (items to buy, same college, exclude own)

**Endpoint:** `GET /items/home/feed`  
**Auth:** Required

Items the user can buy: same college as user, active, and **not** listed by the user. Each item includes **buyer_price** (seller price + 25%).

**Query parameters**

| Parameter | Type   | Default | Description        |
|-----------|--------|--------|--------------------|
| category  | UUID   | -      | Category ID        |
| search    | string | -      | Search in title/desc |
| limit     | number | 20     | Page size         |
| offset    | number | 0      | Pagination offset  |

**Success (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "seller_id": "uuid",
        "category_id": "uuid",
        "title": "Physics Textbook",
        "description": "...",
        "price": 800,
        "buyer_price": 1000,
        "images": ["url"],
        "status": "active",
        "college": "ABC College",
        "category_name": "Books",
        "category_slug": "books",
        "seller_name": "John",
        "seller_college": "ABC College",
        "created_at": "..."
      }
    ],
    "total": 10
  }
}
```

- **price**: Amount seller receives.
- **buyer_price**: Amount buyer pays (price + platform fee). Use this on Home and for cart/checkout.

**Errors**

- **400** – User has no college in profile.
- **401** – Not logged in or invalid token.

---

### 2. Get Single Item (for detail page)

**Endpoint:** `GET /items/:id`  
**Auth:** Not required

**Success (200)**

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "uuid",
      "seller_id": "uuid",
      "title": "...",
      "price": 800,
      "college": "ABC College",
      "category_name": "Books",
      "seller_name": "...",
      "seller_college": "...",
      ...
    }
  }
}
```

For a **buyer**, frontend should show **buyer price** as:  
`buyer_price = item.price * (1 + PLATFORM_FEE_PERCENT/100)`.  
Default: `item.price * 1.25`.

---

### 3. My Listings (items I am selling)

**Endpoint:** `GET /items/my/list`  
**Auth:** Required

Items where the current user is the seller. Shown only in “My Listings”; these are **excluded from Home feed** for that user.

**Query:** `limit`, `offset` (optional).

**Success (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "seller_id": "uuid",
        "title": "...",
        "price": 800,
        "status": "active",
        "category_name": "Books",
        ...
      }
    ],
    "total": 5
  }
}
```

Here **price** is seller price (what seller gets). No **buyer_price** needed for “My Listings”.

---

### 4. Create Item (sell)

**Endpoint:** `POST /items`  
**Auth:** Required

**Body**

| Field       | Type   | Required | Description                |
|------------|--------|----------|----------------------------|
| title      | string | Yes      | Max 500 chars              |
| categoryId | UUID   | Yes      | Category ID                |
| price      | number | Yes      | Seller price (≥ 0)        |
| description| string | No       |                            |
| images     | array  | No       | URLs                       |
| college    | string | No       | Defaults to user’s college |
| contactPhone | string | No     | Defaults to user’s phone   |

Item is stored with **seller_id = current user** and **college** (from body or user profile). It will appear in **My Listings** for the seller and on **Home feed** for other users in the **same college** (at **buyer_price**).

**Errors**

- **400** – Missing college in profile, or invalid category.

---

### 5. Categories (for Home filters)

**Endpoint:** `GET /categories`  
**Auth:** Not required

Use for “Categories” on Home (e.g. Sports, Books). Pass `category` (category ID) to **GET /items/home/feed** to filter by category.

---

### 6. Cart

#### Add to cart

**Endpoint:** `POST /cart/add`  
**Auth:** Required

**Body:** `{ "itemId": "uuid", "quantity": 1 }`

- Only items from **same college** as buyer can be added.
- Cannot add **own** item.
- Item must be **active**.

**Errors**

- **400** – Own item, or item from different college, or item not available.

#### Get cart

**Endpoint:** `GET /cart`  
**Auth:** Required

**Success (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "item_id": "uuid",
        "quantity": 2,
        "title": "...",
        "price": 800,
        "buyer_price": 1000,
        "seller_id": "uuid",
        "category_name": "Books",
        ...
      }
    ],
    "total": 2000
  }
}
```

- **price**: Seller price per unit.
- **buyer_price**: Price per unit paid by buyer (with 25%).
- **total**: Sum of `(buyer_price × quantity)` for all cart items. Use this as **order amount** for payment.

#### Update quantity

**Endpoint:** `PUT /cart/:itemId/quantity`  
**Body:** `{ "quantity": 2 }`  
**Auth:** Required

#### Remove from cart

**Endpoint:** `DELETE /cart/:itemId`  
**Auth:** Required

---

### 7. Orders & Payment

#### Create order (initiate payment)

**Endpoint:** `POST /orders/create`  
**Auth:** Required

Creates an order from current cart and returns Razorpay order details.  
Order total = sum of **(buyer_price × quantity)** for each cart item (25% included).  
Backend stores per line: **seller_amount**, **platform_fee**, **buyer_paid** for payouts.

**Success (201)**

```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "razorpayOrderId": "order_xxx",
    "amount": 2000,
    "currency": "INR",
    "keyId": "rzp_test_xxx"
  }
}
```

Use **amount** and **razorpayOrderId** and **keyId** with Razorpay Checkout on frontend.

#### Verify payment

**Endpoint:** `POST /orders/verify-payment`  
**Auth:** Required

**Body**

```json
{
  "orderId": "uuid",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

Call after successful Razorpay payment. Backend verifies signature and marks order as paid. Cart is cleared.

**Success (200)**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": { "order": { ... } }
}
```

#### My Orders

**Endpoint:** `GET /orders/my`  
**Auth:** Required

Orders **placed by the current user** (buyer).  
**Query:** `limit`, `offset` (optional).

**Success (200)**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "items": [
          {
            "itemId": "uuid",
            "title": "...",
            "quantity": 1,
            "sellerId": "uuid",
            "seller_amount": 800,
            "platform_fee": 200,
            "buyer_paid": 1000
          }
        ],
        "total_amount": "1000.00",
        "payment_status": "paid",
        "razorpay_order_id": "...",
        "razorpay_payment_id": "...",
        "created_at": "..."
      }
    ],
    "total": 3
  }
}
```

---

## Platform Fee & Pricing

| Concept        | Meaning |
|----------------|--------|
| **Seller price** | Stored in `items.price`. What seller receives per unit. |
| **Platform fee** | 25% of seller amount (configurable via `PLATFORM_FEE_PERCENT` in backend). |
| **Buyer price**  | `seller_price × (1 + 25%)` = amount shown to buyer and charged. |

Example: Seller lists at ₹800.  
- Buyer sees and pays **₹1000**.  
- On successful payment: **₹800** to seller, **₹200** to platform.  
Backend stores **seller_amount** and **platform_fee** in each order’s `items` for payout handling.

---

## Order & Payment Flow

1. User browses **Home** via `GET /items/home/feed` (same college, exclude own).
2. User adds items to cart with `POST /cart/add` (same-college check enforced).
3. User opens cart; `GET /cart` returns items with **buyer_price** and **total**.
4. User clicks checkout; frontend calls `POST /orders/create`, gets **amount** and **razorpayOrderId**.
5. Frontend opens Razorpay Checkout with that amount and order ID.
6. On success, frontend calls `POST /orders/verify-payment` with payment details.
7. Backend verifies, marks order paid, clears cart. Payout to seller (₹800) and platform (₹200) is determined from stored **seller_amount** and **platform_fee** (actual transfer can be manual or via payout API).

---

## Error Responses

| Status | Meaning |
|--------|--------|
| 400 | Bad request (e.g. validation, same-college rule, own item). |
| 401 | Unauthorized (no/invalid token). |
| 403 | Forbidden. |
| 404 | Resource not found. |
| 500 | Internal server error. |
| 503 | Payment gateway not configured. |

---

## Quick Reference

| Purpose        | Method | Endpoint              | Auth |
|----------------|--------|------------------------|------|
| Home feed      | GET    | /items/home/feed       | Yes  |
| Item detail    | GET    | /items/:id             | No   |
| My Listings    | GET    | /items/my/list         | Yes  |
| Create item    | POST   | /items                 | Yes  |
| Categories     | GET    | /categories            | No   |
| Add to cart    | POST   | /cart/add              | Yes  |
| Get cart       | GET    | /cart                  | Yes  |
| Create order   | POST   | /orders/create         | Yes  |
| Verify payment | POST   | /orders/verify-payment | Yes  |
| My Orders      | GET    | /orders/my             | Yes  |

All paths are relative to base URL `/api/v1`.

---

## Changelog (Backend)

| Date       | Change |
|------------|--------|
| 2026-02-18 | **Home feed fix**: Corrected SQL parameter count in `getForHome`. The count query was given limit/offset params; it now receives only WHERE params. Home feed no longer errors and items from same college (including those sold by admin) appear correctly. |
