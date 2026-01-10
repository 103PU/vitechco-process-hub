# Checklist Deploy Vercel - 100% Trên Web

## ☑️ Trước Khi Bắt Đầu
- [ ] Đã đóng tất cả terminal/cmd (không dùng Git CLI)
- [ ] Có tài khoản GitHub (https://github.com)
- [ ] Có Google Cloud Console credentials
- [ ] Đã chuẩn bị file project

---

## 📦 BƯỚC 1: Chuẩn Bị File
- [ ] Mở thư mục project: `D:\PROCESS MANAGEMENT\vitechco-process-hub`
- [ ] **XÓA** folder: `node_modules/`, `.next/`, `.git/` (nếu có)
- [ ] Chọn tất cả file còn lại (Ctrl+A)
- [ ] Tạo ZIP: Click chuột phải → Send to → Compressed folder
- [ ] Đặt tên: `vitechco-process-hub.zip`
- [ ] Check size < 50MB

---

## 🌐 BƯỚC 2: Upload GitHub
- [ ] Vào https://github.com → Sign in
- [ ] Click **+** → **New repository**
- [ ] Tên: `vitechco-process-hub`
- [ ] Public/Private (chọn 1)
- [ ] **KHÔNG** tick bất kỳ checkbox nào
- [ ] Click **Create repository**
- [ ] Click **Add file** → **Upload files**
- [ ] **Giải nén ZIP trước**, rồi kéo thả TOÀN BỘ files vào
- [ ] Commit message: "Initial commit - Production ready"
- [ ] Click **Commit changes**
- [ ] Đợi upload xong (2-5 phút)

---

## 🗄️ BƯỚC 3: Tạo Database Vercel
- [ ] Vào https://vercel.com/signup → Login với GitHub
- [ ] Dashboard → **Storage** → **Create Database**
- [ ] Chọn **Postgres**
- [ ] Name: `vitechco-db`
- [ ] Region: **Singapore**
- [ ] Click **Create**
- [ ] Đợi database tạo xong
- [ ] Click database → **Settings** → **Connection Strings**
- [ ] Chọn **Prisma** → Click **Copy**
- [ ] PASTE vào Notepad để lưu tạm

---

## 🔐 BƯỚC 4: Chuẩn Bị Secrets
- [ ] Vào https://generate-secret.vercel.app/32
- [ ] Copy secret → Paste vào Notepad
- [ ] Note: Đây là NEXTAUTH_SECRET

---

## 🚀 BƯỚC 5: Deploy Vercel
- [ ] Vercel Dashboard → **Add New** → **Project**
- [ ] Tìm repo `vitechco-process-hub`
- [ ] Click **Import**
- [ ] Framework: Next.js (auto-detect)
- [ ] **KHÔNG** click Deploy ngay!
- [ ] Scroll xuống → Click **Environment Variables**

### Add từng biến:
- [ ] `DATABASE_URL` = (paste từ Bước 3)
- [ ] `NEXTAUTH_SECRET` = (paste từ Bước 4)
- [ ] `NEXTAUTH_URL` = `http://localhost:3000` (tạm thời)
- [ ] `GOOGLE_CLIENT_ID` = (từ Google Console)
- [ ] `GOOGLE_CLIENT_SECRET` = (từ Google Console)

- [ ] Click nút **Deploy** (to lớn, màu xanh)
- [ ] Đợi 3-5 phút
- [ ] Xem build logs, chờ thông báo success
- [ ] Copy URL: `https://vitechco-process-hub-xxx.vercel.app`

---

## 🔄 BƯỚC 6: Update NEXTAUTH_URL
- [ ] Vercel Project → **Settings** → **Environment Variables**
- [ ] Tìm `NEXTAUTH_URL` → Click **Edit**
- [ ] Đổi thành: `https://vitechco-process-hub-xxx.vercel.app` (URL thật)
- [ ] Click **Save**
- [ ] Tab **Deployments** → Click **...** → **Redeploy**

---

## 🔐 BƯỚC 7: Update Google OAuth
- [ ] Vào https://console.cloud.google.com/apis/credentials
- [ ] Click vào OAuth Client ID
- [ ] **Authorized redirect URIs** → **+ ADD URI**
- [ ] Add: `https://vitechco-process-hub-xxx.vercel.app/api/auth/callback/google`
- [ ] Click **SAVE**

---

## 👤 BƯỚC 8: Tạo Admin User
- [ ] Vào app: https://vitechco-process-hub-xxx.vercel.app
- [ ] Click **Sign in with Google**
- [ ] Login lần đầu
- [ ] Quay lại Vercel → Storage → Postgres → **Data**
- [ ] Bảng `User` → Tìm user vừa tạo
- [ ] Edit → Đổi `role` = `ADMIN`
- [ ] Save

---

## ✅ BƯỚC 9: Kiểm Tra

### Health Check
- [ ] Vào: `https://your-app.vercel.app/api/health`
- [ ] Thấy `"status": "healthy"`

### Login Test
- [ ] Vào homepage
- [ ] Click Sign in → Login Google OK ✅

### Admin Test
- [ ] Vào `/admin`
- [ ] Thấy dashboard ✅
- [ ] Tạo department thử

---

## 🎉 HOÀN TẤT!

App đã live tại: ______________________________

**Chia sẻ link này để team test!**

---

**Ngày hoàn thành**: __________  
**Thời gian**: _____ phút  
**Issues gặp phải**: ___________________________

---

## 📝 Notes

Ghi chú vấn đề hoặc câu hỏi:
