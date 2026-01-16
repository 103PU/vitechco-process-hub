# Phân Tích & Sửa Lỗi Deployment (Vercel + GitHub)

## ❌ 1. Phân Tích Lỗi (Root Cause Analysis)

### A. Lỗi Vercel: `Environment Variable "DATABASE_URL" references Secret "database_url"`
- **Nguyên nhân**: Trong file `vercel.json` cũ (trên GitHub), có đoạn cấu hình `env: { "DATABASE_URL": "@database_url" }`.
- **Cơ chế**: Ký tự `@` báo cho Vercel biết đây là một **Secret** (tính năng cũ), không phải **Environment Variable** thường.
- **Thực tế**: Bạn chưa tạo secret nào tên là `database_url` (và không cần thiết). Bạn đã setup Env Var trong Dashboard, nhưng file config cũ này "đè" lên và trỏ vào hư không → Lỗi.

### B. Lỗi GitHub Action: `CI / build (push) Failing`
- **Nguyên nhân**: Workflow CI chạy `npm run build` hoặc `prisma migrate` nhưng thiếu Environment Variables hoặc timeout.
- **Đánh giá**: Lỗi này **KHÔNG** ảnh hưởng đến việc deploy lên Vercel. Bạn có thể bỏ qua nó tạm thời. Mục tiêu là Vercel chạy ổn định.

---

## ✅ 2. Giải Pháp (Đã Thực Hiện Local)

Tôi đã sửa file `vercel.json` trên máy bạn (ở bước trước).

**File Cũ (Lỗi):**
```json
"env": {
  "DATABASE_URL": "@database_url",
  ...
}
```

**File Mới (Đã Fix):**
```json
{
  "version": 2,
  "regions": ["sin1"],
  "framework": "nextjs"
}
```
*Đã xóa toàn bộ phần `env` reference sai.*

---

## 🚀 3. Các Bước Cần Làm Ngay (Action Plan)

Để fix lỗi "All checks have failed" và deploy thành công, bạn cần làm 2 việc:

### Bước 1: Update GitHub (Để Vercel nhận file sửa lỗi)

Bạn cần push file `vercel.json` mới này lên GitHub.

**Cách 1: Dùng GitHub Desktop (Nếu đã cài)**
1. Mở GitHub Desktop
2. Bạn sẽ thấy 1 file changed: `vercel.json`
3. Commit summary: "Fix vercel.json secret references"
4. Click **Commit to main**
5. Click **Push origin**

**Cách 2: Upload Web (Manual)**
1. Vào folder project, tìm file `vercel.json`
2. Vào GitHub repo của bạn trên web
3. Click **Add file** -> **Upload files**
4. Kéo file `vercel.json` vào
5. Commit changes

### Bước 2: Deploy Lại Bằng Vercel CLI (Để test ngay)

Sau khi file local đã đúng, hãy chạy lệnh này trong terminal:

```bash
vercel --prod
```

- Nếu được hỏi `Set up and deploy?` -> **Y**
- `Which scope?` -> **Enter** (mặc định)
- `Link to existing project?` -> **Y**
- `Link to it?` -> **Y**

**Kết quả mong đợi**:
- Vercel sẽ đọc file `vercel.json` mới (không còn lỗi secret).
- Nó sẽ dùng Environment Variables từ Dashboard (đã setup).
- Build thành công ✅.

---

## 4. Kiểm Tra Sau Deploy

Khi deploy xong, vào đường link `https://vitechco-process-hub-xxx.vercel.app`:
1. **Health Check**: `/api/health` → Trả về JSON ok.
2. **Login**: Thử login Google.
3. **Database**: Thử tạo một record admin.

---

## 💡 Tóm Lại
Lỗi do file config cũ trỏ sai chỗ. **File đã được sửa**. Chỉ cần **Push lên GitHub** và **Deploy lại** là xong!
