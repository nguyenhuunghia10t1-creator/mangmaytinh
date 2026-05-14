# Current State

## Đã hoàn thành
- Tạo bộ file nhớ dự án trong repo.
- Chọn hướng database chính là SQL Server + Prisma.
- Ghi rõ máy đang code không bắt buộc phải cài SQL Server.
- Tạo file theo dõi tiến độ `docs/PROGRESS.md`.
- **[Phase 1 - lần 1]** Setup backend Node.js + Express:
  - Tạo `backend/package.json` với scripts `dev`, `start`, `prisma:generate`.
  - Cài dependencies: express, cors, dotenv, @prisma/client.
  - Cài devDependencies: prisma, nodemon.
  - Tạo cấu trúc thư mục: `src/config`, `src/controllers`, `src/routes`, `src/middlewares`, `src/lib`, `prisma/`.
  - Tạo `backend/prisma/schema.prisma` với provider SQL Server, gồm 4 model: User, Category, Supplier, Material.
  - Tạo `backend/src/config/prisma.js` (Prisma client singleton).
  - Tạo `backend/src/routes/health.js` (GET /api/v1/health).
  - Tạo `backend/src/middlewares/errorHandler.js`.
  - Tạo `backend/src/index.js` (Express app, port từ .env).
  - Tạo `backend/.env.example`.
  - Chạy `npm install` và `npm run prisma:generate` thành công.
  - Kiểm tra `GET /api/v1/health` trả về `{"success":true,"message":"OK","data":{}}`.
- **[Phase 1 - lần 2]** Sửa nhỏ + Setup frontend React + Vite + Tailwind:
  - Đồng bộ port backend = 3000 trong `.env.example` (root) và `VITE_API_BASE_URL=http://localhost:3000/api/v1`.
  - Tạo `.gitignore` ở root (bỏ qua `node_modules`, `.env`, `dist`, `build`, `.DS_Store`...).
  - Cập nhật `docs/RUNBOOK.md`: thêm hướng dẫn dùng `npm.cmd` khi PowerShell chặn `npm`.
  - Tạo `frontend/package.json` (React 18, Vite 5, Tailwind 3, react-router-dom 6, axios).
  - Tạo `frontend/vite.config.js`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/index.html`.
  - Tạo `frontend/.env` và `frontend/.env.example`.
  - Tạo cấu trúc `frontend/src/{pages,components,layouts,services,hooks}`.
  - Tạo `frontend/src/services/api.js` (axios instance, đọc `import.meta.env.VITE_API_BASE_URL`).
  - Tạo React Router (`App.jsx`) với route: `/login`, `/dashboard`, `/materials`, `/categories`, `/suppliers`, `/users`, `*` (NotFound).
  - Tạo `DashboardLayout` (Sidebar trái, Header trên, Main bên phải) + components `Sidebar`, `Header`, `PagePlaceholder`.
  - Tạo các page placeholder: Login, Dashboard, Materials, Categories, Suppliers, Users, NotFound.
  - Chạy `npm install` (155 packages) — OK.
  - Chạy `npm run dev` — Vite ready trên `http://localhost:5173`, response 200 OK, Tailwind compile đúng.

- **[Phase 2 - lần 1]** Auth API + JWT middleware + seed:
  - Cài thêm `bcryptjs` và `jsonwebtoken`.
  - Tạo `backend/src/utils/response.js` (helper `success()`, `fail()` thống nhất format JSON).
  - Tạo `backend/src/middlewares/authMiddleware.js` (verify Bearer JWT, gắn `req.user`; có thêm `requireRole`).
  - Tạo `backend/src/controllers/authController.js` (`login`, `me`):
    - Validate thiếu username/password → 400.
    - User không tồn tại hoặc sai password → 401 (cùng message, không lộ trường nào sai).
    - Đúng → ký JWT bằng `JWT_SECRET`/`JWT_EXPIRES_IN`, payload `{id, username, role}`. Không trả `passwordHash`.
  - Tạo `backend/src/routes/auth.js` (`POST /login`, `GET /me` bảo vệ bằng `authMiddleware`).
  - Mount `app.use('/api/v1/auth', authRoutes)` trong `index.js`. Route `/api/v1/health` giữ nguyên.
  - Tạo `backend/prisma/seed.js`: tạo admin (`username=admin`, `password=123456` hash bằng bcrypt, `fullName=Administrator`, `role=admin`) nếu chưa có; idempotent.
  - Thêm script `"seed": "node prisma/seed.js"` trong `backend/package.json`.

- **[Phase 3 - lần 2]** Frontend CRUD UI cho Categories:
  - Tạo `frontend/src/services/categoryService.js`: `listCategories(q)`, `createCategory(payload)`, `updateCategory(id, payload)`, `deleteCategory(id)`. Mỗi hàm unwrap `res.data.data` để trả thẳng `categories[]` hoặc `category`.
  - Sửa `frontend/src/pages/Categories.jsx` (từ placeholder thành CRUD UI thật):
    - State: `categories`, `loading`, `error`, `searchInput`/`activeQuery` (UI vs. fetched), `formMode` (`closed`/`create`/`edit`), `editingCategory`, `confirmDelete`, `deleting`, `deleteError`.
    - `useEffect` fetch khi `activeQuery` đổi. Search submit-on-Enter/click.
    - Bảng có loading state, empty state (phân biệt có/không có search query), error banner trên top.
    - Modal form (sub-component `CategoryFormModal`) cho create/edit, validate `name` non-empty, trim → `null` description rỗng, hiển thị API error trong modal.
    - Modal confirm delete (sub-component `ConfirmDeleteModal`) hiển thị tên category, có error banner riêng để show lỗi P2003 (409 "Cannot delete category…") gọn gàng, không crash.
  - Không hardcode API URL. Không sửa backend. Không cài thêm package frontend.

- **[Phase 3 - lần 3 đến lần 5]** Hoàn tất CRUD UI frontend cho Suppliers, Materials, Users:
  - Tạo `frontend/src/services/supplierService.js`, `frontend/src/services/materialService.js`, `frontend/src/services/userService.js`.
  - `frontend/src/pages/Suppliers.jsx`: bảng + search `q`, modal create/edit, confirm delete, loading/empty/error state, validate email.
  - `frontend/src/pages/Materials.jsx`: bảng + search/filter `q`/`categoryId`/`supplierId`, dropdown Category/Supplier, modal create/edit, confirm delete, validate quantity/price/imageUrl.
  - `frontend/src/pages/Users.jsx`: bảng + search `q`, modal create/edit, confirm delete, validate password/role, hiển thị UX 403 nếu user hiện tại không phải admin.
  - `frontend/src/services/api.js`: thêm xử lý 401 toàn cục cho request ngoài `/auth/login`, xoá token/user và chuyển về `/login`.
  - `npm.cmd run build` trong `frontend/` pass (105 modules transformed, không warning/error).

- **[Phase 3 - Dashboard số liệu thật]** Hoàn tất Dashboard:
  - `frontend/src/pages/Dashboard.jsx` không còn dùng placeholder.
  - Dashboard gọi các service list hiện có để đếm số lượng: Materials, Categories, Suppliers, Users.
  - Users chỉ gọi khi user hiện tại có role `admin`; nếu không thì hiển thị `—` và ghi "Chỉ admin xem được".
  - Có loading state, error state từng thẻ, cảnh báo khi một số số liệu không tải được, và nút "Tải lại".
  - `npm.cmd run build` trong `frontend/` pass (104 modules transformed, không warning/error).

- **[Phase 3 - lần 1]** Frontend Login + ProtectedRoute:
  - Tạo `frontend/src/contexts/AuthContext.jsx`: `AuthProvider` + `useAuth()`. State `{token, user}` đồng bộ với `localStorage` (keys: `token`, `user`). API: `login({username,password})`, `logout()`, `isAuthenticated`. Gọi backend qua `services/api.js` (không hardcode URL).
  - Tạo `frontend/src/components/ProtectedRoute.jsx`: chưa đăng nhập → `Navigate to="/login"`, lưu `from: location` để redirect lại sau khi login.
  - Tạo `frontend/src/components/PublicRoute.jsx`: đã đăng nhập → `Navigate to="/dashboard"`.
  - Sửa `frontend/src/main.jsx`: bọc `<AuthProvider>` quanh `<App />` (bên trong `BrowserRouter`).
  - Sửa `frontend/src/App.jsx`: `/login` bọc `PublicRoute`; toàn bộ route trong `DashboardLayout` bọc `ProtectedRoute` ở cấp layout (không bọc từng route con).
  - Sửa `frontend/src/pages/Login.jsx`: form controlled, validate rỗng, call API qua context, loading + error UI, redirect về `from.pathname` (mặc định `/dashboard`).
  - Sửa `frontend/src/components/Header.jsx`: hiển thị `user.fullName/username` + badge `role` + button "Đăng xuất".
  - Không sửa backend.

- **[Phase 2 - lần 5]** CRUD `/users` (admin-only) + rà backend tổng thể:
  - Tạo `backend/src/controllers/userController.js` với 5 handler.
    - `list`/`getOne` dùng `select` để không bao giờ trả `passwordHash`.
    - `create`: validate `fullName`/`username` non-empty, `password` string `>= 6` (không trim), `role` ∈ `{admin, staff}` (default `staff`). Hash bằng `bcrypt` cost 10. P2002 → 409 "Username already exists". Trả qua `sanitizeUser()` (destructure bỏ `passwordHash`).
    - `update`: partial — chỉ validate field gửi. Password tối thiểu 6 ký tự, hash lại. P2025 → 404, P2002 → 409. Trả qua `sanitizeUser()`.
    - `remove`: check `req.user.id === id` **trước** Prisma call → 400 "Cannot delete your own account" (không cần DB). P2025 → 404.
    - Constants: `VALID_ROLES = Set(['admin','staff'])`, `PASSWORD_MIN_LENGTH = 6`, `BCRYPT_COST = 10`.
  - Tạo `backend/src/routes/users.js`, `router.use(authMiddleware)` rồi `router.use(requireRole('admin'))` — staff vào sẽ 403.
  - Mount `app.use('/api/v1/users', userRoutes)` trong `index.js`.
  - **Rà backend tổng thể:**
    - `index.js` mount đủ 6 router: health, auth, categories, suppliers, materials, users. ✓
    - `package.json` scripts đủ: `dev`, `start`, `prisma:generate`, `seed`. ✓
    - `.env.example` đủ: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`. ✓
    - Không xóa/đổi CRUD đã có.

- **[Phase 2 - lần 4]** CRUD `/materials`:
  - Tạo `backend/src/controllers/materialController.js` với 5 handler (`list`, `getOne`, `create`, `update`, `remove`).
    - `list` hỗ trợ query `q` (substring `name`/`description`), filter `categoryId`, `supplierId` (validate số nguyên dương). Sort `id asc`. Include `category: {id,name}`, `supplier: {id,name}`.
    - `create`: validate đủ — `name`, `categoryId`, `supplierId`, `unit` bắt buộc; `quantity` non-negative integer; `importPrice`/`sellPrice` non-negative number; `description`/`imageUrl` string-or-null; `imageUrl` non-empty phải qua `new URL(...)` với `http:`/`https:`. Pre-check `categoryId`/`supplierId` tồn tại (song song qua `Promise.all`); không có → 400 với message rõ. P2003 race → 409 "Invalid categoryId or supplierId".
    - `update`: partial — chỉ validate field gửi; nếu gửi `categoryId`/`supplierId` cũng pre-check tồn tại. P2025 → 404, P2003 → 409.
    - `remove`: P2025 → 404. Không pre-check vì Material là lá (không có model nào tham chiếu Material).
    - Constants `MATERIAL_INCLUDE` dùng chung cho mọi response.
  - Tạo `backend/src/routes/materials.js`, `router.use(authMiddleware)`.
  - Mount `app.use('/api/v1/materials', materialRoutes)` trong `index.js`.
  - Quyết định contract: `categoryId`/`supplierId` không tồn tại → **400** (client data sai), phân biệt với 404 (resource id không tồn tại). Đã ghi vào API_SPEC.

- **[Phase 2 - lần 3]** CRUD `/suppliers` + tách `parseId` helper:
  - Tạo `backend/src/utils/parseId.js` (helper số nguyên dương) — refactor `categoryController.js` để dùng helper chung (kiểm thử regression OK: `/categories/abc` vẫn trả 400).
  - Tạo `backend/src/controllers/supplierController.js` với 5 handler (`list`, `getOne`, `create`, `update`, `remove`).
    - `list` hỗ trợ query `q` (substring match `name`, `phone`, `email`, `address`), sort `id asc`.
    - `create`/`update` trim các field optional; rỗng sau trim → `null`. Sai type → 400.
    - Email validate bằng regex cơ bản `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
    - Map Prisma error: P2025 → 404, P2003 (DELETE còn material) → 409 với message dễ hiểu.
    - Không validate `phone` format vì DB_SCHEMA không quy định.
    - `name`/`email` không unique trong DB schema → không trả 409 cho trùng.
  - Tạo `backend/src/routes/suppliers.js`, `router.use(authMiddleware)`.
  - Mount `app.use('/api/v1/suppliers', supplierRoutes)` trong `index.js`.

- **[Phase 2 - lần 2]** CRUD `/categories` + errorHandler hardening:
  - Tạo `backend/src/controllers/categoryController.js` với 5 handler (`list`, `getOne`, `create`, `update`, `remove`).
    - Helper `parseId` chỉ chấp nhận số nguyên dương khớp chính xác.
    - `list` hỗ trợ query `q` (substring match `name` hoặc `description`), sort `id asc`.
    - `create`/`update` trim name; description rỗng sau trim → `null`.
    - Map Prisma error: P2002 → 409 "Category name already exists", P2025 → 404 "Category not found", P2003 (DELETE còn material tham chiếu) → 409 với message dễ hiểu.
    - Không trả raw Prisma error ra client cho các nhánh dự đoán được.
  - Tạo `backend/src/routes/categories.js` — toàn bộ route bảo vệ bằng `authMiddleware` qua `router.use(authMiddleware)`.
  - Mount `app.use('/api/v1/categories', categoryRoutes)` trong `index.js`.
  - Tinh chỉnh `backend/src/middlewares/errorHandler.js`: 5xx ở production → "Internal Server Error", dev → message gốc + `console.error`. 4xx giữ message gốc. Format response không đổi.
  - Không sửa schema Prisma (đã đủ).

## Đang làm
- Chưa có task đang chạy.

## Chưa làm
- Test CRUD `/categories`, `/suppliers`, `/materials`, `/users` end-to-end trên máy có SQL Server
- Test login thật (flow frontend → backend → SQL Server) trên máy có SQL Server (chạy `npx prisma db push` + `npm run seed` rồi mới test)
- Kiểm thử kết nối SQL Server thật trên máy có SQL Server

## Lưu ý phiên gần nhất
- Backend Express vẫn chạy được, route `/api/v1/health` hoạt động đúng (port 3000).
- Frontend Vite dev server chạy được trên port 5173, render skeleton dashboard với Tailwind.
- `POST /api/v1/auth/login` đã code xong. Đã kiểm tra các branch không phụ thuộc DB (400 thiếu body, 401 thiếu token, 401 token sai). Branch tìm user trong DB chưa test được vì máy chưa có SQL Server (lỗi `Can't reach database server at localhost:1433` — đây là expected blocker, không phải lỗi source).
- `GET /api/v1/auth/me` (bảo vệ bằng `authMiddleware`) đã verify branch 401 (missing/invalid token).
- `/api/v1/categories` (CRUD) đã được verify các branch không phụ thuộc DB: 401 thiếu token, 401 token sai; với token hợp lệ thì controller chạy đến Prisma và trả 500 với "Can't reach database server" — expected blocker.
- `/api/v1/suppliers` (CRUD) đã được verify tương tự + branch validation với JWT hợp lệ: 400 id sai format, 400 name rỗng, 400 email sai format, 400 PUT body trống. Đụng Prisma → 500 expected blocker.
- `/api/v1/materials` (CRUD) đã được verify đầy đủ branch không cần DB: 401 thiếu/sai token, 400 id sai, 400 `categoryId`/`supplierId` query sai, 400 các rule validation (name/categoryId/supplierId/unit bắt buộc, quantity âm, price âm, imageUrl sai), 400 PUT body trống. Đụng Prisma → 500 expected blocker.
- `/api/v1/users` (CRUD, admin-only) đã được verify đầy đủ: 401 thiếu/sai token, **403** staff token (requireRole chặn), 400 id sai, 400 các rule validation (fullName/username bắt buộc, password ngắn, role sai), 400 PUT body trống, **400 self-delete** (`Cannot delete your own account`, không cần DB). Đụng Prisma → 500 expected blocker.
- Frontend đã có Login thật, AuthContext, ProtectedRoute, PublicRoute, Header có logout. `npm.cmd run build` pass (101 modules transformed, không warning). Login thực sự gọi API chưa test được vì máy chưa có SQL Server (backend trả 500 "Can't reach database server" khi `/auth/login` đụng `prisma.user.findUnique`).
- Trang `/categories` đã là CRUD UI thật: bảng, search, modal create/edit, confirm delete, loading/empty/error state. Service riêng `categoryService.js` wrap API calls. `npm.cmd run build` pass (102 modules transformed, không warning). Gọi API CRUD thật chưa test được vì máy chưa có SQL Server — UI sẽ hiển thị message lỗi từ backend gọn gàng (không crash).
- Trang `/suppliers`, `/materials`, `/users` đã là CRUD UI thật theo pattern tương tự. `Materials` có dropdown Category/Supplier và validate số/URL; `Users` xử lý UX admin-only/403. `npm.cmd run build` pass (105 modules transformed, không warning).
- Dashboard đã hiển thị số liệu thật bằng cách đếm dữ liệu từ các API list hiện có. `npm.cmd run build` pass (104 modules transformed, không warning).
- Helper `parseId` đã refactor sang `backend/src/utils/parseId.js`. Đã kiểm tra regression `/categories/abc` và `/suppliers/abc` vẫn trả 400 đúng.
- `errorHandler` giờ chuyển sang "Internal Server Error" khi `NODE_ENV=production`; trong dev vẫn trả message Prisma đầy đủ (kèm log `console.error`).
- **Database thật chưa được test** — máy hiện tại chưa cài SQL Server. Khi chuyển sang máy có SQL Server, cần chạy `prisma db push` để tạo bảng, sau đó `npm run seed` để tạo admin mẫu, rồi test `POST /auth/login` và CRUD `/categories`, `/suppliers`, `/materials`, `/users`.
- Không hardcode thông tin kết nối; tất cả đọc từ `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` trong `.env` (backend) và `VITE_API_BASE_URL` trong `.env` (frontend).
- `npm run prisma:generate` bị EPERM trên Windows (file `query_engine-windows.dll.node` đang bị một Node process khác hold). Schema Phase 2 không đổi nên Prisma client từ Phase 1 vẫn dùng được; server chạy bình thường. Nếu cần regenerate, đóng các Node process đang giữ file (kể cả nodemon cũ) rồi chạy lại.
