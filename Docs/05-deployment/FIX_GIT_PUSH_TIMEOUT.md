# Fix Git Push Timeout (HTTP 408)

## Lỗi Gặp Phải
```
error: RPC failed; HTTP 408 curl 22 The requested URL returned error: 408
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
```

## ✅ Giải Pháp Đã Thử

### 1. Tăng Buffer Size (RECOMMENDED)
```bash
# Tăng buffer lên 500MB
git config http.postBuffer 524288000
git config --global http.postBuffer 524288000

# Tắt timeout
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### 2. Thử Push Lại
```bash
git push -u origin master
```

---

## 🔧 Nếu Vẫn Lỗi - Các Giải Pháp Khác

### Giải Pháp 1: Push Theo Batch (Nếu File Lớn)
```bash
# Push từng 100MB một lần
git config --global http.postBuffer 104857600

# Push với depth limit
git push -u origin master --depth 1
```

### Giải Pháp 2: Dùng SSH Thay HTTP
```bash
# Check remote URL hiện tại
git remote -v

# Nếu dùng HTTPS, đổi sang SSH
git remote set-url origin git@github.com:username/vitechco-process-hub.git

# Push lại
git push -u origin master
```

### Giải Pháp 3: Đổi Branch Name (nếu push master)
```bash
# GitHub mặc định dùng 'main' thay vì 'master'
git branch -M main
git push -u origin main
```

### Giải Pháp 4: Check .gitignore (Loại File Lớn)
```bash
# Check file size trước khi commit
git ls-files -v | grep -v "^H"

# Bỏ file lớn khỏi tracking (nếu cần)
echo "*.large" >> .gitignore
git rm --cached large-file.ext
git commit -m "Remove large files"
git push -u origin master
```

### Giải Pháp 5: Compression
```bash
# Enable compression
git config --global core.compression 9
git push -u origin master
```

---

## 🎯 Deploy Trực Tiếp Vercel (Không Cần GitHub)

Nếu Git push vẫn fail, bạn có thể deploy trực tiếp:

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy từ local
vercel

# Follow prompts để setup
```

### Option 2: Deploy Từ Local ZIP
1. Zip toàn bộ project (trừ node_modules, .next)
2. Upload lên GitHub qua web interface
3. Import vào Vercel

---

## 📊 Debug Information

### Check Git Status
```bash
git status
```

### Check File Sizes
```bash
# Find large files
find . -type f -size +50M
```

### Check Remote
```bash
git remote -v
```

### Check Git Config
```bash
git config --list | grep -i http
```

---

## ✅ Recommended Order

1. **Thử lại sau khi config buffer** (đã làm ở trên)
2. Nếu fail → **Đổi sang SSH**
3. Nếu fail → **Check branch name** (main vs master)
4. Nếu fail → **Dùng Vercel CLI deploy trực tiếp**

---

## 💡 Prevention

Để tránh lỗi này trong tương lai:

```bash
# Add vào .gitignore
echo "node_modules/" >> .gitignore
echo ".next/" >> .gitignore
echo "*.log" >> .gitignore
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Commit
git add .gitignore
git commit -m "Update gitignore"
```

---

**Last Updated**: 2026-01-11
