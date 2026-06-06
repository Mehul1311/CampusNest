# Campus OLX - User Roles & Switch to Admin

Backend documentation for the **role system** and **Switch to Admin** button. Use this with the frontend developer.

---

## Table of Contents

1. [User Roles](#user-roles)
2. [Switch to Admin Button](#switch-to-admin-button)
3. [API Endpoints](#api-endpoints)
4. [Setup Scripts](#setup-scripts)

---

## User Roles

The `users` table has a `role` column with these values:

| Role        | Description                                      |
|-------------|--------------------------------------------------|
| `user`      | Default role. Can list, buy, sell items.         |
| `admin`     | Can access admin dashboard, manage items (CRUD). |
| `superadmin`| Full admin. Can promote users to admin or superadmin. |

### Role Hierarchy

- **superadmin** → Can assign any role (`user`, `admin`, `superadmin`) to any user.
- **admin** → Can access admin panel. Cannot change user roles.
- **user** → Standard user. No admin access.

---

## Switch to Admin Button

### When to Show

Show the **"Switch to Admin"** button in the profile/dropdown menu **only when** the logged-in user's role is `admin` or `superadmin`.

### How to Get the Role

**Endpoint:** `GET /auth/me`  
**Auth Required:** Yes (`Authorization: Bearer <token>`)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "uuid",
      "email": "user@college.edu",
      "name": "User Name",
      "college": "ABC College",
      "phone": "9876543210",
      "role": "admin",
      "permissions": []
    }
  }
}
```

### Frontend Logic

```javascript
// After login or GET /auth/me, check user.role
const isAdmin = user?.role === "admin" || user?.role === "superadmin";

// In profile/dropdown menu:
{isAdmin && (
  <Link href="/admin">Switch to Admin</Link>
)}
```

### Navigation

When the user clicks **"Switch to Admin"**, navigate to `/admin` (or your admin dashboard route).

### Role in Token

The JWT issued at login/signup includes `role`. However, if a superadmin promotes a user to admin, that user must **log in again** (or call `GET /auth/me`) to receive the updated role. The profile endpoint always returns the current role from the database.

---

## API Endpoints

### 1. Get Profile (includes role)

| Method | Endpoint    | Auth | Description              |
|--------|-------------|------|--------------------------|
| GET    | /auth/me    | Yes  | Returns current user with role |

**Response `user.role`:** `"user"` | `"admin"` | `"superadmin"`

---

### 2. Update User Role (Superadmin only)

**Endpoint:** `PUT /admin/users/:uid/role`  
**Auth Required:** Yes (Superadmin only)

Only **superadmin** can change a user's role. Admins cannot promote users.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| uid       | UUID | Yes      | User ID     |

**Request Body:**
```json
{
  "role": "admin"
}
```

| Field | Type   | Required | Allowed Values                |
|-------|--------|----------|-------------------------------|
| role  | string | Yes      | `user`, `admin`, `superadmin` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "uuid",
      "email": "user@college.edu",
      "name": "User Name",
      "college": "ABC College",
      "phone": "9876543210",
      "role": "admin",
      "permissions": []
    }
  }
}
```

**Error Responses:**
- `400` – Invalid role (use `user`, `admin`, or `superadmin`)
- `403` – Requester is not superadmin
- `404` – User not found

---

### 3. Get All Users (Admin)

**Endpoint:** `GET /admin/users`  
**Auth Required:** Yes (Admin or Superadmin)

**Query Parameters:** `limit`, `offset`, `role` (filter by role)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "uid": "uuid",
        "email": "user@college.edu",
        "name": "User Name",
        "college": "ABC College",
        "phone": "9876543210",
        "role": "user",
        "permissions": [],
        "is_verified": true,
        "created_at": "2025-02-17T..."
      }
    ],
    "total": 50
  }
}
```

---

## Setup Scripts

### Create first Superadmin

```bash
# User must exist (sign up first)
npm run setup-superadmin -- your-email@example.com

# Or with env var
SUPERADMIN_EMAIL=your-email@example.com npm run setup-superadmin
```

If the user does not exist, a superadmin user is created with default password `superadmin123`. Override with `SUPERADMIN_PASSWORD`.

### Create Admin (alternative)

```bash
npm run setup-admin -- admin-email@example.com
```

This sets role to `admin` only. For `superadmin`, use `setup-superadmin`.

---

## Summary for Frontend

| Feature                | Logic                                                                 |
|------------------------|-----------------------------------------------------------------------|
| Show "Switch to Admin" | `user.role === "admin"` OR `user.role === "superadmin"`               |
| Profile / dropdown     | Call `GET /auth/me` to get `user.role`                               |
| Update role            | `PUT /admin/users/:uid/role` with `{ role: "admin" }` – superadmin only |
| Admin panel access     | Requires `admin` or `superadmin` role                                |
