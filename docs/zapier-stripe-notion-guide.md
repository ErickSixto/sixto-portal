# Zapier Configuration Guide: Stripe → Notion Invoice Sync

**Purpose:** Automatically sync Stripe invoices to the Freelancer OS Invoice database in Notion.

**Prerequisites:**
- Active Stripe account with invoicing enabled
- Zapier account (Free tier supports 5 zaps)
- Notion integration connected to Zapier

---

## Database Reference

**Invoice DB** in Freelancer OS → Shared Database

| Notion Property    | Type   | Stripe Source                   |
|--------------------|--------|---------------------------------|
| No (title)         | Title  | Stripe Invoice Number           |
| Fix cost           | Number | Stripe Invoice Amount (÷ 100)   |
| Payment Status     | Select | Derived from event type          |
| Stripe Invoice ID  | Text   | Stripe Invoice ID (`in_...`)     |
| Stripe Invoice URL | URL    | Stripe Hosted Invoice URL        |
| Paid               | Check  | Set to true on payment           |
| Issued to          | Email  | Stripe Customer Email            |
| Due Date           | Date   | Stripe Invoice Due Date          |
| Issued on          | Date   | Stripe Invoice Created Date      |
| Type               | Select | "Fixed rate" (default)           |

---

## Zap 1: Stripe Invoice Created → Create Notion Record

### Trigger
- **App:** Stripe
- **Event:** New Invoice
- **Account:** Connect your Stripe account
- **Filter (optional):** Status = "open" (skip drafts if desired)

### Action
- **App:** Notion
- **Event:** Create Database Item
- **Account:** Connect your Notion account
- **Database:** Invoice (under Freelancer OS → Shared Database)

### Field Mapping

| Notion Field         | Stripe Field                                                  |
|----------------------|---------------------------------------------------------------|
| No                   | `Invoice Number` (e.g., INV-0001)                             |
| Fix cost             | `Amount Due` ÷ 100 (Stripe uses cents; use Zapier formatter)  |
| Payment Status       | Set to: **Sent**                                              |
| Stripe Invoice ID    | `Invoice ID` (the `in_...` identifier)                        |
| Stripe Invoice URL   | `Hosted Invoice URL`                                          |
| Issued to            | `Customer Email`                                              |
| Type                 | Set to: **Fixed rate** (or map from metadata if needed)       |
| date:Issued on:start | `Created` date (format: YYYY-MM-DD)                           |
| date:Due Date:start  | `Due Date` (format: YYYY-MM-DD)                               |
| Paid                 | Set to: **false** (`__NO__`)                                  |

### Notes
- Stripe amounts are in cents. Use a Zapier Formatter step: `Amount Due` → Divide by 100.
- The `Hosted Invoice URL` is the link clients click to pay.
- If you need to link to a specific Project, add a Zapier lookup step or set the Project relation manually after creation.

---

## Zap 2: Stripe Payment Received → Update Notion Record

### Trigger
- **App:** Stripe
- **Event:** Invoice Payment Succeeded (or "Invoice Paid")
- **Account:** Same Stripe account

### Find Step (Required)
- **App:** Notion
- **Event:** Find Database Item
- **Database:** Invoice
- **Search Property:** Stripe Invoice ID
- **Search Value:** Stripe `Invoice ID` from trigger

### Action
- **App:** Notion
- **Event:** Update Database Item
- **Database Item:** Use the item found in the Find step

### Field Mapping

| Notion Field    | Value                              |
|-----------------|------------------------------------|
| Payment Status  | Set to: **Paid**                   |
| Paid            | Set to: **true** (`__YES__`)       |

### Notes
- The Find step is critical -- it matches the Stripe invoice to the existing Notion record using the `Stripe Invoice ID` field.
- If the Find step returns no results, add a Zapier path to handle the case (e.g., create the record instead).

---

## Zap 3: Stripe Invoice Overdue → Update Notion Record

### Trigger
- **App:** Stripe
- **Event:** Invoice Past Due
- **Account:** Same Stripe account

### Find Step (Required)
- **App:** Notion
- **Event:** Find Database Item
- **Database:** Invoice
- **Search Property:** Stripe Invoice ID
- **Search Value:** Stripe `Invoice ID` from trigger

### Action
- **App:** Notion
- **Event:** Update Database Item
- **Database Item:** Use the item found in the Find step

### Field Mapping

| Notion Field   | Value                  |
|----------------|------------------------|
| Payment Status | Set to: **Overdue**    |

---

## Testing Checklist

1. [ ] Create a test invoice in Stripe → verify Notion record appears with correct data
2. [ ] Mark the test invoice as paid in Stripe → verify Notion record updates to "Paid"
3. [ ] Create a past-due test invoice → verify Notion record updates to "Overdue"
4. [ ] Verify `Stripe Invoice URL` links correctly to the Stripe hosted payment page
5. [ ] Verify amounts are correctly converted from cents to dollars

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Amount shows as cents (e.g., 90000 instead of 900) | Add Formatter step: Numbers → Divide by 100 |
| Find step returns no results | Ensure Zap 1 runs first; check Stripe Invoice ID field is populated |
| Notion connection fails | Re-authorize Notion in Zapier; ensure the integration has access to the Invoice database |
| Duplicate records created | Add a Find step before Create in Zap 1 to check if the record already exists |

---

*Set up these 3 zaps in order (Zap 1 first, then 2 and 3). Test with a real Stripe test-mode invoice before going live.*
