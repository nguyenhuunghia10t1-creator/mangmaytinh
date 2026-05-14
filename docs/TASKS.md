# Tasks

## Phase 1: Setup
- [x] Tạo backend Express
- [x] Tạo frontend React + Vite + Tailwind
- [x] Cấu hình Prisma cho SQL Server
- [x] Tạo Prisma schema (User, Category, Supplier, Material)
- [x] Chuẩn bị hướng dẫn kết nối SQL Server trên máy khác (RUNBOOK.md)
- [x] Tạo .env.example (root + backend + frontend), đồng bộ port 3000
- [x] Tạo .gitignore ở root
- [x] Tạo bộ file nhớ dự án
- [x] Chọn SQL Server làm database chính
- [x] Tạo file theo dõi tiến độ docs/PROGRESS.md
- [x] React Router + DashboardLayout (Sidebar/Header/Main)
- [x] Page placeholder: Login, Dashboard, Materials, Categories, Suppliers, Users
- [x] `frontend/src/services/api.js` dùng `VITE_API_BASE_URL`

## Phase 2: Backend
- [x] Auth API (POST /auth/login, JWT)
- [x] JWT middleware (authMiddleware, requireRole)
- [x] GET /auth/me
- [x] Seed admin (prisma/seed.js + npm run seed)
- [x] Material API (CRUD /materials) — protected bằng JWT, filter `q`/`categoryId`/`supplierId`, include category+supplier, pre-check FK tồn tại, URL validation cho imageUrl
- [x] Category API (CRUD /categories) — protected bằng JWT, có search `q`, map P2002/P2025/P2003
- [x] Supplier API (CRUD /suppliers) — protected bằng JWT, search `q` đa trường, email regex validation, map P2025/P2003
- [x] User API (CRUD /users) — protected bằng JWT + `requireRole('admin')`, bcrypt hash password, role whitelist, self-delete guard, không bao giờ trả `passwordHash`
- [ ] Test end-to-end auth khi có SQL Server (db push + seed + login)
- [ ] Test end-to-end CRUD `/categories`, `/suppliers`, `/materials`, `/users` khi có SQL Server

## Phase 3: Frontend
- [x] Login page (kết nối API thật qua `services/api.js`, lưu JWT vào localStorage, validate trống + loading + error)
- [x] ProtectedRoute (yêu cầu đăng nhập trước khi vào dashboard) + PublicRoute (đã login mà vào /login thì redirect /dashboard)
- [x] AuthContext (token + user, login/logout, đồng bộ localStorage)
- [x] Header hiển thị user thật + nút Đăng xuất
- [x] Dashboard (số liệu thật) — gọi các service list hiện có để đếm Materials/Categories/Suppliers/Users, có loading/error và nút tải lại
- [x] Materials page (bảng + CRUD) — search/filter `q`/`categoryId`/`supplierId`, dropdown Category/Supplier, modal create/edit, confirm delete, validate số + URL; service `materialService.js`
- [x] Categories page (bảng + CRUD) — search `q`, modal create/edit, confirm delete, loading/empty/error state; service `categoryService.js`
- [x] Suppliers page (bảng + CRUD) — search `q`, modal create/edit, confirm delete, validate email; service `supplierService.js`
- [x] Users page (bảng + CRUD) — admin-only UX, search `q`, modal create/edit, confirm delete, validate password/role; service `userService.js`
- [x] Loading, error, confirm delete chung (đã có pattern đầy đủ trên các trang CRUD; chưa tách component dùng chung)

## Phase 4: Final
- [ ] Test API (Postman)
- [ ] Test UI
- [ ] Test database thật trên máy có SQL Server
- [ ] Viết README
- [ ] Chuẩn bị demo
