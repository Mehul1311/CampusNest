# Campus OLX - API Documentation

Complete backend API documentation for frontend integration.

---

## Table of Contents

1. [Base URL & Environment](#base-url--environment)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Auth](#auth)
   - [Categories](#categories)
   - [Items](#items)
   - [Cart](#cart)
   - [Orders & Payment](#orders--payment)
   - [Admin](#admin)

---

## Base URL & Environment

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:5000/api/v1` |
| Production  | `https://your-domain.com/api/v1` |

All endpoints below are relative to the base URL.

---

## Authentication

The API uses **JWT (JSON Web Token)** for authentication.

### How to Use

1. **Signup** or **Login** to receive a `token` in the response.
2. Include the token in all protected requests:
   ```
   Authorization: Bearer <your_token>
   ```

### Example (Axios)

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Token Expiry

- Default: 7 days
- On expiry, API returns `401` with `errorCode: "TOKEN_EXPIRED"`
- Handle by redirecting user to login and clearing stored token

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": [],
  "errorCode": "OPTIONAL_ERROR_CODE"
}
```

---

## Error Handling

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation / invalid input) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 500 | Internal Server Error |
| 503 | Service Unavailable (e.g., payment gateway not configured) |

### Auth Error Codes

| errorCode | Meaning |
|-----------|---------|
| NO_TOKEN | No token provided |
| TOKEN_EXPIRED | Token has expired |
| TOKEN_INVALID | Token is invalid |

### Validation Error Format

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Email required" },
    { "field": "password", "message": "Password min 6 characters" }
  ]
}
```

---

## API Endpoints

---

### Auth

#### 1. Signup

Create a new user account.

**Endpoint:** `POST /auth/signup`  
**Auth Required:** No

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email |
| name | string | Yes | Min 2 characters |
| college | string | Yes | College/campus name |
| phone | string | Yes | Min 10 digits |
| password | string | Yes | Min 6 characters |

**Example Request:**
```json
{
  "email": "student@college.edu",
  "name": "John Doe",
  "college": "ABC Engineering College",
  "phone": "9876543210",
  "password": "secret123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "uid": "uuid",
      "email": "student@college.edu",
      "name": "John Doe",
      "college": "ABC Engineering College",
      "phone": "9876543210",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):** `{ "success": false, "error": "Email already registered" }`

---

#### 2. Login

**Endpoint:** `POST /auth/login`  
**Auth Required:** No

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Example Request:**
```json
{
  "email": "student@college.edu",
  "password": "secret123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uid": "uuid",
      "email": "student@college.edu",
      "name": "John Doe",
      "college": "ABC Engineering College",
      "phone": "9876543210",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):** `{ "success": false, "error": "Invalid email or password" }`

---

#### 3. Get Profile

**Endpoint:** `GET /auth/me`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "uuid",
      "email": "student@college.edu",
      "name": "John Doe",
      "college": "ABC Engineering College",
      "phone": "9876543210",
      "role": "user",
      "permissions": []
    }
  }
}
```

---

### Categories

#### 4. List All Categories

**Endpoint:** `GET /categories`  
**Auth Required:** No

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Books",
        "slug": "books",
        "description": null,
        "display_order": 1,
        "created_at": "2025-02-17T...",
        "updated_at": "2025-02-17T..."
      }
    ]
  }
}
```

**Default Categories:** Books, Electronics, Furniture, Clothing, Sports, Bikes, Stationery, Others

---

#### 5. Get Category by ID

**Endpoint:** `GET /categories/:id`  
**Auth Required:** No

**URL Params:** `id` (UUID)

**Success Response (200):** Same structure as single category object above.  
**Error Response (404):** `{ "success": false, "error": "Category not found" }`

---

#### 6. Create Category (Admin Only)

**Endpoint:** `POST /categories`  
**Auth Required:** Yes (Admin)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name |
| slug | string | No | URL slug (auto-generated from name if omitted) |
| description | string | No | |
| displayOrder | number | No | Display order (default: 0) |

---

#### 7. Update Category (Admin Only)

**Endpoint:** `PUT /categories/:id`  
**Auth Required:** Yes (Admin)

---

#### 8. Delete Category (Admin Only)

**Endpoint:** `DELETE /categories/:id`  
**Auth Required:** Yes (Admin)

---

### Items

#### 9. List Items

**Endpoint:** `GET /items`  
**Auth Required:** No

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| category | string (UUID) | - | Filter by category ID |
| college | string | - | Filter by college name |
| search | string | - | Search in title & description |
| limit | number | 20 | Items per page |
| offset | number | 0 | Pagination offset |

**Example:** `GET /items?category=uuid&search=laptop&limit=10&offset=0`

**Success Response (200):**
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
        "description": "Good condition",
        "price": "250.00",
        "images": ["url1", "url2"],
        "status": "active",
        "college": "ABC College",
        "contact_phone": "9876543210",
        "created_at": "2025-02-17T...",
        "category_name": "Books",
        "category_slug": "books",
        "seller_name": "John Doe",
        "seller_college": "ABC College"
      }
    ],
    "total": 42
  }
}
```

---

#### 10. Get Item by ID

**Endpoint:** `GET /items/:id`  
**Auth Required:** No

**URL Params:** `id` (UUID)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "uuid",
      "seller_id": "uuid",
      "category_id": "uuid",
      "title": "Physics Textbook",
      "description": "Good condition",
      "price": "250.00",
      "images": ["url1", "url2"],
      "status": "active",
      "college": "ABC College",
      "contact_phone": "9876543210",
      "created_at": "2025-02-17T...",
      "category_name": "Books",
      "category_slug": "books",
      "seller_name": "John Doe",
      "seller_college": "ABC College",
      "seller_phone": "9876543210"
    }
  }
}
```

---

#### 11. Create Item

**Endpoint:** `POST /items`  
**Auth Required:** Yes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Max 500 chars |
| categoryId | string (UUID) | Yes | Category ID |
| price | number | Yes | Must be >= 0 |
| description | string | No | |
| images | string[] | No | Array of image URLs |
| college | string | No | Override seller's college |
| contactPhone | string | No | Override seller's phone |

**Example Request:**
```json
{
  "title": "Physics Textbook - Class 12",
  "categoryId": "uuid-of-books-category",
  "price": 250,
  "description": "Almost new, no marks inside",
  "images": ["https://example.com/img1.jpg"]
}
```

**Success Response (201):** `{ "success": true, "data": { "item": { ... } } }`

---

#### 12. Get My Listings

**Endpoint:** `GET /items/my/list`  
**Auth Required:** Yes

**Query Parameters:** `limit`, `offset` (optional)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 5
  }
}
```

---

#### 13. Update Item

**Endpoint:** `PUT /items/:id`  
**Auth Required:** Yes (Owner only)

**URL Params:** `id` (UUID)

**Request Body:** All fields optional (partial update)

| Field | Type | Description |
|-------|------|-------------|
| title | string | Max 500 chars |
| price | number | >= 0 |
| description | string | |
| images | string[] | |
| status | string | `active` \| `sold` \| `inactive` |

---

#### 14. Delete Item

**Endpoint:** `DELETE /items/:id`  
**Auth Required:** Yes (Owner only)

**Success Response (200):** `{ "success": true, "message": "Item deleted" }`

---

### Cart

All cart endpoints require authentication.

#### 15. Add to Cart

**Endpoint:** `POST /cart/add`  
**Auth Required:** Yes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| itemId | string (UUID) | Yes | Item ID |
| quantity | number | No | Default: 1 |

**Example Request:**
```json
{
  "itemId": "uuid-of-item",
  "quantity": 1
}
```

**Success Response (201):** `{ "success": true, "data": { "cartItem": { ... } } }`

**Error Responses:**
- 400: `"Item is not available"` (item sold/inactive)
- 400: `"Cannot add your own item to cart"`

---

#### 16. Get Cart

**Endpoint:** `GET /cart`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "item_id": "uuid",
        "quantity": 1,
        "title": "Physics Textbook",
        "price": "250.00",
        "images": ["url1"],
        "status": "active",
        "seller_id": "uuid",
        "category_name": "Books",
        "created_at": "2025-02-17T..."
      }
    ],
    "total": 250
  }
}
```

---

#### 17. Update Cart Item Quantity

**Endpoint:** `PUT /cart/:itemId/quantity`  
**Auth Required:** Yes

**URL Params:** `itemId` (UUID)

**Request Body:**
```json
{
  "quantity": 2
}
```

- `quantity: 0` removes the item from cart.
- **Success Response (200):** `{ "success": true, "data": { "cartItem": { ... } } }` or `{ "success": true, "message": "Item removed from cart" }`

---

#### 18. Remove from Cart

**Endpoint:** `DELETE /cart/:itemId`  
**Auth Required:** Yes

---

#### 19. Clear Cart

**Endpoint:** `DELETE /cart`  
**Auth Required:** Yes

**Success Response (200):** `{ "success": true, "message": "Cart cleared" }`

---

### Orders & Payment

Orders use **Razorpay** for payments. Frontend must integrate [Razorpay Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/).

#### 20. Create Order

Creates an order from cart items and returns Razorpay order details.

**Endpoint:** `POST /orders/create`  
**Auth Required:** Yes

**Request Body:** None (uses current cart)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "razorpayOrderId": "order_xxxxx",
    "amount": 500,
    "currency": "INR",
    "keyId": "rzp_test_xxxxx"
  }
}
```

**Error Responses:**
- 400: `{ "success": false, "error": "Cart is empty" }`
- 503: `{ "success": false, "error": "Payment gateway not configured" }`

**Frontend Flow:**
1. Call `POST /orders/create`
2. Use `razorpayOrderId`, `amount`, `keyId` with Razorpay Checkout
3. On success, call `POST /orders/verify-payment` with payment details

---

#### 21. Verify Payment

Call after successful Razorpay payment.

**Endpoint:** `POST /orders/verify-payment`  
**Auth Required:** Yes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderId | string (UUID) | Yes | Your order ID from create |
| razorpayOrderId | string | Yes | Razorpay order ID |
| razorpayPaymentId | string | Yes | Razorpay payment ID from success callback |
| razorpaySignature | string | Yes | Razorpay signature from success callback |

**Example Request:**
```json
{
  "orderId": "uuid",
  "razorpayOrderId": "order_xxxxx",
  "razorpayPaymentId": "pay_xxxxx",
  "razorpaySignature": "signature_xxxxx"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "order": {
      "id": "uuid",
      "user_id": "uuid",
      "items": [...],
      "total_amount": "500.00",
      "payment_status": "paid",
      "razorpay_order_id": "order_xxxxx",
      "razorpay_payment_id": "pay_xxxxx",
      "created_at": "2025-02-17T..."
    }
  }
}
```

**Error Response (400):** `{ "success": false, "error": "Invalid payment signature" }`

**Note:** Cart is cleared automatically on successful verification.

---

#### 22. Get My Orders

**Endpoint:** `GET /orders/my`  
**Auth Required:** Yes

**Query Parameters:** `limit` (default: 20), `offset` (default: 0)

**Success Response (200):**
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
            "title": "Physics Textbook",
            "price": 250,
            "quantity": 1,
            "sellerId": "uuid"
          }
        ],
        "total_amount": "250.00",
        "payment_status": "paid",
        "razorpay_order_id": "order_xxxxx",
        "razorpay_payment_id": "pay_xxxxx",
        "created_at": "2025-02-17T..."
      }
    ],
    "total": 3
  }
}
```

---

#### 23. Get Order by ID

**Endpoint:** `GET /orders/:id`  
**Auth Required:** Yes (Owner or Admin)

---

### Admin

All admin endpoints require authentication **and** role `admin` or `superadmin`.

#### 24. Dashboard Stats

**Endpoint:** `GET /admin/stats`  
**Auth Required:** Yes (Admin)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": 150,
    "activeItems": 89,
    "categories": 8,
    "orders": {
      "totalOrders": 45,
      "totalRevenue": 12500.50,
      "byStatus": [
        { "payment_status": "paid", "count": "40" },
        { "payment_status": "pending", "count": "5" }
      ]
    },
    "activityLogs": {
      "total": 1200,
      "byStatus": [...],
      "topUsers": [...]
    }
  }
}
```

---

#### 25. Get All Users

**Endpoint:** `GET /admin/users`  
**Auth Required:** Yes (Admin)

**Query Parameters:** `limit`, `offset`, `role` (filter by user/admin)

---

#### 26. Update User Role

**Endpoint:** `PUT /admin/users/:uid/role`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Valid roles:** `user`, `admin`, `superadmin` (superadmin only by existing superadmin)

---

#### 27. Get All Items (Admin)

**Endpoint:** `GET /admin/items`  
**Auth Required:** Yes (Admin)

**Query Parameters:** `limit`, `offset`, `status` (active/sold/inactive), `category` (category ID)

---

#### 28. Get All Orders (Admin)

**Endpoint:** `GET /admin/orders`  
**Auth Required:** Yes (Admin)

**Query Parameters:** `limit`, `offset`, `status` (pending/paid)

---

#### 29. Get Activity Logs

**Endpoint:** `GET /admin/activity-logs`  
**Auth Required:** Yes (Admin)

**Query Parameters:** `limit`, `offset`, `userId`, `status`, `startDate`, `endDate`, `search`

---

#### 30. Get Activity Log Stats

**Endpoint:** `GET /admin/activity-logs/stats`  
**Auth Required:** Yes (Admin)

**Query Parameters:** `startDate`, `endDate`

---

## Quick Reference: Public vs Protected

| Access | Endpoints |
|--------|-----------|
| **Public** | `POST /auth/signup`, `POST /auth/login`, `GET /categories`, `GET /categories/:id`, `GET /items`, `GET /items/:id` |
| **Auth Required** | All `/auth/me`, `/items` (create, my list, update, delete), `/cart/*`, `/orders/*` |
| **Admin Required** | All `/admin/*`, `POST/PUT/DELETE /categories` |

---

## User Roles

| Role | Description |
|------|-------------|
| user | Default; can list, buy, sell |
| admin | Can access admin dashboard, manage users, view logs |
| superadmin | Full admin; can create other admins/superadmins |

---

## Checklist for Frontend Integration

- [ ] Store JWT after signup/login (e.g., localStorage/sessionStorage)
- [ ] Add `Authorization: Bearer <token>` header to all protected requests
- [ ] Handle 401 (redirect to login, clear token)
- [ ] Handle validation errors (400) and show field-specific messages
- [ ] Integrate Razorpay Checkout for payment flow
- [ ] Call `/orders/verify-payment` after successful Razorpay payment
- [ ] Use `role` from user object to show/hide admin features
- [ ] Implement pagination using `limit` and `offset` where supported
