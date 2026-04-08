# Notion Database Schema Reference

All databases live under **Freelancer OS → Shared Database** in Notion.

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

### Updates
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | |
| Project | Relation → Project | |
| Date | Date | |
| Content | Text | |
| Type | Select | Status Update, Milestone, Announcement, Request |
| Client Visible | Checkbox | Portal display filter |

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
