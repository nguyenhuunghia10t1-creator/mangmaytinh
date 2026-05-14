# API Spec

Base URL: `/api/v1`

Database chính: SQL Server qua Prisma. API contract không phụ thuộc máy đang code có cài SQL Server hay chưa.

Response API thống nhất:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

## Auth

### POST `/auth/login`

Đăng nhập, trả JWT.

Request body (JSON):

```json
{
  "username": "admin",
  "password": "123456"
}
```

Validation:
- Thiếu `username` hoặc `password` → 400, `{ success: false, message: "username and password are required" }`.
- Không tìm thấy user hoặc sai password → 401, `{ success: false, message: "Invalid username or password" }`.

Response 200:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": 1,
      "fullName": "Administrator",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

Không bao giờ trả `passwordHash`.

Token được ký bằng `JWT_SECRET` (đọc từ env), thời hạn theo `JWT_EXPIRES_IN` (mặc định `7d`). Payload gồm `{ id, username, role }`.

### GET `/auth/me`

Trả thông tin user hiện tại từ token. Yêu cầu header:

```
Authorization: Bearer <token>
```

- Thiếu/sai/hết hạn token → 401.
- OK → 200, `data.user = { id, fullName, username, role }`.

### Auth middleware (cho các route bảo vệ sau)

Áp dụng `authMiddleware` cho các route cần đăng nhập. Yêu cầu header `Authorization: Bearer <token>`. Khi hợp lệ, gắn `req.user = { id, username, role }`.

Có thể kết hợp `requireRole('admin')` để chặn theo role.

## Materials

Tất cả route dưới `/materials` đều **yêu cầu đăng nhập** (`Authorization: Bearer <token>`). Thiếu/sai/hết hạn → 401.

Mỗi `material` trả về có kèm `category: { id, name }` và `supplier: { id, name }`.

### GET `/materials`

Query parameters:
- `q` *(optional)* — substring match `name` hoặc `description`.
- `categoryId` *(optional)* — filter theo category. Không phải số nguyên dương → 400 `{ message: "Invalid categoryId" }`.
- `supplierId` *(optional)* — filter theo supplier. Không phải số nguyên dương → 400 `{ message: "Invalid supplierId" }`.

Sort: theo `id` tăng dần.

Response 200:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "materials": [
      {
        "id": 1,
        "name": "Gỗ MDF",
        "categoryId": 1,
        "supplierId": 1,
        "quantity": 10,
        "unit": "tấm",
        "importPrice": "100000",
        "sellPrice": "120000",
        "description": "...",
        "imageUrl": "https://...",
        "createdAt": "2026-05-14T03:00:00.000Z",
        "updatedAt": "2026-05-14T03:00:00.000Z",
        "category": { "id": 1, "name": "Gỗ" },
        "supplier": { "id": 1, "name": "Nhà cung cấp A" }
      }
    ]
  }
}
```

> Lưu ý: `importPrice`/`sellPrice` là `Decimal(18,2)` — Prisma serialize thành chuỗi để giữ độ chính xác.

### GET `/materials/:id`

- `:id` phải là số nguyên dương → 400 `{ message: "Invalid material id" }`.
- Không tìm thấy → 404 `{ message: "Material not found" }`.

Response 200: `{ "data": { "material": {...} } }`.

### POST `/materials`

Request body:

```json
{
  "name": "Gỗ MDF",
  "categoryId": 1,
  "supplierId": 1,
  "quantity": 10,
  "unit": "tấm",
  "importPrice": 100000,
  "sellPrice": 120000,
  "description": "...",
  "imageUrl": "https://example.com/image.jpg"
}
```

Validation (kiểm tra theo thứ tự, dừng ở lỗi đầu tiên):
- `name` bắt buộc, non-empty sau trim → 400 `{ message: "name is required" }`.
- `categoryId` bắt buộc, số nguyên dương → 400 `{ message: "categoryId is required and must be a positive integer" }`.
- `supplierId` bắt buộc, số nguyên dương → 400 tương tự.
- `unit` bắt buộc, non-empty sau trim → 400 `{ message: "unit is required" }`.
- `quantity` *(optional)* — số nguyên `>= 0` → 400 `{ message: "quantity must be a non-negative integer" }`. Không gửi → Prisma dùng default `0` từ schema.
- `importPrice` *(optional)* — số `>= 0` → 400 `{ message: "importPrice must be a non-negative number" }`. Không gửi → default `0`.
- `sellPrice` *(optional)* — số `>= 0` → 400 tương tự. Không gửi → default `0`.
- `description` *(optional)* — string hoặc `null`. Rỗng sau trim → lưu `null`. Sai type → 400 `{ message: "description must be a string or null" }`.
- `imageUrl` *(optional)* — string hoặc `null`. Rỗng sau trim → lưu `null`. Nếu non-empty, phải là URL hợp lệ với protocol `http:` hoặc `https:` (kiểm bằng `new URL(...)`) → 400 `{ message: "Invalid imageUrl" }`.
- `categoryId` không tồn tại trong DB → 400 `{ message: "categoryId does not exist" }`. (Dùng 400 vì client gửi tham chiếu sai; phân biệt với 404 dành cho material id không tồn tại.)
- `supplierId` không tồn tại → 400 `{ message: "supplierId does not exist" }`.
- Nếu Prisma vẫn ném `P2003` (race condition giữa pre-check và insert) → 409 `{ message: "Invalid categoryId or supplierId" }`.

Response 201: `{ "data": { "material": {...} } }`.

### PUT `/materials/:id`

Partial update. Chỉ gửi field cần đổi.

Validation:
- `:id` số nguyên dương → 400.
- Mỗi field gửi lên phải qua đúng rule của POST tương ứng (không có "required" vì là partial; chỉ validate khi có gửi):
  - `name` non-empty → 400 `{ message: "name must be a non-empty string" }`.
  - `categoryId` số nguyên dương → 400 `{ message: "categoryId must be a positive integer" }`. Phải tồn tại → 400 `{ message: "categoryId does not exist" }`.
  - `supplierId` số nguyên dương + tồn tại → tương tự.
  - `quantity` số nguyên `>= 0` → 400.
  - `unit` non-empty → 400 `{ message: "unit must be a non-empty string" }`.
  - `importPrice`/`sellPrice` số `>= 0` → 400.
  - `description`/`imageUrl` string hoặc `null`. `imageUrl` non-empty phải hợp lệ → 400.
- Body không có field hợp lệ nào → 400 `{ message: "No updatable fields provided" }`.
- `P2025` (material không tồn tại) → 404 `{ message: "Material not found" }`.
- `P2003` (FK lỗi do race) → 409 `{ message: "Invalid categoryId or supplierId" }`.

Response 200: `{ "data": { "material": {...} } }`.

### DELETE `/materials/:id`

- `:id` số nguyên dương → 400.
- `P2025` → 404 `{ message: "Material not found" }`.

Response 200:

```json
{
  "success": true,
  "message": "Material deleted",
  "data": {}
}
```

## Categories

Tất cả route dưới `/categories` đều **yêu cầu đăng nhập** (header `Authorization: Bearer <token>`). Thiếu/sai/hết hạn token → 401.

### GET `/categories`

Query parameters:
- `q` *(optional)* — tìm theo `name` hoặc `description` (substring, không phân biệt vị trí).

Sort: theo `id` tăng dần.

Response 200:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Gỗ",
        "description": "Vật liệu gỗ",
        "createdAt": "2026-05-14T03:00:00.000Z",
        "updatedAt": "2026-05-14T03:00:00.000Z"
      }
    ]
  }
}
```

### GET `/categories/:id`

- `:id` phải là số nguyên dương → nếu sai format trả 400 `{ message: "Invalid category id" }`.
- Không tìm thấy → 404 `{ message: "Category not found" }`.

Response 200:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "category": { "id": 1, "name": "Gỗ", "description": "...", "createdAt": "...", "updatedAt": "..." }
  }
}
```

### POST `/categories`

Request body:

```json
{
  "name": "Gỗ",
  "description": "Vật liệu gỗ tự nhiên"
}
```

Validation:
- `name` bắt buộc, không được rỗng/toàn khoảng trắng. Server sẽ `trim()` trước khi lưu. Thiếu/rỗng → 400 `{ message: "name is required" }`.
- `description` optional. Nếu là chuỗi rỗng sau khi trim, lưu thành `null`.
- Trùng `name` (unique constraint) → 409 `{ message: "Category name already exists" }`.

Response 201:

```json
{
  "success": true,
  "message": "Category created",
  "data": {
    "category": { "id": 1, "name": "Gỗ", "description": "...", "createdAt": "...", "updatedAt": "..." }
  }
}
```

### PUT `/categories/:id`

Partial update. Chỉ gửi field cần đổi.

Validation:
- `:id` phải là số nguyên dương → 400 nếu sai.
- Nếu gửi `name`: phải là chuỗi non-empty sau trim → 400 `{ message: "name must be a non-empty string" }`.
- Nếu gửi `description`: chấp nhận chuỗi hoặc `null`. Chuỗi rỗng sau trim được lưu thành `null`.
- Body không có field nào hợp lệ → 400 `{ message: "No updatable fields provided" }`.
- Không tìm thấy id (Prisma `P2025`) → 404 `{ message: "Category not found" }`.
- Đổi name trùng category khác → 409 `{ message: "Category name already exists" }`.

Response 200:

```json
{
  "success": true,
  "message": "Category updated",
  "data": {
    "category": { "id": 1, "name": "Gỗ công nghiệp", "description": "...", "createdAt": "...", "updatedAt": "..." }
  }
}
```

### DELETE `/categories/:id`

- `:id` phải là số nguyên dương → 400 nếu sai.
- Không tìm thấy id (`P2025`) → 404 `{ message: "Category not found" }`.
- Còn `Material` tham chiếu (`P2003`) → 409 `{ message: "Cannot delete category: it is still referenced by one or more materials" }`. Không crash server, không trả raw Prisma error.

Response 200:

```json
{
  "success": true,
  "message": "Category deleted",
  "data": {}
}
```

## Suppliers

Tất cả route dưới `/suppliers` đều **yêu cầu đăng nhập** (header `Authorization: Bearer <token>`). Thiếu/sai/hết hạn token → 401.

### GET `/suppliers`

Query parameters:
- `q` *(optional)* — tìm theo `name`, `phone`, `email`, hoặc `address` (substring).

Sort: theo `id` tăng dần.

Response 200:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "suppliers": [
      {
        "id": 1,
        "name": "Nhà cung cấp A",
        "phone": "0900000000",
        "email": "a@example.com",
        "address": "Hà Nội",
        "createdAt": "2026-05-14T03:00:00.000Z",
        "updatedAt": "2026-05-14T03:00:00.000Z"
      }
    ]
  }
}
```

### GET `/suppliers/:id`

- `:id` phải là số nguyên dương → 400 `{ message: "Invalid supplier id" }`.
- Không tìm thấy → 404 `{ message: "Supplier not found" }`.

Response 200:

```json
{
  "success": true,
  "message": "OK",
  "data": { "supplier": { ... } }
}
```

### POST `/suppliers`

Request body:

```json
{
  "name": "Nhà cung cấp A",
  "phone": "0900000000",
  "email": "a@example.com",
  "address": "Hà Nội"
}
```

Validation:
- `name` bắt buộc, không được rỗng/toàn khoảng trắng. Server `trim()` trước khi lưu. Thiếu/rỗng → 400 `{ message: "name is required" }`.
- `phone`, `email`, `address` đều optional. Nếu là chuỗi rỗng sau trim, lưu thành `null`. Sai type (không phải string/null) → 400 `{ message: "<field> must be a string or null" }`.
- `email` (nếu có giá trị non-empty) phải khớp regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` → 400 `{ message: "Invalid email format" }`. Không validate `phone` format vì DB_SCHEMA không quy định.
- `name`/`email` không có unique constraint trong DB schema, nên không trả 409 cho trường hợp trùng.

Response 201:

```json
{
  "success": true,
  "message": "Supplier created",
  "data": { "supplier": { ... } }
}
```

### PUT `/suppliers/:id`

Partial update. Chỉ gửi field cần đổi.

Validation:
- `:id` phải là số nguyên dương → 400.
- Nếu gửi `name`: phải non-empty sau trim → 400 `{ message: "name must be a non-empty string" }`.
- Nếu gửi `email` non-empty: phải khớp regex → 400 `{ message: "Invalid email format" }`.
- Nếu gửi `phone`/`email`/`address` chuỗi rỗng (hoặc `null`): được lưu thành `null`.
- Sai type optional field → 400 `{ message: "<field> must be a string or null" }`.
- Body không có field nào hợp lệ → 400 `{ message: "No updatable fields provided" }`.
- Không tìm thấy id (Prisma `P2025`) → 404 `{ message: "Supplier not found" }`.

Response 200:

```json
{
  "success": true,
  "message": "Supplier updated",
  "data": { "supplier": { ... } }
}
```

### DELETE `/suppliers/:id`

- `:id` phải là số nguyên dương → 400.
- Không tìm thấy id (`P2025`) → 404 `{ message: "Supplier not found" }`.
- Còn `Material` tham chiếu (`P2003`) → 409 `{ message: "Cannot delete supplier: it is still referenced by one or more materials" }`.

Response 200:

```json
{
  "success": true,
  "message": "Supplier deleted",
  "data": {}
}
```

## Users

Tất cả route dưới `/users` đều **yêu cầu đăng nhập + role `admin`** (`authMiddleware` + `requireRole('admin')`).
- Thiếu/sai/hết hạn token → 401.
- Token hợp lệ nhưng role khác `admin` → 403 `{ message: "Forbidden" }`.

**Không bao giờ trả `passwordHash`** trong bất kỳ response nào. Trường này luôn được loại khỏi payload (qua `select` hoặc helper `sanitizeUser`).

### GET `/users`

Query parameters:
- `q` *(optional)* — substring match `fullName` hoặc `username`.

Sort: theo `id` tăng dần.

Response 200:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "users": [
      {
        "id": 1,
        "fullName": "Administrator",
        "username": "admin",
        "role": "admin",
        "createdAt": "2026-05-14T03:00:00.000Z",
        "updatedAt": "2026-05-14T03:00:00.000Z"
      }
    ]
  }
}
```

### GET `/users/:id`

- `:id` số nguyên dương → 400 `{ message: "Invalid user id" }`.
- Không tìm thấy → 404 `{ message: "User not found" }`.

Response 200: `{ "data": { "user": {...} } }` (không có `passwordHash`).

### POST `/users`

Request body:

```json
{
  "fullName": "Nguyễn Văn A",
  "username": "staff1",
  "password": "123456",
  "role": "staff"
}
```

Validation (theo thứ tự):
- `fullName` bắt buộc, non-empty sau trim → 400 `{ message: "fullName is required" }`.
- `username` bắt buộc, non-empty sau trim → 400 `{ message: "username is required" }`. Sẽ được trim trước khi lưu.
- `password` bắt buộc, string, độ dài `>= 6` ký tự → 400 `{ message: "password must be at least 6 characters" }`. **Không trim password** (leading/trailing space được tính là ký tự hợp lệ).
- `role` *(optional)* — chỉ chấp nhận `"admin"` hoặc `"staff"`. Sai → 400 `{ message: "role must be \"admin\" or \"staff\"" }`. Mặc định `"staff"` nếu không gửi.
- Trùng `username` (unique constraint, Prisma `P2002`) → 409 `{ message: "Username already exists" }`.

Server hash `password` bằng `bcryptjs` (cost 10) trước khi lưu vào `passwordHash`.

Response 201: `{ "data": { "user": {...} } }` (không có `passwordHash`).

### PUT `/users/:id`

Partial update.

Validation:
- `:id` số nguyên dương → 400.
- `fullName` (nếu gửi) — non-empty string → 400 `{ message: "fullName must be a non-empty string" }`.
- `username` (nếu gửi) — non-empty string → 400 `{ message: "username must be a non-empty string" }`. Trùng → 409.
- `password` (nếu gửi) — string `>= 6` ký tự → 400. Được hash lại vào `passwordHash`.
- `role` (nếu gửi) — chỉ `"admin"` hoặc `"staff"`.
- Body rỗng/không có field hợp lệ → 400 `{ message: "No updatable fields provided" }`.
- `P2025` → 404 `{ message: "User not found" }`.
- `P2002` → 409 `{ message: "Username already exists" }`.

Response 200: `{ "data": { "user": {...} } }` (không có `passwordHash`).

### DELETE `/users/:id`

- `:id` số nguyên dương → 400.
- `req.user.id === :id` (admin xóa chính mình) → 400 `{ message: "Cannot delete your own account" }`. Check này thực hiện **trước** khi đụng DB.
- `P2025` → 404 `{ message: "User not found" }`.

Response 200:

```json
{
  "success": true,
  "message": "User deleted",
  "data": {}
}
```
