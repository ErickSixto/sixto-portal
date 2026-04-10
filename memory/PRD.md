# PRD — Erick Sixto Client Project Portal

## Problem Statement
Build a client-facing project portal for a freelance Salesforce consulting business (Erick Sixto). Clients log in, see their projects, and click into any project to view status, deliverables, documents, and meetings.

## Core Requirements
1. **Magic link email authentication** (currently MOCKED, codes returned in API response)
2. **Projects list page** — shows all active and past projects after login
3. **Project detail page** — tabbed view with: Overview, Deliverables, Documents, Meetings, Updates, Request
4. **Admin dashboard** — full management view with billing, clients, projects, portals, access control
5. **Notion API integration** — all project data sourced from live Notion workspace
6. **60:30:10 dark theme** — dark bg, warm neutrals, yellow accent (#F2C94C)
7. **No billing/pricing in client view** — billing data only visible in admin dashboard

## User Personas
- **Client**: Logs in → sees projects → clicks into project for status/deliverables/docs/meetings
- **Admin (Erick)**: Full access to admin dashboard + client portal view

## Tech Stack
- Frontend: React, Tailwind CSS, Lucide React icons
- Backend: FastAPI, Motor (async MongoDB), httpx (Notion API)
- Database: MongoDB (auth codes, users), Notion (source of truth for all project data)
- Auth: JWT tokens, magic link codes (mocked email sending)

## Architecture
```
/app/
├── backend/
│   ├── server.py (all routes, Notion API, auth)
│   └── tests/test_portal_api.py
├── frontend/
│   └── src/
│       ├── App.js (routing)
│       ├── api.js (API client)
│       ├── contexts/AuthContext.js
│       ├── components/ (Layout.js, Sidebar.js)
│       └── pages/
│           ├── LoginPage.js
│           ├── ProjectsPage.js (projects list)
│           ├── ProjectDetailPage.js (tabbed detail)
│           └── admin/ (AdminDashboard, AdminProjects, etc.)
```

## What's Implemented (as of Feb 2026)
- [x] Full auth flow (magic link, mocked)
- [x] Notion API integration (10+ databases mapped)
- [x] Projects list page (active/completed grouping)
- [x] Project detail page with 7 tabs (Overview, Tasks, Deliverables, Documents, Meetings, Updates, Request)
- [x] Admin dashboard with sidebar navigation
- [x] Billing removed from client view
- [x] 60:30:10 dark theme
- [x] Dynamic Notion-based email access (clients from Notion Client DB)
- [x] Admin access management (add/remove admin emails)
- [x] Request form submission (creates Notion page)
- [x] Backend test suite (17 tests passing)

## Backlog
### P1
- Replace mock magic link with real email provider (Resend/SendGrid)
- Verify Admin Access route end-to-end

### P2
- Stripe integration for automated billing (admin only)
- Refactor server.py into modular routers (auth.py, notion.py, admin.py)

## Key API Endpoints
- POST /api/auth/request-magic-link
- POST /api/auth/verify-magic-link
- GET /api/auth/me
- GET /api/portal/projects
- GET /api/portal/project/{id}/dashboard
- GET /api/portal/project/{id}/deliverables
- GET /api/portal/project/{id}/documents
- GET /api/portal/project/{id}/meetings
- GET /api/portal/project/{id}/updates
- POST /api/portal/project/{id}/requests
- GET /api/admin/* (projects, clients, billing, portals, access)
