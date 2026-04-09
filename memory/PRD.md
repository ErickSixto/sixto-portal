# Erick Sixto - Customer Portal PRD

## Original Problem Statement
Build a client portal web application for a Salesforce consulting business. Reads data from a Notion workspace and presents it to clients. Features magic link auth, client/admin views, and Notion API integration.

## Architecture
- **Frontend:** React 18 + Tailwind CSS + React Router v6
- **Backend:** FastAPI (Python 3.11) + MongoDB (auth/sessions)
- **Data Source:** Notion API (primary), MongoDB (auth data only)
- **Auth:** Magic link (mocked) + JWT tokens (cookie + Bearer header)
- **Design:** Charcoal #2D2D2D, Oat #F5F0EB, Yellow #F2C94C accent

## User Personas
1. **Client** - Authenticated via email matching Notion Client DB. Sees project-specific data (tasks, deliverables, billing, updates, meetings, documents).
2. **Admin** (sixto.developer@gmail.com) - Full access to all projects, clients, billing, and portal configurations.

## Core Requirements
- Notion API integration with 5-min caching
- Magic link authentication (mock mode, no email provider yet)
- JWT session management
- Client portal with 8 sections: Dashboard, Tasks, Deliverables, Billing, Updates, Documents, Meetings, Request Form
- Admin dashboard with 5 views: Overview, Projects, Clients, Billing, Portals
- Mobile responsive with collapsible sidebar
- Portal Config-driven section visibility

## What's Been Implemented (Jan 2026)
### Backend (server.py)
- [x] Notion API integration with all 12 database IDs
- [x] Property extraction for all Notion types (title, rich_text, number, select, status, date, checkbox, url, email, files, relation, people, formula, rollup)
- [x] 5-minute in-memory cache with hash-based keys
- [x] Pagination support for Notion queries
- [x] Magic link auth (mock mode - code returned in API response)
- [x] JWT token creation/verification (cookie + Bearer header)
- [x] Admin seed on startup
- [x] All portal data endpoints (dashboard, tasks, deliverables, billing, updates, meetings, documents)
- [x] Request form submission (writes to Notion Requests DB)
- [x] Admin endpoints (projects, clients, billing, portals)
- [x] Cache invalidation endpoint

### Frontend (React)
- [x] Login page with magic link flow (email → code → verify)
- [x] AuthContext with JWT persistence
- [x] Sidebar with admin/portal sections, project selector
- [x] Dashboard with metrics, progress bar, recent updates
- [x] Tasks grouped by phase with status/priority indicators
- [x] Deliverables card grid with download links
- [x] Billing table with Stripe payment links, summary cards
- [x] Updates feed with type badges
- [x] Documents page (proposals, contracts, deliverable files)
- [x] Meetings page with upcoming/past separation
- [x] Request form with all fields
- [x] Admin dashboard, projects, clients, billing, portals pages
- [x] Mobile responsive layout

## Known Issues
- Client database (30dec4c7-cb79-81db-810d-e5831e7f56b7) is NOT shared with the Notion integration → returns 404
  - Fix: Share the Client database with the Notion integration in Notion settings
- Task Phase property not set for any tasks → all show under "Other"
- Two test invoices with ~$358M amounts skewing billing totals in Notion data

## Notion Database IDs
| Database | ID |
|---|---|
| Client | 30dec4c7-cb79-81db-810d-e5831e7f56b7 |
| Project | 30dec4c7-cb79-8127-ac76-d611f161d499 |
| Task | 30dec4c7-cb79-81b2-9ff6-f1a008ab0f87 |
| Invoice | 30dec4c7-cb79-810b-9d87-cb00322238ae |
| Meetings | 30dec4c7-cb79-812a-ad23-e8b19e7c0484 |
| Deliverables | 44576ebd-787e-44aa-8fc3-3a31ea6198f1 |
| Updates | 81df2382-16fc-4ac2-bf05-587a7a284973 |
| Portal Config | 1612bd69-1515-4eb0-a57e-14833acccfb7 |
| Requests | a63ff4cb-86b4-48ff-b52f-3f9110dded88 |
| Proposal | 30dec4c7-cb79-8173-b844-f51ded8cba30 |
| Contract | 30dec4c7-cb79-81e8-8a08-cdbb25fb8c11 |
| Leads | 30dec4c7-cb79-8113-861b-f773ee1c104b |

## Prioritized Backlog

### P0 - Critical
- [ ] Share Client database with Notion integration (user action)
- [ ] Connect real email service (SendGrid/Resend) for magic links

### P1 - Important
- [ ] Portal Config-driven CTA button on dashboard
- [ ] Document links from Project record (AOH Data Model, Deployment Plan, etc.)
- [ ] Meeting participant field display
- [ ] Admin portal config editing (currently read-only)

### P2 - Nice to have
- [ ] Email notifications for request submissions
- [ ] File upload on request form
- [ ] Project timeline/roadmap visualization
- [ ] Dark mode toggle
- [ ] Client self-service profile editing
