# Backend Rules

Chỉ áp dụng cho backend.

Structure:
- src/config
- src/models
- src/controllers
- src/routes
- src/middlewares
- prisma

Rules:
- Không viết CRUD trong server.js.
- Mỗi resource có model, controller, route riêng.
- Dùng async/await.
- Validate input.
- API trả JSON thống nhất.
- Không hardcode secret hoặc chuỗi kết nối database.
- Database chính là SQL Server.
- Dùng Prisma để truy cập database.
- Đọc chuỗi kết nối từ `DATABASE_URL`.
- Máy đang code có thể chưa cài SQL Server, nên tách rõ code và cấu hình runtime.
- Nếu đổi API, cập nhật `../docs/API_SPEC.md`.
- Nếu đổi database schema, cập nhật `../docs/DB_SCHEMA.md`.
