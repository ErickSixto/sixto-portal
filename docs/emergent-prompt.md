# Emergent Portal Prompt — Sixto Portal

Copy and paste this prompt into Emergent to build the client portal app.

---

```
Build a client portal web application for a Salesforce consulting business.

## Business Context
I run a freelance Salesforce consulting business. I manage projects, clients, tasks,
invoices, and deliverables in Notion. I need a professional client-facing portal that
reads data from my Notion workspace and presents it cleanly to my clients.

## App Name
Sixto Portal

## Core Functionality

### Authentication
- Magic link email authentication (no passwords)
- Client email matched to a Client record in my Notion "Client" database
  (title property: "Company Name", email property: "Email")
- Admin access for whitelisted emails (sixto.developer@gmail.com)
- Session management with JWT tokens

### Client Portal (authenticated client view)

**Dashboard:**
- Project name, status, and phase (from Notion "Project" database)
  - Name: title property "Name"
  - Status: status property with values: Not started, Onboarding, Research, In progress, Off boarding, Lost, Done
  - Project Date: date property with start/end range
  - Estimated Amount: number (dollar)
  - Branch: text
- Key metrics: tasks completed/total, deliverables delivered/total
- Recent updates feed (from Notion "Updates" database)

**Tasks:**
- List of tasks filtered by "Client Visible" = true (from Notion "Task" database)
- Grouped by "Phase" property: Getting Started, Planning, Implementation, Offboarding
- Each task shows: Name (title), Status, Due Date, Priority, Tag
- Status indicators: Not Started (gray), In progress (yellow), Done (green), Blocked (red), Won't Do (strikethrough)
- Priority values: High (red), Medium (yellow), Low (blue)

**Deliverables:**
- Card grid of deliverables (from Notion "Deliverables" database)
- Each card: Name (title), Status, Due Date, Delivered Date, Description, download link (if Files attached)
- Status: Pending (gray), In Progress (yellow), Delivered (blue), Accepted (green)
- Only show where "Client Visible" = true

**Billing:**
- Invoice list from Notion "Invoice" database
- Each row: No (title, invoice number), Fix cost (amount), Payment Status, Due Date
- Payment Status badges: Draft (gray), Sent (blue), Paid (green), Overdue (red), Cancelled (brown)
- "Pay Now" button linking to "Stripe Invoice URL" property
- Total billed / total paid / outstanding balance summary

**Updates:**
- Reverse-chronological feed of project updates from "Updates" database
- Only show where "Client Visible" = true
- Each update: Date, Name (title), Content, Type badge (Status Update, Milestone, Announcement)

**Documents:**
- Project documentation pages linked from the Project record
- Display: AOH Data Model, Deployment Plan, User Guide, Technical Guide (as links)
- Include any files attached to Deliverables records

**Meetings:**
- Upcoming and past meetings from "Meetings" database, filtered by "Client Visible" = true
- Each: Date & Time, Name (title), Meeting Link, Participant, Meeting Summary, Notes
- Status values: Scheduled, Invite Sent, Tentative, Rescheduled, Cancelled, Completed

**Request Form:**
- Simple form to submit change requests, questions, or feedback
- Fields: Name (subject), Type (Change Request / Question / Feedback / Support), Description, Priority (Low / Medium / High)
- Writes a new record to the Notion "Requests" database
- Auto-sets Date to today, Status to "New"

### Admin Dashboard (admin view, sixto.developer@gmail.com only)

**All Projects Overview:**
- Table of all projects with: Name, Client, Status, Project Date, Estimated Amount
- Click through to individual project detail

**Client Management:**
- List of all clients from "Client" database: Company Name, Contact Person, Email, Source, Status, Industry

**Billing Dashboard:**
- Outstanding invoices (Payment Status = Sent or Overdue)
- Recent payments (Payment Status = Paid, sorted by date)
- Revenue summary

**Portal Management:**
- List of Portal Config records with: Name, Status, Project, Client
- View section toggles (Show Tasks, Show Meetings, etc.)
- Edit Portal Title, Portal Intro, CTA Label, Support Contact

## Notion Database Reference

All databases are in my Notion workspace under "Freelancer OS → Shared Database":

| Database | Title Property | Key Properties |
|----------|---------------|----------------|
| Client | Company Name | Contact Person, Email, Source, Status, Industry, Stripe |
| Project | Name | Client (relation), Status, Project Type, Branch, Project Date, Estimated Amount |
| Task | Name | Project (relation), Status, Priority, Due Date, Phase, Client Visible, Tag, Notes |
| Invoice | No | Project (relation), Fix cost, Paid, Payment Status, Due Date, Issued on, Stripe Invoice ID, Stripe Invoice URL, Type |
| Meetings | Name | Project (relation), Date & Time, Meeting Link, Status, Client Visible, Meeting Summary, Notes |
| Deliverables | Name | Project (relation), Status, Due Date, Delivered Date, Description, Files, Client Visible |
| Updates | Name | Project (relation), Date, Content, Type, Client Visible |
| Portal Config | Name | Project (relation), Client (relation), Portal Title, Portal Intro, Contact Email, Show Tasks/Meetings/Invoices/Deliverables/Roadmap/Documents/Feedback, CTA Label, CTA URL, Support Contact, Status |
| Requests | Name | Project (relation), Client (relation), Type, Priority, Description, Status, Date |
| Proposal | Name | Client (relation), Project (relation), Status, Price, Date, Files |
| Contract | Name | Project (relation), Status, Date, Files, Client sign, Freelancer sign |
| Leads | Name | Contact Person, Email, Found from, Fiverr URL, Estimated Amount, Stage, Status |

## Data Integration

**Primary data source:** Notion API
- Read from: Client, Project, Task, Invoice, Meetings, Deliverables, Updates, Portal Config, Proposal, Contract
- Write to: Requests database (for client submissions)

**Portal rendering logic:**
1. On login, match client email to Client DB → get Client record
2. Fetch Project records linked to that Client
3. Fetch Portal Config for the active project
4. Use Portal Config section toggles to show/hide portal modules
5. Fetch related Tasks, Deliverables, Invoices, Meetings, Updates filtered by Project + Client Visible

**Secondary integration:** Stripe
- Invoice payment links read from "Stripe Invoice URL" property in Invoice DB
- No direct Stripe API needed — billing data flows through Notion via Zapier

**Caching:**
- Cache Notion API responses for 5 minutes to stay within rate limits
- Invalidate on explicit refresh or new data write (Request submission)

## Pages

1. /login — magic link auth
2. /dashboard — project overview (default after login)
3. /tasks — task list grouped by phase
4. /deliverables — deliverable cards
5. /billing — invoice list and payment links
6. /updates — project update feed
7. /documents — shared documents
8. /meetings — meeting list
9. /request — submit a request/feedback
10. /admin — admin dashboard (admin only)
11. /admin/projects — all projects
12. /admin/clients — all clients
13. /admin/billing — billing overview
14. /admin/portals — portal configuration management

## Design System

**Typography:** Helvetica Neue or system sans-serif (-apple-system, BlinkMacSystemFont)
**Primary color:** Charcoal #2D2D2D
**Background:** Oat #F5F0EB (page background), White #FFFFFF (card backgrounds)
**Accent:** Yellow #F2C94C (CTAs, highlights, progress indicators)
**Text:** Charcoal #2D2D2D (headings), #4F4F4F (body), #828282 (secondary)
**Border/divider:** #E0E0E0

**Style rules:**
- No gradients, no shadows deeper than 1px, no 3D effects
- Card-based layout with generous padding (24px)
- Strong visual hierarchy with clear heading sizes
- Lots of whitespace
- Clean data tables with alternating row backgrounds
- Progress bars using the yellow accent
- Minimal iconography (line icons only)
- Mobile-responsive with sidebar navigation collapsing to hamburger

**Layout:**
- Left sidebar navigation (collapsed on mobile)
- Main content area with max-width 1200px
- Top bar with project name, client name, and profile/logout

## Brand Reference
Tone: Professional, clean, enterprise-but-approachable.
Inspiration: https://ericksixto.github.io/
Name: Erick Sixto | Salesforce Specialist
```
