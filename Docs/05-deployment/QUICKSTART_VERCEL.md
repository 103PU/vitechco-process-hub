# Quick Start: Deploy Vercel (5 Phút)

## ⚡ Để deploy ngay lập tức:

### 1. Push Code Lên GitHub (30 giây)
```bash
git add .
git commit -m "Production ready - Week 4 complete"
git push origin main
```

### 2. Deploy Trên Vercel (2 phút)
1. Vào https://vercel.com/new
2. Import từ GitHub
3. Chọn repo `vitechco-process-hub`
4. Click **Deploy**

### 3. Add Environment Variables (2 phút)
Trong Vercel dashboard, add:
```bash
DATABASE_URL=<from-vercel-postgres>
NEXTAUTH_SECRET=<generate-new>
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
```

### 4. Redeploy
Click **Redeploy** sau khi add env vars

### ✅ Done!
App của bạn đã live tại: `https://your-app.vercel.app`

---

## 📚 Chi Tiết Đầy Đủ
Xem: `VERCEL_FREE_DEPLOYMENT.md`
