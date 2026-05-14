# Runbook

Máy đang code không bắt buộc phải cài SQL Server. Có thể viết source backend/frontend trước, sau đó chuyển sang máy có SQL Server để cấu hình database thật và test cuối.

## Lưu ý Windows PowerShell

Trên Windows, nếu PowerShell chặn `npm` do Execution Policy (lỗi kiểu "cannot be loaded because running scripts is disabled"), có 2 cách xử lý:

1. Dùng `npm.cmd` thay cho `npm`. Ví dụ:
   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```
2. Hoặc mở PowerShell as Administrator và chạy:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

Cmd Prompt (cmd.exe) và Git Bash không bị ảnh hưởng — `npm` chạy bình thường.

## Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Trên PowerShell nếu cần:

```powershell
cd backend
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run dev
```

Script có sẵn:
- `npm run dev` — chạy server với nodemon (tự reload khi sửa code)
- `npm start` — chạy server production (node trực tiếp)
- `npm run prisma:generate` — generate Prisma client từ schema (không cần SQL Server)
- `npm run seed` — chạy `prisma/seed.js` để tạo admin mẫu (`admin/123456`, role `admin`). **Cần SQL Server thật** và bảng `Users` đã tồn tại (chạy `npx prisma db push` trước).

### Lỗi EPERM khi `npm run prisma:generate` trên Windows

Nếu thấy lỗi kiểu:

```
EPERM: operation not permitted, rename '...\node_modules\.prisma\client\query_engine-windows.dll.node.tmpXXXX'
```

nghĩa là có Node process đang giữ handle file đó (nodemon backend cũ, TypeScript server của IDE,…). Cách xử lý:

1. Tìm và tắt process đang chiếm port 3000 (hoặc các nodemon cũ):
   ```powershell
   netstat -ano | Select-String ":3000"
   Stop-Process -Id <PID> -Force
   ```
2. Đóng VS Code (hoặc reload window) để giải phóng TS server, rồi chạy lại.
3. Nếu schema không đổi, có thể bỏ qua bước này — Prisma client cũ vẫn đúng.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Trên PowerShell nếu cần:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Frontend dev server mặc định chạy port 5173 (Vite). Backend dev server chạy port 3000.

### Build production frontend

Trước khi commit/deploy thay đổi UI lớn, chạy build để kiểm tra không có lỗi compile:

```powershell
cd frontend
npm.cmd run build
```

Build sẽ ra `frontend/dist/`. Nếu báo lỗi import/JSX/Tailwind thì sửa rồi build lại.

### Test luồng auth ở frontend

Yêu cầu backend đang chạy ở port 3000 và có SQL Server thật (xem mục "SQL Server Setup On Another Machine"). Nếu thiếu SQL Server thì Login sẽ hiển thị lỗi từ backend, không phải lỗi frontend.

- Vào `http://localhost:5173/dashboard` khi chưa login → bị redirect về `/login`, đường dẫn gốc lưu vào `state.from`.
- Login thành công → quay lại đúng path đã yêu cầu (mặc định `/dashboard`). Token + user lưu vào `localStorage` (keys `token`, `user`).
- Đã login mà vào `/login` → tự redirect về `/dashboard`.
- Bấm nút "Đăng xuất" ở Header → xoá localStorage và đẩy về `/login`.
- Token được tự động đính kèm `Authorization: Bearer <token>` qua interceptor trong `frontend/src/services/api.js`.

### Test trang Categories ở frontend

Yêu cầu đã đăng nhập (có token trong `localStorage`). Backend cần đang chạy + SQL Server thật để CRUD hoạt động đầy đủ.

- Vào `http://localhost:5173/categories`.
- Thử "+ Thêm loại vật tư" với `name` rỗng → form báo "Tên là bắt buộc" (client-side).
- Tạo mới với name hợp lệ → modal đóng, danh sách tự refetch.
- Bấm "Sửa" → modal có sẵn name/description hiện tại → đổi rồi lưu.
- Gõ vào ô search → bấm "Tìm" hoặc Enter → list filter theo `q`. Bấm "Xoá lọc" để reset.
- Bấm "Xoá" trên một dòng → confirm modal → "Xoá" để xác nhận. Nếu category đang được Material tham chiếu, backend trả 409 và modal hiển thị "Cannot delete category: it is still referenced…" mà không đóng.
- Nếu chưa có SQL Server, banner đỏ trên đầu trang sẽ hiển thị message lỗi từ backend (vd. "Can't reach database server at localhost:1433"). UI không crash.

## Environment

Copy `.env.example` to `.env`.

Backend dùng:
- `PORT` — port server (mặc định 3000)
- `DATABASE_URL` — chuỗi kết nối SQL Server
- `JWT_SECRET` — secret key cho JWT (BẮT BUỘC; nếu thiếu, `/auth/login` và authMiddleware sẽ trả 500)
- `JWT_EXPIRES_IN` — thời gian hết hạn token (vd: `7d`, mặc định `7d` nếu không set)

Frontend dùng:
- `VITE_API_BASE_URL`

## SQL Server Setup On Another Machine

Trên máy có SQL Server:

1. Tạo database tên `interior_materials_management`.
2. Copy `backend/.env.example` thành `backend/.env`.
3. Sửa `DATABASE_URL` theo thông tin SQL Server thật. Đặt thêm `JWT_SECRET` ngẫu nhiên (không dùng mặc định).
4. Trong thư mục `backend`, chạy:

```bash
npm run prisma:generate
npx prisma db push
npm run seed
```

Lệnh `npm run seed` tạo user admin mẫu (`username=admin`, `password=123456`, `role=admin`). Đổi mật khẩu này ngay sau khi demo.

Ví dụ `DATABASE_URL`:

```env
DATABASE_URL="sqlserver://localhost:1433;database=interior_materials_management;user=sa;password=YourPassword123;trustServerCertificate=true"
```

Nếu SQL Server dùng Windows Authentication thì cần điều chỉnh chuỗi kết nối theo cấu hình thực tế của máy chạy database.

## Health Check

Sau khi backend chạy, kiểm tra:

```
GET http://localhost:3000/api/v1/health
```

Response mong đợi:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

## Test Auth (cần SQL Server + đã seed admin)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

Response mong đợi:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "fullName": "Administrator", "username": "admin", "role": "admin" }
  }
}
```

Test route bảo vệ:

```bash
curl http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer <token>"
```

## Test Categories (cần SQL Server + JWT hợp lệ)

Tất cả route `/api/v1/categories` yêu cầu header `Authorization: Bearer <token>`. Token lấy từ `POST /auth/login` ở trên.

```bash
# List (có search optional)
curl http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer <token>"
curl "http://localhost:3000/api/v1/categories?q=gỗ" \
  -H "Authorization: Bearer <token>"

# Get one
curl http://localhost:3000/api/v1/categories/1 \
  -H "Authorization: Bearer <token>"

# Create
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Gỗ","description":"Vật liệu gỗ tự nhiên"}'

# Update partial
curl -X PUT http://localhost:3000/api/v1/categories/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Mô tả mới"}'

# Delete
curl -X DELETE http://localhost:3000/api/v1/categories/1 \
  -H "Authorization: Bearer <token>"
```

Mã lỗi đáng chú ý:
- 401 — thiếu/sai/hết hạn token.
- 400 — id không phải số nguyên dương, hoặc body sai validate.
- 404 — không tìm thấy id.
- 409 — trùng `name` (unique constraint), hoặc DELETE category còn material tham chiếu.

## Test Suppliers (cần SQL Server + JWT hợp lệ)

Tất cả route `/api/v1/suppliers` yêu cầu `Authorization: Bearer <token>`.

```bash
# List + search (tìm trong name, phone, email, address)
curl http://localhost:3000/api/v1/suppliers \
  -H "Authorization: Bearer <token>"
curl "http://localhost:3000/api/v1/suppliers?q=hanoi" \
  -H "Authorization: Bearer <token>"

# Get one
curl http://localhost:3000/api/v1/suppliers/1 \
  -H "Authorization: Bearer <token>"

# Create
curl -X POST http://localhost:3000/api/v1/suppliers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nhà cung cấp A","phone":"0900000000","email":"a@example.com","address":"Hà Nội"}'

# Update partial
curl -X PUT http://localhost:3000/api/v1/suppliers/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com"}'

# Delete
curl -X DELETE http://localhost:3000/api/v1/suppliers/1 \
  -H "Authorization: Bearer <token>"
```

Mã lỗi đáng chú ý:
- 401 — thiếu/sai/hết hạn token.
- 400 — id không phải số nguyên dương, `name` rỗng, `email` sai format, hoặc PUT body trống/không hợp lệ.
- 404 — không tìm thấy id.
- 409 — DELETE supplier còn material tham chiếu.

## Test Materials (cần SQL Server + JWT hợp lệ)

Tất cả route `/api/v1/materials` yêu cầu `Authorization: Bearer <token>`. Response material luôn kèm `category: {id,name}` và `supplier: {id,name}`.

```bash
# List + filter
curl http://localhost:3000/api/v1/materials \
  -H "Authorization: Bearer <token>"
curl "http://localhost:3000/api/v1/materials?q=gỗ&categoryId=1&supplierId=1" \
  -H "Authorization: Bearer <token>"

# Get one
curl http://localhost:3000/api/v1/materials/1 \
  -H "Authorization: Bearer <token>"

# Create (categoryId và supplierId phải tồn tại)
curl -X POST http://localhost:3000/api/v1/materials \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Gỗ MDF","categoryId":1,"supplierId":1,"unit":"tấm","quantity":10,"importPrice":100000,"sellPrice":120000,"description":"Mô tả","imageUrl":"https://example.com/img.jpg"}'

# Update partial
curl -X PUT http://localhost:3000/api/v1/materials/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"quantity":20,"sellPrice":150000}'

# Delete
curl -X DELETE http://localhost:3000/api/v1/materials/1 \
  -H "Authorization: Bearer <token>"
```

Mã lỗi đáng chú ý:
- 401 — thiếu/sai/hết hạn token.
- 400 — id sai, `categoryId`/`supplierId` query sai format, validation thân thể request (required fields, số âm, sai type, URL sai, FK không tồn tại).
- 404 — material id không tìm thấy.
- 409 — race condition FK (rất hiếm; pre-check đã chặn 400 trước).

## Test Users (admin-only, cần SQL Server + JWT của admin)

Tất cả route `/api/v1/users` yêu cầu `Authorization: Bearer <token>` **và** payload token phải có `role: "admin"`. Staff token sẽ bị 403. Response không bao giờ chứa `passwordHash`.

```bash
# List + search (theo fullName/username)
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <admin-token>"
curl "http://localhost:3000/api/v1/users?q=staff" \
  -H "Authorization: Bearer <admin-token>"

# Get one
curl http://localhost:3000/api/v1/users/2 \
  -H "Authorization: Bearer <admin-token>"

# Create (role default "staff")
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nguyễn Văn A","username":"staff1","password":"123456","role":"staff"}'

# Update partial (password sẽ được hash lại)
curl -X PUT http://localhost:3000/api/v1/users/2 \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"password":"newpass123"}'

# Delete (không xóa được chính mình)
curl -X DELETE http://localhost:3000/api/v1/users/2 \
  -H "Authorization: Bearer <admin-token>"
```

Mã lỗi đáng chú ý:
- 401 — thiếu/sai/hết hạn token.
- 403 — role khác `admin`.
- 400 — id sai, validation thân thể (fullName/username rỗng, password ngắn, role không hợp lệ, body trống), self-delete (`req.user.id === :id`).
- 404 — user id không tìm thấy.
- 409 — `username` trùng (unique constraint).

## Sanitize lỗi 5xx ở production

`errorHandler` đọc `NODE_ENV`:
- `NODE_ENV=production` → 5xx trả `"Internal Server Error"` (không leak path/Prisma detail).
- Khác (dev, không set) → 5xx trả message gốc + `console.error(err)` để debug.

Khi deploy thật, đặt `NODE_ENV=production` trong env của process Node.
