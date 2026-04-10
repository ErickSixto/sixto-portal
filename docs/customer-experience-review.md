# Customer Experience Review

**Prepared:** April 10, 2026
**Scope:** Portal experience review from the customer's point of view, including usability opportunities and recent improvements

---

## Overall Assessment

The portal already feels credible as a working client workspace: it has clear project structure, visible progress, support intake, and a stronger admin surface than many early internal tools.

The main customer-experience gap has not been “missing data.” It has been “clarity of next action.” Customers need faster answers to:

- What should I look at first?
- Is anything waiting on me?
- What changed recently?
- How do I ask for help?

---

## Journey Review

### 1. Sign-In

What works:

- simple magic-link flow
- no password friction
- clear admin/client distinction

What still needs work:

- there is no visible reassurance about what happens after sign-in
- there is no persistent explanation of response expectations or support behavior

### 2. Projects Home

What works:

- search and active/completed filters are useful
- project cards are visually clear

What still needs work:

- customers need a clearer “start here” moment
- the page previously felt like a file cabinet instead of a guided workspace

### 3. Project Overview

What works:

- progress and status are visible
- recent updates and upcoming meetings already provide useful context

What still needs work:

- raw metrics alone do not explain what needs attention
- customers need an explicit “what to do next” layer
- important project switching behavior should not disappear on smaller screens

### 4. Working Tabs

What works:

- tasks, deliverables, meetings, updates, and requests are all in place
- filters now make task review much easier

What still needs work:

- the portal still relies on the customer understanding the navigation model quickly
- documents remain structurally underdefined

### 5. Help And Support

What works:

- request submission exists

What still needs work:

- customers need stronger guidance on what request type to choose
- priority language needs context so “High” is not overused

---

## Improvements Shipped In This Pass

### Customer-Facing Usability

- added a clearer “start here” summary row on the projects home
- improved the project overview with attention counts, next-up guidance, and action cards
- added a mobile project switcher so multi-project customers are not forced into desktop-only controls
- improved request-form guidance so the customer knows how to categorize requests and set priority

### Trust And Consistency

- fixed dashboard counts so the overview reflects the same visibility rules as the tabs the customer actually sees

This matters because mismatched totals reduce confidence quickly, even if the raw data is technically correct internally.

---

## Remaining Friction Points

### 1. Navigation is still tab-first, not journey-first

Tabs are fine, but the portal still assumes users know where to look.

Recommended next step:

- introduce grouped navigation language such as `Overview`, `Work`, `Updates`, `Meetings`, and `Help`

### 2. Request history is missing

Customers can submit requests, but they cannot yet see what they have already asked for or whether it is being handled.

Recommended next step:

- add a request history view with customer-facing statuses

### 3. Document browsing still feels mechanical

The current documents experience is useful but not intuitive enough for long-term project reference.

Recommended next step:

- move to categories, summaries, and document-specific metadata

### 4. Service expectations are still implicit

Customers need lightweight expectations for:

- response time
- support path
- where urgent blockers belong

Recommended next step:

- display SLA text and support guidance from `Portal Config`

---

## Recommended Next UX Priorities

### Priority 1

- request history with visible statuses
- project health messaging (`On Track`, `At Risk`, `Blocked`)
- support expectations and SLA copy in the portal shell

### Priority 2

- deliverables filters and grouped document categories
- saved or persistent task filters
- visible “last update published” signal

### Priority 3

- milestone timeline / roadmap
- richer onboarding experience for first-time portal users
- in-app feedback after request submission and milestone completion

---

## Experience Principle Going Forward

The portal should behave less like a database viewer and more like a guided client workspace.

That means every page should help the customer answer three questions quickly:

- What changed?
- What needs my attention?
- What should I do next?

When the experience consistently answers those questions, the portal stops feeling like a reporting tool and starts feeling like a dependable client relationship surface.
