# Notion Model Review

**Prepared:** April 10, 2026  
**Scope:** Current schema review, entity enhancements, and metadata recommendations for the Sixto Portal

---

## Executive Summary

The current Notion model is strong enough to power the existing portal, but it is still optimized around internal operations rather than a polished client-facing product surface.

The biggest structural opportunities are:

- decouple portal access from the single client email field
- stop overloading deliverables and proposals/contracts as the entire documents model
- introduce a true milestone layer instead of relying on a mix of task phase, updates, and meetings
- standardize shared metadata across all client-facing entities so sorting, visibility, publishing, and sync are more reliable

---

## Current Strengths

- `Client`, `Project`, `Task`, `Deliverables`, `Meetings`, `Updates`, and `Requests` already cover the core portal experience
- `Portal Config` gives the app a flexible per-project presentation layer
- `Client Visible` flags on tasks, deliverables, meetings, and updates are the right general pattern for selective exposure
- `Invoice` already includes external Stripe references, which is the correct direction for synchronized entities

---

## Structural Gaps

### 1. Portal access is too tightly coupled to `Client.Email`

Today the login model assumes one primary email lookup against the `Client` database. That works for a simple setup, but it becomes brittle when:

- a client has multiple stakeholders
- access needs to be given to an external project manager
- one person should access multiple clients or business units
- a user changes email without changing the client company record

### 2. Documents are still an inferred concept, not a real entity

The current portal assembles documents from:

- deliverable file attachments
- proposal files
- contract files

That is workable for an MVP, but it makes it hard to support:

- implementation guides
- runbooks
- credentials handoff checklists
- deployment notes
- ongoing reference material that is not a deliverable

### 3. Milestones are spread across multiple entities

Right now timeline communication is fragmented across:

- `Project Date`
- `Task.Phase`
- `Deliverables`
- `Updates`
- `Meetings`

This makes it harder to create a truly clear client timeline or progress narrative.

### 4. Shared metadata patterns are inconsistent

Important portal behaviors such as visibility, display order, ownership, and sync status are not standardized across entities. That creates extra app logic and makes the model harder to extend safely.

---

## Recommended New Entities

### 1. `Portal User`

Purpose:

- represent an individual who can sign into the portal

Suggested properties:

- `Name`
- `Email`
- `Status` (`Active`, `Invited`, `Disabled`)
- `Role` (`Client`, `Admin`, `Internal`)
- `Client` relation
- `Default Project` relation
- `Last Login At`
- `Notes`

Why it matters:

- separates authentication identity from the client company record
- supports multiple contacts per client
- makes deactivation and access review much cleaner

### 2. `Portal Membership`

Purpose:

- define which users can access which projects or clients

Suggested properties:

- `Portal User` relation
- `Client` relation
- `Project` relation
- `Access Scope` (`Client-wide`, `Project-specific`)
- `Status`
- `Starts At`
- `Ends At`

Why it matters:

- prevents access logic from being inferred indirectly
- supports exceptions cleanly
- gives the portal a real authorization model

### 3. `Document`

Purpose:

- become the canonical client-facing resource layer

Suggested properties:

- `Name`
- `Project` relation
- `Client` relation
- `Category` (`Guide`, `Runbook`, `Proposal`, `Contract`, `Reference`, `Asset`, `Report`)
- `Summary`
- `Files`
- `External URL`
- `Client Visible`
- `Sort Order`
- `Status` (`Draft`, `Published`, `Archived`)
- `Published At`

Why it matters:

- removes document logic from deliverables
- supports a richer documents experience without hacks

### 4. `Milestone`

Purpose:

- track major project moments independently from tasks and updates

Suggested properties:

- `Name`
- `Project` relation
- `Status` (`Upcoming`, `At Risk`, `Completed`)
- `Target Date`
- `Completed Date`
- `Owner`
- `Summary`
- `Client Visible`
- `Sort Order`

Why it matters:

- enables a clean roadmap/timeline surface
- improves customer understanding of progress beyond raw task counts

---

## Shared Metadata Baseline

The following metadata should be standardized across all client-facing entities wherever relevant:

| Metadata | Why it matters |
|---|---|
| `External ID` | Stable connector or source-system reference |
| `Portal Title` / `Client-Facing Title` | Lets internal naming differ from presentation naming |
| `Portal Summary` | Short UI-safe summary for cards and previews |
| `Client Visible` | Consistent visibility logic across entities |
| `Sort Order` | Stable ordering without relying on title/date only |
| `Owner` | Accountability and routing |
| `Status` | Standard lifecycle handling |
| `Published At` | Clear customer-facing publish timing |
| `Archived At` | Safer retirement of records without deleting history |
| `Source System` | Clarifies whether a record is native, synced from Stripe, etc. |
| `Source Last Synced At` | Debugging and trust signal for sync freshness |
| `Last Client-Facing Update At` | Useful for portal freshness, support, and reminders |

---

## Entity Enhancements

### Client

Recommended additions:

- `Primary Portal Contact`
- `Support Tier`
- `Timezone`
- `Billing Contact`
- `Portal Status`
- `Last Client Activity At`

Why:

- better routing, service expectations, and portal personalization

### Project

Recommended additions:

- `Project Health` (`On Track`, `At Risk`, `Blocked`)
- `Primary Owner`
- `Client-Facing Summary`
- `Start Date` and `End Date` alongside `Project Date` if reporting needs become more exact
- `Phase Label` for high-level stage independent of task phases
- `Primary CTA Type`
- `Last Update Published At`

Why:

- improves dashboard storytelling and customer confidence

### Task

Recommended additions:

- `Start Date`
- `Completed Date`
- `Blocked Reason`
- `Customer Action Needed` checkbox
- `Client-Facing Notes`
- `Sort Order`
- `Effort / Size`

Why:

- better task sequencing, better visibility into what is waiting on the client, and cleaner portal copy

### Invoice

Recommended additions:

- `Currency`
- `Paid Date`
- `Balance Due`
- `Billing Period`
- `Invoice PDF`
- `Reminder Status`
- `Source Last Synced At`

Why:

- gives billing richer status handling and better reporting

### Meetings

Recommended additions:

- `Meeting Type`
- `Agenda`
- `Recording URL`
- `Follow-up Owner`
- `Follow-up Due Date`
- `Outcome`

Why:

- meetings become more useful as a client memory system rather than just a schedule list

### Deliverables

Recommended additions:

- `Category`
- `Version`
- `Approved Date`
- `Approved By`
- `Preview URL`
- `Sort Order`

Why:

- improves handoff clarity and document browsing

### Updates

Recommended additions:

- `Author`
- `Audience`
- `Pinned`
- `Excerpt`
- `CTA Label`
- `CTA URL`

Why:

- updates can become more intentional communications instead of plain records

### Portal Config

Recommended additions:

- `Default Landing Tab`
- `Support SLA Text`
- `Escalation Contact`
- `Welcome Checklist Enabled`
- `Navigation Label Overrides`
- `Theme Variant`

Why:

- allows per-project portal tuning without changing app code

### Requests

Recommended additions:

- `Requester`
- `Assigned To`
- `Client-Facing Status`
- `Internal Notes`
- `Related Task`
- `Related Deliverable`
- `Target Response Date`
- `Resolved Date`

Why:

- supports a future customer-visible request history and better internal triage

---

## Recommended Priority

### Do Now

- add a dedicated `Portal User` or `Portal Membership` model
- define the canonical documents model
- standardize shared metadata: `Client Visible`, `Sort Order`, `Owner`, `Published At`, `Source Last Synced At`

### Do Next

- introduce `Milestone`
- add `Project Health`
- add request triage metadata (`Assigned To`, `Client-Facing Status`, `Resolved Date`)

### Do Later

- visual theming metadata in `Portal Config`
- richer billing metadata
- analytics-oriented activity metadata

---

## Bottom Line

The current schema is enough to keep building, but the next quality step is to shift from “records that happen to power a portal” to “entities intentionally designed for a client experience.”

The most valuable model change is a real access model. The most valuable content-model change is a real documents entity. The most valuable experience-model change is a milestone layer plus standardized metadata across every client-facing record.
