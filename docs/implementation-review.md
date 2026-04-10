# Sixto Portal Implementation Review

**Prepared:** April 9, 2026
**Scope:** Review of the current documentation-driven implementation, including product definition, data model, UX, and delivery readiness

---

## Current State

This repository now contains an Emergent-generated application scaffold alongside the original planning documents. The current implementation spans:

- the React frontend and FastAPI backend
- the portal product direction
- the Emergent build prompt
- the Notion schema contract
- the Stripe to Notion sync flow

That means the highest-value review is still a contract-and-implementation audit. The biggest risks today are inconsistent requirements, missing data contracts, UX behaviors that are implied but not fully defined, and drift between the generated app and the original docs.

---

## Executive Assessment

The product direction is strong. The portal concept is clear, the business model is coherent, and the overall information architecture is promising.

The weak point is implementation alignment. Right now, the repo describes four slightly different systems:

1. the current Notion schema in `config/notion-schema.md`
2. the future-state architecture in `docs/business-operating-system-plan.md`
3. the app contract in `docs/emergent-prompt.md`
4. the current frontend/backend implementation in `frontend/` and `backend/`

If development starts from these docs as-is, the team will likely lose time on rework around data mapping, permissions, admin capabilities, and page structure.

---

## Critical Bugs And Gaps

### 1. Data contract drift across docs

The current schema and the future-state plan do not use the same property names, types, or statuses.

Examples:

- `Client` uses `Company Name`, `Contact Person`, and `Email` in `config/notion-schema.md`, while the operating-system plan proposes `Name`, `Contact Email`, and `Contact Name`.
- `Invoice` uses `No`, `Fix cost`, and `Payment Status` in the active schema, while the plan proposes `Name`, `Amount`, and `Status`.
- `Project` uses `Project Date` in the active schema, while the plan proposes `Start Date` and `End Date`.

Impact:

- prompt-generated code may target the wrong fields
- Zapier mappings may break when the database evolves
- admin tools and reports will be brittle

Recommendation:

- declare `config/notion-schema.md` as the current source of truth
- mark the plan doc as future-state only
- add a single canonical "portal data contract" doc before implementation begins

### 2. Documents feature has no reliable backing model

The app prompt includes a `/documents` page and asks the app to show project documentation pages linked from the project record, but the active schema does not define a `Documents` relation or a document visibility model.

Impact:

- this page is underspecified and likely to become a hardcoded exception
- document visibility for clients is ambiguous
- the UI may ship with broken or empty document states

Recommendation:

- either remove `/documents` from the MVP
- or add a real `Documents` database with `Project`, `Client Visible`, `Type`, `URL`, `Files`, and `Sort Order`

### 3. Admin edit scope is inconsistent with the integration scope

The prompt says the admin can manage portal configuration values, but the integration section only explicitly permits writes to the `Requests` database.

Impact:

- unclear whether admin edits happen in-app or in Notion only
- generated implementation may omit admin mutations or improvise them incorrectly

Recommendation:

- choose one of these models and document it clearly:
- `MVP model:` admin reads everything in-app but edits data in Notion
- `Phase 2 model:` admin can update `Portal Config`, `Updates`, and `Requests` directly from the portal

### 4. Multi-project client behavior is underspecified

The prompt supports fetching all projects related to a client record, but it does not define how a client with multiple active or historical projects chooses context.

Impact:

- navigation ambiguity
- risk of showing the wrong project data by default
- potential information leakage across projects for the same client organization

Recommendation:

- add a required project switcher
- define a default project rule: most recently active, explicitly pinned, or only active project
- persist the selected project in the URL and session state

### 5. Billing automation guide is not robust enough yet

The Zapier guide mixes implementation formats and operational instructions in a way that will likely confuse setup.

Examples:

- `date:Issued on:start` and `date:Due Date:start` are tool-style field names, not normal Zapier field labels
- "New Invoice" is not always the safest trigger for finalized invoice records with hosted URLs
- the guide recommends create-first behavior and only later mentions duplicate protection

Impact:

- duplicate invoice records
- partially populated invoices
- failed date mappings during Zapier setup

Recommendation:

- switch the create flow to a finalized invoice event when possible
- add a find-or-create step before insert
- document field mapping exactly as it appears in Zapier

### 6. Authentication and authorization need a stronger definition

The prompt hardcodes one admin email and ties client access directly to email matching.

Impact:

- brittle admin access control
- difficult role changes later
- weak guidance for users who share a domain but should not see the same records

Recommendation:

- move admin allowlist to environment configuration
- add a `Portal Access` or `Portal User` model in Notion or auth config
- define authorization as `user -> client membership -> project access`, not just email match

---

## UX And Product Opportunities

### Navigation

The current page list is functional, but it is too flat for a polished client experience.

Recommended primary navigation:

- Dashboard
- Work
- Deliverables
- Billing
- Updates
- Meetings
- Help

Recommended structure:

- `Dashboard` for status, timeline, next actions, and summary cards
- `Work` as the home for tasks, roadmap, and documents
- `Help` as the home for requests, support contact, and shared resources

Recommended utilities in the header:

- project switcher
- last synced timestamp
- search
- profile/logout

### Filters

Filters are one of the highest-value quality-of-life additions for both clients and admins.

Recommended filter patterns by module:

- Tasks: status, phase, due date, priority, overdue only
- Deliverables: status, due this week, delivered, has files
- Billing: status, overdue only, paid only, date range
- Meetings: upcoming/past, date range, completed only
- Updates: type, date range, milestone only
- Admin projects: status, client, project type, value band

Recommended UX behavior:

- keep filters visible at the top of list pages
- show active filter chips
- allow one-click clear all
- keep default saved views for common states like `Overdue`, `Upcoming`, and `Needs Attention`

### Dashboard Improvements

The dashboard should answer four questions immediately:

1. What is happening now?
2. What needs attention?
3. What was completed recently?
4. What should the client do next?

Recommended dashboard blocks:

- project health summary
- upcoming milestones
- overdue or blocked tasks
- recent updates
- outstanding invoices
- next meeting
- primary call to action

### Better Empty States

The current spec defines data surfaces but not empty-state behavior.

Recommended empty states:

- no tasks yet: explain that project planning is in progress
- no invoices: confirm there are no outstanding billing items
- no meetings: invite the client to book or wait for scheduling
- no updates: explain when updates will appear

### Mobile Experience

The docs mention a collapsible sidebar, but the mobile behavior needs more definition.

Recommended mobile rules:

- switch from sidebar to bottom navigation or drawer
- keep project switcher pinned near the top
- convert dense tables to stacked cards
- preserve filters as horizontal chips instead of large panels

---

## Clean Design Direction

The current visual direction is appropriately minimal, but it needs stronger system guidance to avoid a generic generated UI.

Recommended design rules:

- use a consistent spacing scale such as `8 / 12 / 16 / 24 / 32`
- define design tokens for color, radius, spacing, borders, and status badges
- use one strong layout shell across all portal pages
- prefer clear sections and anchored headings over many small cards
- make status the most visually consistent pattern in the system

Recommended component set:

- app shell
- project switcher
- filter bar
- summary stat cards
- timeline/milestone rail
- status badge
- data table
- empty state
- callout banner
- activity feed item

Accessibility requirements:

- color is never the only status indicator
- all badge colors meet contrast targets
- keyboard navigation works for filters, nav, and tables
- dates and currency use consistent locale formatting

---

## Senior-Level Scope Recommendation

### Phase 0: Align the contract

Do this before any real build work.

- freeze the active Notion schema
- document current versus future property names
- decide what is in MVP and what is deferred
- remove or defer features without a backing model

### Phase 1: Build the clean client MVP

Recommended MVP scope:

- auth
- project switcher
- dashboard
- tasks with filters
- deliverables with filters
- billing with payment links
- updates feed
- meetings
- request form

Defer from MVP unless modeled properly:

- documents module
- in-app portal config editing
- advanced analytics

### Phase 2: Admin operations

- admin overview
- projects list
- billing dashboard
- request triage
- portal config read-only visibility or controlled editing

### Phase 3: Automation hardening

- Stripe finalized invoice sync
- payment and overdue updates
- duplicate protection
- request notifications
- optional GitHub and calendar sync

---

## Documentation Work To Add Next

The docs folder should eventually include these implementation documents:

- `docs/portal-data-contract.md`
- `docs/portal-sitemap-and-navigation.md`
- `docs/portal-mvp-scope.md`
- `docs/billing-automation-hardening.md`
- `docs/access-control-model.md`

---

## Recommended Immediate Decisions

Before building, make these decisions explicit:

1. Is `config/notion-schema.md` the canonical current schema?
2. Is `/documents` in or out of MVP?
3. Are admin edits in-app or only in Notion for v1?
4. What is the project-selection rule for clients with multiple projects?
5. Is the portal optimized for one active project at a time or a portfolio view?

---

## Final Recommendation

Do not remove everything and start over. The current direction is good.

Instead:

- keep the product vision
- tighten the data contract
- simplify the first release
- add strong navigation and filters early
- build the admin experience only after the client flow is stable

That path preserves the value of the work already done while reducing the biggest implementation risks.
