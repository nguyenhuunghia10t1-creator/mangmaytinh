# Frontend Rules

Chỉ áp dụng cho frontend.

Structure:
- src/pages
- src/components
- src/layouts
- src/services
- src/hooks

Rules:
- Gọi API qua src/services/api.js.
- Không hardcode API URL trong component.
- Có loading, error, confirm delete.
- Component nhỏ, dễ tái sử dụng.
- Dùng React Router cho điều hướng.
- Dùng Tailwind CSS cho style.
- Nếu đổi màn hình hoặc flow, cập nhật `../docs/UI_SPEC.md`.
