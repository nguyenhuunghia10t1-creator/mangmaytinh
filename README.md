# Website Quản Lý Vật Tư Nội Thất

Ứng dụng quản lý vật tư nội thất gồm backend REST API và frontend React.

## Stack

- Backend: Node.js, Express, SQL Server, Prisma, JWT
- Frontend: ReactJS, Axios, React Router, Tailwind CSS
- API base URL: `/api/v1`

## Database Strategy

Dự án dùng SQL Server làm database chính, nhưng máy đang code không bắt buộc phải cài SQL Server.

Source code sẽ dùng biến môi trường `DATABASE_URL`. Khi chuyển sang máy có SQL Server, chỉ cần tạo database, điền `.env`, chạy Prisma và khởi động backend/frontend.

## Chức năng dự kiến

- Đăng nhập
- Quản lý vật tư
- Quản lý loại vật tư
- Quản lý nhà cung cấp
- Quản lý nhân sự/người dùng
- Tìm kiếm, lọc và thao tác CRUD cơ bản

## Tài liệu dự án

Trước khi code, đọc các file trong `docs/`, đặc biệt:

- `docs/PROJECT_BRIEF.md`
- `docs/CURRENT_STATE.md`
- `docs/PROGRESS.md`
- `docs/TASKS.md`
- `docs/DECISIONS.md`
- `docs/API_SPEC.md`
- `docs/DB_SCHEMA.md`
- `docs/UI_SPEC.md`
- `docs/RUNBOOK.md`

## Chạy dự án

Xem hướng dẫn trong `docs/RUNBOOK.md`.
