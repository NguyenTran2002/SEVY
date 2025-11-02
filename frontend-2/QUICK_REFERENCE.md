# Frontend-2 Quick Reference

Quick commands and troubleshooting for SEVY frontend-2.

---

## Local Development

### Start All Services
```bash
cd /Users/nnt/Documents/Developer/[SEVY]/SEVY
docker compose up --build
```

**Access:**
- Old frontend: http://localhost:3000
- **New frontend: http://localhost:3001** ⭐
- Backend: http://localhost:5001

### View Logs
```bash
# All services
docker compose logs -f

# Just frontend-2
docker compose logs frontend-2 -f

# Last 50 lines
docker compose logs frontend-2 --tail 50
```

### Restart Service
```bash
# Restart just frontend-2
docker compose restart frontend-2

# Rebuild and restart
docker compose up --build frontend-2
```

### Stop All Services
```bash
docker compose down
```

---

## Production Deployment

### Quick Deploy
```bash
cd /Users/nnt/Documents/Developer/[SEVY]/SEVY/frontend-2

# Set variables
export BACKEND_URL="https://python-backend-xxx.run.app"
export GOOGLE_MAPS_KEY="AIzaSyCSg6r1MsZAJOCbBSQrKfSNUk5MQ9POIAU"
export PROJECT_ID="sevy-462004"
export REGION="asia-east1"

# Build
docker build \
  --platform linux/amd64 \
  --build-arg VITE_BACKEND_URL="${BACKEND_URL}" \
  --build-arg VITE_GOOGLE_MAPS_KEY="${GOOGLE_MAPS_KEY}" \
  -f Dockerfile.prod \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/sevy/frontend-2:latest \
  .

# Push
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/sevy/frontend-2:latest

# Deploy
gcloud run deploy frontend-2 \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/sevy/frontend-2:latest \
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

### Check Deployment Status
```bash
# Service info
gcloud run services describe frontend-2 --region=asia-east1

# Get URL
gcloud run services describe frontend-2 --region=asia-east1 --format='value(status.url)'

# View logs
gcloud run services logs read frontend-2 --region=asia-east1 --limit=50
```

---

## Troubleshooting

### Chat Not Working

**Check 1: Backend connectivity**
```bash
# Test backend directly
curl -X POST https://python-backend-xxx.run.app/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"developerMode":false}'
```

**Check 2: CORS**
- Open browser console (F12)
- Look for CORS errors
- Verify backend has `CORS(app, resources={r"/*": {"origins": "*"}})`

**Check 3: Environment variable**
```bash
# Verify VITE_BACKEND_URL was set during build
echo $BACKEND_URL

# Rebuild with correct URL
docker build --build-arg VITE_BACKEND_URL="https://..." ...
```

### Stats Showing Hardcoded Values

**Issue:** Stats show 2,500+, 10,000+, 15+ instead of real numbers

**Solutions:**

1. **Check backend endpoint**
   ```bash
   curl -X POST https://python-backend-xxx.run.app/get_all_numbers \
     -H "Content-Type: application/json"

   # Expected: {"students_taught":2500,"sevy_ai_answers":10234,"sevy_educators_number":15}
   ```

2. **Check browser console**
   - Look for fetch errors
   - Network tab: verify POST to /get_all_numbers

3. **Verify MongoDB connection**
   - Backend must have valid MongoDB credentials
   - Check backend logs for DB errors

### Build Fails

**Error: "Cannot find module '@google/genai'"**
- ✅ **Fixed:** Already removed from package.json
- Solution: `npm install` to update dependencies

**Error: "dist folder not found"**
- Vite outputs to `dist/`, not `build/`
- Check Dockerfile.prod line: `COPY --from=build /app/dist`

### Container Won't Start (Cloud Run)

**Check logs:**
```bash
gcloud run services logs read frontend-2 --region=asia-east1 --limit=100
```

**Common issues:**
- Port mismatch (must be 8080)
- Missing nginx.conf
- Incorrect file paths

**Test locally first:**
```bash
docker run -p 8080:8080 --env PORT=8080 <image-name>
curl http://localhost:8080
```

---

## Environment Variables

### Local Development
**Required:** Create `frontend-2/.env` file:
```
VITE_GOOGLE_MAPS_KEY=AIzaSyCSg6r1MsZAJOCbBSQrKfSNUk5MQ9POIAU
```
Vite proxy handles API routing automatically (no VITE_BACKEND_URL needed).

### Production Build
```bash
# Required during docker build
--build-arg VITE_BACKEND_URL="https://python-backend-xxx.run.app"
--build-arg VITE_GOOGLE_MAPS_KEY="AIzaSyCSg6r1MsZAJOCbBSQrKfSNUk5MQ9POIAU"
```

### Cloud Run Runtime
```bash
# Automatically set by Cloud Run
PORT=8080
```

---

## API Endpoints

### `/chat` - AI Conversation
```bash
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is safe sex?"}
    ],
    "developerMode": false
  }'
```

**Response:**
```json
{
  "reply": "Safe sex refers to practices that reduce the risk..."
}
```

### `/get_all_numbers` - Stats
```bash
curl -X POST http://localhost:5001/get_all_numbers \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "students_taught": 2500,
  "sevy_ai_answers": 10234,
  "sevy_educators_number": 15
}
```

---

## Common Tasks

### Update Dependencies
```bash
cd frontend-2
npm install
docker compose up --build frontend-2
```

### Clear sessionStorage (Test)
```javascript
// Browser console
sessionStorage.clear()
location.reload()
```

### Check Message History
```javascript
// Browser console
JSON.parse(sessionStorage.getItem('sevyai_chat_messages_dedicated'))
```

### Test Sliding Window
```javascript
// Send 7+ messages, then check what's sent to backend
// Browser DevTools → Network → /chat → Payload
// Should only send last 10 messages
```

---

## File Locations

### Configuration Files
- `vite.config.ts` - Vite config + proxy
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `.dockerignore` - Docker exclusions

### Docker Files
- `Dockerfile` - Local development
- `Dockerfile.prod` - Production build
- `nginx.conf` - Nginx server config
- `docker-compose.yml` - Multi-service setup (in SEVY/)

### Components (Key Files)
- `components/SevyAI.tsx` - Main chat component
- `components/ChatPopup.tsx` - Popup chat
- `components/Stats.tsx` - Dynamic metrics
- `lib/i18n.tsx` - Translations

### Documentation
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `INTEGRATION_SUMMARY.md` - Integration details
- `QUICK_REFERENCE.md` - This file
- `../CLAUDE.md` - Project overview

---

## Performance Tips

### Optimize Build
```bash
# Production build is already optimized
npm run build

# Check bundle size
ls -lh dist/assets/*.js
```

### Monitor Performance
```bash
# Cloud Run metrics
gcloud run services describe frontend-2 --region=asia-east1

# Local testing
# Use Chrome DevTools → Lighthouse
```

### Reduce Costs
```yaml
# Cloud Run config (already set)
--min-instances=0    # Scale to zero when not in use
--max-instances=10   # Cap maximum instances
--memory=512Mi       # Sufficient for Nginx
```

---

## Useful Commands

### Docker

```bash
# List running containers
docker ps

# Remove all containers
docker compose down -v

# Remove images
docker rmi sevy-frontend-2

# Clean up
docker system prune -a
```

### Git (from SEVY/ directory)

```bash
cd /Users/nnt/Documents/Developer/[SEVY]/SEVY

# Check status
git status

# Add changes
git add frontend-2/

# Commit
git commit -m "Integrate frontend-2 with Flask backend"

# Push
git push
```

### Google Cloud

```bash
# List services
gcloud run services list --region=asia-east1

# Delete service
gcloud run services delete frontend-2 --region=asia-east1

# View revisions
gcloud run revisions list --service=frontend-2 --region=asia-east1

# Rollback
gcloud run services update-traffic frontend-2 \
  --to-revisions=<revision-name>=100 \
  --region=asia-east1
```

---

## Testing Checklist

### Before Committing
- [ ] `docker compose up --build` works
- [ ] Chat sends messages successfully
- [ ] Stats load from API
- [ ] Language switching works
- [ ] No console errors

### Before Deploying
- [ ] Production build succeeds
- [ ] Backend URL is correct
- [ ] Test deployed URL in browser
- [ ] Mobile responsive
- [ ] All API calls work

### After Deployment
- [ ] Chat functionality works
- [ ] Stats show real numbers
- [ ] No CORS errors
- [ ] Conversation persists on refresh
- [ ] Clear chat works

---

## Support

**Issues?**
1. Check this guide first
2. Read `DEPLOYMENT_GUIDE.md`
3. Check Cloud Run logs
4. Email: director.office@sevyai.com

**Useful Links:**
- [Vite Documentation](https://vitejs.dev/)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

**Last Updated:** January 2025
