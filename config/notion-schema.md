# Notion Database Schema Reference

All databases live under **Freelancer OS → Shared Database** in Notion.

Shared Database page ID: `30dec4c7-cb79-8109-a189-d1c755167c53`

The IDs below are the Notion data source / collection IDs used for workspace documentation and MCP workflows. The app runtime in `backend/server.py` uses the Notion REST API database IDs, so those values are expected to differ.

## Database IDs (Data Source / Collection IDs)

| Database | Collection ID |
|----------|--------------|
| Client | `30dec4c7-cb79-8131-983c-000be71067b4` |
| Project | `30dec4c7-cb79-8115-ab8c-000b012e51d4` |
| Task | `30dec4c7-cb79-8104-8c98-000b9cd349ae` |
| Invoice | `30dec4c7-cb79-814d-9514-000bd278b7dd` |
| Meetings | `30dec4c7-cb79-812e-a217-000bcf85ad8e` |
| Proposal | `30dec4c7-cb79-811b-bf11-000b4f9c2fc5` |
| Contract | `30dec4c7-cb79-81dc-9835-000bda808756` |
| Leads | `30dec4c7-cb79-814b-80bc-000b6392e89f` |
| Deliverables | `732696b4-1b48-43b2-96f4-86b168695a60` |
| Updates | `be9d5735-853b-45fb-adb0-b5955ed6de8a` |
| Portal Config | `023e9656-73e9-41d5-a531-0a6215e59aa3` |
| Requests | `936d54e8-1dd2-4c3c-b57f-e5f5239924e3` |
| Portal Users | `29f4d51e-acd4-44f7-8ec5-0586d20f3e55` |
| Portal Documents | `6422e295-ecc9-4a96-8c31-5a312e3586bd` |
| Milestones | `e31b0502-81c3-4a28-8f62-85129d0e5a96` |

## Property Reference

### Client
| Property | Type | Notes |
|----------|------|-------|
| Company Name | Title | |
| Contact Person | Text | |
| Email | Text | Used for magic-link auth matching |
| Source | Select | Lead source |
| Status | Status | Inactive, Active, etc. |
| Industry | Select | |
| Stripe | Text | Stripe customer reference |
| Project | Relation → Project | |
| Proposal | Relation → Proposal | |
| Portal Config | Relation → Portal Config | |
| Requests | Relation → Requests | |
| Portal Users | Relation ← Portal Users | Reverse relation from portal identities |
| Portal Documents | Relation ← Portal Documents | Reverse relation from client-facing documents |
| Milestones | Relation ← Milestones | Reverse relation from project roadmap milestones |
| Primary Portal Contact | Relation → Portal Users | Preferred portal contact |
| Billing Contact | Email | Billing destination or finance contact |
| Timezone | Text | Client operating timezone |
| Portal Notes | Text | Internal notes for portal setup and support |

### Project
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | |
| Client | Relation → Client | |
| Status | Status | Not started, Onboarding, Research, In progress, Off boarding, Lost, Done |
| Project Type | Multi-select | One-Time Project, Retainer, etc. |
| Branch | Text | GitHub branch name |
| Project Date | Date (range) | Start and end dates |
| Estimated Amount | Number (dollar) | |
| Task | Relation → Task | |
| Invoice | Relation → Invoice | |
| Meetings | Relation → Meetings | |
| Proposal | Relation → Proposal | |
| Contract | Relation → Contract | |
| Deliverables | Relation → Deliverables | |
| Updates | Relation → Updates | |
| Portal Config | Relation → Portal Config | |
| Requests | Relation → Requests | |
| Portal Members | Relation ← Portal Users | Reverse relation from accessible portal users |
| Portal Documents | Relation ← Portal Documents | Reverse relation from client-facing documents |
| Milestones | Relation ← Milestones | Reverse relation from the milestone roadmap |
| Project Health | Select | On Track, At Risk, Blocked, Completed |
| Client-Facing Summary | Text | Overview copy for the portal |
| Primary Owner | People | Internal owner accountable for the project |
| Last Update Published At | Date | Most recent published client update |

### Task
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | |
| Project | Relation → Project | |
| Status | Status | Not Started, In progress, Blocked, Won't Do, Done |
| Priority | Select | High, Medium, Low |
| Due Date | Date | |
| Phase | Select | Getting Started, Planning, Implementation, Offboarding |
| Client Visible | Checkbox | Portal display filter |
| Assignee | People | |
| Notes | Text | |
| Tag | Select | Research, Configuration, Development, Communication, Support, Others |
| Customer Action Needed | Checkbox | Surfaces work blocked on the client |
| Blocked Reason | Text | Explanation for blocked tasks |
| Client-Facing Notes | Text | UI-safe notes shown in the portal |
| Sort Order | Number | Stable ordering within the portal |

### Invoice
| Property | Type | Notes |
|----------|------|-------|
| No | Title | Invoice number |
| Project | Relation → Project | |
| Fix cost | Number (dollar) | Invoice amount |
| Paid | Checkbox | Legacy boolean |
| Payment Status | Select | Draft, Sent, Paid, Overdue, Cancelled |
| Due Date | Date | |
| Issued on | Date | |
| Issued to | Email | |
| Type | Select | Fixed rate, Hourly rate, Fiverr Order |
| Stripe Invoice ID | Text | Stripe `in_...` reference |
| Stripe Invoice URL | URL | Hosted payment page |
| Paid Date | Date | Date payment cleared |
| Billing Period | Text | Human-readable covered period |
| Balance Due | Number (dollar) | Remaining amount owed |
| Source Last Synced At | Date | Last successful sync timestamp |

### Meetings
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | |
| Project | Relation → Project | |
| Date & Time | Date | |
| Meeting Link | URL | |
| Status | Status | Scheduled, Invite Sent, Tentative, Rescheduled, Cancelled, Completed |
| Client Visible | Checkbox | Portal display filter |
| Participant | Text | |
| Meeting Summary | Text | |
| Notes | Text | |
| Meeting Type | Select | Kickoff, Weekly Sync, Review, Workshop, Support, Other |
| Agenda | Text | Agenda or pre-read summary |
| Outcome | Text | Main outcome or conclusion |
| Recording URL | URL | Recording or replay link |

### Deliverables
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | |
| Project | Relation → Project | |
| Status | Select | Pending, In Progress, Delivered, Accepted |
| Due Date | Date | |
| Delivered Date | Date | |
| Description | Text | |
| Files | Files | |
| Client Visible | Checkbox | Portal display filter |
| Portal Documents | Relation ← Portal Documents | Reverse relation from canonical portal docs |
| Category | Select | Guide, Report, Asset, Handoff, Reference |
| Version | Text | Version label for handoffs |
| Approved By | Text | Approver name or team |
| Sort Order | Number | Stable ordering within the portal |

### Updates
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | |
| Project | Relation → Project | |
| Date | Date | |
| Content | Text | |
| Type | Select | Status Update, Milestone, Announcement, Request |
| Client Visible | Checkbox | Portal display filter |
| Author | People | Internal author of the update |
| Pinned | Checkbox | Elevates important updates in the portal |
| Excerpt | Text | Short preview copy for cards |
| CTA Label | Text | Optional call-to-action label |
| CTA URL | URL | Optional call-to-action destination |

### Portal Config
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | Config identifier |
| Project | Relation → Project | |
| Client | Relation → Client | |
| Portal Title | Text | Display title in portal |
| Portal Intro | Text | Welcome message |
| Contact Email | Email | |
| Show Tasks | Checkbox | Section toggle |
| Show Meetings | Checkbox | Section toggle |
| Show Invoices | Checkbox | Section toggle |
| Show Deliverables | Checkbox | Section toggle |
| Show Roadmap | Checkbox | Section toggle |
| Show Documents | Checkbox | Section toggle |
| Show Feedback | Checkbox | Section toggle |
| CTA Label | Text | Primary action button text |
| CTA URL | URL | Primary action link |
| Support Contact | Text | |
| Status | Select | Draft, Active, Archived |
| Default Landing Tab | Select | Overview, Tasks, Deliverables, Documents, Meetings, Updates, Request |
| Support SLA Text | Text | Client-facing support expectations |
| Escalation Contact | Text | Escalation destination for support |
| Welcome Checklist Enabled | Checkbox | Enables first-visit onboarding guidance |

### Requests
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | Request subject |
| Project | Relation → Project | |
| Client | Relation → Client | |
| Type | Select | Change Request, Question, Feedback, Support |
| Priority | Select | Low, Medium, High |
| Description | Text | |
| Status | Select | New, In Review, Resolved, Closed |
| Date | Date | Submission date |
| Assigned To | People | Internal request owner |
| Requester Email | Email | Email captured at submission time |
| Client-Facing Status | Select | Received, Planned, In Progress, Delivered, Closed |
| Target Response Date | Date | SLA or promised response date |
| Resolved Date | Date | When the request was fully resolved |

### Portal Users
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | Portal identity name |
| Email | Email | Login identity email |
| Status | Select | Active, Invited, Disabled |
| Role | Select | Client, Admin, Internal |
| Client | Relation → Client | Home client account |
| Accessible Projects | Relation → Project | Projects this user can access |
| Default Project | Relation → Project | Default landing project |
| Access Scope | Select | Client-wide or project-specific |
| Last Login At | Date | Latest successful sign-in |
| Notes | Text | Internal access notes |

### Portal Documents
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | Client-facing document title |
| Project | Relation → Project | Owning project |
| Client | Relation → Client | Owning client |
| Category | Select | Guide, Report, Proposal, Contract, Asset, Reference |
| Client-Facing Title | Text | Preferred display title in the portal UI |
| Summary | Text | Portal card summary |
| Files | Files | Attached deliverables or docs |
| External URL | URL | External destination if hosted elsewhere |
| Client Visible | Checkbox | Portal display filter |
| Sort Order | Number | Stable ordering in the documents view |
| Status | Select | Draft, Published, Archived |
| Published At | Date | Publish timestamp for client visibility |
| Source System | Select | Native, Deliverable, Proposal, Contract, External |
| External ID | Text | Stable source reference for sync jobs |
| Owner | People | Internal owner for document quality and routing |
| Source Last Synced At | Date | Last successful upstream sync |
| Last Reviewed At | Date | Most recent manual QA/review pass |
| Needs Review | Checkbox | Flags docs that need editorial review |
| Deliverable Source | Relation → Deliverables | Canonical source deliverable when synced |
| Proposal Source | Relation → Proposal | Canonical source proposal when synced |
| Contract Source | Relation → Contract | Canonical source contract when synced |

### Milestones
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | Milestone title shown in roadmap views |
| Project | Relation → Project | Owning project |
| Client | Relation → Client | Owning client |
| Status | Select | Upcoming, At Risk, Completed |
| Milestone Type | Select | Kickoff, Approval, Delivery, Launch, Billing, Other |
| Target Date | Date | Planned milestone date |
| Completed Date | Date | Actual completion date |
| Summary | Text | Client-facing milestone context |
| Owner | People | Internal owner accountable for follow-through |
| Client Visible | Checkbox | Portal display filter |
| Sort Order | Number | Stable ordering across roadmap views |
| Customer Action Needed | Checkbox | Highlights milestones blocked on the client |
| CTA Label | Text | Optional customer-facing action label |
| CTA URL | URL | Optional customer-facing action destination |
