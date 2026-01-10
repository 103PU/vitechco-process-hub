# DATA CLASSIFICATION LOGIC SPECIFICATION (V2)
**Version:** 2.0
**Focus:** Strict Validation, Junk Filtering, Multi-Model Expansion
**Status:** REQUIRED

## 1. BRAND (THƯƠNG HIỆU)

### 🚨 Vấn đề hiện tại (Problem)
Hệ thống quá "ngây thơ" (Permissive). Nó coi bất kỳ tên thư mục nào không khớp Regex đều là tên Hãng.
- *Input:* "TEST MÁY RICOH A4 OFFICE"
- *Current Logic:* Không khớp regex model -> Lấy nguyên cụm làm Brand.
- *Result:* Brand = "TEST MÁY RICOH A4 OFFICE" (SAI).

### ✅ Logic Mới (New Strict Logic)
**Nguyên tắc cốt lõi:** "Brand không được sinh ra từ hư vô. Nó phải thuộc về một tập hợp đã biết."

1.  **Whitelist Strategy (Danh sách tin cậy):**
    Hệ thống chỉ chấp nhận các giá trị Brand nằm trong danh sách sau (Case-insensitive):
    - `RICOH`
    - `TOSHIBA`
    - `CANON`
    - `SHARP`
    - `HP`
    - `KONICA MINOLTA` (bao gồm cả `KONICA`, `MINOLTA`)
    - `KYOCERA`
    - `XEROX` (bao gồm `FUJI XEROX`)
    - `BROTHER`
    - `SAMSUNG`
    - `EPSON`
    - `PANASONIC`
    - `LEXMARK`
    - `OKI`

2.  **Extraction & Sanitization (Bóc tách & Làm sạch):**
    - **Input:** "TEST MÁY RICOH A4 OFFICE"
    - **Process:** Quét chuỗi input. Tìm xem có từ khóa nào trong *Whitelist* xuất hiện không.
    - **Match:** Tìm thấy "RICOH".
    - **Output:** `Ricoh`. (Bỏ qua hoàn toàn các từ "TEST", "MÁY", "OFFICE").

3.  **Fallback (Dự phòng):**
    - Nếu KHÔNG tìm thấy Brand nào trong Whitelist:
        - **Tuyệt đối KHÔNG** lấy nguyên chuỗi input.
        - Trả về: `null` (hoặc "Unknown").
        - Ghi log: "Potential new brand or junk folder detected: [Input String]".

---

## 2. MACHINE MODELS (MẪU MÁY)

### 🚨 Vấn đề hiện tại (Problem)
Hệ thống không hiểu cú pháp liệt kê hoặc dải số (Range) phức tạp.
- *Input:* "MPC 6503-8003- Pro C5200S-C5210S"
- *Current Logic:* Chỉ bắt được cụm đầu tiên hoặc trả về nguyên chuỗi.
- *Result:* "MPC 6503" (Thiếu 3 máy còn lại).

### ✅ Logic Mới (New Expansion Logic)

1.  **AI Prompt Engineering (Cải tiến não bộ AI):**
    Cung cấp cho AI khả năng hiểu ngữ cảnh "Danh sách" và "Dải số".
    - *Instruction:* "Detect multiple models. Split ranges (3000-4000) and lists (3000/4000) into individual full model names using the nearest series prefix."
    - *Input:* "MPC 6503-8003- Pro C5200S-C5210S"
    - *AI Output Expectation:* `["MPC 6503", "MPC 8003", "Pro C5200S", "Pro C5210S"]`

2.  **Regex Hybrid Logic (Logic Regex nâng cao):**
    Nếu AI thất bại, Regex phải xử lý được các pattern phổ biến:
    - **Pattern:** `(Prefix) (Number1)[-/](Number2)`
    - *Example:* "MPC 3054-3554"
    - *Logic:* 
        1. Capture Prefix: `MPC`
        2. Capture Numbers: `3054`, `3554`
        3. Combine: `MPC 3054`, `MPC 3554`

---

## 3. IMPLEMENTATION PLAN

1.  **Update `src/lib/ai-classification.ts`:**
    - Thay đổi Prompt để trả về `models: string[]` thay vì `model: string`.
    - Thêm examples khó vào Prompt để "dạy" (Few-shot prompting).

2.  **Update `src/lib/classification.ts`:**
    - Cấu hình hằng số `KNOWN_BRANDS`.
    - Viết lại hàm `extractMetadataFromName`: Thay vì `includes` đơn giản, phải loop qua Whitelist.
    - Viết logic `Clean Input`: Loại bỏ các từ `TEST`, `COPY`, `MAY`, `PRINTER`.

3.  **Update `import-service.ts`:**
    - Xử lý mảng `models` trả về để tạo nhiều bản ghi liên kết (`DocumentOnMachineModel`).
