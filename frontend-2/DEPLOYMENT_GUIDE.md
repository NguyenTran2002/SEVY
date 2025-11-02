# Frontend-2 Deployment Guide

This guide covers both local development and Google Cloud Run production deployment for the new SEVY frontend-2.

## Architecture Overview

**Frontend-2** is a modern React application built with:
- **Vite** (build tool) - Replaces Create React App
- **React 19** - Latest React version
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling

**Backend Integration:**
- Connects to existing Flask backend (`python-backend`)
- Uses `/chat` endpoint for AI conversations (OpenAI GPT-5-nano)
- Uses `/get_all_numbers` endpoint for dynamic metrics
- Implements sessionStorage for conversation persistence
- Privacy-first: zero server-side conversation storage

---

## Local Development

### Prerequisites
- Docker & Docker Compose installed
- Backend `.env` file configured (see main SEVY documentation)

### Quick Start

```bash
cd /Users/nnt/Documents/Developer/[SEVY]/SEVY

# Build and run all services
docker compose up --build

# Access the applications:
# - Old frontend: http://localhost:3000
# - New frontend: http://localhost:3001  👈 Frontend-2
# - Backend API: http://localhost:5001
```

### Services Configuration

**docker-compose.yml** now includes three services:

1. **react-frontend** (port 3000) - Original frontend
2. **frontend-2** (port 3001) - New frontend ✨
3. **python-backend** (port 5001→5000) - Flask API

### API Proxy Configuration

**Vite Dev Server** (vite.config.ts) automatically proxies API calls:
- `/chat` → `http://python-backend:5000/chat`
- `/get_all_numbers` → `http://python-backend:5000/get_all_numbers`

No CORS issues in local development!

### Development Workflow

```bash
# View logs for specific service
docker compose logs frontend-2 -f

# Rebuild after dependency changes
docker compose up --build frontend-2

# Stop all services
docker compose down

# Restart specific service
docker compose restart frontend-2
```

---

## Production Deployment (Google Cloud Run)

### Overview

Frontend-2 uses the **same deployment strategy** as the original react-frontend:
- Multi-stage Docker build (Node build → Nginx serve)
- Static files served via Nginx on port 8080
- Backend URL injected at build time via environment variable

### Prerequisites

1. **Google Cloud CLI** installed and authenticated
2. **Project ID**: `sevy-462004`
3. **Region**: `asia-east1` (Taiwan) or `asia-southeast1` (Singapore)
4. **Artifact Registry**: `sevy` repository exists
5. **Backend deployed** and URL known (e.g., `https://python-backend-xxx.run.app`)

### Step 1: Set Environment Variables

```bash
# Navigate to frontend-2 directory
cd /Users/nnt/Documents/Developer/[SEVY]/SEVY/frontend-2

# Set deployment variables
export PROJECT_ID=sevy-462004
export REGION=asia-east1
export REPOSITORY=sevy
export IMAGE_NAME=frontend-2
export TAG=latest

# IMPORTANT: Set your backend URL and Google Maps API key
export BACKEND_URL="https://python-backend-xxx-uc.a.run.app"
export GOOGLE_MAPS_KEY="AIzaSyCSg6r1MsZAJOCbBSQrKfSNUk5MQ9POIAU"
```

### Step 2: Build Production Docker Image

```bash
# Build with backend URL and Google Maps API key as build arguments
docker build \
  --platform linux/amd64 \
  --build-arg VITE_BACKEND_URL="${BACKEND_URL}" \
  --build-arg VITE_GOOGLE_MAPS_KEY="${GOOGLE_MAPS_KEY}" \
  -f Dockerfile.prod \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${TAG} \
  .
```

**What happens during build:**
- Stage 1: `npm install` + `npm run build` (Vite creates `/dist` folder)
- `VITE_BACKEND_URL` and `VITE_GOOGLE_MAPS_KEY` are embedded into JavaScript bundle
- Stage 2: Copy built files to Nginx, configure for Cloud Run port 8080

### Step 3: Push to Artifact Registry

```bash
# Authenticate with Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Push image
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${TAG}
```

### Step 4: Deploy to Cloud Run

```bash
gcloud run deploy frontend-2 \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${TAG} \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --port=8080 \
  --project=${PROJECT_ID}
```

**Output will include:**
```
Service URL: https://frontend-2-xxx-uc.a.run.app
```

### Step 5: Verify Deployment

```bash
# Test the deployed service
curl -I https://frontend-2-xxx-uc.a.run.app

# Expected: HTTP/2 200
```

Visit the URL in your browser and test:
1. ✅ Chat functionality (connects to backend)
2. ✅ Stats display (fetches from MongoDB)
3. ✅ Language switching (English/Vietnamese)
4. ✅ Conversation persistence (sessionStorage)
5. ✅ Clear chat button

---

## Deployment Scripts (Recommended)

Create a deployment script for convenience:

**`deploy.sh`:**
```bash
#!/bin/bash
set -e

# Configuration
PROJECT_ID="sevy-462004"
REGION="asia-east1"
REPOSITORY="sevy"
IMAGE_NAME="frontend-2"
TAG="latest"

# Prompt for backend URL and Google Maps API key
read -p "Enter backend URL (e.g., https://python-backend-xxx.run.app): " BACKEND_URL
read -p "Enter Google Maps API key: " GOOGLE_MAPS_KEY

echo "Building Docker image with backend URL: ${BACKEND_URL}"

# Build
docker build \
  --platform linux/amd64 \
  --build-arg VITE_BACKEND_URL="${BACKEND_URL}" \
  --build-arg VITE_GOOGLE_MAPS_KEY="${GOOGLE_MAPS_KEY}" \
  -f Dockerfile.prod \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${TAG} \
  .

# Push
echo "Pushing to Artifact Registry..."
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${TAG}

# Deploy
echo "Deploying to Cloud Run..."
gcloud run deploy frontend-2 \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${TAG} \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --port=8080 \
  --project=${PROJECT_ID}

echo "✅ Deployment complete!"
```

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## DNS Configuration (Replace Old Frontend)

If you want frontend-2 to become the main **sevyai.com** site:

### Option 1: Update Existing DNS Record
```bash
# Get frontend-2 URL
gcloud run services describe frontend-2 --region=asia-east1 --format='value(status.url)'

# Update your DNS provider:
# Type: CNAME
# Name: @ (or www)
# Value: ghs.googlehosted.com

# In Cloud Run domain mappings:
gcloud run domain-mappings create \
  --service=frontend-2 \
  --domain=sevyai.com \
  --region=asia-east1
```

### Option 2: Beta Subdomain (Recommended for Testing)
```bash
# Deploy on beta.sevyai.com first
gcloud run domain-mappings create \
  --service=frontend-2 \
  --domain=beta.sevyai.com \
  --region=asia-east1

# Test thoroughly before switching main domain
```

---

## Troubleshooting

### Issue: "Failed to fetch" when calling backend

**Symptoms:**
- Chat doesn't work
- Stats show fallback values (2,500+, 10,000+, 15+)
- Browser console shows network errors

**Solutions:**

1. **Check CORS on backend:**
   ```python
   # In python-backend/app.py
   CORS(app, resources={r"/*": {"origins": "*"}})
   ```

2. **Verify VITE_BACKEND_URL was set during build:**
   ```bash
   # Rebuild with correct URL
   docker build --build-arg VITE_BACKEND_URL="https://python-backend-xxx.run.app" ...
   ```

3. **Test backend directly:**
   ```bash
   curl -X POST https://python-backend-xxx.run.app/get_all_numbers \
     -H "Content-Type: application/json"
   ```

### Issue: Container fails to start

**Check logs:**
```bash
gcloud run services logs read frontend-2 --region=asia-east1 --limit=50
```

**Common causes:**
- Port mismatch (must be 8080 for Cloud Run)
- Missing nginx.conf
- Incorrect build output directory (Vite uses `dist`, not `build`)

### Issue: Blank page in production

**Symptoms:**
- White screen
- Console errors: "Failed to load resource"

**Solutions:**

1. **Check build output:**
   ```bash
   # Verify dist/ folder was created
   ls -la dist/
   ```

2. **Check nginx config:**
   ```nginx
   # nginx.conf should have:
   try_files $uri /index.html;
   ```

3. **Inspect deployed container:**
   ```bash
   docker run -it --entrypoint /bin/sh <image-name>
   # Check if /usr/share/nginx/html has files
   ```

---

## Performance Optimization

### Enable HTTP/2 (Cloud Run Default)
✅ Already enabled by default

### Gzip Compression
✅ Configured in nginx.conf

### Caching Strategy

**Backend API Cache:**
- `/get_all_numbers`: 30-second TTL cache (server-side)
- Reduces database queries

**Frontend Static Assets:**
- Add cache headers in nginx.conf (optional):
  ```nginx
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
  }
  ```

---

## Monitoring

### Cloud Run Metrics

View in Google Cloud Console:
- Request count
- Request latency
- Container CPU/memory usage
- Error rate

### Custom Monitoring

Add to `SevyAI.tsx`:
```typescript
// Track API errors
fetch(`${API_BASE_URL}/chat`, ...)
  .catch(error => {
    console.error('[SEVY] API Error:', error);
    // Send to error tracking service (e.g., Sentry)
  });
```

---

## Rollback Procedure

If deployment fails or has issues:

```bash
# List previous revisions
gcloud run revisions list --service=frontend-2 --region=asia-east1

# Rollback to previous revision
gcloud run services update-traffic frontend-2 \
  --to-revisions=frontend-2-00001-abc=100 \
  --region=asia-east1
```

---

## Cost Optimization

**Frontend-2 Cloud Run Costs:**
- **Free tier**: 2 million requests/month
- **Scale to zero**: No cost when not in use
- **Estimated**: ~$5-10/month for typical traffic

**Tips:**
- Set `--min-instances=0` to scale to zero
- Use `--max-instances=10` to cap costs
- Monitor usage in Cloud Console billing

---

## Differences from Old Frontend

| Feature | Old Frontend (react-frontend) | New Frontend (frontend-2) |
|---------|------------------------------|---------------------------|
| Build Tool | Webpack (Create React App) | Vite |
| React Version | 17 | 19 |
| Language | JavaScript | TypeScript |
| UI Library | Material-UI | Tailwind CSS |
| Routing | react-router-dom | State-based |
| i18n | i18next + IPInfo API | Custom Context API |
| Mobile | Separate components | Responsive |
| Build Output | `build/` | `dist/` |
| Dev Port | 3000 | 3000 (in Docker: 3001) |

---

## Next Steps

After successful deployment:

1. ✅ **Update CLAUDE.md** documentation with frontend-2 details
2. ✅ **Add monitoring** (Sentry, LogRocket, etc.)
3. ✅ **Replace placeholder gallery images** with actual photos
4. ✅ **A/B test** against old frontend
5. ✅ **Migrate traffic** gradually (10% → 50% → 100%)
6. ✅ **Update DNS** to point sevyai.com to frontend-2
7. ✅ **Archive old frontend** or retire it

---

## Support

For issues or questions:
- Email: director.office@sevyai.com
- Documentation: `/SEVY Google Cloud/SEVY_DEPLOYMENT_GUIDE.md`

---

**Last Updated:** January 2025
**Version:** 1.0
