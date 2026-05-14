# Technical Decisions

- Database chính dùng SQL Server.
- Backend truy cập database qua Prisma.
- Máy đang code không bắt buộc phải cài SQL Server.
- Thông tin kết nối database luôn đặt trong biến môi trường `DATABASE_URL`.
- Không hardcode server, user, password database trong source code.
- Backend dùng Express.js.
- Frontend dùng ReactJS + Vite.
- Auth dùng JWT.
- API version là `/api/v1`.
- Backend và frontend tách thư mục riêng.
- Response API thống nhất dạng:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```
