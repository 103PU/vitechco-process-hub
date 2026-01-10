# Deploy Lên Vercel (FREE) - Hướng Dẫn Từng Bước

## ✅ Tại Sao Chọn Vercel?

**Hoàn Toàn MIỄN PHÍ** cho demo/testing với:
- ✅ Unlimited projects
- ✅ PostgreSQL database (Hobby plan - 256MB free)
- ✅ Tự động HTTPS/SSL
- ✅ Global CDN
- ✅ Deploy trong 2 phút
- ✅ Không cần quản lý server
- ✅ Tự động deploy khi git push

**So Sánh 3 Options**:
| Feature | Vercel | Docker | VPS+PM2 |
|---------|--------|--------|---------|
| **Chi phí** | **FREE** | $5-10/tháng | $5-10/tháng |
| **Độ khó** | **Rất đơn giản** | Trung bình | Khó |
| **Thời gian setup** | **2 phút** | 30 phút | 1 giờ |
| **SSL** | **Tự động** | Phải setup | Phải setup |
| **Database free** | **Có** | Không | Không |
| **Bảo trì** | **Không cần** | Phải tự quản | Phải tự quản |

---

## 📋 Chuẩn Bị (5 phút)

### 1. Tài Khoản Cần Thiết
- [ ] GitHub account (để link source code)
- [ ] Vercel account (đăng ký tại https://vercel.com - dùng GitHub login)
- [ ] Google Cloud Console (cho OAuth)

### 2. Kiểm Tra Code
```bash
# Đảm bảo code pushed lên GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

## 🚀 Bước 1: Setup Database (3 phút)

### 1.1 Tạo Vercel Postgres Database

1. Vào https://vercel.com/dashboard
2. Click **Storage** → **Create Database**
3. Chọn **Postgres**
4. Chọn region gần nhất (Singapore cho Việt Nam)
5. Click **Create**

### 1.2 Lấy Database Connection String

1. Trong database dashboard, click **Settings** → **Connection Strings**
2. Copy **Prisma** connection string (dạng: `postgresql://...`)
3. Lưu lại để dùng ở bước sau

---

## 🚀 Bước 2: Setup Google OAuth (5 phút)

### 2.1 Cập Nhật Redirect URIs

1. Vào https://console.cloud.google.com/apis/credentials
2. Click vào Google OAuth Client ID của bạn
3. Thêm Authorized redirect URIs:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
4. Click **Save**

**LưuTrong ý**: Thay `your-app-name` bằng tên project Vercel của bạn

---

## 🚀 Bước 3: Deploy Lên Vercel (2 phút)

### 3.1 Import Project

1. Vào https://vercel.com/new
2. Click **Import Git Repository**
3. Chọn repository `vitechco-process-hub`
4. Click **Import**

### 3.2 Configure Project

**Framework Preset**: Next.js (tự động detect)

**Root Directory**: `./` (mặc định)

**Build Command**: 
```bash
npm run build
```

**Output Directory**: `.next` (mặc định)

**Install Command**: 
```bash
npm install
```

### 3.3 Add Environment Variables

Click **Environment Variables** và thêm:

```bash
# Database (từ Vercel Postgres ở Bước 1.2)
DATABASE_URL=postgresql://...từ-vercel-postgres...

# NextAuth - CRITICAL: Generate mới!
NEXTAUTH_SECRET=
# Generate bằng lệnh: openssl rand -base64 32
# Hoặc dùng: https://generate-secret.vercel.app/32

NEXTAUTH_URL=https://your-app-name.vercel.app

# Google OAuth (từ Google Cloud Console)
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# Storage - Dùng Vercel Blob (FREE)
# Để trống để dùng local storage tạm thời
S3_ENDPOINT=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
```

**Lưu ý quan trọng**:
- `NEXTAUTH_SECRET`: Phải generate mới, KHÔNG dùng "change-me-in-production"
- `NEXTAUTH_URL`: Phải match với domain Vercel của bạn
- Storage: Có thể setup sau, không blocking cho demo

### 3.4 Deploy

1. Click **Deploy**
2. Đợi ~2 phút
3. Xem build logs để đảm bảo thành công

---

## 🚀 Bước 4: Run Database Migrations (1 phút)

Sau khi deploy thành công:

### Cách 1: Sử dụng Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to project
vercel link

# Run migration
vercel env pull .env.production.local
npx prisma migrate deploy
npx prisma db push
```

### Cách 2: Manual via Prisma Studio

1. Vào Vercel dashboard → Storage → Postgres DB của bạn
2. Click **Query** hoặc **Prisma Studio**
3. Run migrations manually

---

## ✅ Bước 5: Verification (2 phút)

### 5.1 Check Health
```bash
curl https://your-app-name.vercel.app/api/health
```

Kết quả mong đợi:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "...",
  "environment": "production"
}
```

### 5.2 Test Application

1. Vào https://your-app-name.vercel.app
2. Click **Sign in with Google**
3. Login thành công ✅
4. Test search, admin panel, upload

---

## 🎯 Post-Deployment Tasks

### Bắt Buộc (Ngay Sau Deploy)

1. **Set First Admin User**:
   ```bash
   # Vào Vercel Postgres → Query tab
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
   ```

2. **Test RBAC**:
   - Login với admin account
   - Vào `/admin` → tạo department/tag
   - Login với account khác → không thấy admin panel ✅

### Optional (Có Thể Làm Sau)

1. **Setup Vercel Blob Storage** (thay S3):
   ```bash
   vercel blob create vitechco-assets
   # Follow instructions để lấy env vars
   ```

2. **Custom Domain** (nếu có):
   - Vào Vercel dashboard → Settings → Domains
   - Add domain → follow DNS instructions

3. **Monitoring**:
   - Vercel tự động có Analytics (free)
   - Setup Sentry nếu cần error tracking

---

## 🔧 Troubleshooting

### Issue: Build Failed

**Solution**:
```bash
# Local test build
npm run build

# Fix errors locally first
git add .
git commit -m "Fix build errors"
git push
# Vercel auto-redeploys
```

### Issue: Database Connection Error

**Solution**:
1. Check `DATABASE_URL` trong Vercel env vars
2. Đảm bảo có connection pooling:
   ```
   DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=2"
   ```

### Issue: OAuth Error

**Solution**:
1. Check Google OAuth redirect URIs đã thêm đúng domain
2. Verify `NEXTAUTH_URL` match với actual domain
3. Clear cookies và thử lại

### Issue: "Module not found" Error

**Solution**:
```bash
# Ensure all dependencies in package.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

---

## 💡 Vercel Free Tier Limits

**Đủ Cho Demo/Testing**:
- ✅ Bandwidth: 100GB/month
- ✅ Serverless Function Execution: 100 GB-hours
- ✅ Postgres Storage: 256MB (đủ cho ~10,000 documents)
- ✅ Postgres Queries: 60 hours/month
- ✅ Build Time: Unlimited

**Khi Nào Cần Upgrade**:
- Traffic > 100GB/month
- Database > 256MB
- Cần team collaboration

---

## 🎉 Hoàn Thành!

Sau khi hoàn tất các bước trên, bạn có:
- ✅ Application chạy trên HTTPS với domain .vercel.app
- ✅ PostgreSQL database hosted
- ✅ Tự động deploy mỗi khi git push
- ✅ Không tốn một xu nào!

**Next Steps**:
1. Share link với team để test
2. Tạo sample data để demo
3. Monitor performance qua Vercel Analytics

---

## 📞 Support

**Vercel Documentation**: https://vercel.com/docs  
**Vercel Discord**: https://vercel.com/discord  
**Status Page**: https://www.vercel-status.com/

---

**Last Updated**: 2026-01-11  
**Difficulty**: ⭐ (Rất dễ)  
**Time Required**: ~15 phút total  
**Cost**: **$0/month** 🎉
