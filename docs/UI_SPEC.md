# UI Spec

## Pages
- Login (đứng riêng, không có sidebar)
- Dashboard
- Materials List
- Create Material
- Edit Material
- Categories
- Suppliers
- Users
- NotFound (404)

## Layout chung (DashboardLayout)
- Sidebar bên trái (cố định, width 15rem, nền `slate-900`).
- Header phía trên (height 4rem, nền trắng, hiển thị tiêu đề + avatar).
- Nội dung chính bên phải, có scroll riêng, padding 1.5rem, nền `slate-100`.

## Sidebar
Các link điều hướng (dùng `NavLink` của react-router-dom, active state highlight bằng `bg-brand-600`):
- Dashboard → `/dashboard`
- Vật tư → `/materials`
- Loại vật tư → `/categories`
- Nhà cung cấp → `/suppliers`
- Nhân sự → `/users`

## Phase 3 - Dashboard số liệu thật (đã có)
- Trang `/dashboard` (`frontend/src/pages/Dashboard.jsx`) hiển thị số liệu thật bằng cách gọi các service list hiện có rồi đếm `.length`.
- Các thẻ số liệu:
  - Vật tư: `listMaterials()`.
  - Loại vật tư: `listCategories()`.
  - Nhà cung cấp: `listSuppliers()`.
  - Nhân sự: `listUsers()` chỉ khi user hiện tại có role `admin`; user không phải admin thấy `—`.
- Có nút "Tải lại", loading state, error state từng thẻ, và cảnh báo nếu một phần số liệu chưa tải được.
- Không cần backend endpoint dashboard riêng trong phiên bản hiện tại.

## Phase 1 (skeleton ban đầu)
- Đã có DashboardLayout, Sidebar, Header, các page placeholder dùng component `PagePlaceholder`.
- Dashboard ban đầu hiển thị 4 thẻ stat trống (`—`); Phase 3 đã thay bằng số liệu thật.
- Login ban đầu là placeholder; Phase 3 đã thay bằng login thật.
- Các trang CRUD ban đầu là placeholder; Phase 3 đã thay Categories, Suppliers, Materials, Users bằng UI thật.

## Phase 3 lần 2 - Categories CRUD UI (đã có)
- Trang `/categories` (`frontend/src/pages/Categories.jsx`) là CRUD UI thật sự — không còn placeholder.
- API gọi qua `frontend/src/services/categoryService.js` (`listCategories(q)`, `createCategory`, `updateCategory`, `deleteCategory`). Service trả về phần `data.categories` / `data.category` đã unwrap; component không phải động vào shape `{success,message,data}`.
- Layout trang:
  - **Header trang**: tiêu đề "Loại vật tư" + mô tả ngắn + nút "+ Thêm loại vật tư" (mở modal create).
  - **Thanh tìm kiếm**: ô input + nút "Tìm" submit-on-Enter/click → set `activeQuery` → effect fetch lại. Khi có `activeQuery` thì hiện nút "Xoá lọc".
  - **Error banner** (đỏ, `role="alert"`) hiển thị khi GET fail.
  - **Bảng** 5 cột: ID, Tên, Mô tả (— nếu null), Cập nhật (định dạng `toLocaleString('vi-VN')`), Thao tác. Hai nút mỗi dòng: "Sửa" (mở modal edit) và "Xoá" (mở confirm modal).
  - **Loading row**: "Đang tải…" khi đang fetch.
  - **Empty state**: nếu không có `activeQuery` → "Chưa có loại vật tư nào. Bấm 'Thêm loại vật tư' để tạo mới." Nếu có `activeQuery` → "Không có loại vật tư khớp với '<query>'.".
- **Form modal** (create/edit):
  - Overlay `bg-slate-900/40`, modal trắng `max-w-md`.
  - Fields: `name` (required, dấu `*`), `description` (textarea optional, 3 dòng). Trim trước khi gửi; description trống → `null`.
  - Validate client-side: name không được rỗng sau trim.
  - Lỗi từ API hiển thị banner đỏ trong modal (`err.response.data.message` từ backend).
  - Nút "Huỷ" + nút submit ("Tạo mới" / "Lưu thay đổi"). Khi submitting: disable cả 2 nút, đổi text submit thành "Đang lưu…".
  - Submit thành công → đóng modal + refetch danh sách với `activeQuery` hiện tại.
- **Confirm delete modal**:
  - Hỏi "Bạn có chắc muốn xoá loại vật tư <tên>?".
  - Nút "Huỷ" + "Xoá" (nền đỏ). Khi đang xoá: disable cả 2, đổi text "Đang xoá…".
  - Lỗi từ API hiển thị banner đỏ ngay trong modal (vd. 409 khi category còn material tham chiếu).
  - Xoá thành công → đóng modal + refetch.

## Phase 3 lần 3 - Suppliers CRUD UI (đã có)
- Trang `/suppliers` (`frontend/src/pages/Suppliers.jsx`) là CRUD UI thật, gọi API qua `frontend/src/services/supplierService.js`.
- Layout giống Categories: header trang, search `q`, error banner, bảng, modal create/edit, confirm delete modal.
- Bảng có các cột: ID, Tên, SĐT, Email, Địa chỉ, Cập nhật, Thao tác.
- Form fields: `name` required, `phone` optional, `email` optional có validate email cơ bản, `address` optional.
- Delete error như 409 supplier còn material tham chiếu hiển thị trong confirm modal.

## Phase 3 lần 4 - Materials CRUD UI (đã có)
- Trang `/materials` (`frontend/src/pages/Materials.jsx`) là CRUD UI thật, gọi API qua `frontend/src/services/materialService.js`.
- Bộ lọc gồm `q`, `categoryId`, `supplierId`. Dropdown Category/Supplier lấy từ `categoryService.js` và `supplierService.js`.
- Bảng có các cột: ID, Tên, Loại, Nhà cung cấp, SL, Đơn vị, Giá nhập, Giá bán, Cập nhật, Thao tác.
- Form create/edit fields: `name`, `categoryId`, `supplierId`, `quantity`, `unit`, `importPrice`, `sellPrice`, `description`, `imageUrl`.
- Validate client-side: required fields, quantity là số nguyên không âm, import/sell price là số không âm, imageUrl nếu nhập phải là URL `http/https`.
- Có loading/empty/error state, confirm delete và error banner riêng trong modal.

## Phase 3 lần 5 - Users CRUD UI (đã có)
- Trang `/users` (`frontend/src/pages/Users.jsx`) là CRUD UI thật, gọi API qua `frontend/src/services/userService.js`.
- Route backend yêu cầu admin; frontend nếu biết user hiện tại không phải `admin` sẽ hiển thị cảnh báo quyền và không gọi API list.
- Bảng có các cột: ID, Họ tên, Username, Vai trò, Cập nhật, Thao tác.
- Form create fields: `fullName`, `username`, `password`, `role`; password phải >= 6 ký tự.
- Form edit fields: `fullName`, `username`, `password` optional, `role`.
- Không hiển thị hoặc xử lý `passwordHash` ở frontend. Nút xoá tài khoản đang đăng nhập bị disable.
- `services/api.js` có xử lý 401 toàn cục: xoá token/user và chuyển về `/login`, trừ lỗi từ `/auth/login`.

## Phase 3 lần 1 - Auth ở frontend (đã có)
- `AuthContext` (`frontend/src/contexts/AuthContext.jsx`) giữ `token` + `user`, đồng bộ với `localStorage` (key `token` và `user`). Expose `login({username, password})`, `logout()`, `isAuthenticated`.
- `AuthProvider` bọc toàn bộ `<App />` trong `main.jsx`.
- `ProtectedRoute` (`frontend/src/components/ProtectedRoute.jsx`): nếu chưa đăng nhập → `<Navigate to="/login" state={{from: location}} replace />`. Sau khi login sẽ quay về đúng `from.pathname`.
- `PublicRoute` (`frontend/src/components/PublicRoute.jsx`): nếu đã có token mà vào `/login` → redirect `/dashboard`.
- Route `/login` được bọc `<PublicRoute>`; tất cả route trong `DashboardLayout` được bọc `<ProtectedRoute>` ở cấp layout (không cần bọc từng route con).
- `Login` page:
  - State controlled: `username`, `password`, `error`, `loading`.
  - Validate trống ở client trước khi gọi API.
  - Gọi `api.post('/auth/login', ...)` qua `services/api.js` (không hardcode URL).
  - Lỗi: ưu tiên `err.response.data.message`; fallback `err.message`; cuối cùng "Đăng nhập thất bại".
  - Loading khi đang gọi API, input + button disabled, button đổi text "Đang đăng nhập…".
  - Thành công → lưu `token`/`user` vào localStorage qua context → `navigate(redirectTo)` (mặc định `/dashboard`, hoặc `from.pathname` nếu bị bật ra từ ProtectedRoute).
- `Header`:
  - Hiển thị `user.fullName || user.username`, badge `user.role`, avatar (chữ cái đầu).
  - Button "Đăng xuất" → `logout()` rồi `navigate('/login', { replace: true })`.

## Mỗi trang CRUD (Phase 3) cần có
- Bảng danh sách
- Nút thêm
- Nút sửa
- Nút xóa
- Confirm trước khi xóa
- Loading và error message

## Style
- Dùng Tailwind CSS.
- Màu chính (brand): `#3b6dff` (500), `#2954e6` (600), `#1f43b8` (700).
- Font: Segoe UI / system-ui.
- Style admin dashboard nội bộ, không làm landing page.
