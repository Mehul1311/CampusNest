# Campus OLX - Admin API Documentation

API documentation for **"See as Admin"** and **admin dashboard** endpoints. The admin **Items** section (list/edit/delete all items) has been removed from the backend. Use this alongside the main [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) or [CAMPUS_OLX_BACKEND_API.md](./CAMPUS_OLX_BACKEND_API.md) for full integration.

---

## Table of Contents

1. [See as Admin - UI Logic](#see-as-admin---ui-logic)
2. [Admin Access Requirements](#admin-access-requirements)
3. [Admin Endpoints (No Items)](#admin-endpoints-no-items)
4. [Quick Reference](#quick-reference)

---

## See as Admin - UI Logic

The **"See as Admin"** option should appear in the user dropdown/profile menu **only when the logged-in user has admin privileges**.

### How to Determine Admin Status

**Endpoint:** `GET /auth/me`  
**Auth Required:** Yes (`Authorization: Bearer <token>`)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "uuid",
      "email": "admin@college.edu",
      "name": "Admin User",
      "college": "ABC College",
      "phone": "9876543210",
      "role": "admin",
      "permissions": []
    }
  }
}
```

### Role Values

| `user.role` | Admin Access | Show "See as Admin" |
|-------------|--------------|---------------------|
| `user`      | No           | No                  |
| `admin`     | Yes          | Yes                 |
| `superadmin`| Yes          | Yes                 |

### Frontend Implementation

```javascript
const isAdmin = user?.role === "admin" || user?.role === "superadmin";

{isAdmin && (
  <Link href="/admin">See as Admin</Link>
)}
```

When the user clicks "See as Admin", navigate to `/admin` (dashboard).  
**Note:** There is no admin "Items" or "Add Item" API; the backend does not expose admin item CRUD.

---

## Admin Access Requirements

All admin endpoints require:

1. **Valid JWT** in header: `Authorization: Bearer <token>`
2. **User role** must be `admin` or `superadmin`

If the token is missing/invalid → `401 Unauthorized`  
If the user is not admin → `403 Forbidden` with `{ "success": false, "error": "Admin access required" }`

---

## Admin Endpoints (No Items)

Base path: `/api/v1/admin`

| Purpose        | Method | Endpoint                    | Auth |
|----------------|--------|-----------------------------|------|
| Dashboard stats| GET    | `/admin/stats`              | Yes (Admin) |
| List users     | GET    | `/admin/users`              | Yes (Admin) |
| Update user role | PUT  | `/admin/users/:uid/role`    | Yes (Superadmin only) |
| List orders    | GET    | `/admin/orders`             | Yes (Admin) |
| Activity logs  | GET    | `/admin/activity-logs`      | Yes (Admin) |
| Activity stats | GET    | `/admin/activity-logs/stats`| Yes (Admin) |

**Removed (no longer available):**

- `GET /admin/items` – list all items  
- `PUT /admin/items/:id` – update item  
- `DELETE /admin/items/:id` – delete item  

The admin dashboard **stats** response no longer includes `activeItems`; it includes `users`, `categories`, `orders`, and `activityLogs` only.

---

## Quick Reference

| Action           | Method | Endpoint                         |
|------------------|--------|----------------------------------|
| Dashboard stats  | GET    | `/admin/stats`                   |
| List users       | GET    | `/admin/users`                   |
| Update user role | PUT    | `/admin/users/:uid/role`         |
| List orders      | GET    | `/admin/orders`                  |
| Activity logs    | GET    | `/admin/activity-logs`          |
| Activity stats   | GET    | `/admin/activity-logs/stats`    |

All require: `Authorization: Bearer <token>` and role `admin` or `superadmin`. Role updates require `superadmin`.
