# Backend Changes – For Frontend Developer

Summary of backend fixes and behavior. Use with **CAMPUS_OLX_BACKEND_API.md** for full API details.

---

## Fix Applied (18 Feb 2026)

### Home feed error and visibility

**Issue:**  
- Calling `GET /items/home/feed` returned **500** with:  
  `bind message supplies 4 parameters, but prepared statement "" requires 2`.  
- Items listed by an admin (same college) did not show on the Home page for another user with the same college.

**Cause:**  
- In the home feed SQL, the **count** query was executed with the full parameter array (including `limit` and `offset`).  
- The count query only has placeholders for the WHERE clause (e.g. 2–4 params), so passing 4–6 params caused a parameter mismatch.

**Change (backend only):**  
- In `ItemModel.getForHome`, the **count** query now receives only the parameters used in the WHERE clause.  
- The main list query still receives WHERE params + `limit` + `offset`.  
- No API contract change: same endpoint, same request/response.

**Result:**  
- `GET /items/home/feed` returns **200** and the correct list.  
- Items from the **same college** (including those sold by admin) now appear on Home for other users of that college.  
- Own listings are still excluded from Home (they only appear in My Listings).

---

## What Frontend Should Do

- **Home page:** Keep using **`GET /api/v1/items/home/feed`** with `Authorization: Bearer <token>`.  
- **Query params:** `category`, `search`, `limit`, `offset` as in the API doc.  
- **Response:** `data.items` (each with `price`, `buyer_price`, …) and `data.total`.  
- No changes required on the frontend for this fix; only the backend was updated.

---

## API Reference

Full request/response and rules: **`CAMPUS_OLX_BACKEND_API.md`**.
