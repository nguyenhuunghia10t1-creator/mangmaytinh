# Project Instructions

Đây là website quản lý vật tư nội thất.

Stack:
- Backend: Node.js, Express, SQL Server, Prisma, JWT
- Frontend: ReactJS, Axios, React Router, Tailwind CSS
- API: RESTful CRUD, base URL /api/v1

Lưu ý môi trường:
- Máy đang code không bắt buộc phải cài SQL Server.
- Luôn viết backend theo biến môi trường DATABASE_URL.
- SQL Server thật có thể chạy trên máy khác khi demo hoặc kiểm thử cuối.
- Không hardcode thông tin kết nối database trong source code.

Luôn đọc các file sau trước khi code:
- docs/PROJECT_BRIEF.md
- docs/CURRENT_STATE.md
- docs/PROGRESS.md
- docs/TASKS.md
- docs/DECISIONS.md
- docs/API_SPEC.md
- docs/DB_SCHEMA.md
- docs/UI_SPEC.md
- docs/RUNBOOK.md

Quy tắc:
- Không tự đổi stack.
- Database chính của dự án là SQL Server, truy cập qua Prisma.
- Không xóa code cũ nếu chưa chắc.
- Không tạo file trùng chức năng.
- Sau mỗi lần code, cập nhật CURRENT_STATE.md, PROGRESS.md và TASKS.md.
- PROGRESS.md dùng để ghi rõ phiên vừa làm gì, còn gì chưa làm, đã kiểm tra bằng cách nào, và bước tiếp theo là gì.
- Nếu đổi API, cập nhật API_SPEC.md.
- Nếu đổi database, cập nhật DB_SCHEMA.md.
- Nếu đổi giao diện hoặc luồng màn hình, cập nhật UI_SPEC.md.
- Nếu đổi cách chạy dự án, cập nhật RUNBOOK.md.
