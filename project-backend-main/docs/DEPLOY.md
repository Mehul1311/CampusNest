# Campus OLX Backend – Docker & CI/CD

**Repository:** Use a **backend-only** GitHub repo whose root is this folder (`project-backend`). So the repo contains `Dockerfile`, `src/`, `package.json`, `.github/workflows/`, etc. at the root. That way GitHub Actions finds `.github/workflows/deploy-backend.yml` at the repo root.

## Docker (local)

```bash
cd project-backend
docker build -t campus-olx-backend .
docker run -d --name campus-olx-backend -p 5000:5000 --env-file .env campus-olx-backend
```

## EC2 deploy (GitHub Actions)

The workflow **Build → Push to Docker Hub → Deploy** runs on push to `main`/`master` or on **workflow_dispatch**.

### 1. GitHub repository secrets

In **Settings → Secrets and variables → Actions**, add:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (Settings → Security → Access Tokens) |
| `EC2_HOST` | EC2 public IP or hostname |
| `EC2_USER` | SSH user (e.g. `ubuntu` for Amazon Linux 2/Ubuntu AMI) |
| `EC2_SSH_PRIVATE_KEY` | Full contents of the private key (.pem) used to SSH to EC2 |

### 2. EC2 setup

- Install Docker: `sudo yum install -y docker` (Amazon Linux) or `sudo apt install -y docker.io` (Ubuntu), then `sudo systemctl enable docker && sudo systemctl start docker`.
- Create env file in the SSH user’s home (e.g. `~/campus-olx-backend.env`) with:

```env
PORT=5000
NODE_ENV=production
PGHOST=your-rds-or-db-host
PGPORT=5432
PGDATABASE=campus_olx
PGUSER=postgres
PGPASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
PLATFORM_FEE_PERCENT=25
FRONTEND_URL=https://your-frontend-domain.com
# Optional: Firebase (one of these)
# FIREBASE_SERVICE_ACCOUNT_BASE64=base64-encoded-json
# or FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# or GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

- Ensure the workflow’s deploy step uses the same path for the env file. Default in the workflow is `campus-olx-backend.env` in the SSH user’s home (e.g. `~/campus-olx-backend.env`). Create it there or set the path in the workflow to match (e.g. `ENV_FILE=~/campus-olx-backend.env`).

### 3. Image and container

- Image: `$DOCKERHUB_USERNAME/campus-olx-backend:latest` (and `:${{ github.sha }}`).
- Container name: `campus-olx-backend`.
- Port: **5000** (host and container). Open inbound TCP 5000 in the EC2 security group if the API is accessed from the internet.

### 4. Rollback

If the new container exits, the workflow rolls back to the previous image and restarts the container with the same `--env-file` and port.
