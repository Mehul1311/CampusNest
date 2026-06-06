<!-- testing hai ye -->

# Deploy Backend to AWS: RDS + EC2 Env Setup

## Part 1: Create AWS RDS (PostgreSQL)

### 1.1 Create the RDS instance

1. In **AWS Console** go to **RDS** → **Create database**.
2. **Engine**: PostgreSQL (match your app; e.g. 15 or 16).
3. **Templates**: **Free tier** (for testing) or **Production**.
4. **Settings**:
   - **DB instance identifier**: e.g. `campus-olx-db`
   - **Master username**: e.g. `postgres` (or another name; remember it)
   - **Master password**: Choose a strong password and **save it** (you’ll put it in `.env` on EC2).
5. **Instance configuration**:  
   Free tier: `db.t3.micro` (or pick a larger instance for production).
6. **Storage**: Default (e.g. 20 GB gp2) is fine; enable autoscaling if you want.
7. **Connectivity** (important):
   - **VPC**: Use the **same VPC** as your EC2 instance.
   - **Subnet**: Default or same as EC2.
   - **Public access**: **No** (DB only reachable from inside VPC).
   - **VPC security group**: Create new, e.g. `rds-campus-olx-sg`.
8. **Database authentication**: Password authentication.
9. **Additional configuration** (optional):
   - **Initial database name**: e.g. `campus_olx` (so RDS creates this DB for you).
   - Or leave blank and create the DB later (see below).
10. Create the database. Wait until status is **Available**.

### 1.2 Allow EC2 to reach RDS

1. **RDS** → your DB → **Connectivity & security**.
2. Note the **Endpoint** (e.g. `campus-olx-db.xxxxxx.us-east-1.rds.amazonaws.com`) and **Port** (usually `5432`).
3. Open **VPC Security Groups** (or from RDS page click the security group).
4. Edit **Inbound rules** for the RDS security group:
   - **Type**: PostgreSQL  
   - **Port**: 5432  
   - **Source**: Security group of your **EC2** instance (e.g. `sg-xxxxx`).  
     This allows only your EC2 to connect, not the whole internet.

### 1.3 Create database (if you didn’t set “Initial database name”)

If you left “Initial database name” blank, RDS creates a DB named like the master user. To use `campus_olx`:

1. From your **EC2** (or any machine that can reach RDS), install a PostgreSQL client if needed:
   ```bash
   sudo apt update && sudo apt install -y postgresql-client
   ```
2. Connect (replace with your RDS endpoint, user, and password):
   ```bash
   PGPASSWORD='YourMasterPassword' psql -h YOUR_RDS_ENDPOINT -U postgres -d postgres -c "CREATE DATABASE campus_olx;"
   ```
   Use the **RDS endpoint** from the RDS console (not localhost).

---

## Part 2: Store `.env` on the EC2 server

Your app loads `.env` from the project directory. Put a **production** `.env` only on the server (never commit it).

### 2.1 SSH into EC2 and go to your app directory

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
cd /path/to/your/project-backend   # e.g. /home/ubuntu/project-backend
```

### 2.2 Create the production `.env` file

Create or edit `.env` in the **project root** (e.g. `project-backend/.env`), **not** inside `src/`:

```bash
nano .env
```

Paste the following and **replace every placeholder** with your real values:

```env
# Server
PORT=5000
NODE_ENV=production

# AWS RDS (PostgreSQL)
PGHOST=YOUR_RDS_ENDPOINT
PGPORT=5432
PGDATABASE=campus_olx
PGUSER=postgres
PGPASSWORD=YOUR_RDS_MASTER_PASSWORD
PGSSLMODE=require

# JWT (generate a strong random string for production)
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_STRING
JWT_EXPIRES_IN=7d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

PLATFORM_FEE_PERCENT=25

# Frontend URL (your deployed frontend; no trailing slash)
FRONTEND_URL=https://your-frontend-domain.com

# Firebase Admin - use JSON string so you don't need a file on server
# Optional: set FIREBASE_SERVICE_ACCOUNT_JSON to the full JSON (one line, escaped)
# Or upload firebase-service-account.json and set path:
GOOGLE_APPLICATION_CREDENTIALS=/home/ubuntu/project-backend/firebase-service-account.json
```

**Replace:**

| Placeholder | Where to get it |
|------------|------------------|
| `YOUR_RDS_ENDPOINT` | RDS → your DB → Connectivity & security → Endpoint |
| `YOUR_RDS_MASTER_PASSWORD` | The master password you set when creating RDS |
| `REPLACE_WITH_LONG_RANDOM_STRING` | e.g. `openssl rand -base64 48` |
| `your_razorpay_key_id` / `your_razorpay_secret` | Your Razorpay dashboard |
| `https://your-frontend-domain.com` | Your real frontend URL (no trailing slash) |
| Path in `GOOGLE_APPLICATION_CREDENTIALS` | Path where you put `firebase-service-account.json` on EC2 |

Save and exit (`Ctrl+O`, Enter, `Ctrl+X` in nano).

### 2.3 Restrict permissions (recommended)

So only your app user can read the file:

```bash
chmod 600 .env
```

### 2.4 Firebase on the server (pick one)

**Option A – File on server**

- Copy `firebase-service-account.json` to EC2 (e.g. `scp -i your-key.pem firebase-service-account.json ubuntu@YOUR_EC2:/home/ubuntu/project-backend/`).
- In `.env` set:
  ```env
  GOOGLE_APPLICATION_CREDENTIALS=/home/ubuntu/project-backend/firebase-service-account.json
  ```
- Restrict the file: `chmod 600 firebase-service-account.json`.

**Option B – JSON in env (no file)**

- Put the **entire** JSON in one line (escape double quotes: `\"`).
- In `.env`:
  ```env
  FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...",...}
  ```
- Remove or comment out `GOOGLE_APPLICATION_CREDENTIALS` so the app uses `FIREBASE_SERVICE_ACCOUNT_JSON` instead.

### 2.5 Run the app from project root

So `.env` and (if used) `firebase-service-account.json` paths are correct:

```bash
cd /home/ubuntu/project-backend
node src/server.js
# or
NODE_ENV=production node src/server.js
```

If you use **nodemon** only for local dev, on the server use **node** or a process manager (e.g. **PM2**):

```bash
npm install -g pm2
pm2 start src/server.js --name campus-olx-api
pm2 save && pm2 startup
```

---

## Quick checklist

- [ ] RDS created in same VPC as EC2.
- [ ] RDS security group allows inbound **5432** from EC2’s security group only.
- [ ] Database `campus_olx` exists (created by RDS or by you).
- [ ] `.env` on EC2 has correct `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE=require`.
- [ ] Strong `JWT_SECRET` and real Razorpay keys.
- [ ] `FRONTEND_URL` set to your real frontend URL.
- [ ] Firebase configured via file path or `FIREBASE_SERVICE_ACCOUNT_JSON`.
- [ ] `.env` permissions: `chmod 600 .env`.
- [ ] App started from `project-backend` directory so it finds `.env`.

After that, your backend on EC2 will use RDS for PostgreSQL and the env stored on the server.
