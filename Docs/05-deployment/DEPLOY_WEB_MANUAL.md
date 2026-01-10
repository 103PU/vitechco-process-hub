# Deploy Vercel 100% Trên Web - KHÔNG Dùng Git Command Line

## 🎯 Hướng Dẫn Này Dành Cho Ai?
- ✅ Không muốn dùng Git command line
- ✅ Muốn làm 100% trên web browser
- ✅ Tránh lỗi Git phức tạp
- ✅ Deploy nhanh trong 10 phút

---

## 📦 BƯỚC 1: Chuẩn Bị File (2 phút)

### 1.1 Tạo File ZIP

1. Mở File Explorer
2. Đi tới thư mục project: `D:\PROCESS MANAGEMENT\vitechco-process-hub`
3. **XÓA các folder này** (quan trọng để giảm kích thước):
   - `node_modules/` (nếu có)
   - `.next/` (nếu có)
   - `.git/` (nếu muốn làm sạch hoàn toàn)

4. **Chọn TẤT CẢ các file còn lại** (Ctrl+A)
5. Click chuột phải → **Send to** → **Compressed (zipped) folder**
6. Đặt tên: `vitechco-process-hub.zip`

### 1.2 Kiểm Tra File ZIP

- Kích thước nên < 50MB (không có node_modules)
- Giải nén thử để chắc chắn có đủ file

---

## 🌐 BƯỚC 2: Upload Lên GitHub (3 phút)

### 2.1 Tạo Repository Mới

1. Mở browser, vào https://github.com
2. Click **Sign in** (hoặc Sign up nếu chưa có account)
3. Sau khi login, click nút **+** góc trên bên phải
4. Chọn **New repository**

### 2.2 Điền Thông Tin Repository

```
Repository name: vitechco-process-hub
Description: VitechCo Process Management Hub - Production Ready
```

**Chọn**:
- ⚪ Public (hoặc Private nếu muốn)
- ☐ KHÔNG tick "Add a README file"
- ☐ KHÔNG tick "Add .gitignore"
- ☐ KHÔNG tick "Choose a license"

**Click nút**: **Create repository**

### 2.3 Upload File ZIP

Sau khi tạo repo, bạn sẽ thấy màn hình trống. **BỎ QUA** các lệnh Git.

1. Scroll xuống, tìm dòng: **"uploading an existing file"**
2. Click vào link **"uploading an existing file"**
3. Hoặc đơn giản click: **"Add file"** → **"Upload files"**

### 2.4 Kéo Thả File

**Option A: Kéo thả (Recommended)**
1. Mở File Explorer, tìm file ZIP vừa tạo
2. Kéo file ZIP vào ô "Drop files here to add them to your repository"

**Option B: Browse**
1. Click **"choose your files"**
2. Chọn file ZIP
3. Click **Open**

### 2.5 Commit Upload

Ở cuối trang:
```
Commit message: Initial commit - Production ready Week 4
```

Click nút xanh: **Commit changes**

**Đợi**: GitHub sẽ upload file (1-2 phút tùy kích thước)

### 2.6 Giải Nén File ZIP Trên GitHub

Sau khi upload xong:

1. Click vào file `vitechco-process-hub.zip` trong repo
2. Click nút **Download** để tải về (hoặc giữ nguyên)

**LƯU Ý QUAN TRỌNG**: 
- GitHub **KHÔNG** tự động giải nén ZIP
- Bạn cần giải nén và upload lại các file riêng lẻ

**Cách Đúng**:
1. Xóa file ZIP khỏi repo: 
   - Click file ZIP → Click icon 🗑️ → Commit deletion
2. Upload lại các file riêng lẻ:
   - Click **Add file** → **Upload files**
   - Giải nén ZIP trên máy
   - Kéo toàn bộ folder đã giải nén vào
   - Commit

---

## ⚡ CÁCH DỄ HƠN: Dùng GitHub Desktop (Recommended)

Nếu upload web quá chậm, dùng GitHub Desktop:

### 2.1 Tải GitHub Desktop
1. Vào https://desktop.github.com/
2. Download và cài đặt
3. Login với GitHub account

### 2.2 Clone Repo Trống
1. Mở GitHub Desktop
2. File → Clone repository
3. Chọn `vitechco-process-hub`
4. Chọn thư mục local để clone

### 2.3 Copy File Vào
1. Mở File Explorer tới thư mục clone
2. Copy toàn bộ file project vào (trừ node_modules, .next, .git)
3. GitHub Desktop sẽ tự detect changes

### 2.4 Commit & Push
1. Trong GitHub Desktop, thấy danh sách files changed
2. Ở góc dưới trái:
   - **Summary**: "Initial commit - Production ready"
   - **Description**: (để trống)
3. Click **Commit to main**
4. Click **Push origin**

**Xong!** File đã lên GitHub.

---

## 🚀 BƯỚC 3: Deploy Lên Vercel (5 phút)

### 3.1 Tạo Tài Khoản Vercel

1. Vào https://vercel.com/signup
2. Click **Continue with GitHub**
3. Authorize Vercel truy cập GitHub
4. Đợi đến màn hình Dashboard

### 3.2 Import Project

1. Trong Vercel Dashboard, click **Add New...** → **Project**
2. Tìm repo `vitechco-process-hub` trong danh sách
3. Click **Import** bên cạnh tên repo

### 3.3 Configure Project

Vercel sẽ tự động detect Next.js. **GIỮ NGUYÊN** tất cả settings:

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**KHÔNG** click Deploy ngay. Click **Environment Variables** ở dưới.

### 3.4 Setup Database (QUAN TRỌNG!)

Trước khi add env vars, tạo database:

1. Mở tab mới: https://vercel.com/dashboard
2. Click **Storage** (menu bên trái)
3. Click **Create Database**
4. Chọn **Postgres**
5. Database Name: `vitechco-db`
6. Region: **Singapore (sin1)** (gần VN nhất)
7. Click **Create**

**Đợi 1-2 phút** database tạo xong.

### 3.5 Lấy Database Connection String

1. Database vừa tạo → Click vào
2. Tab **Settings** → **Connection Strings**
3. Chọn **Prisma**
4. Click **Copy** button
5. Lưu vào Notepad tạm

Connection string sẽ dạng:
```
postgresql://default:xxx@xxx-pooler.postgres.vercel.com:5432/vercel_db?sslmode=require
```

### 3.6 Generate NEXTAUTH_SECRET

**Option 1: Online Tool**
1. Vào https://generate-secret.vercel.app/32
2. Copy secret generated

**Option 2: Manual**
Dùng chuỗi random bất kỳ (32+ ký tự), VD:
```
your-super-secret-key-change-this-in-production-12345678
```

### 3.7 Add Environment Variables

Quay lại tab Import Project, scroll xuống **Environment Variables**:

Click **Add** cho từng biến:

**1. DATABASE_URL**
```
Key: DATABASE_URL
Value: <paste connection string từ Vercel Postgres ở bước 3.5>
```

**2. NEXTAUTH_SECRET**
```
Key: NEXTAUTH_SECRET
Value: <paste secret từ bước 3.6>
```

**3. NEXTAUTH_URL** (TẠM THỜI để localhost)
```
Key: NEXTAUTH_URL
Value: http://localhost:3000
```
*(Sẽ update sau khi deploy xong)*

**4. GOOGLE_CLIENT_ID**
```
Key: GOOGLE_CLIENT_ID
Value: <your-google-client-id>.apps.googleusercontent.com
```
*(Lấy từ Google Cloud Console)*

**5. GOOGLE_CLIENT_SECRET**
```
Key: GOOGLE_CLIENT_SECRET
Value: <your-google-secret>
```

**Storage (Optional - có thể add sau)**:
```
S3_ENDPOINT: (để trống)
S3_ACCESS_KEY_ID: (để trống)
S3_SECRET_ACCESS_KEY: (để trống)
S3_BUCKET: (để trống)
```

### 3.8 Deploy!

1. Sau khi add xong env vars
2. Click nút xanh to: **Deploy**
3. Đợi 2-5 phút
4. Xem build logs để chắc không lỗi

---

## ✅ BƯỚC 4: Update NEXTAUTH_URL (2 phút)

Sau khi deploy thành công:

### 4.1 Lấy Domain Vercel

Bạn sẽ thấy:
```
🎉 Congratulations!
Your project is live at: https://vitechco-process-hub-xxx.vercel.app
```

Copy URL này.

### 4.2 Update Environment Variable

1. Vào Vercel dashboard → Project vừa deploy
2. **Settings** tab
3. **Environment Variables**
4. Tìm `NEXTAUTH_URL`
5. Click **Edit**
6. Thay đổi value thành:
   ```
   https://vitechco-process-hub-xxx.vercel.app
   ```
   *(dùng URL thật của bạn)*
7. Click **Save**

### 4.3 Redeploy

1. Vào tab **Deployments**
2. Click **...** (three dots) ở deployment mới nhất
3. Click **Redeploy**
4. Confirm **Redeploy**

---

## 🔐 BƯỚC 5: Update Google OAuth (2 phút)

### 5.1 Add Redirect URI

1. Vào https://console.cloud.google.com/apis/credentials
2. Click vào OAuth 2.0 Client ID của bạn
3. Trong **Authorized redirect URIs**, click **+ ADD URI**
4. Thêm:
   ```
   https://vitechco-process-hub-xxx.vercel.app/api/auth/callback/google
   ```
   *(thay xxx bằng domain thật)*
5. Click **SAVE**

---

## 🗄️ BƯỚC 6: Setup Database Schema (2 phút)

### 6.1 Run Migrations Trên Vercel

**Option 1: Qua Prisma Studio Online**
1. Vercel Dashboard → Storage → Postgres database
2. Click **Data** tab
3. Sẽ thấy Prisma Studio interface
4. Database đang trống

**Option 2: Dùng Vercel CLI (nếu không sợ CLI)**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production.local
npx prisma migrate deploy
```

**Option 3: Manual SQL (Không khuyến khích)**
- Có thể copy schema từ `prisma/schema.prisma`
- Chạy create table statements manually

### 6.2 Tạo Admin User

Sau khi có tables:

1. Vào app: https://your-app.vercel.app
2. Click **Sign in with Google**
3. Login lần đầu (user sẽ tạo với role TECHNICIAN)
4. Quay lại Vercel Postgres → Data tab
5. Tìm bảng `User`
6. Edit user vừa tạo
7. Đổi `role` từ `TECHNICIAN` → `ADMIN`
8. Save

---

## ✅ BƯỚC 7: Kiểm Tra (1 phút)

### 7.1 Test Health Check
```
https://your-app.vercel.app/api/health
```

Kết quả mong đợi:
```json
{
  "status": "healthy",
  "database": "connected",
  ...
}
```

### 7.2 Test Login
1. Vào homepage
2. Click Sign in
3. Login Google thành công ✅

### 7.3 Test Admin Panel
1. Vào `/admin`
2. Thấy admin dashboard ✅
3. Tạo department/tag thử

---

## 🎉 HOÀN THÀNH!

Bạn đã có:
- ✅ Code trên GitHub
- ✅ App live trên Vercel (HTTPS)
- ✅ PostgreSQL database
- ✅ Google OAuth hoạt động
- ✅ Admin account

**URL của bạn**: https://vitechco-process-hub-xxx.vercel.app

---

## 🔥 Troubleshooting

### Lỗi: Build Failed
1. Check build logs trong Vercel
2. Thường do thiếu dependencies
3. Thử redeploy

### Lỗi: Database Connection
1. Check DATABASE_URL đúng format
2. Ensure database đã tạo trên Vercel
3. Check connection pooling trong connection string

### Lỗi: OAuth Redirect
1. Check NEXTAUTH_URL match với actual domain
2. Check Google OAuth redirect URIs đã add đúng
3. Clear cookies và thử lại

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org

---

**Last Updated**: 2026-01-11  
**Method**: 100% Web Interface - No Git CLI  
**Difficulty**: ⭐⭐ (Dễ)  
**Time**: ~15 phút
