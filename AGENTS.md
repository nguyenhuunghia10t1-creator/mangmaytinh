# Agent Instructions

Read this file before making changes.

Project: Website quản lý vật tư nội thất.

Stack:
- Backend: Node.js, Express, SQL Server, Prisma, JWT
- Frontend: ReactJS, Axios, React Router, Tailwind CSS
- API: RESTful CRUD, base URL /api/v1

Environment direction:
- This machine may not have SQL Server installed.
- Code must use DATABASE_URL from `.env`.
- The real SQL Server connection can be configured later on another machine.
- Do not hardcode database credentials.

Always check:
- docs/PROJECT_BRIEF.md
- docs/CURRENT_STATE.md
- docs/PROGRESS.md
- docs/TASKS.md
- docs/DECISIONS.md
- docs/API_SPEC.md
- docs/DB_SCHEMA.md
- docs/UI_SPEC.md
- docs/RUNBOOK.md

Rules:
- Follow existing architecture.
- Do not change tech stack.
- Use SQL Server as the main database through Prisma.
- Keep backend and frontend separated.
- Do not delete existing code unless the reason is clear.
- Do not create duplicate files with the same responsibility.
- Update docs after finishing a task.
- After each coding session, update docs/CURRENT_STATE.md, docs/PROGRESS.md, and docs/TASKS.md.
- Use docs/PROGRESS.md as the session log for what was done, what remains, verification, blockers, and next steps.
- If API behavior changes, update docs/API_SPEC.md.
- If database fields or relations change, update docs/DB_SCHEMA.md.
- If UI pages or flows change, update docs/UI_SPEC.md.
