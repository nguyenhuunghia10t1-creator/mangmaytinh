# Progress Log

File này dùng để ghi tiến độ sau mỗi phiên làm việc.

Luôn cập nhật file này sau khi code, sửa tài liệu, chạy test, hoặc hoàn thành một phần việc quan trọng.

## Quy tắc cập nhật

Mỗi lần làm xong một việc, thêm một mục mới ở đầu phần "Nhật ký".

Mỗi mục cần ghi:
- Ngày làm
- Người/agent thực hiện
- Đã làm gì
- Chưa làm gì
- Đã kiểm tra bằng cách nào
- Lỗi/blocker nếu có
- Bước tiếp theo đề xuất

Khi cập nhật tiến độ, cũng phải cập nhật:
- `docs/CURRENT_STATE.md`
- `docs/TASKS.md`
- Tài liệu liên quan nếu có thay đổi API, database, UI hoặc cách chạy

## Trạng thái tổng quan hiện tại

Backend Phase 2 đã xong toàn bộ. Frontend Phase 3 đã có Auth, Dashboard số liệu thật, và CRUD UI cho Categories, Suppliers, Materials, Users: bảng, search/filter, modal create/edit, confirm delete, loading/empty/error state. `services/api.js` đã có xử lý 401 toàn cục ngoài `/auth/login`. Chưa test API thật end-to-end vì máy hiện tại thiếu SQL Server. Phần còn lại chính là README/demo và test end-to-end trên máy có SQL Server.

Đã hoàn thành:
- Backend Node.js + Express chạy được trên port 3000.
- Prisma schema SQL Server đã có (4 model).
- Health check `/api/v1/health` hoạt động.
- `POST /api/v1/auth/login` và `GET /api/v1/auth/me` đã code xong; JWT middleware (`authMiddleware`, `requireRole`) sẵn sàng dùng cho các route Phase 2 sau.
- CRUD `/api/v1/categories` (list với `q`, get one, create, update partial, delete) đã code xong, có map Prisma error (P2002 → 409, P2025 → 404, P2003 → 409).
- CRUD `/api/v1/suppliers` (list với `q` 4 trường, get one, create, update partial, delete) đã code xong, có email regex validation, map Prisma error (P2025 → 404, P2003 → 409).
- CRUD `/api/v1/materials` (list với `q`/`categoryId`/`supplierId`, get one, create, update partial, delete) đã code xong, include `category`+`supplier`, pre-check FK tồn tại → 400 (Material không tham chiếu được nên không có 409 cascade).
- CRUD `/api/v1/users` **admin-only** (list với `q`, get one, create với bcrypt hash, update partial, delete với self-protect) đã code xong; không trả `passwordHash`; map P2002 → 409 "Username already exists", P2025 → 404.
- Toàn bộ route `/categories`, `/suppliers`, `/materials` được bảo vệ bằng `authMiddleware`. `/users` bảo vệ bằng `authMiddleware` + `requireRole('admin')`.
- Helper `parseId` tách sang `backend/src/utils/parseId.js`, được dùng chung cho 3 controller.
- `errorHandler` đã tinh chỉnh: production trả "Internal Server Error" cho 5xx, dev vẫn trả message chi tiết kèm `console.error`.
- Seed script `backend/prisma/seed.js` + script `npm run seed`.
- Frontend React + Vite + Tailwind skeleton chạy được trên port 5173.
- React Router + DashboardLayout + `services/api.js`.
- Frontend Auth: Login, AuthContext, ProtectedRoute/PublicRoute, Header có logout.
- Frontend Dashboard: đếm số liệu thật bằng các API list hiện có.
- Frontend CRUD UI: Categories, Suppliers, Materials, Users.
- Root `.env.example` đã đồng bộ port 3000, root `.gitignore` đã có.
- RUNBOOK.md đã ghi chú PowerShell `npm.cmd`, seed, EPERM của prisma, curl examples cho Categories/Suppliers.
- Database thật chưa test (máy hiện tại chưa có SQL Server).

Chưa làm:
- Test login thật end-to-end khi có SQL Server (frontend → backend → DB).
- Test end-to-end các CRUD backend/frontend khi có SQL Server.

## Nhật ký

### 2026-05-14 - Phase 3: Dashboard số liệu thật

Người/agent thực hiện: Codex

Đã làm:
- Sửa `frontend/src/pages/Dashboard.jsx`:
  - Bỏ `PagePlaceholder`.
  - Gọi `listMaterials()`, `listCategories()`, `listSuppliers()`, `listUsers()` để lấy danh sách và đếm `.length`.
  - Dùng `Promise.allSettled` để một API lỗi không làm hỏng toàn bộ Dashboard.
  - Chỉ gọi `listUsers()` khi user hiện tại có role `admin`; user không phải admin thấy `—` và helper "Chỉ admin xem được".
  - Thêm loading state, error state từng thẻ, cảnh báo khi một số số liệu không tải được, và nút "Tải lại".
- Cập nhật `docs/TASKS.md`, `docs/CURRENT_STATE.md`, `docs/UI_SPEC.md`, `docs/PROGRESS.md`.

Đã kiểm tra bằng cách nào:
- `cd frontend && npm.cmd run build`:
  - 104 modules transformed.
  - Output: `dist/index.html 0.43 kB`, CSS 14.70 kB, JS 265.22 kB.
  - Built in 1.16s, không warning/error.

Chưa test được vì thiếu SQL Server:
- Số liệu Dashboard lấy từ DB thật.
- Users count với token admin thật.
- Error/loading khi backend có dữ liệu thật.

Lỗi/blocker:
- Expected blocker: máy hiện tại chưa có SQL Server nên API đụng DB chưa thể test end-to-end.

Bước tiếp theo đề xuất:
1. Chạy frontend dev server để xem UI.
2. Khi có máy SQL Server: `prisma db push` → `npm run seed` → login admin/123456 → test Dashboard và toàn bộ CRUD.
3. Cập nhật README/demo sau khi test DB thật.

### 2026-05-14 - Phase 3 lần 3-5: Suppliers, Materials, Users CRUD UI

Người/agent thực hiện: Codex

Đã làm:
- Hoàn tất phần đang dang dở của Suppliers UI:
  - `frontend/src/services/supplierService.js`: `listSuppliers(q)`, `createSupplier`, `updateSupplier`, `deleteSupplier`.
  - `frontend/src/pages/Suppliers.jsx`: bảng, search `q`, modal create/edit, confirm delete, loading/empty/error state, validate email, hiển thị lỗi API trong đúng vùng thao tác.
- Tạo `frontend/src/services/materialService.js`:
  - `listMaterials({ q, categoryId, supplierId })`, `createMaterial`, `updateMaterial`, `deleteMaterial`.
- Sửa `frontend/src/pages/Materials.jsx` từ placeholder thành CRUD UI thật:
  - Bảng vật tư có category/supplier, quantity, unit, importPrice, sellPrice, updatedAt.
  - Bộ lọc theo `q`, `categoryId`, `supplierId`.
  - Form create/edit có `name`, `categoryId`, `supplierId`, `quantity`, `unit`, `importPrice`, `sellPrice`, `description`, `imageUrl`.
  - Validate client-side: required fields, số không âm, quantity là số nguyên không âm, `imageUrl` phải là URL `http/https` nếu nhập.
  - Dropdown Category/Supplier lấy qua `categoryService.js` và `supplierService.js`.
- Tạo `frontend/src/services/userService.js`:
  - `listUsers(q)`, `createUser`, `updateUser`, `deleteUser`.
- Sửa `frontend/src/pages/Users.jsx` từ placeholder thành CRUD UI thật:
  - Bảng nhân sự, search `q`, modal create/edit, confirm delete.
  - Form create user yêu cầu `fullName`, `username`, `password >= 6`, `role`.
  - Form edit user cho phép đổi `fullName`, `username`, `role`, và password optional.
  - Nếu user hiện tại có role khác `admin`, page hiển thị cảnh báo quyền và không gọi API list.
  - Disable nút xoá tài khoản đang đăng nhập.
- Sửa `frontend/src/services/api.js`:
  - Nếu API trả 401 ngoài `/auth/login`, xoá `token`/`user` khỏi localStorage và chuyển về `/login`.
- Cập nhật `docs/TASKS.md`, `docs/CURRENT_STATE.md`, `docs/UI_SPEC.md`, `docs/PROGRESS.md`.

Đã kiểm tra bằng cách nào:
- `cd frontend && npm.cmd run build`:
  - 105 modules transformed.
  - Output: `dist/index.html 0.43 kB`, CSS 14.31 kB, JS 262.69 kB.
  - Built in 1.20s, không warning/error.

Chưa test được vì thiếu SQL Server:
- CRUD thật cho Suppliers, Materials, Users.
- Materials load dropdown Category/Supplier từ DB thật.
- Users admin-only với token thật từ login.
- 401 auto logout với token hết hạn thật.

Lỗi/blocker:
- Expected blocker: máy hiện tại chưa có SQL Server nên các API đụng Prisma/DB chưa thể test end-to-end.

Bước tiếp theo đề xuất:
1. Chạy frontend dev server để tự nhìn UI.
2. Khi có máy SQL Server: `prisma db push` → `npm run seed` → login admin/123456 → test CRUD end-to-end.
3. Sau khi CRUD ổn, làm Dashboard số liệu thật hoặc README/demo.

### 2026-05-14 - Phase 3 lần 2: Frontend CRUD UI cho Categories

Người/agent thực hiện: Claude Code

Đã làm:

**Code mới:**
- `frontend/src/services/categoryService.js`:
  - `listCategories(q)`: nếu `q` non-empty (sau trim) thì truyền qua `params.q`. Trả `data.categories ?? []`.
  - `createCategory(payload)`: POST `/categories`, trả `data.category`.
  - `updateCategory(id, payload)`: PUT `/categories/:id`, trả `data.category`.
  - `deleteCategory(id)`: DELETE `/categories/:id`.
  - Helper `unwrap(res)` = `res?.data?.data ?? {}` để không phải động vào shape `{success,message,data}` ở component.

**Code sửa:**
- `frontend/src/pages/Categories.jsx` (từ placeholder thành CRUD UI thật):
  - State đầy đủ: `categories`, `loading`, `error`, `searchInput`/`activeQuery`, `formMode` (`closed`/`create`/`edit`), `editingCategory`, `confirmDelete`, `deleting`, `deleteError`.
  - `fetchCategories(q)` qua `useCallback` + `useEffect` watch `activeQuery`. Search submit-on-Enter/click (không debounce — tránh phức tạp).
  - Helper `extractApiError(err, fallback)` lấy ưu tiên `err.response.data.message` → `err.message` → fallback. Helper `formatDate` dùng `toLocaleString('vi-VN')`.
  - Bảng 5 cột: ID / Tên / Mô tả / Cập nhật / Thao tác. Description null hiển thị "—". Mỗi dòng có nút "Sửa" + "Xoá".
  - Loading row + empty state (phân biệt theo có search hay không).
  - Sub-component `CategoryFormModal`: modal overlay, fields `name` (required) + `description` (textarea). Trim + null hoá description rỗng. Validate client `name` non-empty. Hiển thị API error trong modal. Disable + đổi text submit khi đang submit.
  - Sub-component `ConfirmDeleteModal`: hỏi xác nhận theo tên category. Có error banner ngay trong modal để show 409 P2003 (category còn material) gọn gàng.

**Không sửa backend.** Không cài thêm package frontend.

Đã kiểm tra bằng cách nào:
- `cd frontend && npm.cmd run build`:
  - 102 modules transformed (101 → 102, đúng với việc thêm `categoryService.js`).
  - Output: `dist/index.html 0.43kB`, `dist/assets/index-BQzQEfYo.css 13.49kB`, `dist/assets/index-D-fFNru5.js 225.60kB`. Built in 1.15s. Không warning, không error.
- Không hardcode API URL: page chỉ import từ `categoryService.js`, service chỉ dùng `api` instance (`services/api.js` đọc `import.meta.env.VITE_API_BASE_URL`).
- `/categories` đã được bảo vệ trước đó bằng `ProtectedRoute` ở cấp layout — vào lúc chưa login sẽ bị redirect `/login`.
- Khi backend trả 500 "Can't reach database server" (chưa có SQL Server), trang sẽ hiển thị error banner đỏ trên top, không crash.

Chưa test được vì thiếu SQL Server (sẽ test khi chuyển sang máy có DB):
- GET danh sách categories thật, search theo `q`.
- POST tạo mới (201).
- PUT update partial.
- DELETE thành công.
- DELETE category còn material → 409 "Cannot delete category…" hiển thị trong confirm modal.
- POST trùng name → 409 "Category name already exists" hiển thị trong form modal.

Lỗi/blocker:
- Expected: tất cả CRUD đều cần SQL Server thật để test end-to-end.
- Không có lỗi source.

Bước tiếp theo đề xuất:
1. Phase 3 lần 3: CRUD UI cho `Suppliers` — pattern y hệt Categories, thêm `phone`/`email`/`address` field + email validation.
2. Hoặc Phase 3 lần 4: CRUD UI cho `Materials` — phức tạp hơn (FK `categoryId`/`supplierId` → cần dropdown từ API list, số `quantity`/`importPrice`/`sellPrice`, `imageUrl`).
3. Hoặc thêm response interceptor 401 toàn cục ở `services/api.js` (auto logout khi token hết hạn).
4. Hoặc Phase 4: setup máy có SQL Server → test end-to-end toàn bộ luồng đã có.

---

### 2026-05-14 - Phase 3 lần 1: Frontend Login + ProtectedRoute

Người/agent thực hiện: Claude Code

Đã làm:

**Code mới:**
- `frontend/src/contexts/AuthContext.jsx`:
  - `AuthProvider` giữ `token` + `user` qua `useState`. Khởi tạo từ `localStorage` (keys `token` và `user`). `user` parse từ JSON, fallback `null` nếu parse fail.
  - `login({username, password})`: `api.post('/auth/login', {...})`, đọc `res.data.data.{token,user}`, ghi `localStorage` + setState. Ném error nếu response thiếu field.
  - `logout()`: xoá `token`/`user` khỏi `localStorage` + setState `null`.
  - Expose `{ token, user, isAuthenticated, login, logout }` qua `useMemo`. `useAuth()` throw nếu dùng ngoài provider.
  - Không hardcode URL — đi qua `services/api.js` đã có `baseURL = import.meta.env.VITE_API_BASE_URL` và interceptor đính kèm Bearer token.
- `frontend/src/components/ProtectedRoute.jsx`: nếu `!isAuthenticated` → `<Navigate to="/login" state={{from: location}} replace />`. Sau khi login Login page sẽ đọc `state.from.pathname` để quay về.
- `frontend/src/components/PublicRoute.jsx`: nếu `isAuthenticated` → `<Navigate to="/dashboard" replace />`.

**Code sửa:**
- `frontend/src/main.jsx`: thêm `<AuthProvider>` bao `<App />` (bên trong `BrowserRouter`).
- `frontend/src/App.jsx`:
  - `/login` bọc `<PublicRoute>`.
  - Layout route `<DashboardLayout />` bọc `<ProtectedRoute>` ở cấp layout — bảo vệ luôn `/dashboard`, `/materials`, `/categories`, `/suppliers`, `/users`. `/` redirect → `/dashboard` cũng tự được bảo vệ.
- `frontend/src/pages/Login.jsx`: bỏ form disabled placeholder. Form controlled với `useState` cho `username`, `password`, `error`, `loading`. Validate trống ở client trước khi gọi API. Gọi `login()` từ context. Error UI có `role="alert"`, fallback message theo thứ tự `err.response.data.message` → `err.message` → "Đăng nhập thất bại". Button + input disabled khi loading; button đổi text "Đang đăng nhập…". Sau khi thành công `navigate(redirectTo, { replace: true })` với `redirectTo = location.state?.from?.pathname || '/dashboard'`.
- `frontend/src/components/Header.jsx`: hiển thị `user.fullName || user.username`, badge `user.role`, avatar (chữ cái đầu của tên). Button "Đăng xuất" gọi `logout()` rồi `navigate('/login', { replace: true })`.

**Không sửa backend.** Không cài thêm package frontend.

Đã kiểm tra bằng cách nào:
- `cd frontend && npm.cmd run build`:
  - 101 modules transformed.
  - Output: `dist/index.html 0.43 kB`, `dist/assets/index-DUPaebav.css 11.22 kB`, `dist/assets/index-BLY3MEqZ.js 217.06 kB`. Built in 1.19s. Không warning, không error.
- Không hardcode URL: AuthContext gọi `api.post(...)`, không có chuỗi `http://localhost:3000` trong frontend code mới.
- ProtectedRoute logic: dựa trên `isAuthenticated = !!token`, token đọc từ `localStorage.getItem('token')` lúc mount → mở `/dashboard` khi chưa login sẽ redirect `/login` ngay ở render đầu tiên (không gọi API).
- PublicRoute logic: nếu đã có token thì mở `/login` sẽ redirect `/dashboard`.

Chưa test được vì thiếu SQL Server (sẽ test khi chuyển sang máy có DB):
- Login thật flow frontend → backend → DB → trả token.
- Header hiển thị fullName thật của admin.
- Logout xoá token rồi vào lại `/dashboard` → bị đẩy về `/login`.
- ProtectedRoute redirect-after-login: vào `/materials` lúc chưa login → bị đẩy về `/login` → login xong quay lại `/materials`.

Lỗi/blocker:
- Expected: backend `/auth/login` đụng DB nên Login thật sẽ trả 500 trên máy không có SQL Server. Frontend xử lý đúng: hiển thị message lỗi từ `response.data.message`, không crash.
- Không có lỗi source.

Bước tiếp theo đề xuất:
1. Phase 3 lần 2: Frontend CRUD UI — bắt đầu từ trang đơn giản nhất `Categories` (bảng + thêm/sửa/xóa, confirm delete, loading/error), rồi Suppliers, Materials, Users.
2. Hoặc thêm response interceptor ở `services/api.js` để xử lý 401 toàn cục (auto logout + redirect khi token hết hạn).
3. Hoặc Phase 4: setup máy có SQL Server → `npm.cmd run prisma:generate` → `npx prisma db push` → `npm.cmd run seed` → test login thật end-to-end.

---

### 2026-05-14 - Phase 2 lần 5: CRUD `/users` (admin-only) + rà backend tổng thể

Người/agent thực hiện: Claude Code

Đã làm:

**Code mới:**
- `backend/src/controllers/userController.js`: 5 handler.
  - Constants: `VALID_ROLES = Set(['admin','staff'])`, `PASSWORD_MIN_LENGTH = 6`, `BCRYPT_COST = 10`.
  - Helper local `sanitizeUser(user)`: destructure bỏ `passwordHash` từ payload trước khi trả về.
  - `list`: query `q` (substring `fullName`/`username`), sort `id asc`. Dùng `select` chỉ trả `{id, fullName, username, role, createdAt, updatedAt}` — `passwordHash` không bao giờ được fetch.
  - `getOne`: `parseId` → 400 nếu sai. `select` không có `passwordHash`. 404 nếu không thấy.
  - `create`: validate fullName/username non-empty, password string `>= 6` (không trim — leading/trailing space hợp lệ), role optional ∈ `{admin, staff}` (default `staff`). Hash bằng `bcrypt.hash(password, 10)`. P2002 → 409 "Username already exists". Trả qua `sanitizeUser()`.
  - `update`: partial — chỉ validate field gửi. Password ngắn → 400. Role sai → 400. Body trống → 400. P2025 → 404, P2002 → 409. Trả qua `sanitizeUser()`.
  - `remove`: `parseId` → 400. **Check `req.user.id === id` trước Prisma call** → 400 "Cannot delete your own account" (không cần DB, test verify được). P2025 → 404.
- `backend/src/routes/users.js`: `router.use(authMiddleware)` + `router.use(requireRole('admin'))` ngay từ đầu — staff token → 403 trước khi tới controller.
- `backend/src/index.js`: import + mount `app.use('/api/v1/users', userRoutes)`.

**Rà backend tổng thể (audit pass):**
- `backend/src/index.js` mount đủ 6 router: `/api/v1` (health), `/api/v1/auth`, `/api/v1/categories`, `/api/v1/suppliers`, `/api/v1/materials`, `/api/v1/users`. ✓
- `backend/package.json` scripts: `dev`, `start`, `prisma:generate`, `seed`. ✓
- `backend/.env.example`: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`. ✓
- Không xóa/đổi CRUD đã có.

**Schema Prisma:**
- Không sửa. User model đã có `username @unique` (đủ cho P2002), `passwordHash`, `role` default `staff`.

**Dependencies:**
- Không cài thêm package (`bcryptjs` đã có sẵn từ Phase 2 lần 1).

Đã kiểm tra bằng cách nào (14 case, restart backend từ PID 24724):
- Sinh 2 token: staff (id=5, role=staff) và admin (id=1, role=admin).
- `GET /health` → 200 ✓
- `GET /users` không token → 401 missing ✓
- `GET /users` token sai → 401 invalid ✓
- `GET /users` **staff token → 403 "Forbidden"** ✓ (requireRole hoạt động đúng)
- `GET /users/abc` admin → 400 "Invalid user id" ✓
- `POST /users -d '{}'` admin → 400 "fullName is required" ✓
- `POST /users` password ngắn → 400 "password must be at least 6 characters" ✓
- `POST /users` role "superuser" → 400 "role must be \"admin\" or \"staff\"" ✓
- `PUT /users/5 -d '{}'` admin → 400 "No updatable fields provided" ✓
- **`DELETE /users/1` với admin token (id=1) → 400 "Cannot delete your own account"** ✓ (self-protect không cần DB)
- `GET /users` admin → 500 "Can't reach database server at localhost:1433" — expected blocker.
- Regression `GET /categories/abc` admin → 400 ✓
- Regression `GET /suppliers/abc` admin → 400 ✓
- Regression `GET /materials/abc` admin → 400 ✓

Chưa test được vì thiếu SQL Server (sẽ test khi chuyển sang máy có DB):
- Tạo user mới với bcrypt hash thật sự lưu được vào DB.
- List users không có `passwordHash` trong payload.
- Update password → hash lại được.
- Update username trùng → 409.
- Delete user khác → 200.
- Response shape không bao giờ chứa `passwordHash` (đảm bảo `sanitizeUser` đúng).

Lỗi/blocker:
- Expected: tất cả call đụng DB đều fail với "Can't reach database server".
- `prisma:generate` không cần chạy lại (schema không đổi).
- Không có lỗi source.

Bước tiếp theo đề xuất:
1. Phase 3 lần 1: Frontend Login page kết nối `/auth/login`, lưu JWT vào localStorage, tạo `ProtectedRoute` redirect về `/login` nếu chưa có token.
2. Phase 4: setup máy có SQL Server → `npm.cmd run prisma:generate` → `npx prisma db push` → `npm.cmd run seed` → test end-to-end toàn bộ CRUD đã có (categories/suppliers/materials/users) + auth.
3. Hardening tuỳ chọn: rate limit cho `/auth/login`, request id logger, helmet middleware.

---

### 2026-05-14 - Phase 2 lần 4: CRUD `/materials`

Người/agent thực hiện: Claude Code

Đã làm:

**Code mới:**
- `backend/src/controllers/materialController.js`: 5 handler với validation đầy đủ:
  - Helper inline: `isNonEmptyString`, `isNonNegativeInteger`, `isNonNegativeNumber`, `isPositiveInteger`, `normalizeOptionalString`, `isValidHttpUrl` (dùng `new URL(...)`, chỉ accept `http:`/`https:`).
  - Constant `MATERIAL_INCLUDE = { category:{select:{id,name}}, supplier:{select:{id,name}} }` dùng chung.
  - `list`: query `q` (substring `name`/`description`), `categoryId`, `supplierId` (validate qua `parseId`, sai → 400 "Invalid categoryId/supplierId"). Sort `id asc`. Include category + supplier cơ bản.
  - `getOne`: `parseId`, 404 nếu không thấy.
  - `create`: validate theo thứ tự: name (required), categoryId (required + positive int), supplierId (required + positive int), unit (required), quantity (optional, non-negative int), importPrice/sellPrice (optional, non-negative number), description (optional, string/null), imageUrl (optional, string/null, non-empty phải qua `new URL` với `http:`/`https:`). Pre-check FK tồn tại bằng `Promise.all([prisma.category.findUnique, prisma.supplier.findUnique])` — không có → 400 "categoryId/supplierId does not exist". P2003 race → 409 "Invalid categoryId or supplierId".
  - `update`: partial — chỉ validate field gửi lên với rule tương tự. Pre-check FK nếu update categoryId/supplierId. Body trống → 400 "No updatable fields provided". P2025 → 404. P2003 → 409.
  - `remove`: P2025 → 404. Không pre-check (Material là lá, không model nào tham chiếu Material).
  - Quyết định contract: FK không tồn tại → **400** (client data sai, phân biệt với 404 dành cho material id).
- `backend/src/routes/materials.js`: `router.use(authMiddleware)`.
- `backend/src/index.js`: mount `app.use('/api/v1/materials', materialRoutes)`.

**Schema Prisma:**
- Không sửa. `Material` đã có sẵn các trường + FK đến `Category` và `Supplier`.

**Dependencies:**
- Không cài thêm package.

Đã kiểm tra bằng cách nào (16 case, restart backend từ PID 22540):
- `GET /api/v1/health` → 200 ✓
- `GET /materials` không token → 401 missing ✓
- `GET /materials` token sai → 401 invalid ✓
- `POST /materials` không token → 401 missing ✓
- `GET /materials/abc` token hợp lệ → 400 "Invalid material id" ✓
- `GET /materials?categoryId=abc` → 400 "Invalid categoryId" ✓
- `GET /materials?supplierId=abc` → 400 "Invalid supplierId" ✓
- `POST /materials -d '{}'` → 400 "name is required" ✓
- `POST /materials -d '{"name":"Gỗ"}'` → 400 "categoryId is required and must be a positive integer" ✓
- `POST /materials` quantity âm → 400 "quantity must be a non-negative integer" ✓
- `POST /materials` importPrice âm → 400 "importPrice must be a non-negative number" ✓
- `POST /materials` imageUrl "not a url" → 400 "Invalid imageUrl" ✓
- `GET /materials` token hợp lệ → 500 "Can't reach database server at localhost:1433" — expected blocker (đụng `prisma.material.findMany`).
- `PUT /materials/5 -d '{}'` → 400 "No updatable fields provided" ✓
- Regression `GET /categories/abc` → 400 "Invalid category id" ✓
- Regression `GET /suppliers/abc` → 400 "Invalid supplier id" ✓

Chưa test được vì thiếu SQL Server (sẽ test khi chuyển sang máy có DB):
- Tạo material mới với categoryId + supplierId tồn tại → 201 + include category/supplier.
- Tạo material với categoryId không tồn tại → 400 "categoryId does not exist" (pre-check thật sự đụng DB).
- Tạo material với supplierId không tồn tại → 400 "supplierId does not exist".
- List với filter `categoryId=1` thực sự lọc đúng.
- Update partial từng field.
- Delete material → 200.
- Serialization Decimal `importPrice`/`sellPrice` thành chuỗi.

Lỗi/blocker:
- Expected: tất cả call đụng DB đều fail với "Can't reach database server".
- `prisma:generate` không cần chạy lại (schema không đổi).
- Không có lỗi source.

Bước tiếp theo đề xuất:
1. CRUD `/users` (cần hash password khi tạo/update, không trả `passwordHash`; có thể giới hạn cho admin bằng `requireRole('admin')`).
2. Hoặc Phase 3 lần 1: Frontend Login + ProtectedRoute → bắt đầu kết nối UI với API thật.
3. Hoặc Phase 4: setup máy có SQL Server, chạy `prisma db push` + `npm run seed` + test end-to-end các CRUD đã có.

---

### 2026-05-14 - Phase 2 lần 3: CRUD `/suppliers` + tách `parseId` helper

Người/agent thực hiện: Claude Code

Đã làm:

**Code mới:**
- `backend/src/utils/parseId.js`: helper chuẩn hoá parse id thành số nguyên dương. Logic: trim đầu/cuối, parseInt base 10, reject `null`/`undefined`/`<=0`/non-integer/chuỗi không khớp số nguyên thuần (vd "1abc", "1.5", "-1", "abc"). Refactor `categoryController.js` để require helper này thay vì local function — giảm trùng lặp khi sắp viết Materials/Users.
- `backend/src/controllers/supplierController.js`: 5 handler:
  - `list`: query `q` optional → `where.OR` tìm trong 4 trường (`name`, `phone`, `email`, `address`) substring. Sort `id asc`. Trả `{ suppliers: [...] }`.
  - `getOne`: validate id (`parseId`), 404 nếu không thấy. Trả `{ supplier }`.
  - `create`: validate `name` non-empty sau trim (400). `phone`/`email`/`address` optional, trim → null nếu rỗng. Sai type → 400 "<field> must be a string or null". `email` non-empty phải khớp `^[^\s@]+@[^\s@]+\.[^\s@]+$` → 400 "Invalid email format". Trả 201 + `{ supplier }` + "Supplier created".
  - `update`: partial — chỉ update field có gửi. Validate name nếu có (400). Validate email nếu có (regex). Optional field rỗng/null → null. Sai type → 400. Body rỗng/không có field nào hợp lệ → 400 "No updatable fields provided". P2025 → 404. Trả `{ supplier }`.
  - `remove`: validate id. P2025 → 404. P2003 (còn material tham chiếu) → 409 "Cannot delete supplier: it is still referenced by one or more materials".
  - Không trả raw Prisma error cho các nhánh dự đoán được.
  - Helper local `normalizeOptionalString(value)`: `null` → `null`, không phải string → `undefined` (làm signal sai type), trim chuỗi → rỗng thành null.
- `backend/src/routes/suppliers.js`: `router.use(authMiddleware)` chặn mọi route, GET/POST/PUT/DELETE đầy đủ.
- `backend/src/index.js`: import `supplierRoutes`, mount `app.use('/api/v1/suppliers', supplierRoutes)`. Health + auth + categories giữ nguyên.

**Schema Prisma:**
- Không sửa. `Supplier` không có unique constraint trên `name`/`email`. `Material.supplierId` FK đến `Supplier.id` (default NoAction/Restrict) → P2003 fire khi DELETE supplier còn material.

**Dependencies:**
- Không cài thêm package.

Đã kiểm tra bằng cách nào:
- Dừng backend cũ (PID 11148) bằng `Stop-Process -Id 11148 -Force` để giải phóng port 3000.
- `node src/index.js` (background) — server lắng nghe port 3000.
- Sinh JWT hợp lệ bằng `JWT_SECRET` trong `.env`.
- `curl GET /api/v1/health` → 200 ✓
- `curl GET /api/v1/suppliers` không token → 401 "missing token" ✓
- `curl GET /api/v1/suppliers` token sai → 401 "invalid or expired token" ✓
- `curl POST /api/v1/suppliers` không token → 401 "missing token" (auth chạy trước validate) ✓
- `curl GET /api/v1/suppliers/abc` (token hợp lệ) → 400 "Invalid supplier id" ✓
- `curl POST /api/v1/suppliers -d '{"name":"   "}'` (token hợp lệ) → 400 "name is required" ✓
- `curl POST /api/v1/suppliers -d '{"name":"NCC A","email":"not-an-email"}'` (token hợp lệ) → 400 "Invalid email format" ✓
- `curl GET /api/v1/suppliers` (token hợp lệ) → 500 "Can't reach database server at localhost:1433" — expected blocker.
- `curl PUT /api/v1/suppliers/5 -d '{}'` (token hợp lệ) → 400 "No updatable fields provided" ✓
- Regression test: `curl GET /api/v1/categories/abc` (token hợp lệ) → 400 "Invalid category id" ✓ — parseId refactor không vỡ.

Chưa test được vì thiếu SQL Server (sẽ test khi chuyển sang máy có DB):
- Tạo supplier mới, liệt kê, tìm theo `q`, lấy theo id, update partial, delete.
- Delete supplier còn material → 409 (cần seed material).
- Sort `id asc` nhất quán.
- Email hợp lệ thực sự lưu được vào DB.

Lỗi/blocker:
- Expected: tất cả call đụng DB đều fail với "Can't reach database server" — không thể test thật trên máy này.
- `prisma:generate` không cần chạy lại lần này (không đổi schema).
- Không có lỗi source.

Bước tiếp theo đề xuất:
1. CRUD `/materials` (phức tạp nhất — có FK đến Category và Supplier, validate category/supplier tồn tại, các trường số `quantity`/`importPrice`/`sellPrice`).
2. Hoặc CRUD `/users` (cần hash password khi tạo/update, không trả `passwordHash`, có thể giới hạn cho role admin bằng `requireRole`).
3. Hoặc Phase 3 lần 1: Frontend Login + ProtectedRoute.
4. Khi chuyển sang máy có SQL Server: `npm.cmd run prisma:generate` → `npx prisma db push` → `npm.cmd run seed` → test CRUD `/categories`, `/suppliers` end-to-end.

---

### 2026-05-14 - Phase 2 lần 2: CRUD `/categories` + errorHandler hardening

Người/agent thực hiện: Claude Code

Đã làm:

**Code mới:**
- `backend/src/controllers/categoryController.js`: 5 handler (`list`, `getOne`, `create`, `update`, `remove`):
  - `list`: query `q` optional → `where.OR = [{name contains q}, {description contains q}]`. Sort `id asc`. Trả `{ categories: [...] }`.
  - `getOne`: validate id là số nguyên dương (helper `parseId`) → 400 nếu sai. 404 nếu không thấy. Trả `{ category }`.
  - `create`: validate `name` non-empty sau trim (400 nếu thiếu). `description` optional, trim → null nếu rỗng. P2002 (trùng unique name) → 409 "Category name already exists". 201 + `{ category }`.
  - `update`: partial — chỉ update field gửi lên. Validate name nếu có (400), description chấp nhận string hoặc null. Body trống → 400. P2025 → 404. P2002 → 409. Trả `{ category }`.
  - `remove`: validate id. P2025 → 404. P2003 (còn Material tham chiếu) → 409 "Cannot delete category: it is still referenced by one or more materials". OK → `{}` + "Category deleted".
  - Helper `parseId(raw)`: chỉ chấp nhận số nguyên dương khớp chính xác (loại bỏ "1abc", " 1 ", "-1", "1.5", "abc").
- `backend/src/routes/categories.js`: tất cả route đều dùng `router.use(authMiddleware)` ngay từ đầu → mọi request không token / token sai đều bị chặn 401 trước khi đụng controller.
- `backend/src/index.js`: thêm `const categoryRoutes = require('./routes/categories')` và `app.use('/api/v1/categories', categoryRoutes)`. Health + auth route giữ nguyên.

**Hardening errorHandler:**
- `backend/src/middlewares/errorHandler.js`: với 5xx, ở production trả "Internal Server Error" (không leak path/Prisma detail), ở dev vẫn trả `err.message` kèm `console.error(err)` để debug. Với 4xx trả message gốc (đã controll bởi controller). Giữ nguyên format `{ success, message, data }`.

**Schema Prisma:**
- Không sửa. `Category.name` đã `@unique`, `Material.categoryId` đã FK đến `Category.id` (default NoAction/Restrict) → P2003 sẽ fire khi DELETE category còn material.

**Dependencies:**
- Không cài thêm package.

Đã kiểm tra bằng cách nào:
- `node src/index.js` (background) — server lắng nghe port 3000 (sau khi `Stop-Process` PID 27572 — backend cũ từ phiên trước).
- `curl GET /api/v1/health` → `{"success":true,"message":"OK","data":{}}` HTTP 200. ✓
- `curl GET /api/v1/categories` (không token) → 401 `"Unauthorized: missing token"`. ✓
- `curl GET /api/v1/categories -H "Authorization: Bearer this.is.bad"` → 401 `"Unauthorized: invalid or expired token"`. ✓
- `curl POST /api/v1/categories -d '{"name":"Gỗ"}'` (không token) → 401 missing token (auth middleware chạy trước validate body). ✓
- `curl GET /api/v1/categories/abc` (không token) → 401 missing token (auth chặn trước parseId). ✓
- Sinh JWT hợp lệ bằng `JWT_SECRET` trong `.env`, gọi `GET /categories` → 500 `"Can't reach database server at localhost:1433"`. Đây là expected blocker — auth pass, đụng Prisma, không có SQL Server. Không phải lỗi source.

Chưa test được vì thiếu SQL Server (sẽ test khi chuyển sang máy có DB):
- Tạo category mới, liệt kê, tìm theo `q`, lấy theo id, update partial, delete.
- Trùng name → 409.
- Delete category còn material → 409 (cần seed material để test).
- Sort `id asc` nhất quán.

Lỗi/blocker:
- Expected: tất cả call đụng DB đều fail với "Can't reach database server" — không thể test thật trên máy này.
- `prisma:generate` không cần chạy lại lần này (không đổi schema).
- Không có lỗi source.

Bước tiếp theo đề xuất:
1. CRUD `/suppliers` (cấu trúc tương tự, không cần unique trên `name`).
2. CRUD `/materials` (phức tạp hơn — có FK đến Category và Supplier, cần validate).
3. Hoặc Phase 3 lần 1: Frontend Login + ProtectedRoute để có thể demo flow auth thật.
4. Khi chuyển sang máy có SQL Server: `npm.cmd run prisma:generate` → `npx prisma db push` → `npm.cmd run seed` → test CRUD `/categories` end-to-end.

---

### 2026-05-14 - Phase 2 lần 1: Auth API + JWT middleware + Seed

Người/agent thực hiện: Claude Code

Đã làm:

**Dependencies:**
- `npm install bcryptjs jsonwebtoken` — added 14 packages, 0 vulnerabilities. Cập nhật `backend/package.json` đã có `bcryptjs ^3.0.3`, `jsonwebtoken ^9.0.3`.

**Code mới:**
- `backend/src/utils/response.js`: helper `success(res, data, message, status)` và `fail(res, message, status, data)` — chuẩn hoá response `{ success, message, data }`.
- `backend/src/middlewares/authMiddleware.js`:
  - Đọc header `Authorization: Bearer <token>`.
  - Thiếu/sai format token → 401 "missing token".
  - JWT verify bằng `process.env.JWT_SECRET`.
  - `JWT_SECRET` không set → 500 "Server misconfigured".
  - Token sai/hết hạn → 401 "invalid or expired token".
  - OK → `req.user = payload`, `next()`.
  - Bonus: export `requireRole(...roles)` để dùng cho phân quyền sau.
- `backend/src/controllers/authController.js`:
  - `login(req,res,next)`: validate username/password (400 nếu thiếu), `prisma.user.findUnique({where:{username}})`, `bcrypt.compare` với `passwordHash`. Sai user hoặc sai password đều trả 401 cùng message "Invalid username or password" (không lộ trường nào sai). OK → `jwt.sign({id,username,role}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN || '7d'})`. Response data: `{ token, user: { id, fullName, username, role } }` — không bao giờ trả `passwordHash`.
  - `me(req,res,next)`: dùng `req.user.id` (từ authMiddleware) → `prisma.user.findUnique({ select: { id, fullName, username, role } })`.
- `backend/src/routes/auth.js`: `POST /login` → `login`; `GET /me` → `authMiddleware, me`.
- `backend/src/index.js`: mount `app.use('/api/v1/auth', authRoutes)`. Health vẫn ở `/api/v1/health`.

**Seed:**
- `backend/prisma/seed.js`: idempotent — nếu user `admin` đã tồn tại thì skip; nếu chưa, hash `123456` bằng bcrypt (cost 10) rồi `prisma.user.create({...fullName:'Administrator', role:'admin'})`. In log rõ ràng và `prisma.$disconnect()` ở finally.
- Thêm `"seed": "node prisma/seed.js"` vào `backend/package.json`.

**Schema Prisma:**
- Không sửa schema. User model hiện có (`username unique`, `passwordHash`, `role`, `fullName`) đã đủ cho auth.

Đã kiểm tra bằng cách nào:
- `cd backend && npm install bcryptjs jsonwebtoken` — OK.
- `npm run prisma:generate` — **FAIL với EPERM** trên Windows do file `query_engine-windows.dll.node` bị một Node process khác hold (có thể là backend cũ từ phiên trước, hoặc TS server). Schema không đổi nên Prisma client từ Phase 1 vẫn đúng. Đã xoá các file `.tmp*` rác trong `node_modules\.prisma\client`. Server start bình thường, route auth chạy bình thường. Đây là vấn đề môi trường Windows, không phải lỗi source — đã ghi vào RUNBOOK.
- Phát hiện port 3000 đã bị 1 backend cũ từ phiên trước chiếm (PID 23884) → `Stop-Process -Id 23884 -Force` để giải phóng port.
- `npm start` → server lắng nghe port 3000.
- `curl GET http://localhost:3000/api/v1/health` → `{"success":true,"message":"OK","data":{}}` HTTP 200. ✓
- `curl POST /api/v1/auth/login -d '{}'` → 400 `"username and password are required"`. ✓
- `curl POST /api/v1/auth/login -d '{"username":"x"}'` → 400 `"username and password are required"`. ✓
- `curl GET /api/v1/auth/me` (no header) → 401 `"Unauthorized: missing token"`. ✓
- `curl GET /api/v1/auth/me -H "Authorization: Bearer abc.def.ghi"` → 401 `"Unauthorized: invalid or expired token"`. ✓
- `curl POST /api/v1/auth/login -d '{"username":"admin","password":"123456"}'` → 500 với message Prisma `"Can't reach database server at localhost:1433"`. Đây là expected blocker do máy hiện tại chưa cài SQL Server — không phải lỗi source.

Chưa test được vì thiếu SQL Server (sẽ test trên máy có DB):
- Login thành công với admin thật → 200 + token.
- `GET /auth/me` với token thật → trả thông tin user.
- Seed script (`npm run seed`) tạo admin lần đầu, và idempotent ở lần thứ hai.
- JWT_EXPIRES_IN có hoạt động đúng theo cấu hình `.env` không.

Lỗi/blocker:
- Expected: không thể test luồng auth có truy DB nếu không có SQL Server (đã ghi rõ ở trên).
- Environment: `npm run prisma:generate` EPERM trên Windows. Workaround: đóng các Node process đang hold `query_engine-windows.dll.node` (nodemon cũ, TS server,…) rồi chạy lại; hoặc bỏ qua khi schema không đổi.
- Note: errorHandler hiện tại trả nguyên message lỗi của Prisma (bao gồm path file). Đủ tốt cho dev nhưng nên sanitize ở Phase sau trước khi production.

Bước tiếp theo đề xuất:
1. Phase 2 lần 2: CRUD `/categories` (đơn giản nhất, đủ để test luồng auth-protected route + frontend table sau này).
2. Hoặc Phase 3 lần 1: Frontend Login page kết nối `/auth/login`, lưu JWT vào localStorage, tạo `ProtectedRoute` redirect về `/login` nếu chưa có token.
3. Khi chuyển sang máy có SQL Server: `npm.cmd run prisma:generate` → `npx prisma db push` → `npm.cmd run seed` → test `POST /auth/login admin/123456`.

---

### 2026-05-14 - Phase 1 lần 2: Sửa nhỏ + Setup Frontend React + Vite + Tailwind

Người/agent thực hiện: Claude Code

Đã làm:

**Phần A - Sửa nhỏ:**
- Sửa `.env.example` ở root: đổi `PORT=5000` → `PORT=3000`, đổi `VITE_API_BASE_URL=http://localhost:5000/api/v1` → `http://localhost:3000/api/v1`.
- Tạo `.gitignore` ở root, bỏ qua: `node_modules`, `.env`, `backend/.env`, `frontend/.env`, `dist`, `build`, `.DS_Store`, `Thumbs.db`, `.vscode`, `.idea`, `*.log`.
- Cập nhật `docs/RUNBOOK.md`: thêm mục "Lưu ý Windows PowerShell" về Execution Policy và `npm.cmd`, thêm ví dụ lệnh dùng `npm.cmd` cho backend/frontend.
- Không xóa `backend/package-lock.json`, không xóa source backend cũ.

**Phần B - Frontend:**
- Tạo `frontend/package.json` với dependencies:
  - react ^18.3.1, react-dom ^18.3.1
  - axios ^1.7.7, react-router-dom ^6.27.0
  - devDependencies: vite ^5.4.10, @vitejs/plugin-react ^4.3.3, tailwindcss ^3.4.14, postcss ^8.4.47, autoprefixer ^10.4.20
  - Scripts: `dev`, `build`, `preview`
- Tạo `frontend/vite.config.js` (plugin react, port 5173).
- Cấu hình Tailwind: `frontend/tailwind.config.js` (content scan `index.html`, `src/**/*.{js,jsx,ts,tsx}`, theme extend màu `brand`), `frontend/postcss.config.js` (tailwindcss + autoprefixer).
- Tạo `frontend/index.html`, `frontend/src/main.jsx` (mount React + BrowserRouter), `frontend/src/styles/index.css` (Tailwind base/components/utilities).
- Tạo cấu trúc: `frontend/src/pages`, `frontend/src/components`, `frontend/src/layouts`, `frontend/src/services`, `frontend/src/hooks`.
- Tạo `frontend/src/services/api.js`:
  - Dùng `import.meta.env.VITE_API_BASE_URL`, không hardcode URL.
  - Axios instance với interceptor request (gắn Bearer token từ localStorage nếu có) và interceptor response (passthrough lỗi).
- Tạo React Router (`App.jsx`) với routes:
  - `/login` (đứng riêng, không dùng DashboardLayout)
  - `/` redirect → `/dashboard`
  - `/dashboard`, `/materials`, `/categories`, `/suppliers`, `/users` (trong DashboardLayout)
  - `*` → NotFound
- Tạo `layouts/DashboardLayout.jsx`: Sidebar trái + Header trên + main `<Outlet/>` bên phải, full-height, có overflow.
- Tạo `components/Sidebar.jsx` với link: Dashboard, Vật tư, Loại vật tư, Nhà cung cấp, Nhân sự (dùng `NavLink`, active state).
- Tạo `components/Header.jsx`, `components/PagePlaceholder.jsx`.
- Tạo các page placeholder: `Login.jsx`, `Dashboard.jsx` (có 4 thẻ stat trống), `Materials.jsx`, `Categories.jsx`, `Suppliers.jsx`, `Users.jsx`, `NotFound.jsx`.
- Tạo `frontend/.env` và `frontend/.env.example` (chỉ có `VITE_API_BASE_URL=http://localhost:3000/api/v1`).

**Phần C - Kiểm tra:**
- Chạy `npm install` trong `frontend/` (PowerShell, dùng `npm`): added 155 packages, không có lỗi.
- Chạy `npm run dev` (background): Vite v5.4.21 ready trên `http://localhost:5173/` sau ~321ms.
- `curl http://localhost:5173/` → HTTP 200.
- `curl http://localhost:5173/src/main.jsx` → trả về JSX đã transform (React, BrowserRouter, App).
- `curl http://localhost:5173/src/styles/index.css` → trả về CSS đã có Tailwind preflight + utility classes + custom brand-* được generate đúng.
- Backend không chạy đồng thời lần này, nhưng đã verify ở phiên trước.

Chưa làm:
- Auth JWT, CRUD APIs cho Materials/Categories/Suppliers/Users.
- Kết nối page frontend với API thật.
- Kết nối SQL Server thật (`prisma db push`).

Đã kiểm tra bằng cách nào:
- `npm install` qua Bash tool (Git Bash trên Windows) — thành công, không có lỗi.
- `npm run dev` background, đọc log → thấy `VITE v5.4.21 ready in 321ms` và `http://localhost:5173/`.
- `curl` HTTP 200 cho root, `src/main.jsx` (JS đã transform), `src/styles/index.css` (Tailwind đã build) — xác nhận pipeline Vite + React + Tailwind hoạt động.

Lỗi/blocker:
- Không có blocker. `npm audit` báo 2 moderate severity vulnerabilities (transitive), chưa fix vì có thể là breaking change; sẽ xem lại sau khi cần.

Bước tiếp theo:
- Phase 2 lần 1: Viết Auth API (POST `/auth/login`, bcrypt, JWT) + middleware xác thực.
- Hoặc: làm CRUD `/categories` trước vì đơn giản nhất, tiện test luồng API + frontend table.

---

### 2026-05-14 - Phase 1 lần 1: Setup Backend

Người/agent thực hiện: Claude Code

Đã làm:
- Tạo `backend/package.json` với scripts: `dev`, `start`, `prisma:generate`.
- Cài dependencies: express, cors, dotenv, @prisma/client.
- Cài devDependencies: prisma, nodemon.
- Tạo cấu trúc thư mục backend: `src/config`, `src/controllers`, `src/routes`, `src/middlewares`, `src/lib`, `prisma/`.
- Tạo `backend/prisma/schema.prisma` dùng provider `sqlserver`, đọc `DATABASE_URL` từ env, gồm 4 model: User, Category, Supplier, Material (theo docs/DB_SCHEMA.md).
- Tạo `backend/src/config/prisma.js` (Prisma client singleton, export để dùng sau này khi có CRUD).
- Tạo `backend/src/routes/health.js` — route `GET /health`, trả JSON `{success, message, data}`.
- Tạo `backend/src/middlewares/errorHandler.js` — middleware xử lý lỗi cơ bản.
- Tạo `backend/src/index.js` — Express app, mount `/api/v1`, dùng port từ `process.env.PORT`.
- Tạo `backend/.env.example`.
- Tạo `backend/.env` cho môi trường dev (DATABASE_URL placeholder, chưa có SQL Server thật).
- Chạy `npm install` — OK, 106 packages.
- Chạy `npm run prisma:generate` — OK, Prisma client v5.22.0 generated.
- Chạy `npm run dev` — server khởi động trên port 3000.
- Gọi `GET http://localhost:3000/api/v1/health` — trả `{"success":true,"message":"OK","data":{}}` đúng format.

Chưa làm:
- Frontend React.
- Auth JWT.
- CRUD cho Materials, Categories, Suppliers, Users.
- Kết nối SQL Server thật (`prisma db push` / `prisma migrate`).

Đã kiểm tra bằng cách nào:
- Chạy `npm install` và `npm run prisma:generate` qua PowerShell — đều thành công, không có lỗi.
- Chạy `npm run dev`, dùng `Invoke-RestMethod` gọi `GET /api/v1/health` — nhận response đúng format.

Lỗi/blocker:
- Không có. Backend chạy bình thường mà không cần SQL Server.

Bước tiếp theo:
- Phase 1 lần 2: Tạo frontend React + Vite.
- Hoặc Phase 2 lần 1: Viết Auth API (POST /auth/login, bcrypt, JWT).

---

### 2026-05-14 - Tạo file theo dõi tiến độ

Người/agent thực hiện: Codex

Đã làm:
- Tạo `docs/PROGRESS.md`.
- Cập nhật `CLAUDE.md` để Claude Code phải đọc và cập nhật `docs/PROGRESS.md`.
- Cập nhật `AGENTS.md` để Codex phải đọc và cập nhật `docs/PROGRESS.md`.
- Cập nhật `README.md`, `docs/CURRENT_STATE.md`, `docs/TASKS.md`.

Chưa làm:
- Chưa tạo backend Express.
- Chưa tạo frontend React.
- Chưa tạo Prisma schema.
- Chưa kiểm thử kết nối SQL Server thật.

Đã kiểm tra:
- Xác nhận trước đó repo chưa có `docs/PROGRESS.md`.

Blocker:
- Không có blocker.

Bước tiếp theo:
- Thực hiện Phase 1 lần 1: setup backend Express + Prisma schema SQL Server, chưa cần kết nối SQL Server thật.
