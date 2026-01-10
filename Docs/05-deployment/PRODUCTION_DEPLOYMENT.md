# Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Migration](#database-migration)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Services
- ✅ PostgreSQL 14+ database
- ✅ Node.js 18+ runtime environment
- ✅ Object storage (AWS S3 or MinIO)
- ⚠️ Optional: Redis (for caching/rate limiting)
- ⚠️ Optional: Sentry (error tracking)

### Access Requirements
- Database admin credentials
- Google OAuth app credentials
- S3/MinIO bucket created
- Domain name configured (if applicable)

---

## Environment Setup

### 1. Create Production Environment File

```bash
cp .env.example .env.production
```

### 2. Configure Critical Variables

**CRITICAL - Must Change**:
```bash
# Generate secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Production URL
NEXTAUTH_URL="https://your-domain.com"

# Database (from hosting provider)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**Required - OAuth**:
```bash
# From Google Cloud Console
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
```

**Required - Storage**:
```bash
# AWS S3 or compatible service
S3_ENDPOINT="https://s3.amazonaws.com"  # or MinIO URL
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="vitechco-production"
S3_FORCE_PATH_STYLE="false"  # true for MinIO
```

**Optional - Monitoring**:
```bash
SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_ENVIRONMENT="production"
```

---

## Database Migration

### Step 1: Backup Current Database (if upgrading)

```bash
# PostgreSQL backup
pg_dump -h localhost -U postgres vitechco_hub > backup_$(date +%Y%m%d_%H%M%S).sql

# Or for hosted database
pg_dump DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (production database)
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Verify schema
npx prisma db push --skip-generate
```

### Step 3: Seed Initial Data (First Deployment Only)

```bash
# Create admin user manually in database or via Prisma Studio
npx prisma studio

# Or use seed script if available
npm run db:seed
```

---

## Deployment Steps

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login & Deploy**:
```bash
vercel login
vercel --prod
```

3. **Configure Environment Variables** in Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.production`

4. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Option B: Docker Deployment

1. **Build Docker Image**:
```bash
docker build -t vitechco-process-hub:latest .
```

2. **Run Container**:
```bash
docker run -d \
  --name vitechco-hub \
  -p 3000:3000 \
  --env-file .env.production \
  vitechco-process-hub:latest
```

### Option C: Traditional VPS (PM2)

1. **Install Dependencies**:
```bash
npm ci --production
```

2. **Build Application**:
```bash
npm run build
```

3. **Start with PM2**:
```bash
npm install -g pm2
pm2 start npm --name "vitechco-hub" -- start
pm2 save
pm2 startup
```

---

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-11T...",
  "environment": "production"
}
```

### 2. Authentication Test
1. Visit `https://your-domain.com`
2. Click "Sign in with Google"
3. Verify successful login
4. Check user role in database

### 3. Critical Features Test
- ✅ Homepage loads
- ✅ Search functionality works
- ✅ Admin panel accessible (ADMIN role)
- ✅ Document upload works
- ✅ File storage accessible

### 4. Performance Verification
```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.com --view

# Expected scores:
# Performance: ≥90
# Accessibility: ≥90
# Best Practices: ≥90
# SEO: ≥90
```

### 5. Security Verification
- ✅ HTTPS enabled
- ✅ RBAC guards working (try accessing admin as non-admin)
- ✅ File upload validation working
- ✅ No console errors in browser

---

## Monitoring Setup

### 1. Error Tracking with Sentry
```bash
# Already configured in code if SENTRY_DSN is set
# Verify errors are being tracked at https://sentry.io
```

### 2. Database Monitoring
```bash
# Setup automated backups (daily recommended)
# Example cron for PostgreSQL
0 2 * * * pg_dump DATABASE_URL > /backups/vitechco_$(date +\%Y\%m\%d).sql
```

### 3. Uptime Monitoring
- Setup ping monitor (e.g., UptimeRobot, Pingdom)
- Monitor: `https://your-domain.com/api/health`
- Alert if down for > 5 minutes

---

## Rollback Procedures

### Immediate Rollback (Vercel)
```bash
# Revert to previous deployment
vercel rollback
```

### Database Rollback
```bash
# Restore from backup
psql DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Or use Prisma to roll back specific migration
npx prisma migrate resolve --rolled-back "migration_name"
```

### Application Rollback (PM2)
```bash
# If previous version is in Git
git checkout <previous-commit>
npm ci
npm run build
pm2 restart vitechco-hub
```

---

## Troubleshooting

### Issue: Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Database Connection Failed
- Verify `DATABASE_URL` is correct
- Check database server is accessible
- Verify SSL settings (add `?sslmode=require` if needed)

### Issue: OAuth Error
- Verify Google OAuth redirect URIs include production URL
- Check `NEXTAUTH_URL` matches actual domain
- Ensure `NEXTAUTH_SECRET` is set and consistent

### Issue: File Upload Fails
- Verify S3 bucket exists and is accessible
- Check S3 credentials are correct
- Verify CORS settings on S3 bucket

---

## Security Checklist

Before going live:
- [ ] `NEXTAUTH_SECRET` changed from default
- [ ] Database credentials are secure
- [ ] S3/MinIO credentials are secure
- [ ] HTTPS enabled on domain
- [ ] Google OAuth restricted to production domain
- [ ] No sensitive data in Git repository
- [ ] Error messages don't expose internal details
- [ ] Rate limiting considered (if high traffic expected)
- [ ] Backups automated
- [ ] Monitoring active

---

## Support & Maintenance

### Regular Maintenance
- **Weekly**: Check error logs in Sentry
- **Weekly**: Verify backups are running
- **Monthly**: Review security updates (`npm audit`)
- **Monthly**: Check disk space and database size
- **Quarterly**: Update dependencies

### Emergency Contacts
- Database Admin: [contact]
- DevOps Lead: [contact]
- Project Manager: [contact]

---

**Last Updated**: 2026-01-11  
**Version**: 1.0.0  
**Status**: Production Ready
