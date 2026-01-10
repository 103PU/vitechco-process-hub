# Giảm Kích Thước Project Xuống <50MB

## ❌ Vấn Đề: Project 487MB

Quá lớn để upload web! Cần giảm xuống <50MB.

---

## ✂️ BƯỚC 1: XÓA CÁC FOLDER KHÔNG CẦN (Quan Trọng!)

Mở File Explorer → `D:\PROCESS MANAGEMENT\vitechco-process-hub`

### Xóa NGAY các folder này:

**1. node_modules/** 
- Kích thước: ~200-400MB
- ❌ PHẢI XÓA
- Lý do: Sẽ tự động install lại khi deploy

**2. .next/**
- Kích thước: ~50-100MB  
- ❌ PHẢI XÓA
- Lý do: Build output, sẽ build lại khi deploy

**3. .git/**
- Kích thước: ~10-50MB
- ❌ NÊN XÓA (nếu upload web)
- Lý do: GitHub sẽ tạo Git history mới

**4. coverage/** (nếu có)
- Kích thước: ~5-20MB
- ❌ XÓA
- Lý do: Test coverage reports không cần

**5. .vercel/** (nếu có)
- ❌ XÓA
- Lý do: Cache của Vercel

**6. playwright-report/** (nếu có)
- ❌ XÓA
- Lý do: Test reports

**7. test-results/** (nếu có)
- ❌ XÓA

**8. dist/** hoặc **out/** (nếu có)
- ❌ XÓA
- Lý do: Build output

---

## 📝 BƯỚC 2: Tạo File .gitignore (Để GitHub Biết Bỏ Qua)

Tạo file mới tên `.gitignore` trong thư mục root:

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
.next/
out/
dist/
build/

# Testing
coverage/
.nyc_output/
playwright-report/
test-results/

# Vercel
.vercel/

# Environment variables
.env
.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.cache/
temp/
tmp/
```

**Cách tạo .gitignore**:
1. Notepad → File → Save As
2. File name: `.gitignore` (có dấu chấm đầu)
3. Save as type: **All Files**
4. Encoding: UTF-8
5. Save vào folder root project

---

## 📊 BƯỚC 3: Kiểm Tra Các File Lớn

### Tìm file >5MB:

1. Mở Command Prompt (hoặc PowerShell)
2. Chạy:
```powershell
cd "d:\PROCESS MANAGEMENT\vitechco-process-hub"
dir /s /o-s | findstr /R "^[0-9].*[0-9],[0-9][0-9][0-9],[0-9][0-9][0-9]"
```

### Các file thường lớn không cần:

- `*.mp4`, `*.avi` → Video demos (xóa hoặc để link online)
- `*.zip`, `*.rar` → Archives (xóa)
- `*.sqlite` lớn → Database development (có thể xóa)
- `*.log` files → Xóa
- PDF lớn trong `/public` → Xóa hoặc upload cloud

---

## ✅ BƯỚC 4: Tạo ZIP Sau Khi Clean

Sau khi xóa các folder trên:

1. **Refresh** File Explorer (F5)
2. Chọn tất cả file còn lại (Ctrl+A)
3. Chuột phải → Send to → Compressed folder
4. Đặt tên: `vitechco-process-hub-clean.zip`

**Kiểm tra**:
- File ZIP nên ~ **10-30MB**
- Không có `node_modules/`
- Không có `.next/`

---

## 🔍 BƯỚC 5: Verify Nội Dung ZIP

Giải nén ZIP thử để kiểm tra:

**Phải có**:
- ✅ `src/` folder
- ✅ `public/` folder
- ✅ `prisma/` folder
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `tsconfig.json`
- ✅ `.gitignore` (mới tạo)
- ✅ `Docs/` folder

**KHÔNG được có**:
- ❌ `node_modules/`
- ❌ `.next/`
- ❌ `.git/`
- ❌ Coverage reports
- ❌ Test artifacts

---

## 📦 Kích Thước Mong Đợi

| Component    | Size           |
| ------------ | -------------- |
| `src/`       | ~5-10MB        |
| `public/`    | ~1-5MB         |
| `prisma/`    | ~1MB           |
| `Docs/`      | ~1-2MB         |
| Config files | <1MB           |
| **TOTAL**    | **~10-20MB** ✅ |

---

## ⚡ Nếu Vẫn >50MB

### Option 1: Upload Qua GitHub Desktop (Recommended)

Thay vì ZIP, dùng GitHub Desktop:

1. Download: https://desktop.github.com/
2. Install và login
3. File → Add Local Repository
4. Select folder project (đã clean)
5. Publish repository
6. GitHub Desktop tự động ignore theo .gitignore!

### Option 2: Chia Nhỏ Upload

Nếu bắt buộc dùng web:

1. Upload từng folder một:
   - Upload `src/` folder
   - Upload `public/` folder  
   - Upload `prisma/` folder
   - Upload files config (package.json, etc.)

---

## 🛑 Files NÊN XÓA Trước Khi Upload

```
✂️ Checklist Xóa:
☐ node_modules/
☐ .next/
☐ .git/
☐ coverage/
☐ .vercel/
☐ playwright-report/
☐ test-results/
☐ *.log files
☐ .env (giữ .env.example)
☐ Large media files
☐ Database dumps (*.sql, *.sqlite nếu lớn)
```

---

## 💡 Pro Tip

**Tạo Script Để Clean Nhanh**:

Tạo file `cleanup.bat`:
```batch
@echo off
echo Cleaning project...
rmdir /s /q node_modules
rmdir /s /q .next
rmdir /s /q .git
rmdir /s /q coverage
rmdir /s /q .vercel
del /q *.log
echo Done! Safe to ZIP now.
pause
```

Double-click để chạy → Project clean ngay!

---

**Last Updated**: 2026-01-11  
**Target Size**: <50MB (đạt ~10-20MB sau clean)
