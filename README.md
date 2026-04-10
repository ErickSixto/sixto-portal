# Sixto Portal

Client-facing project portal for **Erick Sixto | Salesforce Specialist**.

Built with [Emergent](https://emergent.sh), backed by Notion as the single source of truth.

---

## What This Is

A professional client portal that reads project data from Notion and presents it to clients. Clients can view project progress, tasks, deliverables, invoices, meetings, and submit feedback — all driven by data already managed in Notion.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────→│  Sixto      │────→│   Notion    │
│  (Browser)  │     │  Portal     │     │   (Hub)     │
│             │←────│  (Emergent) │←────│             │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                    ┌──────┴──────┐     ┌──────┴──────┐
                    │   Stripe    │     │   Zapier    │
                    │  (Billing)  │     │  (Sync)     │
                    └─────────────┘     └─────────────┘
```

**Notion** is the operating system — all project, client, task, invoice, and deliverable data lives there.

**Emergent** renders the portal UI from Notion data via the Notion API.

**Stripe** handles invoicing. Zapier syncs invoice events back to Notion.

## Notion Databases

| Database | Purpose |
|----------|---------|
| Client | Company records, contact info, Stripe links |
| Project | Active/completed projects, timelines, budgets |
| Task | Work items grouped by phase, with client visibility flags |
| Invoice | Billing records synced from Stripe |
| Meetings | Scheduled and completed meetings |
| Deliverables | Formal project deliverables with status tracking |
| Updates | Project status updates and milestones |
| Portal Config | Per-project portal display settings |
| Requests | Client-submitted change requests and feedback |
| Proposal | Project proposals |
| Contract | Signed contracts |
| Leads | Inbound leads pipeline |

## Docs

| File | Description |
|------|-------------|
| [`docs/notion-model-review.md`](docs/notion-model-review.md) | Review of the current Notion schema, suggested entity additions, and recommended shared metadata |
| [`docs/customer-experience-review.md`](docs/customer-experience-review.md) | Review of the client journey with usability recommendations and customer-facing priorities |
| [`docs/implementation-review.md`](docs/implementation-review.md) | Senior-level audit of the current implementation docs, UX gaps, and prioritized improvement scope |
| [`docs/emergent-prompt.md`](docs/emergent-prompt.md) | The prompt to paste into Emergent to build the portal |
| [`docs/zapier-stripe-notion-guide.md`](docs/zapier-stripe-notion-guide.md) | Step-by-step Zapier configuration for Stripe → Notion sync |
| [`docs/business-operating-system-plan.md`](docs/business-operating-system-plan.md) | Full strategic architecture document |

## Portal Features

### Client View
- Project dashboard with status and metrics
- Task list grouped by phase (Getting Started → Offboarding)
- Deliverables with download links
- Invoice list with Stripe payment links
- Meeting history and upcoming meetings
- Project update feed
- Request/feedback submission form

### Admin View
- All projects overview
- Client management
- Billing dashboard
- Portal configuration management

## Design

- **Primary:** Charcoal `#2D2D2D`
- **Background:** Oat `#F5F0EB`
- **Accent:** Yellow `#F2C94C`
- Clean, card-based layout. No gradients, minimal shadows.
- Mobile-responsive with collapsible sidebar navigation.

## Setup

1. Configure Notion databases (see `docs/business-operating-system-plan.md`)
2. Set up Zapier automations (see `docs/zapier-stripe-notion-guide.md`)
3. Paste the Emergent prompt (see `docs/emergent-prompt.md`)
4. Connect your Notion API key in Emergent

## Contact

**Erick Sixto** — sixto.developer@gmail.com
[ericksixto.github.io](https://ericksixto.github.io/)
