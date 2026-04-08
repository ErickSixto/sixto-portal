# Notion-Centered Business Operating System & Emergent Client Portal
## Strategic Architecture Document — Erick Sixto Consulting

**Prepared:** April 8, 2026
**Author:** AI Strategy & Architecture Assistant
**Scope:** Full audit, future-state architecture, portal standardization, Emergent app brief, and implementation roadmap

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State](#2-current-state)
3. [Problems & Constraints](#3-problems--constraints)
4. [Future-State Architecture](#4-future-state-architecture)
5. [Tool Roles](#5-tool-roles)
6. [Recommended Database & Content Structure](#6-recommended-database--content-structure)
7. [Portal Standardization Strategy](#7-portal-standardization-strategy)
8. [Emergent App Brief](#8-emergent-app-brief)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Emergent Prompt](#10-emergent-prompt)
11. [Automation & Integration Map](#11-automation--integration-map)
12. [Risks, Assumptions & Open Questions](#12-risks-assumptions--open-questions)

---

## 1. Executive Summary

Your Notion workspace is functional and well-structured at the individual system level. The challenge is not that things are broken — it is that two parallel systems coexist, portal creation requires heavy manual duplication, and no automation layer connects your tools.

**Key findings:**

- You operate **two independent Notion systems** in parallel: **Freelance HQ+** (a purchased template) and **Freelancer OS** (your customized operational workspace). Active client work (e.g., Land Geeks) runs on Freelancer OS, while Freelance HQ+ holds unused sample data and redundant hub structure.
- Client portals are **page-level duplicates**, each spawning **15+ isolated databases**. Every portal requires manual editing of titles, dates, welcome text, navigation links, and workflow phases.
- Invoices are **manual Notion pages** using templates. There is no Stripe integration, no billing sync, and no automated payment status tracking.
- No automation layer (Zapier or otherwise) connects Notion to Stripe, GitHub, Fiverr, or Google.
- The system works for low volume but will not scale cleanly beyond 5-8 concurrent projects without compounding maintenance debt.

**Recommended path:**

1. Consolidate to a single Notion system (Freelancer OS as the foundation)
2. Introduce a portal configuration database to replace manual portal editing
3. Connect Stripe for billing visibility
4. Define the Emergent app as the client-facing presentation layer
5. Execute in 7 phases over 8-12 weeks

---

## 2. Current State

### 2A. Workspace Architecture

You have two top-level Notion systems:

#### Freelance HQ+ (purchased template)
A comprehensive freelance management template from Good Quests with 5 hubs:

| Hub | Contains |
|---|---|
| Management Hub | Tasks, Projects, Clients, Meetings, Documents, Time Tracking |
| Sales Hub | Sales Pipeline (Leads), Services, Products, Affiliates, Sales Strategy |
| Marketing Hub | Social Media, Ads, Referrals, Testimonials, Website Planner, Portfolio, Brand Hub |
| Growth Hub | OKRs, SOPs, Planners, Learning, Resources, Business Admin |
| Finance Hub | Invoices, Income, Expenses, Accounts, Financial Overview |

Additional infrastructure: Shared Databases page, FHQ+ Backend (source databases), Assistant database (summary/rollup engine), navigation system with quick actions.

#### Freelancer OS (your operational system)
Your customized workspace that runs actual client engagements:

| Hub | Contains |
|---|---|
| Project Hub | Client, Project, Services, Tasks, Proposals, Contracts, Meetings, Templates |
| Productivity Hub | Habits, Routines, Focus, Notes, Goals, Calendar |
| Marketing Hub | Social Media, Content, SEO, Ads, Email, Analytics, Brand |
| Business Hub | Finance, Legal, Clients, Resources, Workflows, Admin |
| Finance Hub | Revenue, Expenses, Accounts, Subscriptions, Financial Overview |

Active components: Leads database, Project database with real clients, Shared Database page, Summary 3.0 (reporting), Monthly/Yearly Finance tracking.

**Currently active for real work:** Freelancer OS is where live client projects (Land Geeks, Khaero, Nayrhit, Kraus Aerospace, Glowback LED) are managed.

### 2B. Portal Architecture

The portal system uses a **duplicate-and-customize** model:

**How it works today:**
1. A new client entry is created in the Clients database using a template
2. The template auto-generates a Client Portal page nested inside the client record
3. Each portal contains its own **Portal Backend** with 15+ isolated databases:
   - Assistant, Directory, Tasks, Meetings, Invoices, Important Documents, Workspace Files, Client Info, Client Materials, Shared Accounts, Resources, Notes, Time Tracking Summary, Time Logs, Feedback Form, Project Roadmap
4. The portal front-end is a structured page with:
   - Navigation sidebar (Project Scope, Contract, Payment, Tasks, Questionnaire, Workspace, Meeting, Account Access, Feedback)
   - Welcome callout, project timeline, contact info
   - Project Workflow with 4 phased columns (Getting Started, Planning, Implementation, Offboarding)
   - Task and Meeting views
   - Calendar view
5. You manually edit: portal title, project summary, project timeline dates, client name, navigation items, welcome text, and workflow items

**What gets shared vs. isolated:**
- **Shared** (from main workspace): Tasks, Meetings, Contracts, Invoices databases (via linked views with client/project filters, shared as view-only)
- **Isolated** (per portal): Client Info, Client Materials, Workspace Files, Feedback Form, Notes, Shared Accounts, Resources, Time Tracking

**Active portals identified:**
- Land Geeks - Project Portal (active, real client)
- Portal Templates (at least 3 versions)
- Sample portals: Andrew's, Cate's, FHQ Client Portal A, FHQ+ Client Portal A

### 2C. Shared Databases (Source of Truth)

Located at `Freelance HQ+ → Shared Databases`:

| Database | Purpose | Shared with Portals? |
|---|---|---|
| Tasks | All project tasks | Yes (view-only, filtered) |
| Meetings | All meetings | Yes (view-only, filtered) |
| Contracts | All contracts | Yes (view-only, filtered) |
| Invoices | All invoices | Yes (view-only, filtered) |
| Projects | All projects | Internal only |
| Clients | All clients | Internal only |
| Time Tracking Logs | Hours logged | Internal only |

Freelancer OS has its own parallel set of databases (Project, Task, Client, etc.) that are the ones actually in use for real work.

### 2D. Data Flow Between Tools

```
Fiverr ──(manual)──→ Notion Leads DB ──(manual)──→ Client + Project
                                                        │
GitHub ←──(manual branch creation)──────────────────────┘
                                                        │
Stripe ←──(no integration, manual invoices)─────────────┘
                                                        │
Google ←──(manual, email/docs/calendar)─────────────────┘
                                                        │
Salesforce ←──(project delivery context)────────────────┘
```

There is **no automation** between any of these tools. Every handoff is manual.

### 2E. Real Project Example: Land Geeks

Demonstrates the full lifecycle in your current system:

- **Source:** Fiverr (Fiverr inbox link stored in project URL field)
- **Project type:** One-Time Project
- **Estimated amount:** $900
- **Status:** Done
- **Branch:** LandGeeks (GitHub)
- **Date range:** March 18 - April 2, 2026
- **Tasks:** 30 linked tasks
- **Meetings:** 3 linked meetings
- **Deliverables page:** Separate page with resources
- **Technical documentation:** 4 subpages (Data Model, Deployment Plan, User Guide, Technical Guide)
- **Portal:** Land Geeks - Project Portal (full portal with workflow phases, tasks, meetings, calendar)
- **Invoice:** 1 linked invoice
- **Proposal:** 1 linked proposal
- **Contract:** 1 linked contract

---

## 3. Problems & Constraints

### Critical Issues

| # | Problem | Impact | Severity |
|---|---|---|---|
| 1 | **Two parallel systems** (Freelance HQ+ and Freelancer OS) | Confusion about which system to use, duplicated databases, wasted effort maintaining both | High |
| 2 | **Portal duplication model** creates 15+ databases per client | Massive data sprawl, maintenance overhead, inconsistent portals, fragile structure | High |
| 3 | **Manual portal customization** for every project | Time-consuming, error-prone, inconsistent client experience | High |
| 4 | **No Stripe integration** | Invoices are manual pages, no payment status tracking, no billing visibility for clients | Medium |
| 5 | **No automation between tools** | Every handoff is manual — Fiverr to Notion, Notion to GitHub, billing reminders | Medium |
| 6 | **Notion sharing limitations** force complex permission workarounds | Clients need access to Shared Databases page, fragile filter-based security model | Medium |

### Structural Weaknesses

| Issue | Detail |
|---|---|
| **Database fragmentation** | Two sets of Tasks, Clients, Projects, Invoices databases across the two systems. Some data in Freelance HQ+, active data in Freelancer OS. |
| **Template proliferation** | Multiple portal templates (3+) with no clear canonical version |
| **Invoice disconnect** | Notion invoices are manual pages with hardcoded payment terms. No connection to Stripe. No automated payment tracking. |
| **Lead pipeline gap** | Fiverr leads enter manually. No structured lead → client → project conversion flow. |
| **Documentation sprawl** | Project documentation (e.g., Land Geeks technical guides) lives as subpages inside project records rather than in a centralized, searchable documents hub. |
| **No portal configuration layer** | Portal content (title, intro, sections, visibility) is embedded in page content, not driven by structured data. |

### What Works Well

| Strength | Detail |
|---|---|
| **Rich project records** | The Project database in Freelancer OS has excellent properties: client relation, tasks, meetings, invoices, proposals, contracts, branch, estimated amount, status, dates, workflow formulas |
| **Portal UX** | The portal template is well-designed: clear navigation, phased workflow, task/meeting/calendar views, professional presentation |
| **Workflow phases** | The 4-phase project workflow (Getting Started → Planning → Implementation → Offboarding) is a strong reusable pattern |
| **Canva integration** | Custom artwork per portal (covers, directory covers, client center covers) |
| **Summary/Assistant database** | Automated rollup engine that aggregates data across all databases |
| **SOP foundation** | SOPs for client onboarding, project delivery, and workflows exist |

---

## 4. Future-State Architecture

### Design Principles

1. **One system, not two.** Freelancer OS becomes the sole operational system. Freelance HQ+ is archived or selectively merged.
2. **Configure, don't duplicate.** Portals are driven by a configuration database, not by cloning pages.
3. **Notion = operational hub.** All records, relationships, and workflows live in Notion.
4. **Emergent = presentation layer.** The client-facing experience is a separate app that reads from Notion data.
5. **Automate handoffs.** Zapier connects Stripe, GitHub, and Notion for key workflows.

### Recommended Top-Level Domains

```
Freelancer OS (Root)
├── Command Center (Dashboard)
├── Project Hub
│   ├── Clients
│   ├── Projects
│   ├── Tasks
│   ├── Deliverables
│   └── Documentation
├── Sales Hub
│   ├── Leads
│   ├── Services
│   └── Proposals
├── Finance Hub
│   ├── Invoices
│   ├── Revenue
│   └── Expenses
├── Operations Hub
│   ├── Meetings
│   ├── Time Tracking
│   ├── SOPs & Workflows
│   └── Resources
├── Portal Configuration
│   ├── Portal Settings (DB)
│   ├── Portal Sections (DB)
│   └── Portal Templates
├── Marketing Hub
│   ├── Content
│   ├── Brand
│   └── Portfolio
└── Shared Database (Source DBs)
    ├── Clients DB
    ├── Projects DB
    ├── Tasks DB
    ├── Invoices DB
    ├── Meetings DB
    ├── Leads DB
    ├── Contracts DB
    ├── Proposals DB
    ├── Documents DB
    ├── Deliverables DB
    ├── Portal Config DB
    └── Updates DB
```

---

## 5. Tool Roles

| Tool | Role | Integration with Notion |
|---|---|---|
| **Notion** | Operational hub, source of truth for all business data | — |
| **Stripe** | Billing source of truth (invoices, payments, subscriptions) | Zapier sync: invoice created → Notion record, payment received → status update |
| **GitHub** | Code repository, branch-per-project delivery | Branch name stored in Project record. Zapier: PR merged → task status update (optional) |
| **Fiverr** | Lead acquisition platform | Manual or Zapier: new order → Lead/Client record in Notion |
| **Google** | Email, Calendar, Docs, Sheets | Calendar → Notion meetings (Zapier). Docs linked in project records. |
| **Salesforce** | Service domain and client delivery platform | Project context. Implementation details stored in Notion project documentation. |
| **Cursor** | Development, planning, documentation, architecture | MCP access to Notion for audits, planning, documentation |
| **Zapier** | Automation and orchestration layer | Connects all tools to Notion |
| **Emergent** | Client-facing portal/app (future) | Reads from Notion databases via API |

---

## 6. Recommended Database & Content Structure

### Core Databases

#### Clients DB
| Property | Type | Purpose |
|---|---|---|
| Name | Title | Client name |
| Status | Select | Active, Inactive, Prospect, Archived |
| Contact Email | Email | Primary contact |
| Contact Name | Rich Text | Contact person |
| Source | Select | Fiverr, Referral, Direct, LinkedIn, Website |
| Projects | Relation → Projects | All associated projects |
| Invoices | Relation → Invoices | All invoices |
| Portal Config | Relation → Portal Config | Portal settings |
| Total Revenue | Rollup | Sum of paid invoices |
| Company | Rich Text | Company name |
| Notes | Rich Text | Internal notes |

#### Projects DB
| Property | Type | Purpose |
|---|---|---|
| Name | Title | Project name |
| Client | Relation → Clients | Parent client |
| Status | Select | Discovery, Scoping, In Progress, Review, Done, On Hold, Cancelled |
| Project Type | Select | One-Time, Retainer, Maintenance, Advisory |
| Branch | Rich Text | GitHub branch name |
| Start Date | Date | Project start |
| End Date | Date | Project end |
| Estimated Amount | Number (USD) | Quoted amount |
| Tasks | Relation → Tasks | All tasks |
| Deliverables | Relation → Deliverables | Formal deliverables |
| Meetings | Relation → Meetings | All meetings |
| Invoices | Relation → Invoices | All invoices |
| Proposals | Relation → Proposals | Linked proposals |
| Contracts | Relation → Contracts | Linked contracts |
| Documents | Relation → Documents | Project documentation |
| Portal Config | Relation → Portal Config | Portal display settings |
| Fiverr URL | URL | Fiverr order/inbox link |
| Summary | Relation → Summary | Assistant/reporting link |

#### Tasks DB
| Property | Type | Purpose |
|---|---|---|
| Name | Title | Task description |
| Project | Relation → Projects | Parent project |
| Status | Select | Not Started, In Progress, Blocked, Done |
| Priority | Select | Low, Medium, High, Urgent |
| Due Date | Date | Deadline |
| Assignee | Person | Who is responsible |
| Phase | Select | Getting Started, Planning, Implementation, Offboarding |
| Client Visible | Checkbox | Show on client portal? |
| Completed | Checkbox | Done flag |

#### Invoices DB
| Property | Type | Purpose |
|---|---|---|
| Name | Title | Invoice identifier |
| Project | Relation → Projects | Parent project |
| Client | Relation → Clients | Billed client |
| Amount | Number (USD) | Invoice amount |
| Status | Select | Draft, Sent, Paid, Overdue, Cancelled |
| Due Date | Date | Payment due date |
| Paid Date | Date | Actual payment date |
| Stripe Invoice ID | Rich Text | Stripe reference |
| Stripe Invoice URL | URL | Hosted invoice link |
| Type | Select | Deposit, Milestone, Final, Recurring |

#### Deliverables DB
| Property | Type | Purpose |
|---|---|---|
| Name | Title | Deliverable name |
| Project | Relation → Projects | Parent project |
| Status | Select | Pending, In Progress, Delivered, Accepted |
| Due Date | Date | Expected delivery |
| Delivered Date | Date | Actual delivery |
| Description | Rich Text | What this deliverable includes |
| Files | Files | Attached deliverable files |
| Client Visible | Checkbox | Show on portal? |

#### Portal Config DB (NEW)
| Property | Type | Purpose |
|---|---|---|
| Name | Title | Config identifier (usually = project name) |
| Project | Relation → Projects | Which project this configures |
| Client | Relation → Clients | Which client |
| Portal Title | Rich Text | Display title |
| Portal Intro | Rich Text | Welcome/summary text |
| Contact Email | Email | Displayed contact |
| Show Tasks | Checkbox | Section visibility |
| Show Meetings | Checkbox | Section visibility |
| Show Invoices | Checkbox | Section visibility |
| Show Deliverables | Checkbox | Section visibility |
| Show Roadmap | Checkbox | Section visibility |
| Show Workspace | Checkbox | Section visibility |
| Show Documents | Checkbox | Section visibility |
| Show Feedback | Checkbox | Section visibility |
| CTA Label | Rich Text | Primary action label |
| CTA URL | URL | Primary action link |
| Support Contact | Rich Text | How to reach support |
| Brand Color | Select | Portal accent color |
| Status | Select | Draft, Active, Archived |

#### Updates DB (NEW)
| Property | Type | Purpose |
|---|---|---|
| Name | Title | Update title |
| Project | Relation → Projects | Parent project |
| Date | Date | Update date |
| Content | Rich Text | Update body |
| Type | Select | Status Update, Milestone, Announcement, Request |
| Client Visible | Checkbox | Show on portal? |
| Author | Person | Who posted |

### Database Relationships (Entity Map)

```
Client (1) ──→ (many) Projects
Project (1) ──→ (many) Tasks
Project (1) ──→ (many) Deliverables
Project (1) ──→ (many) Documents
Project (1) ──→ (many) Updates
Project (1) ──→ (many) Meetings
Project (1) ──→ (many) Invoices
Project (1) ──→ (1) Portal Config
Project (1) ──→ (1) Proposal
Project (1) ──→ (1) Contract
Client (1) ──→ (many) Invoices
Client (1) ──→ (1) Portal Config
Lead (1) ──→ (0..1) Client (conversion)
```

### Visibility Model

| Layer | Who Sees It | What It Contains |
|---|---|---|
| **Internal** | You only | All data, admin views, financial details, internal notes, lead pipeline, SOPs |
| **Client-Visible** | You + Client | Filtered tasks, deliverables, meetings, updates, invoices (status only), documents marked visible |
| **Portal** | Client only (via Emergent) | Configured subset of client-visible data, styled presentation |
| **Admin** | You (via Emergent) | Portal management, client overview, billing dashboard |

---

## 7. Portal Standardization Strategy

### Current Model (Stop Doing)

```
New Project → Duplicate Portal Template → Edit 20+ fields manually → 
Share page + Shared Databases → Hope filters are correct
```

**Problems:** 15+ databases duplicated per portal, manual content editing, inconsistent portals, fragile permissions.

### Target Model (Start Doing)

```
New Project → Create Portal Config record (fill 10 fields) → 
Portal auto-renders from config + project data → 
Emergent app reads config and presents portal
```

### Transition Plan

**Phase 1 (Notion-only, immediate):**
1. Create Portal Config DB with the properties defined above
2. Create one "canonical" portal template that reads from Portal Config via relations/formulas
3. For new projects, create the config record and use the canonical template
4. Stop duplicating portal backends — use shared databases exclusively

**Phase 2 (Emergent, later):**
1. Emergent reads Portal Config, Project, Tasks, Deliverables, Invoices, Updates from Notion API
2. Portal is entirely rendered by Emergent — no Notion page shared with clients
3. Notion remains the data entry point; Emergent is the display layer

### Portal Configuration Properties (Quick Reference)

```
Portal Title          → "Land Geeks - Property Manager"
Portal Intro          → "Custom LWC - Property & Property Owners Manager"
Project Timeline      → Reads from Project.Start Date / End Date
Contact Email         → sixto.developer@gmail.com
Show Tasks            → ✓
Show Meetings         → ✓
Show Invoices         → ✓
Show Deliverables     → ✓
Show Roadmap          → ✓
Show Workspace        → ✗
Show Documents        → ✓
Show Feedback         → ✓
CTA Label             → "Submit Feedback"
CTA URL               → [Feedback form link]
Support Contact       → "Email sixto.developer@gmail.com"
Brand Color           → Charcoal
Status                → Active
```

---

## 8. Emergent App Brief

### Product Name
**Sixto Portal** — Client Delivery Hub

### Tagline
Clean, professional project visibility for Salesforce consulting clients.

### Core Purpose
Replace manually-edited Notion portal pages with a polished, authenticated web application that surfaces project status, deliverables, billing, and communication — all driven by structured data in Notion.

### Target Users
1. **Clients** — View project status, deliverables, invoices, and submit requests
2. **Admin (Erick)** — Manage portal configurations, monitor all projects, view billing

### Core Modules

| Module | Client View | Admin View |
|---|---|---|
| **Login** | Email/password or magic link auth | Full access |
| **Project Dashboard** | Current status, timeline, workflow phase, key metrics | All projects overview |
| **Tasks** | Visible tasks grouped by phase, status indicators | Full task management |
| **Deliverables** | Delivered items with download links, status | Manage deliverable records |
| **Documents** | Shared project documents, contracts, proposals | Upload and manage |
| **Updates** | Chronological project updates and milestones | Post updates |
| **Billing** | Invoice list with status (Paid/Pending/Overdue), Stripe hosted links | Full billing dashboard |
| **Requests** | Submit change requests, support questions, feedback | View and manage requests |
| **Meetings** | Upcoming and past meetings with notes | Schedule and manage |

### Design Direction

- **Typography:** Helvetica (or system sans-serif stack)
- **Palette:** Charcoal (#2D2D2D), Oat (#F5F0EB), Yellow accent (#F2C94C)
- **Style:** Minimalist, geometric, high legibility
- **Layout:** Generous whitespace, strong hierarchy, clean card-based UI
- **No:** Gradients, shadows, 3D effects, emoji, cluttered visuals
- **Yes:** Decision trees, checklists, progress indicators, clean data tables

### Technical Architecture

```
┌─────────────────────────────────────────┐
│              Emergent App               │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ Client  │  │  Admin   │  │  Auth  │ │
│  │ Portal  │  │Dashboard │  │ Layer  │ │
│  └────┬────┘  └────┬─────┘  └────────┘ │
│       │             │                    │
│  ┌────┴─────────────┴────┐              │
│  │    Notion API Layer   │              │
│  └────┬─────────────┬────┘              │
└───────┼─────────────┼───────────────────┘
        │             │
┌───────┴──┐   ┌──────┴──────┐
│  Notion  │   │   Stripe    │
│ (Data)   │   │ (Billing)   │
└──────────┘   └─────────────┘
```

### Data Sources (from Notion)

| Notion Database | Emergent Module | Read/Write |
|---|---|---|
| Projects | Dashboard, Timeline | Read |
| Tasks | Tasks view | Read |
| Deliverables | Deliverables view | Read |
| Invoices | Billing view | Read |
| Meetings | Meetings view | Read |
| Updates | Updates feed | Read |
| Portal Config | Portal rendering | Read |
| Documents | Documents view | Read |
| Feedback / Requests | Request form | Write (new records) |

### Authentication Model

- Magic link email authentication (simple, no password management)
- Client email matched to Client record in Notion
- Admin access for Erick via email whitelist
- Session-based with JWT tokens

---

## 9. Implementation Roadmap

### Phase 1: Consolidate & Clean (Week 1-2)

**Objective:** Establish a single operational system.

| Task | Detail |
|---|---|
| Audit Freelance HQ+ for unique data | Identify any real client/project data in FHQ+ that needs migrating |
| Migrate unique data to Freelancer OS | Move any real records, not sample data |
| Archive Freelance HQ+ | Move to a clearly labeled archive section |
| Standardize database naming | Ensure consistent naming across all databases |
| Clean up sample/demo entries | Remove Andrew, Cate, John, Olena sample data |

**Deliverables:** Single operational system, clean databases, archived legacy system.
**Dependencies:** None.
**Risks:** Data in FHQ+ may not be easily migrated if structures differ. Low risk — manual copy acceptable for small volumes.

---

### Phase 2: Define Target Information Architecture (Week 2-3)

**Objective:** Implement the recommended database structure.

| Task | Detail |
|---|---|
| Create Deliverables DB | New database for formal deliverables |
| Create Updates DB | New database for project status updates |
| Create Portal Config DB | New database for portal configuration |
| Add missing properties to existing DBs | Client Visible checkboxes, Stripe fields on Invoices |
| Set up relations between databases | Wire all relationships per the entity map |
| Create standard views | Admin views, client-filtered views, status boards |

**Deliverables:** Complete database schema with all relations.
**Dependencies:** Phase 1 complete.
**Risks:** Notion relation limits if too many cross-references. Mitigate by being selective about rollups.

---

### Phase 3: Portal Configuration Model (Week 3-4)

**Objective:** Replace manual portal editing with data-driven configuration.

| Task | Detail |
|---|---|
| Create canonical portal template | One template that reads from Portal Config |
| Populate Portal Config for active projects | Create records for Land Geeks and any other active projects |
| Test the new portal model | Verify that a new project can get a portal by creating a config record |
| Document the new portal creation SOP | Step-by-step: create project → create config → share portal |

**Deliverables:** Working portal configuration system, documented SOP.
**Dependencies:** Phase 2 complete.
**Risks:** Notion formula/relation limitations may prevent fully dynamic portals. Mitigation: some manual linking may still be needed, but dramatically reduced.

---

### Phase 4: Stripe Integration (Week 4-5)

**Objective:** Connect billing to Notion.

| Task | Detail |
|---|---|
| Set up Zapier: Stripe invoice created → Notion record | Auto-create Invoice record with amount, status, Stripe URL |
| Set up Zapier: Stripe payment received → update Notion | Mark invoice as Paid with date |
| Set up Zapier: Stripe invoice overdue → update Notion | Mark invoice as Overdue |
| Add Stripe hosted invoice links to Invoice DB | Clients can click through to pay |
| Test end-to-end billing flow | Create invoice in Stripe → verify in Notion |

**Deliverables:** Automated billing sync, Stripe invoice links in Notion.
**Dependencies:** Phase 2 (Invoice DB schema).
**Risks:** Zapier pricing for volume. Low risk at current volume.

---

### Phase 5: Automation Layer (Week 5-7)

**Objective:** Automate key handoffs between tools.

| Automation | Trigger | Action |
|---|---|---|
| New Fiverr order → Lead | Fiverr notification (email-based) | Create Lead record in Notion |
| Lead converted → Client + Project | Manual trigger in Notion | Template creates linked records |
| Meeting scheduled → Notion | Google Calendar event created | Create Meeting record |
| Project status change → Client notification | Notion property change | Send email via Zapier |
| Weekly project digest → Client | Scheduled | Email with project status summary |

**Deliverables:** Working automation workflows.
**Dependencies:** Phases 2-4.
**Risks:** Fiverr has limited API access; email-based triggers may be fragile.

---

### Phase 6: Emergent App Build (Week 6-10)

**Objective:** Build the client-facing portal application.

| Task | Detail |
|---|---|
| Set up Emergent project with Notion API | Connect to Notion databases |
| Build authentication layer | Magic link email auth |
| Build client dashboard | Project overview, status, timeline |
| Build tasks view | Filtered, phase-grouped tasks |
| Build deliverables view | Download-enabled deliverable cards |
| Build billing view | Invoice list with Stripe payment links |
| Build updates feed | Chronological project updates |
| Build request/feedback form | Write-back to Notion |
| Build admin dashboard | Multi-project overview, client management |
| Apply brand styling | Charcoal/Oat/Yellow palette, Helvetica, minimal design |

**Deliverables:** Deployed Emergent app.
**Dependencies:** Phases 2-4 (data structure must be stable).
**Risks:** Notion API rate limits, Emergent platform capabilities. Mitigate with caching layer.

---

### Phase 7: Launch & Optimize (Week 10-12)

**Objective:** Go live and iterate.

| Task | Detail |
|---|---|
| Migrate active client to new portal | Test with Land Geeks or next new project |
| Collect client feedback | On portal UX and functionality |
| Optimize automations | Fix edge cases, add error handling |
| Document the full system | Internal runbook for portal creation, client onboarding, billing |
| Plan v2 features | Change request tracking, document signing, scheduling |

**Deliverables:** Live system, client feedback, documentation.
**Dependencies:** All prior phases.
**Risks:** Client adoption. Mitigate by maintaining Notion portal as fallback during transition.

---

## 10. Emergent Prompt

The following prompt is ready to paste into Emergent to begin building the portal app:

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
- Client email matched to a Client record in a Notion "Clients" database
- Admin access for specific whitelisted emails
- Session management with JWT tokens

### Client Portal (authenticated client view)

**Dashboard:**
- Project name, status, and phase (from Notion Projects DB)
- Project timeline with start/end dates
- Key metrics: tasks completed/total, deliverables delivered/total
- Recent updates feed (from Notion Updates DB)

**Tasks:**
- List of tasks filtered by Client Visible = true (from Notion Tasks DB)
- Grouped by Phase: Getting Started, Planning, Implementation, Offboarding
- Each task shows: name, status, due date, priority
- Status indicators: Not Started (gray), In Progress (yellow), Done (green), Blocked (red)

**Deliverables:**
- Card grid of deliverables (from Notion Deliverables DB)
- Each card: name, status, due date, description, download link (if files attached)
- Status: Pending, In Progress, Delivered, Accepted

**Billing:**
- Invoice list from Notion Invoices DB
- Each row: invoice name, amount, status, due date
- Status badges: Draft (gray), Sent (blue), Paid (green), Overdue (red)
- "Pay Now" button linking to Stripe hosted invoice URL
- Total billed / total paid / outstanding balance summary

**Updates:**
- Reverse-chronological feed of project updates
- Each update: date, title, content, type badge (Status Update, Milestone, Announcement)

**Documents:**
- List of shared documents (from Notion Documents DB, filtered Client Visible = true)
- Download links for attached files
- Categories: Contract, Proposal, Scope, Deliverable, Reference

**Meetings:**
- Upcoming and past meetings (from Notion Meetings DB)
- Each: date, title, agenda, notes (if available), meeting link

**Request Form:**
- Simple form to submit change requests, questions, or feedback
- Fields: subject, type (Change Request / Question / Feedback), description, priority
- Writes a new record to a Notion "Requests" database

### Admin Dashboard (admin view)

**All Projects Overview:**
- Table of all active projects with: client name, status, phase, dates, revenue
- Click through to individual project detail

**Client Management:**
- List of all clients with status, total revenue, active projects count

**Billing Dashboard:**
- Outstanding invoices, recent payments, revenue by month

**Portal Management:**
- View/edit portal configurations per project
- Toggle section visibility, update intro text

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

## Data Integration

**Primary data source:** Notion API
- Read from databases: Projects, Tasks, Deliverables, Invoices, Meetings, 
  Updates, Documents, Portal Config, Clients
- Write to: Requests database (for client submissions)

**Secondary integration:** Stripe
- Invoice payment links (read Stripe Invoice URL from Notion Invoices DB)
- No direct Stripe API needed — billing data flows through Notion

**Caching:**
- Cache Notion API responses for 5 minutes to stay within rate limits
- Invalidate on explicit refresh or new data write

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

## Brand Reference
Tone: Professional, clean, enterprise-but-approachable. 
Inspiration: https://ericksixto.github.io/
Name: Erick Sixto | Salesforce Specialist
```

---

## 11. Automation & Integration Map

### Recommended Zapier Workflows

| # | Name | Trigger | Action | Priority |
|---|---|---|---|---|
| 1 | **Stripe → Notion: Invoice Created** | Stripe: Invoice Created | Notion: Create DB Item (Invoices) with amount, status, Stripe URL | High |
| 2 | **Stripe → Notion: Payment Received** | Stripe: Invoice Paid | Notion: Update DB Item (set Status=Paid, Paid Date=today) | High |
| 3 | **Stripe → Notion: Invoice Overdue** | Stripe: Invoice Past Due | Notion: Update DB Item (set Status=Overdue) | Medium |
| 4 | **Google Calendar → Notion: Meeting** | Google Calendar: New Event (with tag) | Notion: Create DB Item (Meetings) | Medium |
| 5 | **Notion → Email: Project Update** | Notion: Updates DB new item | Gmail: Send email to client | Medium |
| 6 | **Weekly Digest** | Schedule: Every Monday 9am | Notion: Query active projects → Gmail: Send summary | Low |
| 7 | **New Lead Notification** | Fiverr email → Gmail filter | Notion: Create Lead record | Low |

### Integration Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Fiverr  │────→│  Zapier  │────→│  Notion  │
└──────────┘     │          │     │  (Hub)   │
┌──────────┐     │          │     │          │
│  Stripe  │←───→│          │←───→│          │
└──────────┘     │          │     │          │
┌──────────┐     │          │     │          │
│  Google  │←───→│          │←───→│          │
└──────────┘     └──────────┘     └─────┬────┘
                                        │
┌──────────┐                    ┌───────┴────┐
│  GitHub  │←── branch name ──→│  Emergent  │
└──────────┘                    │   (App)    │
┌──────────┐                    │            │
│Salesforce│←── delivery ──────→│            │
└──────────┘                    └────────────┘
```

---

## 12. Risks, Assumptions & Open Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Notion API rate limits impact Emergent app | Medium | Medium | Implement 5-minute cache layer; batch API calls |
| Notion sharing model breaks with schema changes | Low | High | Test portal permissions after every database change |
| Stripe webhook reliability | Low | Medium | Zapier retry logic; manual reconciliation monthly |
| Emergent platform limitations | Medium | Medium | Validate core features before full build; have Next.js fallback |
| Client adoption of new portal | Low | Medium | Maintain Notion portal as fallback during transition |

### Assumptions

1. Freelancer OS is the correct foundation to build on (not Freelance HQ+)
2. Current project volume (3-8 concurrent) does not require enterprise-grade infrastructure
3. Emergent can connect to Notion API and render dynamic content
4. Clients are comfortable with magic link authentication
5. Stripe is already set up for invoicing
6. The 4-phase workflow model (Getting Started → Planning → Implementation → Offboarding) applies to most projects

### Open Questions

| # | Question | Impact | Suggested Resolution |
|---|---|---|---|
| 1 | Are there any real client records in Freelance HQ+ that need preserving? | Phase 1 scope | Audit before archiving |
| 2 | Does Emergent support Notion API integration natively or via custom code? | Phase 6 approach | Validate in Emergent before committing |
| 3 | Do you want to keep separate FHQ+ portal features (Canva artwork, shared accounts)? | Portal design | Include as optional Portal Config flags |
| 4 | Should the Emergent app support multiple projects per client simultaneously? | App architecture | Recommend yes — add project selector |
| 5 | What is the current Stripe setup — are invoices already being created there? | Phase 4 scope | If not, set up Stripe invoicing first |
| 6 | Do you need document signing (contracts) in the portal? | v2 scope | Defer to Phase 7 v2 planning |
| 7 | Should clients be able to schedule meetings through the portal? | v2 scope | Calendly/Cal.com embed — defer to v2 |

### Database Naming Conventions

| Convention | Example |
|---|---|
| Singular noun for database names | `Client` not `Clients` in DB title (Notion convention) |
| PascalCase for property names | `Client Visible`, `Due Date`, `Stripe Invoice URL` |
| Prefix portal-specific properties | `Portal: Title`, `Portal: Intro` (or use separate Portal Config DB) |
| Use `[View of X]` naming for linked views | `View of Tasks`, `View of Invoices` |
| Status values: past-tense for completed states | `Done`, `Paid`, `Delivered`, `Accepted` |

### Cleanup Priorities (Immediate)

1. **Archive Freelance HQ+** sample portals (Andrew, Cate, John, Olena, FHQ samples)
2. **Remove duplicate portal templates** — keep one canonical version
3. **Consolidate Tasks/Projects/Clients** — ensure active data lives in Freelancer OS databases only
4. **Clean up orphaned pages** — "Project Name" placeholders, empty Client Center pages
5. **Standardize Fiverr URL storage** — ensure all projects have the source link

---

*End of document. This plan is designed to be executed incrementally with minimal disruption to ongoing client work. Each phase has clear scope, deliverables, and dependencies. Start with Phase 1 (consolidation) and Phase 2 (schema) before touching any client-facing systems.*
