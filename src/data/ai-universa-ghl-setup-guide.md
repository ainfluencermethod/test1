# AI Universa — GoHighLevel Email Platform Setup Guide

> **Campaign:** AI Universa 3-Day Free YouTube Workshop (April 15–17, 2026)
> **Language:** Slovenian
> **Creator:** Pici / Nepridiprav
> **Domain:** aiuniversa.si
> **Database:** 22,000 contacts (1,400 buyers · 20,600 non-buyers)
> **Email sequences:** 29 emails across 6 flows
> **Offer:** €897.99 standard / €2,500 VIP

---

## Table of Contents

1. [Account & Domain Setup](#1-account--domain-setup)
2. [Contact Management](#2-contact-management)
3. [Email Flows Configuration](#3-email-flows-configuration)
4. [Automation Workflows (GHL-Specific)](#4-automation-workflows-ghl-specific)
5. [Tracking & Analytics Setup](#5-tracking--analytics-setup)
6. [Deliverability Best Practices](#6-deliverability-best-practices)
7. [Testing Checklist](#7-testing-checklist)
8. [Launch Timeline](#8-launch-timeline)

---

## 1. Account & Domain Setup

### 1.1 Create a Sub-Account

1. Log in to your GoHighLevel **Agency** dashboard.
2. Go to **Settings → Sub-Accounts → Create Sub-Account**.
3. Fill in:
   - **Name:** AI Universa
   - **Industry:** Education / Online Courses
   - **Timezone:** Europe/Ljubljana (CET/CEST)
   - **Currency:** EUR
4. Click **Save**. You'll be redirected to the new sub-account.

> 💡 Using a dedicated sub-account keeps AI Universa contacts, workflows, and analytics isolated from other projects.

### 1.2 Connect Custom Sending Domain

GHL uses **Mailgun** (or LC Email) under the hood. You need to verify `aiuniversa.si` for email sending.

1. Inside the sub-account, go to **Settings → Email Services**.
2. If using **LC Email (GoHighLevel's built-in):**
   - Click **Add Domain** → enter `aiuniversa.si`.
   - GHL will generate DNS records for you.
3. If using **Mailgun integration:**
   - Go to **Settings → Integrations → Mailgun**.
   - Enter your Mailgun API key and connect.
   - Add `aiuniversa.si` as a verified domain in Mailgun, then map it in GHL.

### 1.3 DNS Records — SPF, DKIM, DMARC

Log in to your domain registrar (where `aiuniversa.si` is managed) and add these DNS records:

#### SPF Record
| Type | Host | Value |
|------|------|-------|
| TXT | `@` | `v=spf1 include:mg.aiuniversa.si include:_spf.google.com ~all` |

> Adjust the `include:` based on which sending service GHL assigns. The exact value is shown in GHL's domain verification screen.

#### DKIM Record
| Type | Host | Value |
|------|------|-------|
| TXT | `smtp._domainkey` | *(Copy the long DKIM key from GHL's Email Services screen)* |

> GHL/Mailgun generates a unique DKIM key per domain. Copy it exactly — no line breaks.

#### DMARC Record
| Type | Host | Value |
|------|------|-------|
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@aiuniversa.si; pct=100` |

> Start with `p=quarantine`. After 2–4 weeks of clean sending, upgrade to `p=reject`.

#### Verification Steps
1. After adding all records, return to GHL **Email Services** and click **Verify**.
2. DNS propagation can take 15 min to 48 hours. Use [MXToolbox](https://mxtoolbox.com/SuperTool.aspx) to check.
3. All three (SPF ✅, DKIM ✅, DMARC ✅) must show **verified** before sending any campaign emails.

### 1.4 Set "From" Address & Reply-To

1. Go to **Settings → Email Services → Sending Configuration**.
2. Set:
   - **From Name:** `Pici | AI Universa`
   - **From Email:** `pici@aiuniversa.si`
   - **Reply-To:** `pici@aiuniversa.si` (or a monitored inbox)
3. Add a secondary from address for transactional emails:
   - **From Name:** `AI Universa`
   - **From Email:** `info@aiuniversa.si`

### 1.5 Domain Warm-Up Plan

⚠️ **CRITICAL:** Sending to 22,000 contacts from a cold domain will land you in spam. You MUST warm up.

See [Section 6](#6-deliverability-best-practices) for the full warm-up schedule. Start warm-up **no later than March 11, 2026** (5 weeks before the event).

---

## 2. Contact Management

### 2.1 Custom Fields Setup

Before importing contacts, create these custom fields:

1. Go to **Settings → Custom Fields → Create Field**.
2. Create:

| Field Name | Field Key | Type | Options/Notes |
|---|---|---|---|
| Buyer Status | `buyer_status` | Dropdown | `buyer`, `non_buyer` |
| Registered Date | `registered_date` | Date | When they registered for the workshop |
| VIP Status | `vip_status` | Dropdown | `none`, `vip_prospect`, `vip_customer` |
| Registration Status | `registration_status` | Dropdown | `not_registered`, `registered`, `attended` |
| Engagement Level | `engagement_level` | Dropdown | `cold`, `warm`, `hot` |
| Workshop Day Attended | `workshop_days` | Multi-select | `day1`, `day2`, `day3` |
| Purchase Product | `purchase_product` | Dropdown | `none`, `standard_897`, `vip_2500` |

### 2.2 Tag Strategy

Create these tags (go to **Contacts → Tags → Add Tag**):

**Buyer Status Tags:**
- `buyer` — existing 1,400 buyers
- `non-buyer` — 20,600 non-buyers

**Registration Tags:**
- `registered` — signed up for free workshop
- `not-registered` — hasn't signed up yet

**Flow Control Tags:**
- `flow-preevent-started` — entered pre-event sequence
- `flow-event-started` — entered event sequence
- `flow-sales-started` — entered sales sequence
- `flow-urgency-started` — entered urgency sequence
- `post-reg-complete` — completed post-registration flow

**Engagement Tags:**
- `opened-email` — has opened at least one email
- `clicked-email` — has clicked at least one link
- `attended-day1`, `attended-day2`, `attended-day3`

**Outcome Tags:**
- `purchased-standard` — bought €897.99 product
- `purchased-vip` — bought €2,500 VIP
- `unsubscribed`

### 2.3 Import Contacts

1. Prepare two CSV files:
   - `buyers_1400.csv` — columns: `first_name`, `email`, `buyer_status` (value: `buyer`)
   - `nonbuyers_20600.csv` — columns: `first_name`, `email`, `buyer_status` (value: `non_buyer`)

2. Go to **Contacts → Import → CSV Upload**.

3. **Import Buyers first:**
   - Upload `buyers_1400.csv`
   - Map columns: `first_name` → First Name, `email` → Email, `buyer_status` → Buyer Status
   - **Add Tag on Import:** `buyer`
   - Click **Import**

4. **Import Non-Buyers:**
   - Upload `nonbuyers_20600.csv`
   - Map same columns
   - **Add Tag on Import:** `non-buyer`
   - Click **Import**

5. Verify counts:
   - Go to **Contacts → Smart Lists**
   - Create list: Tag = `buyer` → should show ~1,400
   - Create list: Tag = `non-buyer` → should show ~20,600

### 2.4 Create Smart Lists (Segments)

Create these Smart Lists for quick access and workflow triggers:

| Smart List Name | Filter Conditions |
|---|---|
| All Buyers | Tag contains `buyer` |
| All Non-Buyers | Tag contains `non-buyer` |
| Registered Non-Buyers | Tag contains `non-buyer` AND `registered` |
| Unregistered Non-Buyers | Tag contains `non-buyer` AND NOT `registered` |
| Registered Buyers | Tag contains `buyer` AND `registered` |
| Warm-Up Batch 1 | Tag contains `non-buyer` AND `opened-email` (most engaged first) |
| Sales Eligible | Tag contains `non-buyer` AND NOT `purchased-standard` AND NOT `purchased-vip` |

---

## 3. Email Flows Configuration

### Overview: 29 Emails Across 6 Flows

| Flow | Emails | Target | Trigger | Goal |
|---|---|---|---|---|
| 1A: Pre-Event Non-Buyers | 6 | Non-buyers | Campaign start (Mar 25) | Register for workshop |
| 1B: Pre-Event Buyers VIP | 4 | Buyers | Campaign start (Mar 25) | Re-engage, VIP preview |
| 2: Event Flow | 7 | All registered | April 15 | Attendance + engagement |
| 3: Post-Event Sales | 5 | Non-buyers only | April 17 evening | Convert to paid |
| 4: Urgency | 4 | Non-buyers only | April 20 | Final push before close |
| 5: Post-Registration + Reminders | 3 | New registrants | Form submission | Confirm + remind |

**Total: 29 emails** (6 + 4 + 7 + 5 + 4 + 3)

---

### Flow 1A: Pre-Event Non-Buyers (6 emails)

**Workflow Name:** `AIU - Pre-Event - Non-Buyers`
**Trigger:** Tag `non-buyer` is applied + Date is March 25, 2026
**Goal:** Get non-buyers to register for the free workshop

| # | Email | Send Date | Wait Step | Notes |
|---|---|---|---|---|
| 1 | Announcement / Tease | Mar 25 (Day -21) | — | Big reveal: free 3-day workshop |
| 2 | Value Stack / What You'll Learn | Mar 28 (Day -18) | Wait 3 days | Content preview, social proof |
| 3 | Behind the Scenes / Story | Apr 1 (Day -14) | Wait 4 days | Personal story, why this matters |
| 4 | Social Proof / Testimonials | Apr 6 (Day -9) | Wait 5 days | Past results, screenshots |
| 5 | Last Chance to Register | Apr 12 (Day -3) | Wait 6 days | Urgency, spots filling up |
| 6 | Tomorrow It Starts | Apr 14 (Day -1) | Wait 2 days | Final reminder, logistics |

**Workflow Steps in GHL:**
```
Trigger: Contact Tag Added = "non-buyer"
  → Filter: Date is on or after March 25, 2026
  → Send Email #1 (Announcement)
  → Wait 3 days
  → If/Else: Tag contains "registered"?
      → YES: Remove from workflow (they'll enter Post-Registration flow)
      → NO: Send Email #2 (Value Stack)
  → Wait 4 days
  → If/Else: Tag contains "registered"?
      → YES: Remove from workflow
      → NO: Send Email #3 (Behind the Scenes)
  → Wait 5 days
  → If/Else: Tag contains "registered"?
      → YES: Remove from workflow
      → NO: Send Email #4 (Social Proof)
  → Wait 6 days
  → If/Else: Tag contains "registered"?
      → YES: Remove from workflow
      → NO: Send Email #5 (Last Chance)
  → Wait 2 days
  → If/Else: Tag contains "registered"?
      → YES: Remove from workflow
      → NO: Send Email #6 (Tomorrow It Starts)
  → Add Tag: "flow-preevent-complete"
```

> 💡 The If/Else checks after each wait ensure contacts who register mid-flow stop getting "register now" emails. They transition to the Post-Registration + Reminders flow automatically.

---

### Flow 1B: Pre-Event Buyers VIP (4 emails)

**Workflow Name:** `AIU - Pre-Event - Buyers VIP`
**Trigger:** Tag `buyer` is applied + Date is March 25, 2026
**Goal:** Re-engage existing buyers, give exclusive VIP preview

| # | Email | Send Date | Wait Step | Notes |
|---|---|---|---|---|
| 1 | Exclusive Invitation | Mar 25 (Day -21) | — | VIP tone: "You're getting early access" |
| 2 | What's New / Preview | Apr 1 (Day -14) | Wait 7 days | Sneak peek of workshop content |
| 3 | Your VIP Perks | Apr 9 (Day -6) | Wait 8 days | What they get that others don't |
| 4 | See You Tomorrow | Apr 14 (Day -1) | Wait 5 days | Logistics, VIP links |

**Workflow Steps in GHL:**
```
Trigger: Contact Tag Added = "buyer"
  → Filter: Date is on or after March 25, 2026
  → Send Email #1 (Exclusive Invitation)
  → Wait 7 days
  → Send Email #2 (What's New)
  → Wait 8 days
  → Send Email #3 (VIP Perks)
  → Wait 5 days
  → Send Email #4 (See You Tomorrow)
  → Add Tag: "flow-preevent-buyers-complete"
```

> No registration If/Else needed — buyers are assumed to attend. Just add `registered` tag to all buyers on import if they auto-qualify.

---

### Flow 2: Event Flow (7 emails)

**Workflow Name:** `AIU - Event Flow`
**Trigger:** Date = April 15, 2026 + Tag contains `registered`
**Goal:** Drive attendance and engagement across all 3 days

| # | Email | Send Date/Time | Notes |
|---|---|---|---|
| 1 | Day 1 Morning — We're LIVE | Apr 15, 08:00 CET | YouTube link, schedule, excitement |
| 2 | Day 1 Evening — Replay + Homework | Apr 15, 20:00 CET | Replay link, key takeaways |
| 3 | Day 2 Morning — Day 2 Starts Now | Apr 16, 08:00 CET | Tease day 2 content, link |
| 4 | Day 2 Evening — Replay + Progress | Apr 16, 20:00 CET | Replay, community engagement |
| 5 | Day 3 Morning — The Big Day | Apr 17, 08:00 CET | This is where it all comes together |
| 6 | Day 3 Evening — What's Next | Apr 17, 20:00 CET | Recap, transition to offer |
| 7 | Thank You + What's Coming | Apr 18, 10:00 CET | Gratitude, hint at offer |

**Workflow Steps in GHL:**
```
Trigger: Date/Time = April 15, 2026 08:00 CET
  → Filter: Tag contains "registered"
  → Send Email #1 (Day 1 Morning)
  → Wait until April 15, 20:00
  → Send Email #2 (Day 1 Evening)
  → Wait until April 16, 08:00
  → Send Email #3 (Day 2 Morning)
  → Wait until April 16, 20:00
  → Send Email #4 (Day 2 Evening)
  → Wait until April 17, 08:00
  → Send Email #5 (Day 3 Morning)
  → Wait until April 17, 20:00
  → Send Email #6 (Day 3 Evening)
  → Wait until April 18, 10:00
  → Send Email #7 (Thank You)
  → Add Tag: "flow-event-complete"
```

> 🕒 Use **"Wait until specific date/time"** steps (not relative waits) to hit exact send times. GHL supports this under Wait → Specific Date/Time.

---

### Flow 3: Post-Event Sales (5 emails) — ⚠️ NON-BUYERS ONLY

**Workflow Name:** `AIU - Post-Event Sales`
**Trigger:** Tag `flow-event-complete` added + Tag `non-buyer` present
**Goal:** Convert attendees to €897.99 standard or €2,500 VIP

> 🚨 **CRITICAL EXCLUSION:** This flow must NEVER reach contacts with the `buyer` tag. The If/Else filter at entry is your primary safeguard. Add a second check inside the workflow as a failsafe.

| # | Email | Timing | Notes |
|---|---|---|---|
| 1 | The Offer Is Open | Day 0 (Apr 17 evening) | Full offer reveal, pricing, bonuses |
| 2 | Deep Dive — What's Inside | Day 1 (Apr 18) | Detailed breakdown of what they get |
| 3 | Success Stories / Proof | Day 2 (Apr 19) | Testimonials, case studies, results |
| 4 | FAQ / Objection Handling | Day 3 (Apr 20) | Common questions, risk reversal |
| 5 | Final Call — Doors Closing Soon | Day 4 (Apr 21) | Transition to urgency flow |

**Workflow Steps in GHL:**
```
Trigger: Tag Added = "flow-event-complete"
  → If/Else: Tag contains "buyer"?
      → YES: ❌ STOP (End workflow — do NOT continue)
      → NO: Continue ↓
  → If/Else: Tag contains "purchased-standard" OR "purchased-vip"?
      → YES: ❌ STOP
      → NO: Continue ↓
  → Add Tag: "flow-sales-started"
  → Send Email #1 (Offer Is Open)
  → Wait 1 day
  → If/Else: Tag contains "purchased-standard" OR "purchased-vip"?
      → YES: ❌ STOP
      → NO: Send Email #2 (Deep Dive)
  → Wait 1 day
  → If/Else: purchased? → Stop or Send Email #3
  → Wait 1 day
  → If/Else: purchased? → Stop or Send Email #4
  → Wait 1 day
  → If/Else: purchased? → Stop or Send Email #5
  → Add Tag: "flow-sales-complete"
```

> 🛡️ **Triple Protection Against Buyers Getting Sales Emails:**
> 1. Entry filter checks for `buyer` tag → blocks entry
> 2. Entry filter checks for `purchased-*` tags → blocks re-entry
> 3. Every email step re-checks purchase status → exits if purchased mid-flow

---

### Flow 4: Urgency (4 emails) — ⚠️ NON-BUYERS ONLY

**Workflow Name:** `AIU - Urgency Countdown`
**Trigger:** Tag `flow-sales-complete` added + Tag `non-buyer` present
**Goal:** Final 48-hour push before cart closes

> 🚨 Same buyer exclusion rules as Flow 3.

| # | Email | Timing | Notes |
|---|---|---|---|
| 1 | 48 Hours Left | Apr 21 evening | Countdown begins, recap value |
| 2 | 24 Hours Left | Apr 22 morning | Scarcity, last bonuses expiring |
| 3 | Tonight at Midnight | Apr 22 evening | Final hours, emotional close |
| 4 | CLOSED (or Last Chance) | Apr 23 morning | Cart closed / extended grace period |

**Workflow Steps in GHL:**
```
Trigger: Tag Added = "flow-sales-complete"
  → If/Else: Tag contains "buyer"? → YES: STOP
  → If/Else: Tag contains "purchased-*"? → YES: STOP
  → Add Tag: "flow-urgency-started"
  → Send Email #1 (48 Hours Left)
  → Wait 12 hours
  → If/Else: purchased? → Stop or Send Email #2 (24 Hours Left)
  → Wait 12 hours
  → If/Else: purchased? → Stop or Send Email #3 (Tonight at Midnight)
  → Wait 12 hours
  → If/Else: purchased? → Stop or Send Email #4 (CLOSED)
  → Add Tag: "flow-urgency-complete"
  → Add Tag: "campaign-complete"
```

---

### Flow 5: Post-Registration + Reminders (3 emails)

**Workflow Name:** `AIU - Post-Registration`
**Trigger:** Tag `registered` is added (via form submission or webhook)
**Goal:** Confirm registration, build anticipation, remind before event

| # | Email | Timing | Notes |
|---|---|---|---|
| 1 | Welcome — You're In! | Immediate | Confirmation, what to expect, save the date |
| 2 | Reminder — Tomorrow We Start | Apr 14, 18:00 CET | Logistics, YouTube link, schedule |
| 3 | We're Live — Join Now! | Apr 15, 07:45 CET | Direct link, 15 min before start |

**Workflow Steps in GHL:**
```
Trigger: Tag Added = "registered"
  → Send Email #1 (Welcome — Immediate)
  → Add Tag: "post-reg-started"
  → Wait until April 14, 2026 18:00 CET
  → Send Email #2 (Tomorrow Reminder)
  → Wait until April 15, 2026 07:45 CET
  → Send Email #3 (We're Live)
  → Add Tag: "post-reg-complete"
```

> This flow runs independently of pre-event flows. When a contact registers, they're removed from the pre-event "register now" sequence AND enrolled here simultaneously.

---

## 4. Automation Workflows (GHL-Specific)

### 4.1 Building Workflows in GHL

1. Go to **Automation → Workflows → Create Workflow → Start from Scratch**.
2. Name it using the naming convention: `AIU - [Flow Name]`.
3. Each workflow has: **Trigger → Actions → Conditions → End**.

### 4.2 Key GHL Workflow Elements Used

| Element | GHL Location | What It Does |
|---|---|---|
| **Trigger: Tag Added** | Workflow Trigger → Contact Tag | Starts when a specific tag is applied |
| **Trigger: Date/Time** | Workflow Trigger → Date/Time | Fires at a specific date/time |
| **Send Email** | Action → Send Email | Sends a configured email template |
| **Wait** | Action → Wait | Pauses workflow (relative time or specific date) |
| **If/Else** | Action → If/Else | Conditional branch based on tags, fields, etc. |
| **Add Tag** | Action → Add Contact Tag | Applies a tag to the contact |
| **Remove Tag** | Action → Remove Contact Tag | Removes a tag |
| **End / Stop** | Action → End This Workflow | Stops the contact in this workflow |

### 4.3 Buyer Exclusion Setup (⚠️ CRITICAL)

This is the most important safety mechanism in the entire campaign. Buyers must **never** receive sales/urgency emails.

**Primary Method — Entry-Level If/Else:**
```
At the START of Flow 3 and Flow 4:

If/Else Condition:
  → Contact Tag → Contains → "buyer"
  → Branch YES: Go to → "End This Workflow"
  → Branch NO: Continue to next step

THEN a second If/Else:
  → Contact Tag → Contains ANY of → "purchased-standard", "purchased-vip"
  → Branch YES: → "End This Workflow"
  → Branch NO: Continue
```

**Secondary Method — Pre-Step Checks:**
Before every `Send Email` action in Flows 3 and 4, add:
```
If/Else: Contact Tag contains "buyer" OR "purchased-standard" OR "purchased-vip"
  → YES: End This Workflow
  → NO: Send Email
```

**Tertiary Method — Workflow Settings:**
1. In each sales/urgency workflow, click the **workflow settings gear** (⚙️).
2. Under **Enrollment Settings**, set:
   - **Filter:** Contact Tag does NOT contain `buyer`
   - This prevents buyers from even entering the workflow.

> 🔐 Use ALL THREE methods. Belt, suspenders, and duct tape. One accidental sales email to a buyer can damage trust permanently.

### 4.4 Flow Transitions

Contacts move between flows via **tags**. Here's the flow map:

```
IMPORT
  ├── Tag: "buyer" → Flow 1B (Pre-Event Buyers)
  └── Tag: "non-buyer" → Flow 1A (Pre-Event Non-Buyers)

REGISTRATION (any point)
  └── Tag: "registered" → Flow 5 (Post-Registration)
      └── Also removes from Flow 1A (if still running)

EVENT START (April 15)
  └── Tag: "registered" → Flow 2 (Event Flow)

EVENT END (April 17)
  └── Tag: "flow-event-complete"
      ├── Buyers → STOP (no further flows)
      └── Non-buyers → Flow 3 (Sales)

SALES COMPLETE
  └── Tag: "flow-sales-complete"
      └── Non-buyers (not purchased) → Flow 4 (Urgency)

PURCHASE (any point)
  └── Tag: "purchased-standard" or "purchased-vip"
      → Immediately exits Flow 3 and Flow 4
      → Optional: Send "Thank You" email
```

### 4.5 Registration Tracking via Webhook

When someone registers on the landing page (aiuniversa.si), you need to:

1. **Create a GHL Form or use an Inbound Webhook:**
   - Go to **Sites → Forms → Create Form** (if using GHL landing page)
   - OR go to **Automation → Workflows → Trigger → Inbound Webhook**

2. **For external landing page (recommended):**
   - In your workflow, create a trigger: **Inbound Webhook**
   - GHL generates a unique webhook URL like:
     ```
     https://services.leadconnectorhq.com/hooks/xxxxxxx
     ```
   - Send this URL to your developer
   - The landing page should POST to this URL with `email` and `first_name` on form submit

3. **Webhook workflow:**
   ```
   Trigger: Inbound Webhook
     → Create/Update Contact (email, first_name)
     → Add Tag: "registered"
     → Update Field: registration_status = "registered"
     → Update Field: registered_date = {{current_date}}
   ```

### 4.6 Removing Contacts from Active Workflows

When a contact registers (and should stop getting "register now" emails):

1. In the **Post-Registration workflow** (Flow 5), after the trigger:
   ```
   → Remove from Workflow: "AIU - Pre-Event - Non-Buyers"
   → Remove from Workflow: "AIU - Pre-Event - Buyers VIP"
   ```
   Use the **"Remove Contact from Workflow"** action.

When a contact purchases:
   ```
   → Remove from Workflow: "AIU - Post-Event Sales"
   → Remove from Workflow: "AIU - Urgency Countdown"
   → Add Tag: "purchased-standard" (or "purchased-vip")
   ```

---

## 5. Tracking & Analytics Setup

### 5.1 UTM Parameters

Add UTM parameters to **every link** in every email. Use this convention:

| Parameter | Value | Example |
|---|---|---|
| `utm_source` | `email` | Always "email" |
| `utm_medium` | `ghl` | Identifies GoHighLevel |
| `utm_campaign` | `aiu-2026` | Campaign identifier |
| `utm_content` | `flow[X]-email[Y]` | Specific email | 

**Example link:**
```
https://aiuniversa.si/register?utm_source=email&utm_medium=ghl&utm_campaign=aiu-2026&utm_content=flow1a-email3
```

**UTM naming per flow:**
- Flow 1A emails: `flow1a-email1` through `flow1a-email6`
- Flow 1B emails: `flow1b-email1` through `flow1b-email4`
- Flow 2 emails: `flow2-email1` through `flow2-email7`
- Flow 3 emails: `flow3-email1` through `flow3-email5`
- Flow 4 emails: `flow4-email1` through `flow4-email4`
- Flow 5 emails: `flow5-email1` through `flow5-email3`

### 5.2 GHL Email Reporting

GHL tracks these automatically per email:

- **Open Rate** — Target: >25% for warm list, >15% for cold
- **Click-Through Rate (CTR)** — Target: >3%
- **Unsubscribe Rate** — Must stay below 0.5% per send
- **Bounce Rate** — Must stay below 2% (clean list first!)
- **Spam Complaints** — Must stay below 0.1%

**Where to find reports:**
- **Per-email stats:** Automation → Workflows → [Workflow] → click on email action → Stats
- **Overall dashboard:** Reporting → Email → select date range

### 5.3 Revenue Attribution

When payment processing is connected (Stripe, PayPal, etc.):

1. Go to **Payments → Integrations → Connect Stripe**.
2. Create **Products** in GHL:
   - Product 1: "AI Universa Standard" — €897.99
   - Product 2: "AI Universa VIP" — €2,500.00
3. Link products to order forms / checkout pages.
4. In **Reporting → Attribution**, you'll see which email flow drove each purchase.
5. Set up a **Purchase trigger workflow:**
   ```
   Trigger: Payment Received
     → If product = Standard: Add Tag "purchased-standard"
     → If product = VIP: Add Tag "purchased-vip"
     → Remove from Workflow: "AIU - Post-Event Sales"
     → Remove from Workflow: "AIU - Urgency Countdown"
     → Send "Thank You" email
   ```

### 5.4 Key Metrics Dashboard

Create a custom GHL dashboard (**Reporting → Dashboards → Create**):

| Metric | Source | Goal |
|---|---|---|
| Total Registered | Count of "registered" tag | 5,000+ |
| Registration Rate (Non-Buyers) | Registered / 20,600 | >20% |
| Day 1 Attendance | "attended-day1" tag count | >50% of registered |
| Day 3 Attendance | "attended-day3" tag count | >30% of registered |
| Sales Conversion | Purchases / non-buyer attendees | >3% |
| Revenue | Stripe integration | Target TBD |
| Unsubscribe Rate | Per campaign | <0.5% |

---

## 6. Deliverability Best Practices

### 6.1 Domain Warm-Up Schedule

⚠️ **Start no later than March 11, 2026** (5 weeks before event, 2 weeks before campaign emails begin on March 25).

You're warming up a fresh sending domain for an eventual 22,000-person send. This requires discipline.

| Week | Dates | Daily Volume | Total/Week | Who To Send To |
|---|---|---|---|---|
| Week 1 | Mar 11–17 | 200–500 | ~2,500 | Most engaged past openers only |
| Week 2 | Mar 18–24 | 500–1,500 | ~7,000 | Engaged contacts + some cold |
| Week 3 | Mar 25–31 | 1,500–3,000 | ~15,000 | Broader list (campaign starts!) |
| Week 4 | Apr 1–7 | 3,000–5,000 | ~28,000 | Full list capacity |
| Week 5 | Apr 8–14 | 5,000–8,000 | ~45,000 | Event week readiness |

**Warm-Up Content (Weeks 1–2):**
- Send valuable, non-promotional content
- Blog posts, tips, "did you know" series
- Goal: Get **opens and clicks** to build reputation
- Can use existing content repurposed into email format

**Warm-Up Execution in GHL:**
1. Create a Smart List: Most engaged contacts (filter by previous engagement if available, or random sample of buyers first)
2. Create a simple workflow or use **Email Campaigns** (one-off sends)
3. Send warm-up emails daily, increasing volume per the schedule above
4. Monitor bounce rate and spam complaints after each send

> 💡 **Pro tip:** Send to your 1,400 buyers first during Week 1. They're most likely to open, which signals ESPs that you're legitimate.

### 6.2 List Cleaning

Before importing into GHL:

1. **Run the list through a verification service:**
   - Recommended: [ZeroBounce](https://zerobounce.net), [NeverBounce](https://neverbounce.com), or [MillionVerifier](https://millionverifier.com)
   - Cost: ~$30–50 for 22K contacts
   - Remove: invalid, catch-all (risky), disposable, spam traps

2. **Expected cleanup:**
   - 22,000 contacts → expect 18,000–20,000 valid after cleaning
   - Remove all hard bounces, role-based (info@, admin@), and disposable emails

3. **In GHL after import:**
   - Go to **Contacts → Bulk Actions → Export Bounced**
   - Tag bounced contacts as `bounced` — do NOT delete (keep for records)

### 6.3 Bounce Handling

GHL handles bounces automatically, but configure:

1. **Settings → Email Services → Bounce Handling:**
   - Hard bounces: Auto-remove from future sends (default in GHL)
   - Soft bounces: Retry 3 times, then suppress
   
2. **Create a "Bounced" workflow:**
   ```
   Trigger: Email Event → Bounced
     → Add Tag: "bounced"
     → Remove from all active workflows
   ```

### 6.4 Spam Complaint Monitoring

- **Threshold:** Keep complaints below **0.1%** (1 complaint per 1,000 emails)
- **Google Postmaster Tools:** Register `aiuniversa.si` at [postmaster.google.com](https://postmaster.google.com) for detailed Gmail deliverability data
- **Monitor daily** during campaign (Reporting → Email → check complaint rate)
- **If complaints spike above 0.1%:**
  1. Pause all sends immediately
  2. Review the offending email content
  3. Check if you're hitting non-opted-in contacts
  4. Reduce volume by 50% for next 3 days
  5. Resume slowly

### 6.5 Email Content Best Practices

- **Unsubscribe link:** Must be in every email (GHL adds this automatically via `{{unsubscribe_link}}`)
- **Physical address:** Required by law — add to email footer
- **Text-to-image ratio:** Keep above 60% text / 40% images
- **Avoid spam trigger words** in subject lines (especially in the sales/urgency flows):
  - ❌ "FREE!!!", "Act now!!!", "Guaranteed!!!"
  - ✅ Natural language, lowercase, personal
- **Send time:** Optimal for Slovenian audience: 8:00–10:00 CET or 18:00–20:00 CET

---

## 7. Testing Checklist

Complete ALL items before any live send.

### 7.1 Seed List Testing

1. Create 5–10 test contacts with real email addresses (team members, personal accounts).
2. Tag them with both `buyer` and `non-buyer` variations.
3. Run each workflow manually:
   - Go to **Contacts → [Test Contact] → Workflows → Add to Workflow**
   - Select each workflow and verify emails arrive

### 7.2 Per-Email Checks

For each of the 29 emails:

- [ ] **Subject line** renders correctly (no broken merge fields)
- [ ] **Preview text** shows properly in inbox
- [ ] **From name/email** is correct (`Pici | AI Universa` / `pici@aiuniversa.si`)
- [ ] **Merge fields** work: `{{contact.first_name}}` populates correctly
- [ ] **All links** are clickable and go to the right URL
- [ ] **UTM parameters** are present on every link
- [ ] **Unsubscribe link** works
- [ ] **Images** load (check on email clients without auto-load)
- [ ] **Mobile preview** — text readable, buttons tappable, no horizontal scroll
- [ ] **Desktop preview** — layout correct, images sized properly
- [ ] **Slovenian text** — no encoding issues with č, š, ž characters

### 7.3 Workflow Logic Tests

- [ ] **Buyer exclusion:** Add a test contact with `buyer` tag → try to enter Flow 3/4 → verify they're BLOCKED
- [ ] **Registration mid-flow:** Start a test contact in Flow 1A → add `registered` tag → verify they exit Flow 1A and enter Flow 5
- [ ] **Purchase mid-flow:** Start a test contact in Flow 3 → add `purchased-standard` tag → verify they exit Flow 3 and don't enter Flow 4
- [ ] **Wait times:** Verify wait steps are configured correctly (days, not hours, where intended)
- [ ] **Tag application:** Check all tags are applied at the right workflow steps
- [ ] **Flow transitions:** Walk through the complete buyer journey and non-buyer journey end-to-end

### 7.4 Deliverability Tests

- [ ] **Spam score:** Send test emails to [mail-tester.com](https://mail-tester.com) — aim for 9/10 or higher
- [ ] **SPF check:** Verify with `dig txt aiuniversa.si` — SPF record present
- [ ] **DKIM check:** Verify DKIM passes in email headers (check "Show Original" in Gmail)
- [ ] **DMARC check:** Verify with [MXToolbox DMARC lookup](https://mxtoolbox.com/dmarc.aspx)
- [ ] **Inbox placement:** Test with [GlockApps](https://glockapps.com) or similar — verify landing in inbox, not spam

### 7.5 Final Pre-Launch Checklist

- [ ] All 29 email templates created and loaded into workflows
- [ ] All 6 workflows built, tested, and set to **DRAFT** (not published yet)
- [ ] Domain warm-up completed (Weeks 1–2 done, Week 3 starting)
- [ ] List cleaned and imported (verify final count)
- [ ] Smart Lists showing correct counts
- [ ] Webhook from landing page tested and receiving data
- [ ] Stripe/payment integration tested
- [ ] Team briefed on monitoring schedule
- [ ] Publish workflows in order:
  1. Flow 5 (Post-Registration) — publish first (always-on)
  2. Flow 1A + 1B (Pre-Event) — publish March 25
  3. Flow 2 (Event) — publish April 14
  4. Flow 3 (Sales) — publish April 17
  5. Flow 4 (Urgency) — publish April 21

---

## 8. Launch Timeline

| Date | Action | Notes |
|---|---|---|
| **Mar 11** | Start domain warm-up | 200-500/day, send to buyers first |
| **Mar 11** | Set up GHL sub-account, DNS, custom fields | Complete all technical setup |
| **Mar 12–14** | Import contacts, create segments | Clean list before import |
| **Mar 15–17** | Build all 6 workflows | Use this guide step-by-step |
| **Mar 18–21** | Test all workflows with seed list | Complete testing checklist |
| **Mar 22–24** | Fix any issues, warm-up continues | Increase to 1,500/day |
| **Mar 25** | 🚀 **LAUNCH — Publish Flow 1A + 1B** | Pre-event sequences begin |
| **Mar 25–Apr 14** | Monitor deliverability daily | Check opens, bounces, complaints |
| **Apr 14** | Publish Flow 2 (Event) | Ready for Day 1 morning send |
| **Apr 15** | 🎬 **Event Day 1** | Monitor attendance, engagement |
| **Apr 16** | Event Day 2 | Check email opens vs YouTube views |
| **Apr 17** | Event Day 3 → Publish Flow 3 (Sales) | Sales sequence starts evening |
| **Apr 18–20** | Sales flow active | Monitor conversions daily |
| **Apr 21** | Publish Flow 4 (Urgency) | Final 48-hour countdown |
| **Apr 23** | 🔒 **Cart Close** | Disable all workflows |
| **Apr 24** | Post-campaign analysis | Export all metrics, revenue report |

---

## Quick Reference: All Workflow Names

| # | Workflow Name | Status |
|---|---|---|
| 1 | `AIU - Pre-Event - Non-Buyers` | Publish Mar 25 |
| 2 | `AIU - Pre-Event - Buyers VIP` | Publish Mar 25 |
| 3 | `AIU - Event Flow` | Publish Apr 14 |
| 4 | `AIU - Post-Event Sales` | Publish Apr 17 |
| 5 | `AIU - Urgency Countdown` | Publish Apr 21 |
| 6 | `AIU - Post-Registration` | Publish Mar 25 (always-on) |
| 7 | `AIU - Purchase Thank You` | Publish Apr 17 (always-on) |
| 8 | `AIU - Bounce Handler` | Publish Mar 11 (always-on) |
| 9 | `AIU - Warm-Up Sends` | Publish Mar 11, disable Mar 24 |

---

## Appendix: GHL Navigation Quick Map

| Task | GHL Location |
|---|---|
| Add sub-account | Settings → Sub-Accounts |
| Configure email domain | Settings → Email Services |
| Create custom fields | Settings → Custom Fields |
| Import contacts | Contacts → Import |
| Create Smart Lists | Contacts → Smart Lists |
| Build workflows | Automation → Workflows |
| Create email templates | Marketing → Emails → Templates |
| View email stats | Reporting → Email |
| Connect Stripe | Payments → Integrations |
| Set up webhook | Automation → Workflows → Trigger → Inbound Webhook |
| Forms | Sites → Forms |
| Tags | Contacts → Tags |

---

*Guide created for the AI Universa 2026 campaign. Last updated: March 2026.*
*For questions, refer to [GoHighLevel documentation](https://help.gohighlevel.com) or support.*
