# Database Schema

Database chính: SQL Server.

ORM: Prisma.

Máy đang code không bắt buộc phải cài SQL Server. Schema này dùng để viết Prisma schema và tạo bảng khi chuyển sang máy có SQL Server.

## Users

- id: int, primary key, identity
- fullName: nvarchar(100), required
- username: nvarchar(50), required, unique
- passwordHash: nvarchar(255), required
- role: admin | staff
- createdAt: datetime2
- updatedAt: datetime2

## Categories

- id: int, primary key, identity
- name: nvarchar(100), required, unique
- description: nvarchar(255), optional
- createdAt: datetime2
- updatedAt: datetime2

## Suppliers

- id: int, primary key, identity
- name: nvarchar(150), required
- phone: nvarchar(20), optional
- email: nvarchar(100), optional
- address: nvarchar(255), optional
- createdAt: datetime2
- updatedAt: datetime2

## Materials

- id: int, primary key, identity
- name: nvarchar(150), required
- categoryId: int, foreign key to Categories.id
- supplierId: int, foreign key to Suppliers.id
- quantity: int, default 0
- unit: nvarchar(50), required
- importPrice: decimal(18,2), default 0
- sellPrice: decimal(18,2), default 0
- description: nvarchar(500), optional
- imageUrl: nvarchar(255), optional
- createdAt: datetime2
- updatedAt: datetime2

## Relations

- Materials.categoryId -> Categories.id
- Materials.supplierId -> Suppliers.id
