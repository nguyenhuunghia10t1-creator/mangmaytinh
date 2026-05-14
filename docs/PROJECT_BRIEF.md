# Project Brief

Tên đề tài: Website quản lý vật tư nội thất.

Yêu cầu:
- Backend API bằng Node.js
- Frontend ReactJS gọi API
- Database chính dùng SQL Server
- ORM dùng Prisma để backend kết nối database
- RESTful API hỗ trợ GET, POST, PUT, DELETE
- Quản lý vật tư, loại vật tư, nhà cung cấp, nhân sự
- Có đăng nhập, phân quyền cơ bản

Ràng buộc môi trường:
- Máy đang code không bắt buộc phải cài SQL Server.
- Backend phải đọc kết nối database từ `DATABASE_URL`.
- Database thật có thể được cấu hình và kiểm thử trên máy khác có SQL Server.

Mục tiêu demo:
- Đăng nhập
- Xem danh sách vật tư
- Thêm, sửa, xóa vật tư
- Tìm kiếm, lọc vật tư
- Test API bằng Postman
