# AI Universa — GoHighLevel Email Platform Setup Guide

**Client:** AI Universa (aiuniversa.si)
**Campaign:** 3-Day Live AI Masterclass Event
**Event Date:** April 15–17, 2026
**Pricing:** €899 Standard / €2,499 VIP
**Audience:** Slovenian professionals & entrepreneurs
**Email Sequences:** 29 emails across 3 flows (pre-event nurture, cart open, post-event)
**Prepared by:** Jarvis Content Systems
**Date:** March 2026

---

## Table of Contents

1. [GoHighLevel Account Setup & Configuration](#1-gohighlevel-account-setup--configuration)
2. [Domain Authentication (SPF, DKIM, DMARC)](#2-domain-authentication-spf-dkim-dmarc)
3. [Sending Domain & Email Warmup Strategy](#3-sending-domain--email-warmup-strategy)
4. [Contact List Import & Segmentation](#4-contact-list-import--segmentation)
5. [Email Flows — Structure & Content Loading](#5-email-flows--structure--content-loading)
6. [Automation/Workflow Builder — Step-by-Step](#6-automationworkflow-builder--step-by-step)
7. [A/B Testing Setup](#7-ab-testing-setup)
8. [GDPR Compliance for Slovenia/EU](#8-gdpr-compliance-for-sloveniaeu)
9. [Deliverability Monitoring & Troubleshooting](#9-deliverability-monitoring--troubleshooting)
10. [Landing Page Integration (Form → GHL Pipeline)](#10-landing-page-integration-form--ghl-pipeline)
11. [SMS/WhatsApp Integration for Slovenia](#11-smswhatsapp-integration-for-slovenia)
12. [Sending Schedule & Campaign Calendar](#12-sending-schedule--campaign-calendar)
13. [Tracking & Analytics Setup](#13-tracking--analytics-setup)
14. [Pre-Launch Checklist](#14-pre-launch-checklist)

---

## 1. GoHighLevel Account Setup & Configuration

### 1.1 Account Creation

1. Go to **[app.gohighlevel.com](https://app.gohighlevel.com)** and sign up for the **Agency Unlimited plan** ($297/mo) or **SaaS Pro plan** ($497/mo). For a single business, the $97/mo Starter plan works but lacks some automation features you'll need. **Recommended: $297/mo Agency plan** — it includes unlimited sub-accounts, workflows, and the full email builder.

2. During signup:
   - **Business Name:** AI Universa
   - **Business Type:** Education / Training
   - **Country:** Slovenia
   - **Timezone:** Central European Time (CET / UTC+1) — select `Europe/Ljubljana`
   - **Currency:** EUR (€)
   - **Phone:** Use your Slovenian business number with country code `+386`

### 1.2 Sub-Account Setup

GHL uses a hierarchy: Agency → Sub-accounts. Create a dedicated sub-account for this campaign.

1. Navigate to **Settings → Sub-Accounts → Create Sub-Account**
2. Fill in:
   - **Sub-Account Name:** `AI Universa – April 2026 Event`
   - **Business Name:** AI Universa d.o.o. (or your legal entity name)
   - **Address:** Your registered Slovenian business address
   - **Website:** `https://aiuniversa.si`
   - **Timezone:** `Europe/Ljubljana`
   - **Language:** Slovenian (for internal labels) — note: GHL's interface is English-only, but all customer-facing content will be in Slovenian

### 1.3 Business Profile Configuration

1. Go to **Settings → Business Profile** inside the sub-account
2. Complete every field:
   - **Logo:** Upload AI Universa logo (min 200×200px, PNG preferred)
   - **Business Email:** `info@aiuniversa.si`
   - **Business Phone:** `+386 XX XXX XXXX`
   - **Physical Address:** Full Slovenian address (required for CAN-SPAM/GDPR footer)
   - **Industry:** Education & Training

### 1.4 User Permissions

1. **Settings → My Staff → Add Employee**
2. Create user accounts for each team member who needs access
3. Set role to **Admin** for the business owner, **User** for team members
4. Enable 2FA for all accounts (Settings → My Profile → Two Factor Authentication)

> **💡 Pro Tip:** Create a shared team login for the event operations team with limited permissions (no billing access). This prevents accidental plan changes during the campaign crunch.

---

## 2. Domain Authentication (SPF, DKIM, DMARC)

This is the most critical technical step. Skipping this = emails land in spam. Period.

### 2.1 Add Your Sending Domain

1. Go to **Settings → Email Services → Dedicated Domain**
2. Click **"Add Domain"**
3. Enter: `aiuniversa.si`
4. GHL will generate DNS records you need to add

### 2.2 SPF Record

**What it does:** Tells receiving servers "these IPs are allowed to send email on behalf of aiuniversa.si."

1. Log in to your DNS provider (whoever manages aiuniversa.si — likely your Slovenian hosting provider or Cloudflare)
2. Add a **TXT record**:
   - **Host/Name:** `@` (or leave blank, depending on provider)
   - **Type:** TXT
   - **Value:** `v=spf1 include:_spf.msgsndr.com ~all`

> **⚠️ Important:** If you already have an SPF record (e.g., for Google Workspace), DO NOT create a second one. Instead, merge them:
> ```
> v=spf1 include:_spf.google.com include:_spf.msgsndr.com ~all
> ```
> Only one SPF record per domain is allowed.

### 2.3 DKIM Record

**What it does:** Cryptographically signs your emails to prove they haven't been tampered with.

1. GHL will provide a DKIM record after you add the domain. It will look like:
   - **Host/Name:** `ghl._domainkey` (GHL specifies the exact selector)
   - **Type:** TXT (or CNAME, depending on GHL's current setup)
   - **Value:** The long key string GHL provides (copy it exactly — one wrong character breaks it)

2. Add this record in your DNS provider

### 2.4 DMARC Record

**What it does:** Tells receiving servers what to do if SPF/DKIM fail, and where to send reports.

1. Add a **TXT record**:
   - **Host/Name:** `_dmarc`
   - **Type:** TXT
   - **Value:** `v=DMARC1; p=quarantine; rua=mailto:dmarc@aiuniversa.si; pct=100; adkim=r; aspf=r`

**Breakdown:**
- `p=quarantine` — failed emails go to spam (start here; move to `p=reject` after warmup)
- `rua=mailto:dmarc@aiuniversa.si` — aggregate reports sent here (create this mailbox)
- `pct=100` — apply policy to 100% of emails
- `adkim=r` / `aspf=r` — relaxed alignment (more forgiving during warmup)

### 2.5 Custom Tracking Domain

1. In GHL: **Settings → Email Services → Dedicated Domain → Tracking Domain**
2. Set up a CNAME record:
   - **Host/Name:** `email` (creates `email.aiuniversa.si`)
   - **Type:** CNAME
   - **Value:** `t.msgsndr.com` (or whatever GHL specifies)

This makes tracking links show `email.aiuniversa.si/...` instead of generic GHL tracking domains — massively improves deliverability and brand trust.

### 2.6 Verification

1. After adding all DNS records, wait **24–48 hours** for propagation
2. Back in GHL: **Settings → Email Services** → click **"Verify"** next to each record
3. All three (SPF, DKIM, DMARC) should show green checkmarks
4. External verification: Use [MXToolbox](https://mxtoolbox.com/SuperTool.aspx) to check:
   - SPF: Enter `aiuniversa.si` → SPF Record Lookup
   - DKIM: Enter `ghl._domainkey.aiuniversa.si` → DKIM Lookup
   - DMARC: Enter `aiuniversa.si` → DMARC Lookup

> **💡 Pro Tip:** Screenshot all green checkmarks and save them. If deliverability issues arise later, you'll want proof that authentication was correctly configured at setup.

---

## 3. Sending Domain & Email Warmup Strategy

### 3.1 Dedicated Sending Address

1. Go to **Settings → Email Services**
2. Set your primary sending address:
   - **From Name:** `AI Universa` (or the founder's name for personal touch — e.g., `Marko iz AI Universa`)
   - **From Email:** `marko@aiuniversa.si` (using a person's name increases open rates 15-25% vs. `info@`)
   - **Reply-To:** `info@aiuniversa.si` (or the same address — keep it monitored!)

### 3.2 Email Warmup Plan

**Why this matters:** If you start blasting 5,000 emails from a new sending setup, ISPs will flag you instantly. You need to build reputation gradually.

**Timeline: 4 weeks before campaign launch (start by March 15, 2026)**

#### Week 1 (March 15–21): Foundation
| Day | Volume | Target |
|-----|--------|--------|
| Day 1 | 20 emails | Most engaged contacts only |
| Day 2 | 30 emails | Same segment |
| Day 3 | 50 emails | Same segment |
| Day 4 | 50 emails | Expand slightly |
| Day 5 | 75 emails | Mix of segments |
| Day 6–7 | Rest | Let reputation settle |

#### Week 2 (March 22–28): Growth
| Day | Volume | Target |
|-----|--------|--------|
| Day 8 | 100 emails | Broader engaged list |
| Day 9 | 150 emails | Same |
| Day 10 | 200 emails | Same |
| Day 11 | 300 emails | Expanding |
| Day 12 | 400 emails | Full segments |
| Day 13–14 | Rest | — |

#### Week 3 (March 29 – April 4): Scale
| Day | Volume | Target |
|-----|--------|--------|
| Day 15 | 500 emails | — |
| Day 16 | 750 emails | — |
| Day 17 | 1,000 emails | — |
| Day 18 | 1,500 emails | — |
| Day 19 | 2,000 emails | — |
| Day 20–21 | Rest | — |

#### Week 4 (April 5–11): Full Volume
| Day | Volume | Target |
|-----|--------|--------|
| Day 22 | 2,500 emails | — |
| Day 23 | 3,000 emails | — |
| Day 24 | Full list | Pre-event sequences begin |
| Day 25+ | Campaign volume | Cart open emails |

### 3.3 Warmup Content Strategy

During warmup weeks 1–3, send **value-first content** that encourages engagement (opens + replies):
- Quick AI tips ("3 AI orodja, ki jih morate preizkusiti ta teden")
- Short surveys ("Kateri AI izziv vas najbolj muči?")
- Free resources (mini-guides, checklists)
- Ask for replies — reply signals tell ISPs "this sender is wanted"

> **💡 Pro Tip:** GHL has a built-in email warmup tool under **Settings → Email Services → Warmup**. Enable it alongside your manual warmup for best results. The built-in tool sends and receives emails between GHL accounts to simulate real engagement patterns.

### 3.4 Warmup Monitoring Metrics

Track daily during warmup:
- **Open rate** — target >40% during warmup (you're sending to engaged contacts)
- **Bounce rate** — must stay <2%. If higher, stop and clean list
- **Spam complaint rate** — must stay <0.1%. If higher, stop immediately
- **Inbox placement** — use [GlockApps](https://glockapps.com) or [Mail-Tester](https://www.mail-tester.com/) to check

---

## 4. Contact List Import & Segmentation

### 4.1 List Preparation (Before Import)

Before importing anything into GHL, clean your data:

1. **Export from current system** (whatever you're using now — spreadsheet, CRM, etc.)
2. **Required columns for GHL import:**
   - `Email` (required)
   - `First Name`
   - `Last Name`
   - `Phone` (with +386 country code)
   - `Tags` (see section 4.3)
   - `Source` (where did this contact come from?)
   - `Date Added`
3. **Clean the data:**
   - Remove duplicates
   - Remove role-based emails (info@, admin@, office@)
   - Validate email syntax (no spaces, proper format)
   - Use an email verification service like [ZeroBounce](https://www.zerobounce.net/) or [NeverBounce](https://neverbounce.com/) — verify EVERY email before import. Cost: ~$5–10 per 1,000 contacts. Worth every cent.
4. **Save as CSV** (UTF-8 encoding — critical for Slovenian characters: č, š, ž)

### 4.2 Import Process

1. Go to **Contacts → Import Contacts**
2. Upload your CSV file
3. **Map columns** to GHL fields:
   - `Email` → Email
   - `First Name` → First Name
   - `Last Name` → Last Name
   - `Phone` → Phone
   - Map any custom fields you need
4. **Import settings:**
   - ✅ Update existing contacts if duplicate found
   - ✅ Add tags during import
   - Set **Do Not Disturb:** OFF (unless contact has explicitly opted out)
5. Click **Import** and verify count matches your CSV

### 4.3 Tagging Strategy

Tags are how you segment. Set these up BEFORE importing.

**Go to Settings → Tags → Create Tag** for each:

#### Source Tags
- `source:website` — came from aiuniversa.si form
- `source:social` — came from social media
- `source:referral` — referred by someone
- `source:event` — from a previous event
- `source:webinar` — attended a free webinar
- `source:lead-magnet` — downloaded a free resource

#### Interest Tags
- `interest:ai-beginner` — new to AI
- `interest:ai-intermediate` — some AI experience
- `interest:ai-advanced` — experienced with AI
- `interest:business-owner` — runs a business
- `interest:employee` — works for a company
- `interest:freelancer` — independent professional

#### Campaign Tags
- `campaign:april-2026-event` — in the campaign universe
- `campaign:pre-event-nurture` — receiving nurture sequence
- `campaign:cart-open` — in cart open phase
- `campaign:purchased-standard` — bought standard ticket
- `campaign:purchased-vip` — bought VIP ticket
- `campaign:abandoned-cart` — started but didn't finish purchase
- `campaign:post-event` — event completed

#### Engagement Tags
- `engagement:hot` — opened 3+ emails recently
- `engagement:warm` — opened 1-2 emails recently
- `engagement:cold` — no opens in 30+ days
- `engagement:replied` — has replied to an email

### 4.4 Smart Lists (Segments)

Go to **Contacts → Smart Lists → Create Smart List** for each segment:

1. **"April Event — Full List"**
   - Filter: Tag contains `campaign:april-2026-event`

2. **"April Event — Engaged (Hot)"**
   - Filter: Tag contains `campaign:april-2026-event` AND Tag contains `engagement:hot`

3. **"April Event — Business Owners"**
   - Filter: Tag contains `campaign:april-2026-event` AND Tag contains `interest:business-owner`

4. **"April Event — Purchased (All)"**
   - Filter: Tag contains `campaign:purchased-standard` OR Tag contains `campaign:purchased-vip`

5. **"April Event — Not Purchased"**
   - Filter: Tag contains `campaign:april-2026-event` AND Tag does NOT contain `campaign:purchased-standard` AND Tag does NOT contain `campaign:purchased-vip`

6. **"April Event — VIP Buyers"**
   - Filter: Tag contains `campaign:purchased-vip`

7. **"April Event — Abandoned Cart"**
   - Filter: Tag contains `campaign:abandoned-cart`

> **💡 Pro Tip:** Smart Lists update dynamically. As contacts get tagged through automations, they automatically enter/exit these segments. This is the backbone of your targeting.

---

## 5. Email Flows — Structure & Content Loading

### 5.1 Flow Architecture Overview

You have 29 emails across 3 flows. Here's the recommended structure:

#### Flow 1: Pre-Event Nurture (12 emails)
**Purpose:** Build anticipation, establish authority, warm the audience
**Duration:** March 15 – April 5 (3 weeks)
**Frequency:** 4 emails/week

| # | Email | Send Day | Subject Line (example) | Purpose |
|---|-------|----------|----------------------|---------|
| 1 | Welcome / What's Coming | March 15 | Nekaj velikega prihaja... | Tease the event |
| 2 | Problem Awareness | March 17 | Ali vaš posel zaostaja za AI revolucijo? | Pain point |
| 3 | Social Proof | March 19 | Kaj pravijo udeleženci preteklih dogodkov | Testimonials |
| 4 | Content Value | March 21 | 3 AI strategije, ki jih morate poznati | Free value |
| 5 | Authority Builder | March 24 | Zakaj sem zapustil korporacijo za AI | Founder story |
| 6 | Case Study | March 26 | Kako je [ime] podvojil prihodke z AI | Results |
| 7 | FAQ / Objections | March 28 | "Nimam časa za 3-dnevni dogodek" | Handle objections |
| 8 | VIP Reveal | March 31 | Ekskluzivno: kaj dobijo VIP udeleženci | Upsell VIP |
| 9 | Countdown Begin | April 2 | Še 13 dni do AI Masterclass | Urgency |
| 10 | Agenda Reveal | April 3 | Tukaj je celoten program 3 dni | Specifics |
| 11 | Last Value Drop | April 4 | Brezplačen AI toolkit (samo ta teden) | Final value |
| 12 | Cart Open Teaser | April 5 | Jutri se odpre prijava... | Bridge to cart |

#### Flow 2: Cart Open (12 emails)
**Purpose:** Drive registrations during the sales window
**Duration:** April 6 – April 14 (9 days)
**Frequency:** Aggressive — 1-2 per day during final days

| # | Email | Send Day | Subject Line (example) | Purpose |
|---|-------|----------|----------------------|---------|
| 13 | Cart Open | April 6 | Prijava je ODPRTA 🚀 | Launch |
| 14 | Early Bird | April 6 (PM) | Prvih 50 mest: posebna cena | Scarcity |
| 15 | What You'll Learn | April 7 | 47 veščin, ki se jih naučite v 3 dneh | Value stack |
| 16 | Social Proof | April 8 | 23 mest že zasedenih (dan 2) | FOMO |
| 17 | Objection Buster | April 9 | "€899 je preveč" — Ali res? | ROI framing |
| 18 | VIP Push | April 10 | Zakaj pametni izberejo VIP | Upsell |
| 19 | Bonus Stack | April 11 | NOVO: 3 bonusi za prijavljene do petka | Added value |
| 20 | Abandoned Cart #1 | Triggered | Pozabili ste dokončati prijavo | Recovery |
| 21 | 48h Warning | April 12 | Še 48 ur do zapolnitve mest | Urgency |
| 22 | Final Day AM | April 14 | ZADNJI DAN: AI Masterclass | Last chance |
| 23 | Final Day PM | April 14 (PM) | Vrata se zapirajo ob polnoči ⏰ | Final push |
| 24 | Closed Cart | April 15 | Prijava je zaprta | FOMO for future |

#### Flow 3: Post-Event (5 emails)
**Purpose:** Deliver value, collect testimonials, upsell next offer
**Duration:** April 18 – May 2 (2 weeks)
**Frequency:** 2-3 per week

| # | Email | Send Day | Subject Line (example) | Purpose |
|---|-------|----------|----------------------|---------|
| 25 | Thank You | April 18 | Hvala, da ste bili del tega! | Gratitude |
| 26 | Replay Access | April 19 | Vaši posnetki so pripravljeni | Deliver value |
| 27 | Survey | April 22 | Kako bi ocenili AI Masterclass? | Feedback |
| 28 | Testimonial Ask | April 25 | Vaša izkušnja pomaga drugim | Social proof |
| 29 | Next Offer Teaser | May 2 | Kaj sledi po AI Masterclass? | Upsell/retention |

### 5.2 Loading Emails into GHL

For each email:

1. Go to **Marketing → Emails → Templates → Create Template**
2. Select **"Build From Scratch"** (not a pre-made template — you want full control)
3. Use the **drag-and-drop builder:**
   - Add a **Header** block with AI Universa logo
   - Add **Text** blocks for your body content
   - Add **Button** blocks for CTAs (use high-contrast colors — your brand's primary color)
   - Add a **Footer** block with:
     - Business name and address (GDPR requirement)
     - Unsubscribe link: `{{unsubscribe_link}}` (auto-generated by GHL)
     - "Zakaj prejemate to e-pošto" explanation in Slovenian
4. **Save as template** with naming convention: `AUE-[flow]-[number]-[short-name]`
   - Example: `AUE-NURTURE-01-welcome`
   - Example: `AUE-CART-13-cart-open`
   - Example: `AUE-POST-25-thank-you`

### 5.3 Email Design Standards

**Apply these settings to every email:**

- **Width:** 600px (standard email width)
- **Background color:** `#FFFFFF` (white) or your brand background
- **Font:** System fonts only — Arial, Helvetica, sans-serif (web fonts don't render in most email clients)
- **Font size:** 16px body, 24-28px headers
- **CTA button:** Minimum 44×44px tap target, high contrast color, text like "REZERVIRAJ SVOJE MESTO" or "PRIJAVITE SE ZDAJ"
- **Images:** Compress to <100KB each, always include alt text in Slovenian
- **Preheader text:** Fill in for every email (the preview text that shows in inbox)

### 5.4 Personalization Tokens

Use these GHL merge fields throughout your emails:

- `{{contact.first_name}}` — First name
- `{{contact.last_name}}` — Last name
- `{{contact.email}}` — Email
- `{{contact.phone}}` — Phone
- `{{contact.company_name}}` — Company (if collected)

**Fallback syntax:** `{{contact.first_name | "prijatelj"}}` — uses "prijatelj" (friend) if first name is empty.

> **💡 Pro Tip:** In Slovenian, use the formal "Vi" (you) form in all emails unless your brand voice is explicitly casual. For a premium €899+ event, formal language signals quality.

---

## 6. Automation/Workflow Builder — Step-by-Step

This is where the magic happens. GHL workflows are the engine that sends the right email to the right person at the right time.

### 6.1 Workflow Basics

1. Go to **Automation → Workflows → Create Workflow**
2. Select **"Start from Scratch"**
3. Name it clearly: `[AUE] Flow Name — Description`

### 6.2 Workflow 1: Pre-Event Nurture Flow

**Name:** `[AUE] Pre-Event Nurture — March 15 to April 5`

#### Trigger Setup
1. Click **"Add New Trigger"**
2. Select trigger type: **"Tag Added"**
3. Configure:
   - **Tag:** `campaign:pre-event-nurture`
   - **Filter:** Contact has tag `campaign:april-2026-event`
   - **Run:** Once per contact

#### Workflow Steps

```
TRIGGER: Tag "campaign:pre-event-nurture" added
│
├── Step 1: WAIT — Until specific date/time
│   └── Date: March 15, 2026 @ 09:00 CET
│
├── Step 2: SEND EMAIL
│   └── Template: AUE-NURTURE-01-welcome
│   └── From: marko@aiuniversa.si
│   └── Subject: Nekaj velikega prihaja...
│
├── Step 3: ADD TAG
│   └── Tag: engagement:sent-nurture-01
│
├── Step 4: WAIT — 2 days
│
├── Step 5: IF/ELSE CONDITION
│   └── IF: Contact has tag "campaign:purchased-standard" OR "campaign:purchased-vip"
│   │   └── GOTO: End (remove from nurture if purchased)
│   └── ELSE: Continue
│
├── Step 6: SEND EMAIL
│   └── Template: AUE-NURTURE-02-problem-awareness
│   └── Subject: Ali vaš posel zaostaja za AI revolucijo?
│
├── Step 7: WAIT — 2 days
│
├── Step 8: IF/ELSE (purchase check — repeat before every email)
│   └── Same logic as Step 5
│
├── Step 9: SEND EMAIL
│   └── Template: AUE-NURTURE-03-social-proof
│
│   ... (continue pattern for emails 4–12)
│
├── Step [final-2]: SEND EMAIL
│   └── Template: AUE-NURTURE-12-cart-open-teaser
│
├── Step [final-1]: ADD TAG
│   └── Tag: campaign:cart-open
│   └── (This triggers Flow 2)
│
└── Step [final]: REMOVE TAG
    └── Tag: campaign:pre-event-nurture
```

#### Key Configuration Details

- **Wait steps:** Use "Wait for Time Delay" → 2 days between most emails
- **Purchase checks:** Add an IF/ELSE before EVERY send step that checks for purchase tags. This prevents buyers from getting sales emails.
- **Time of send:** Set all sends for **09:00 CET (Tuesday, Thursday)** or **10:00 CET (Saturday)** — optimal for Slovenian professionals checking email at work
- **Exit condition:** Add a **"Goal"** step at the top: "Contact gets tag `campaign:purchased-standard` OR `campaign:purchased-vip`" → exits workflow immediately

### 6.3 Workflow 2: Cart Open Flow

**Name:** `[AUE] Cart Open — April 6 to April 14`

#### Trigger Setup
1. **Trigger Type:** "Tag Added"
2. **Tag:** `campaign:cart-open`

#### Workflow Steps

```
TRIGGER: Tag "campaign:cart-open" added
│
├── Step 1: WAIT — Until April 6, 2026 @ 09:00 CET
│
├── Step 2: SEND EMAIL
│   └── Template: AUE-CART-13-cart-open
│   └── Subject: Prijava je ODPRTA 🚀
│
├── Step 3: WAIT — 6 hours
│
├── Step 4: IF/ELSE — purchased?
│   └── IF purchased: End
│   └── ELSE: Continue
│
├── Step 5: SEND EMAIL
│   └── Template: AUE-CART-14-early-bird
│   └── Subject: Prvih 50 mest: posebna cena
│
├── Step 6: WAIT — 18 hours (next morning)
│
│   ... (continue with daily/twice-daily pattern)
│
├── Step [abandoned cart branch]:
│   └── IF/ELSE: Contact visited checkout page BUT no purchase tag
│   │   └── WAIT — 1 hour
│   │   └── SEND EMAIL: AUE-CART-20-abandoned-cart
│   │   └── WAIT — 24 hours
│   │   └── IF still no purchase:
│   │       └── SEND EMAIL: Follow-up abandoned cart
│
├── Step [final-day AM]:
│   └── WAIT — Until April 14, 2026 @ 08:00 CET
│   └── SEND EMAIL: AUE-CART-22-final-day-am
│
├── Step [final-day PM]:
│   └── WAIT — Until April 14, 2026 @ 18:00 CET
│   └── SEND EMAIL: AUE-CART-23-final-day-pm
│
├── Step [cart-closed]:
│   └── WAIT — Until April 15, 2026 @ 08:00 CET
│   └── IF not purchased:
│   │   └── SEND EMAIL: AUE-CART-24-closed-cart
│   │   └── ADD TAG: campaign:did-not-purchase
│   └── REMOVE TAG: campaign:cart-open
│
└── END
```

#### Abandoned Cart Sub-Workflow

Create a separate workflow for abandoned cart:

**Name:** `[AUE] Abandoned Cart Recovery`
**Trigger:** Tag `campaign:abandoned-cart` added

```
TRIGGER: Tag "campaign:abandoned-cart" added
│
├── Step 1: WAIT — 1 hour
│
├── Step 2: IF/ELSE — purchased?
│   └── IF yes: Remove tag, End
│   └── ELSE: Continue
│
├── Step 3: SEND EMAIL
│   └── Template: AUE-CART-20-abandoned-cart
│   └── Subject: Pozabili ste dokončati prijavo
│
├── Step 4: WAIT — 24 hours
│
├── Step 5: IF/ELSE — purchased?
│   └── IF yes: Remove tag, End
│   └── ELSE: Continue
│
├── Step 6: SEND EMAIL
│   └── Template: Abandoned cart follow-up with bonus/incentive
│   └── Subject: Še vedno razmišljate? Tukaj je dodaten razlog...
│
└── END
```

### 6.4 Workflow 3: Post-Event Flow

**Name:** `[AUE] Post-Event Follow-Up — April 18 to May 2`

#### Trigger Setup
1. **Trigger Type:** "Tag Added"
2. **Tag:** `campaign:post-event`
3. **Filter:** Must have tag `campaign:purchased-standard` OR `campaign:purchased-vip`

```
TRIGGER: Tag "campaign:post-event" added
│
├── Step 1: WAIT — Until April 18, 2026 @ 10:00 CET
│
├── Step 2: IF/ELSE — VIP or Standard?
│   └── IF VIP:
│   │   └── SEND EMAIL: AUE-POST-25-thank-you (VIP version)
│   │   └── Includes VIP-specific content/bonuses
│   └── ELSE (Standard):
│       └── SEND EMAIL: AUE-POST-25-thank-you (Standard version)
│
├── Step 3: WAIT — 1 day
│
├── Step 4: SEND EMAIL
│   └── Template: AUE-POST-26-replay-access
│
├── Step 5: WAIT — 3 days
│
├── Step 6: SEND EMAIL
│   └── Template: AUE-POST-27-survey
│   └── Include link to feedback form (Google Forms or GHL form)
│
├── Step 7: WAIT — 3 days
│
├── Step 8: SEND EMAIL
│   └── Template: AUE-POST-28-testimonial-ask
│
├── Step 9: WAIT — 7 days
│
├── Step 10: SEND EMAIL
│   └── Template: AUE-POST-29-next-offer
│
└── END
```

### 6.5 Purchase Confirmation Workflow

Don't forget this critical workflow:

**Name:** `[AUE] Purchase Confirmation & Tagging`

```
TRIGGER: Payment received (via GHL payment integration or webhook from payment processor)
│
├── Step 1: IF/ELSE — Which product?
│   └── IF Standard (€899):
│   │   └── ADD TAG: campaign:purchased-standard
│   │   └── REMOVE TAGS: campaign:cart-open, campaign:abandoned-cart
│   │   └── SEND EMAIL: Order confirmation (Standard)
│   └── IF VIP (€2,499):
│       └── ADD TAG: campaign:purchased-vip
│       └── REMOVE TAGS: campaign:cart-open, campaign:abandoned-cart
│       └── SEND EMAIL: Order confirmation (VIP)
│
├── Step 2: CREATE OPPORTUNITY
│   └── Pipeline: AI Masterclass April 2026
│   └── Stage: Purchased
│   └── Value: €899 or €2,499
│
├── Step 3: INTERNAL NOTIFICATION
│   └── Send email/SMS to team: "Nova prijava! [Name] — [Standard/VIP]"
│
└── END
```

> **💡 Pro Tip:** Always test every workflow with a test contact before activating. In GHL, go to the workflow → click the three dots → "Test Workflow" → select a test contact (use your own email). Verify every email arrives, every condition works, every tag gets applied.

---

## 7. A/B Testing Setup

### 7.1 What to A/B Test

For a 29-email campaign, focus A/B testing on the highest-impact emails:
- **Email #13 (Cart Open)** — this is your money email
- **Email #22 (Final Day AM)** — last push, highest urgency
- **Email #1 (Welcome)** — sets the tone

### 7.2 GHL A/B Testing in Workflows

1. In your workflow, before the email send step, add an **"A/B Split"** action
2. Configure:
   - **Split:** 50/50 (for 2 variants)
   - **Path A:** Send Email with Subject Line A
   - **Path B:** Send Email with Subject Line B

#### Example for Cart Open Email (#13):

```
... previous steps ...
│
├── A/B SPLIT (50/50)
│   ├── Path A:
│   │   └── SEND EMAIL: AUE-CART-13-cart-open
│   │       Subject: Prijava je ODPRTA 🚀
│   │
│   └── Path B:
│       └── SEND EMAIL: AUE-CART-13-cart-open-B
│           Subject: [OMEJENO] AI Masterclass — prijavite se zdaj
│
├── WAIT — 4 hours
│
├── IF/ELSE: Check which variant had higher open rate
│   └── (Manual review — GHL doesn't auto-select winner in workflow)
│   └── Note: Review stats after 4h, then adjust subsequent emails
│
... continue ...
```

### 7.3 Subject Line Testing Strategy

Create two templates for each tested email — identical body, different subject:

| Email | Variant A (Curiosity) | Variant B (Direct/Urgency) |
|-------|----------------------|---------------------------|
| #13 Cart Open | Prijava je ODPRTA 🚀 | [OMEJENO] AI Masterclass — prijavite se zdaj |
| #22 Final Day | To je vaša zadnja priložnost | ⏰ Še 12 ur: AI Masterclass se zapira |
| #1 Welcome | Nekaj velikega prihaja... | Dobrodošli v AI Universa — kaj sledi |

### 7.4 Reading Results

1. Go to **Marketing → Emails → Statistics**
2. Compare open rates between variants after at least 500 sends per variant
3. **Winner criteria:** Higher open rate after 24 hours
4. Apply the winning subject line style to future emails in the same flow

> **💡 Pro Tip:** For a Slovenian audience of professionals, test formal vs. informal "Vi/ti" language in subject lines. Cultural tone can swing open rates by 20%+.

---

## 8. GDPR Compliance for Slovenia/EU

**This is non-negotiable.** Slovenia falls under EU GDPR. Violations can cost up to €20M or 4% of annual turnover.

### 8.1 Consent Collection

Every contact in your list must have **explicit, informed, freely given, specific, and unambiguous consent**.

#### On Your Landing Page / Forms:
- ✅ Use an **unchecked checkbox** (no pre-checked boxes — that's illegal under GDPR)
- ✅ Checkbox text (in Slovenian):
  ```
  □ Strinjam se s prejemanjem e-poštnih sporočil o AI Universa dogodkih
    in izobraževanjih. Svojo privolitev lahko kadar koli prekličem.
    [Politika zasebnosti]
  ```
- ✅ Link to your Privacy Policy (Politika zasebnosti) — must exist at `aiuniversa.si/zasebnost`
- ✅ Separate checkboxes for different purposes:
  - One for email marketing
  - One for SMS (if applicable)
  - One for terms & conditions (for purchase)

### 8.2 Privacy Policy Requirements

Your Privacy Policy page must include (in Slovenian):
1. **Identity of data controller:** AI Universa d.o.o., full address, contact email
2. **What data you collect:** Name, email, phone, IP address, purchase history
3. **Why you collect it:** Email marketing, event registration, customer service
4. **Legal basis:** Consent (Article 6(1)(a)) for marketing; Contract (Article 6(1)(b)) for purchase
5. **Data retention period:** How long you keep the data (e.g., 3 years after last interaction)
6. **Third parties:** List GHL (Go High Level Inc., USA) as a data processor — note: requires **Standard Contractual Clauses (SCCs)** for US data transfer
7. **Rights of data subjects:**
   - Right to access
   - Right to rectification
   - Right to erasure ("right to be forgotten")
   - Right to data portability
   - Right to withdraw consent
   - Right to lodge a complaint with **Informacijski pooblaščenec** (IP-RS.si)
8. **Contact for data requests:** DPO or designated email (e.g., `zasebnost@aiuniversa.si`)

### 8.3 GHL Configuration for GDPR

1. **Settings → Business Profile → Legal:**
   - Add your Privacy Policy URL
   - Add your Terms of Service URL

2. **Email footer (every email must include):**
   ```
   AI Universa d.o.o.
   [Naslov podjetja], [Pošta], Slovenija
   
   To e-poštno sporočilo prejemate, ker ste se prijavili na naš seznam.
   {{unsubscribe_link | "Odjavite se"}}
   ```

3. **Unsubscribe handling:**
   - GHL automatically handles unsubscribes via `{{unsubscribe_link}}`
   - Set up: **Settings → Email Services → Unsubscribe Settings**
   - **Unsubscribe type:** One-click (GDPR requires easy opt-out)
   - **Unsubscribe page:** Customize with Slovenian text
   - **List-Unsubscribe header:** Ensure it's enabled (Settings → Email Services)

4. **Data Processing Agreement (DPA):**
   - Go to GHL's website → Legal/Privacy → download their DPA
   - Sign it and keep on file
   - This documents GHL as your data processor under GDPR Article 28

### 8.4 Right to Erasure Workflow

Create a workflow for handling deletion requests:

**Name:** `[AUE] GDPR — Data Deletion Request`
**Trigger:** Manual (triggered when you receive a deletion request)

```
TRIGGER: Manual trigger
│
├── Step 1: REMOVE ALL TAGS
│
├── Step 2: UPDATE CONTACT
│   └── Set Do Not Disturb: ON (all channels)
│
├── Step 3: INTERNAL NOTIFICATION
│   └── Alert: "GDPR deletion request from [Name]. Delete within 30 days."
│
├── Step 4: WAIT — 1 day (for team to export if needed)
│
├── Step 5: DELETE CONTACT
│   └── (Note: GHL may require manual deletion — this step reminds you)
│
└── END
```

> **💡 Pro Tip:** Keep a GDPR log spreadsheet tracking all consent records, deletion requests, and their completion dates. This is your audit trail if the Slovenian Information Commissioner comes knocking.

---

## 9. Deliverability Monitoring & Troubleshooting

### 9.1 Key Metrics Dashboard

Set up a tracking spreadsheet or use GHL's built-in analytics. Monitor these daily during campaign:

| Metric | Target | 🟡 Warning | 🔴 Critical |
|--------|--------|-----------|------------|
| Open Rate | >25% | 15-25% | <15% |
| Click Rate | >3% | 1-3% | <1% |
| Bounce Rate | <2% | 2-5% | >5% |
| Spam Complaint Rate | <0.05% | 0.05-0.1% | >0.1% |
| Unsubscribe Rate | <0.5% | 0.5-1% | >1% per email |
| Inbox Placement | >90% | 80-90% | <80% |

### 9.2 Where to Find These in GHL

1. **Per-email stats:** Marketing → Emails → click on any sent email → Stats tab
2. **Overall stats:** Marketing → Emails → Dashboard (top-level view)
3. **Contact activity:** Contacts → click any contact → Activity tab (see their email engagement)
4. **Workflow stats:** Automation → Workflows → click workflow → Stats tab (shows funnel conversion)

### 9.3 Troubleshooting Guide

#### Problem: Low Open Rates (<15%)

**Diagnose:**
1. Check inbox placement with [Mail-Tester](https://www.mail-tester.com/) — send a test email to their address, get a score
2. Check if emails land in spam, Promotions tab, or Primary inbox
3. Verify authentication: SPF, DKIM, DMARC all passing?

**Fix:**
- If spam: Review email content for trigger words ("FREE", "ACT NOW", excessive caps/emojis)
- If Promotions: Reduce images, increase text ratio, remove HTML-heavy formatting
- If authentication fails: Re-check DNS records (Section 2)
- Try sending from a personal name (`Marko Novak` vs. `AI Universa`)
- Reduce send volume and focus on engaged contacts only

#### Problem: High Bounce Rate (>2%)

**Diagnose:**
1. Check bounce types in GHL: **Contacts → Bulk Actions → Export Bounced**
2. **Hard bounces:** Invalid emails — these contacts must be removed
3. **Soft bounces:** Temporary issues (full inbox, server down) — retry once

**Fix:**
- Immediately remove all hard bounced contacts
- Re-verify your list with ZeroBounce/NeverBounce
- Check if you imported an old/stale list
- If ongoing: tighten email validation on sign-up forms

#### Problem: High Spam Complaints (>0.1%)

**Diagnose:**
- Check Google Postmaster Tools (if many Gmail recipients)
- Review which specific email triggered complaints

**Fix:**
- Make unsubscribe link more prominent (move it to top of email, not just footer)
- Add "Why you received this" text above unsubscribe link
- Review email content — is it too aggressive/salesy?
- Check if contacts actually opted in (consent audit)
- Slow down send frequency

#### Problem: Emails Landing in Gmail Promotions Tab

**Fix (move to Primary):**
- Reduce HTML complexity — plain-text style emails perform better
- Remove multiple images and fancy formatting
- Write like a human, not a marketer
- Use one link max (your CTA)
- Ask engaged contacts to move you to Primary: "Premaknite nas v Primarni zavihek" with instructions

### 9.4 External Monitoring Tools

Set up these free/cheap tools:

1. **[Google Postmaster Tools](https://postmaster.google.com/)** — Free. Shows your domain's reputation with Gmail. Add `aiuniversa.si` and verify.
2. **[Mail-Tester](https://www.mail-tester.com/)** — Free. Test individual emails before sending to your list. Aim for score 9/10+.
3. **[MXToolbox](https://mxtoolbox.com/)** — Free. Monitor DNS records, blacklists. Set up a free monitoring alert for `aiuniversa.si`.
4. **[GlockApps](https://glockapps.com/)** — Paid (~$59/mo). Inbox placement testing across providers. Worth it for high-value campaigns.

> **💡 Pro Tip:** After sending each campaign email, wait 2 hours, then check open rates. If a specific ISP (Gmail, Outlook, Yahoo) shows significantly lower opens, there may be a deliverability issue specific to that provider. GHL doesn't break this down by ISP natively — check Google Postmaster Tools for Gmail-specific data.

---

## 10. Landing Page Integration (Form → GHL Pipeline)

### 10.1 Option A: GHL Landing Page (Recommended)

Build your landing page directly in GHL for seamless integration.

1. Go to **Sites → Funnels → Create Funnel**
2. Name: `AI Masterclass April 2026`
3. Create pages:
   - **Page 1:** Sales page (event details, testimonials, pricing)
   - **Page 2:** Checkout / Registration form
   - **Page 3:** Thank you / Confirmation

#### Registration Form Setup

On your checkout page:

1. Add a **Form** element
2. Configure fields:
   - First Name (required)
   - Last Name (required)
   - Email (required)
   - Phone (required — format hint: +386...)
   - Company Name (optional)
   - Ticket Type: Dropdown — `Standard (€899)` / `VIP (€2,499)` (or separate buttons)
3. **Form Settings:**
   - **On Submit Action:** Redirect to thank you page
   - **Add Tag on Submit:** `campaign:april-2026-event`, `source:website`
   - **Add to Workflow:** `[AUE] Pre-Event Nurture`
   - **Create/Update Contact:** Yes
   - **Notification:** Email to team on new submission

4. **GDPR Consent (on form):**
   - Add checkbox field (unchecked by default):
     ```
     □ Strinjam se s prejemanjem obvestil o AI Universa.
       Preberi [Politiko zasebnosti].
     ```
   - Add this as a custom field → Map to a "GDPR Consent" custom field in GHL

### 10.2 Option B: External Landing Page (aiuniversa.si)

If your landing page is on WordPress, Webflow, or custom:

1. **Embed GHL form:**
   - Go to **Sites → Forms → Create Form**
   - Build the form (same fields as above)
   - Click **"Integrate"** → Copy the embed code
   - Paste into your external landing page

2. **OR use Webhook integration:**
   - Get your GHL webhook URL: **Settings → Webhooks → Inbound Webhook** → copy URL
   - Configure your external form to POST data to this webhook
   - Map fields in GHL: **Settings → Webhooks → Field Mapping**

3. **OR use Zapier/Make:**
   - Connect your form tool (Typeform, Google Forms, etc.) to GHL via Zapier
   - Action: Create/Update Contact in GHL
   - Add tags and workflows via Zapier

### 10.3 Pipeline Setup

Pipelines track your leads through the sales journey.

1. Go to **Opportunities → Pipelines → Create Pipeline**
2. Name: `AI Masterclass April 2026`
3. Create stages:

| Stage | Description | Automation |
|-------|-------------|------------|
| 1. Lead | New contact entered funnel | Auto: tag `campaign:april-2026-event` |
| 2. Nurturing | In pre-event email sequence | Auto: tag `campaign:pre-event-nurture` |
| 3. Cart Open | Sales window active | Auto: tag `campaign:cart-open` |
| 4. Checkout Started | Visited checkout page | Auto: tag `campaign:abandoned-cart` if no purchase in 1h |
| 5. Purchased — Standard | Bought standard ticket | Auto: tag `campaign:purchased-standard` |
| 6. Purchased — VIP | Bought VIP ticket | Auto: tag `campaign:purchased-vip` |
| 7. Attended | Attended the event | Manual or auto after event |
| 8. Post-Event | In follow-up sequence | Auto: tag `campaign:post-event` |

4. **Opportunity values:** Set default values per stage:
   - Purchased — Standard: €899
   - Purchased — VIP: €2,499

### 10.4 Payment Integration

1. **Stripe (recommended for EU):**
   - Go to **Settings → Payments → Stripe** → Connect your Stripe account
   - Create Products in Stripe:
     - `AI Masterclass Standard — €899`
     - `AI Masterclass VIP — €2,499`
   - In GHL checkout page, link to Stripe products

2. **Alternative: Direct bank transfer**
   - For Slovenian businesses, some customers prefer Položnica / bank transfer
   - Create a manual payment option on your form
   - Set up a workflow to send bank details and mark as "pending payment"

> **💡 Pro Tip:** Add Stripe payment links directly in your cart-open emails. The fewer clicks between "I want this" and "I paid," the higher your conversion. GHL supports embedding Stripe checkout links: `https://buy.stripe.com/your-link`

---

## 11. SMS/WhatsApp Integration for Slovenia

### 11.1 SMS via GHL (Twilio)

GHL uses Twilio for SMS. Slovenia IS supported.

#### Setup:
1. **Settings → Phone Numbers → Buy Number**
2. Search for a Slovenian number:
   - Country: Slovenia (+386)
   - Capabilities: SMS ✅, Voice ✅
   - Cost: ~$2-5/month for the number
3. Purchase the number
4. **Per-SMS cost:** ~€0.06-0.10 per outbound SMS to Slovenian numbers

#### Use Cases for SMS in This Campaign:
- **Cart open reminder:** SMS 2 hours after cart-open email if not opened
- **Abandoned cart:** SMS 30 min after cart abandonment
- **Event reminders:** SMS day before and morning of event
- **VIP exclusive:** SMS-only offers for VIP tier

#### SMS Workflow Example:

```
... after email send step ...
│
├── WAIT — 3 hours
│
├── IF/ELSE: Email opened?
│   └── IF opened: Skip SMS
│   └── ELSE (not opened):
│       └── SEND SMS
│           From: +386 XX XXX XXXX
│           Message: "{{contact.first_name}}, prijava za AI Masterclass
│           je odprta! Preverite: [link] — AI Universa"
│
... continue ...
```

### 11.2 WhatsApp via GHL

GHL supports WhatsApp Business API integration.

#### Requirements:
1. **Meta Business Account** verified
2. **WhatsApp Business API** access (apply through Meta/GHL)
3. **Approved message templates** (WhatsApp requires pre-approved templates for outbound messages)

#### Setup:
1. **Settings → WhatsApp → Connect**
2. Follow GHL's WhatsApp setup wizard
3. Verify your business with Meta
4. Submit message templates for approval (takes 24-48h):
   - Template 1: Event reminder
   - Template 2: Cart open notification
   - Template 3: Purchase confirmation

#### WhatsApp Template Examples (submit for approval):

**Template: event_reminder**
```
Pozdravljeni {{1}}! 👋

Spomnimo vas, da se AI Masterclass začne {{2}}.

📍 Lokacija: {{3}}
🕐 Začetek: {{4}}

Veselimo se, da vas vidimo!
— AI Universa
```

**Template: cart_open**
```
{{1}}, prijava za AI Masterclass je odprta! 🚀

✅ 3 dni praktičnega učenja AI
✅ Omejeno število mest
✅ Cena: od €899

Prijavite se: {{2}}
```

#### Compliance Notes for WhatsApp:
- WhatsApp requires **explicit opt-in** specifically for WhatsApp messages (separate from email consent)
- Add a separate checkbox on forms: "□ Želim prejemati sporočila prek WhatsApp"
- 24-hour messaging window: After a user messages you, you have 24h to respond freely. Outside that window, only pre-approved templates are allowed.

### 11.3 Cost Comparison for Slovenia

| Channel | Cost per Message | Open Rate | Best For |
|---------|-----------------|-----------|----------|
| Email | ~€0.001 | 20-35% | Primary communication |
| SMS | ~€0.06-0.10 | 85-95% | Urgency, reminders |
| WhatsApp | ~€0.05-0.08 | 90-98% | Engagement, conversations |

**Recommendation:** Use email as primary (29 sequences), SMS for critical moments (abandoned cart, event day reminders — ~5 total SMS per contact max), WhatsApp for VIP buyers only (exclusive channel feel).

> **💡 Pro Tip:** Slovenians are heavy WhatsApp users (85%+ smartphone penetration). For a premium event, a WhatsApp group for VIP ticket holders creates exclusivity and increases show-up rate. Create this manually — not automated — for the personal touch.

---

## 12. Sending Schedule & Campaign Calendar

### 12.1 Master Campaign Calendar

```
MARCH 2026
═══════════════════════════════════════════════════════════════
Week 1 (Mar 2-8)    WARMUP PHASE 1 — Account setup & DNS
Week 2 (Mar 9-15)   WARMUP PHASE 2 — Start sending warmup emails
Week 3 (Mar 16-22)  WARMUP + NURTURE START — Email #1-4
Week 4 (Mar 23-29)  NURTURE — Email #5-8
Week 5 (Mar 30-Apr 5) NURTURE — Email #9-12

APRIL 2026
═══════════════════════════════════════════════════════════════
Week 6 (Apr 6-12)   CART OPEN — Email #13-21
                     ⚡ PEAK SELLING PERIOD
Week 7 (Apr 13-14)  FINAL PUSH — Email #22-24
                     🔴 URGENCY MAXIMUM
Apr 15-17            🎓 EVENT DAYS — No marketing emails
                     (Send operational emails only: schedule, links)
Week 8 (Apr 18-25)  POST-EVENT — Email #25-28
Week 9 (Apr 26-May 2) POST-EVENT — Email #29
```

### 12.2 Optimal Send Times for Slovenia

Based on B2B/professional audience in CET timezone:

| Day | Best Time | Good Time | Avoid |
|-----|-----------|-----------|-------|
| Monday | 09:00 CET | 14:00 CET | Before 08:00, after 20:00 |
| Tuesday | 09:00 CET ⭐ | 10:00 CET | — |
| Wednesday | 09:00 CET | 14:00 CET | — |
| Thursday | 09:00 CET ⭐ | 10:00 CET | — |
| Friday | 09:00 CET | — | After 14:00 (weekend mode) |
| Saturday | 10:00 CET | — | Only for nurture content |
| Sunday | ❌ Skip | — | No sends (respect rest day) |

⭐ = Historically highest open rates for Slovenian professionals

### 12.3 Detailed Send Schedule

#### Pre-Event Nurture (12 emails)

| Email | Date | Day | Time (CET) | Type |
|-------|------|-----|-----------|------|
| #1 Welcome | Mar 15 (Sun)* | Sunday | 10:00 | Special exception: campaign kickoff |
| #2 Problem | Mar 17 | Tuesday | 09:00 | Pain point |
| #3 Social Proof | Mar 19 | Thursday | 09:00 | Testimonials |
| #4 Value | Mar 21 | Saturday | 10:00 | Free content |
| #5 Authority | Mar 24 | Tuesday | 09:00 | Story |
| #6 Case Study | Mar 26 | Thursday | 09:00 | Results |
| #7 FAQ | Mar 28 | Saturday | 10:00 | Objections |
| #8 VIP Reveal | Mar 31 | Tuesday | 09:00 | Upsell |
| #9 Countdown | Apr 2 | Thursday | 09:00 | Urgency |
| #10 Agenda | Apr 3 | Friday | 09:00 | Specifics |
| #11 Value Drop | Apr 4 | Saturday | 10:00 | Final value |
| #12 Cart Teaser | Apr 5 | Sunday | 10:00 | Bridge |

*Note: Mar 15 is a Sunday. Acceptable for a "big announcement" feel.

#### Cart Open (12 emails)

| Email | Date | Day | Time (CET) | Type |
|-------|------|-----|-----------|------|
| #13 Cart Open | Apr 6 | Monday | 09:00 | 🚀 LAUNCH |
| #14 Early Bird | Apr 6 | Monday | 18:00 | Scarcity |
| #15 What You Learn | Apr 7 | Tuesday | 09:00 | Value |
| #16 Social Proof | Apr 8 | Wednesday | 09:00 | FOMO |
| #17 Objection | Apr 9 | Thursday | 09:00 | ROI |
| #18 VIP Push | Apr 10 | Friday | 09:00 | Upsell |
| #19 Bonus Stack | Apr 11 | Saturday | 10:00 | Bonuses |
| #20 Abandoned Cart | Triggered | — | +1 hour | Recovery |
| #21 48h Warning | Apr 12 | Sunday | 10:00 | Urgency |
| #22 Final Day AM | Apr 14 | Tuesday | 08:00 | ⚡ LAST CHANCE |
| #23 Final Day PM | Apr 14 | Tuesday | 18:00 | ⏰ CLOSING |
| #24 Closed Cart | Apr 15 | Wednesday | 08:00 | FOMO |

#### Post-Event (5 emails)

| Email | Date | Day | Time (CET) | Type |
|-------|------|-----|-----------|------|
| #25 Thank You | Apr 18 | Saturday | 10:00 | Gratitude |
| #26 Replay | Apr 19 | Sunday | 10:00 | Deliver |
| #27 Survey | Apr 22 | Wednesday | 09:00 | Feedback |
| #28 Testimonial | Apr 25 | Saturday | 10:00 | Collect |
| #29 Next Offer | May 2 | Saturday | 10:00 | Upsell |

### 12.4 Event-Day Communications

During the event (April 15–17), send **operational emails only** — not from your marketing workflows:

| Email | Date | Time | Subject |
|-------|------|------|---------|
| Day 1 Schedule | Apr 15 | 07:00 | Dan 1: Danes vas čaka... (agenda) |
| Day 1 Recap | Apr 15 | 20:00 | Dan 1 zaključen! Jutri: ... |
| Day 2 Schedule | Apr 16 | 07:00 | Dan 2: Danes vas čaka... |
| Day 2 Recap | Apr 16 | 20:00 | Dan 2 zaključen! Zadnji dan jutri... |
| Day 3 Schedule | Apr 17 | 07:00 | Zadnji dan! Danes: ... |

Create a separate workflow for these: `[AUE] Event-Day Operations`

---

## 13. Tracking & Analytics Setup

### 13.1 UTM Parameters

Add UTM parameters to EVERY link in your emails. This lets you track email-driven traffic and conversions in Google Analytics.

#### UTM Structure:

```
https://aiuniversa.si/prijava?utm_source=email&utm_medium=email&utm_campaign=ai-masterclass-april-2026&utm_content=[email-identifier]
```

**Specific UTM tags per email:**

| Parameter | Value | Example |
|-----------|-------|---------|
| `utm_source` | `gohighlevel` | Always the same |
| `utm_medium` | `email` | Always "email" |
| `utm_campaign` | `ai-masterclass-apr26` | Same for entire campaign |
| `utm_content` | `nurture-01-welcome` | Unique per email |
| `utm_term` | `cta-button` or `text-link` | Distinguish link types |

#### GHL UTM Setup:

1. When adding links in email templates, always append UTM parameters
2. In GHL's email builder, click on any link → add query parameters
3. You can use GHL's built-in UTM builder or manually append

**Example CTA button URL:**
```
https://aiuniversa.si/prijava?utm_source=gohighlevel&utm_medium=email&utm_campaign=ai-masterclass-apr26&utm_content=cart-13-open&utm_term=cta-button
```

### 13.2 Google Analytics 4 (GA4) Setup

1. **Create a GA4 property** for aiuniversa.si (if not already done)
2. **Install GA4 tag:**
   - On your external site: Add GA4 snippet to `<head>`
   - On GHL landing pages: **Sites → Settings → Tracking Code** → paste GA4 tag
3. **Set up Conversions:**
   - Go to GA4 → Admin → Events → Create Event
   - Create these conversion events:
     - `purchase_standard` — when standard ticket is purchased
     - `purchase_vip` — when VIP ticket is purchased
     - `begin_checkout` — when checkout page is viewed
     - `form_submit` — when registration form is submitted

### 13.3 GHL Conversion Tracking

1. **Trigger Links (for email click tracking):**
   - GHL automatically tracks clicks on links within emails
   - View at: Marketing → Emails → select email → Click Map

2. **Attribution Reporting:**
   - Go to **Reporting → Attribution**
   - Set date range to campaign period
   - Filter by source: Email
   - This shows which emails drove the most conversions

### 13.4 Custom Reporting Dashboard

Create a GHL dashboard for real-time campaign monitoring:

1. Go to **Reporting → Dashboards → Create Dashboard**
2. Name: `AI Masterclass April 2026 — Campaign Dashboard`
3. Add widgets:

| Widget | Type | Data Source |
|--------|------|-------------|
| Total Revenue | Number | Opportunities: Won value |
| Standard Tickets Sold | Number | Contacts with tag `campaign:purchased-standard` |
| VIP Tickets Sold | Number | Contacts with tag `campaign:purchased-vip` |
| Email Open Rate (avg) | Chart | Email stats |
| Conversion Funnel | Funnel | Pipeline stages |
| Revenue by Source | Pie chart | Attribution |
| Daily Registrations | Line chart | Opportunities created per day |

### 13.5 Facebook/Meta Pixel (if running paid ads)

1. **Get your Meta Pixel ID** from Facebook Events Manager
2. **Install on GHL pages:** Sites → Settings → Head Tracking Code:
   ```html
   <!-- Meta Pixel Code -->
   <script>
   !function(f,b,e,v,n,t,s)
   {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
   n.callMethod.apply(n,arguments):n.queue.push(arguments)};
   if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
   n.queue=[];t=b.createElement(e);t.async=!0;
   t.src=v;s=b.getElementsByTagName(e)[0];
   s.parentNode.insertBefore(t,s)}(window, document,'script',
   'https://connect.facebook.net/en_US/fbevents.js');
   fbq('init', 'YOUR_PIXEL_ID');
   fbq('track', 'PageView');
   </script>
   ```
3. **Fire purchase events** on the thank you page:
   ```html
   <script>
   fbq('track', 'Purchase', {
     value: 899.00,  // or 2499.00 for VIP
     currency: 'EUR',
     content_name: 'AI Masterclass April 2026',
     content_category: 'Event Ticket'
   });
   </script>
   ```

### 13.6 GHL → Google Sheets Reporting (Optional)

For stakeholders who want a simple spreadsheet view:

1. Use GHL's Zapier integration or native webhook
2. Trigger: New opportunity created / Stage changed
3. Action: Add row to Google Sheet
4. Columns: Date, Name, Email, Ticket Type, Amount, Source

This gives you a real-time sales tracker outside GHL.

> **💡 Pro Tip:** Set up a daily Slack/email alert using GHL workflows: every day at 18:00, trigger an internal email summarizing today's registrations, revenue, and email performance. This keeps the team motivated during the cart-open window.

---

## 14. Pre-Launch Checklist

Complete every item before activating your first workflow. Each item includes the person responsible and estimated time.

### Phase 1: Technical Foundation (Week of March 2)

- [ ] **GHL account created** and sub-account configured (30 min)
- [ ] **DNS records added:** SPF, DKIM, DMARC, Tracking CNAME (30 min)
- [ ] **DNS records verified** in GHL (green checkmarks) — wait 24-48h after adding (5 min)
- [ ] **External verification** via MXToolbox — all passing (10 min)
- [ ] **Custom tracking domain** set up and verified (15 min)
- [ ] **Sending domain** configured with From Name and From Email (10 min)
- [ ] **GHL email warmup** tool enabled (5 min)
- [ ] **Google Postmaster Tools** set up for aiuniversa.si (15 min)
- [ ] **Stripe payment integration** connected and products created (30 min)
- [ ] **Phone number purchased** for SMS (Slovenia +386) (10 min)
- [ ] **2FA enabled** for all team accounts (10 min)

### Phase 2: Content & Compliance (Week of March 9)

- [ ] **Privacy Policy** published at aiuniversa.si/zasebnost (2 hours with legal review)
- [ ] **Terms of Service** published (1 hour)
- [ ] **GHL Data Processing Agreement** signed and filed (30 min)
- [ ] **All 29 email templates** loaded into GHL with consistent branding (4-6 hours)
- [ ] **Email footer** configured with GDPR-compliant content in Slovenian (15 min)
- [ ] **Unsubscribe page** customized in Slovenian (15 min)
- [ ] **GDPR consent checkbox** text finalized and added to all forms (15 min)
- [ ] **A/B variants** created for emails #1, #13, #22 (1 hour)

### Phase 3: Automation & Segmentation (Week of March 9)

- [ ] **All tags created** in GHL (30 min)
- [ ] **Smart Lists** configured and tested (30 min)
- [ ] **Pipeline** created with all stages (20 min)
- [ ] **Workflow 1:** Pre-Event Nurture built and tested (2 hours)
- [ ] **Workflow 2:** Cart Open built and tested (2 hours)
- [ ] **Workflow 3:** Post-Event built and tested (1 hour)
- [ ] **Workflow 4:** Abandoned Cart built and tested (1 hour)
- [ ] **Workflow 5:** Purchase Confirmation built and tested (1 hour)
- [ ] **Workflow 6:** GDPR Deletion built and tested (30 min)
- [ ] **Workflow 7:** Event-Day Operations built and tested (1 hour)
- [ ] **All workflows tested** with test contact (entire flow, every branch) (2 hours)

### Phase 4: Integration & Tracking (Week of March 9-12)

- [ ] **Landing page / form** connected to GHL (form submission → contact created + tagged) (1 hour)
- [ ] **Payment flow** end-to-end tested (form → checkout → payment → confirmation email → tags applied) (1 hour)
- [ ] **GA4** installed and conversion events firing (1 hour)
- [ ] **UTM parameters** added to every link in every email (2 hours)
- [ ] **Facebook Pixel** installed (if using paid ads) (30 min)
- [ ] **Reporting dashboard** created in GHL (30 min)
- [ ] **Google Sheets tracker** connected (if desired) (30 min)

### Phase 5: Warmup & List Prep (March 12-15)

- [ ] **Contact list cleaned** and verified via email verification service (2 hours)
- [ ] **Contact list imported** with correct tags (1 hour)
- [ ] **Import verified:** Spot-check 10 random contacts — all fields correct (15 min)
- [ ] **Warmup schedule** begun (see Section 3.2) — first 20 emails sent (30 min)

### Phase 6: Launch Week (March 15)

- [ ] **Warmup metrics checked:** Open rate >40%, bounce <2%, spam <0.1% (15 min daily)
- [ ] **Test email sent** for Email #1 to team members — renders correctly on mobile and desktop (30 min)
- [ ] **Workflow 1 activated** — Pre-Event Nurture goes live (5 min)
- [ ] **Daily monitoring** in place — someone checks stats every day at 18:00 CET (10 min daily)
- [ ] **Mail-Tester score** checked — must be 9/10+ (10 min)

### Phase 7: Cart Open (April 6)

- [ ] **Workflow 2 activated** — Cart Open goes live (5 min)
- [ ] **Payment system verified** — one final test purchase (15 min)
- [ ] **Team notification workflow** active (5 min)
- [ ] **Abandoned cart workflow** active (5 min)
- [ ] **Monitoring cadence increased** to 3x daily during cart open (10 min each)

### Phase 8: Event & Post-Event (April 15+)

- [ ] **Marketing workflows paused** during event days (5 min)
- [ ] **Event-Day Operations workflow** activated (5 min)
- [ ] **Post-event tags** applied to attendees (15 min)
- [ ] **Workflow 3 activated** — Post-Event goes live (5 min)
- [ ] **Campaign retrospective:** Compile final stats, revenue, lessons learned (2 hours)

---

## Appendix A: GHL Field Reference

| GHL Field | Your Value |
|-----------|-----------|
| Sub-Account Name | AI Universa – April 2026 Event |
| Business Name | AI Universa d.o.o. |
| Website | https://aiuniversa.si |
| Timezone | Europe/Ljubljana |
| Currency | EUR |
| From Name | Marko iz AI Universa (or founder's actual name) |
| From Email | marko@aiuniversa.si |
| Reply-To | info@aiuniversa.si |
| Tracking Domain | email.aiuniversa.si |
| SPF Record | v=spf1 include:_spf.msgsndr.com ~all |
| DMARC Record | v=DMARC1; p=quarantine; rua=mailto:dmarc@aiuniversa.si; pct=100 |
| Privacy Policy URL | https://aiuniversa.si/zasebnost |
| GDPR Contact | zasebnost@aiuniversa.si |
| Pipeline Name | AI Masterclass April 2026 |
| Stripe Products | Standard €899, VIP €2,499 |
| Phone (SMS) | +386 XX XXX XXXX (purchased in GHL) |

## Appendix B: Emergency Playbook

**If deliverability drops suddenly:**
1. STOP all sends immediately (pause all workflows)
2. Check MXToolbox for blacklist inclusion
3. Verify DNS records haven't changed
4. Check Google Postmaster Tools for reputation drop
5. Contact GHL support: support@gohighlevel.com
6. DO NOT resume until issue is identified and fixed

**If spam complaints spike:**
1. Pause the workflow that triggered complaints
2. Review the specific email content
3. Make unsubscribe link more prominent
4. Send a "confirm your subscription" email to remaining list
5. Remove anyone who doesn't confirm within 72h

**If Stripe integration breaks:**
1. Check Stripe dashboard for errors
2. Re-authenticate Stripe in GHL settings
3. Test with a small transaction
4. If unresolvable: set up a temporary direct Stripe Checkout link and email it to interested contacts while fixing the integration

---

## Appendix C: Key Slovenian Phrases for Email Content

| English | Slovenian |
|---------|-----------|
| Register Now | Prijavite se zdaj |
| Limited Spots | Omejeno število mest |
| Early Bird Price | Zgodnja cena |
| Unsubscribe | Odjava od prejemanja e-pošte |
| Privacy Policy | Politika zasebnosti |
| Why you received this email | Zakaj prejemate to e-pošto |
| Your ticket | Vaša vstopnica |
| See you there | Se vidimo tam |
| Don't miss out | Ne zamudite |
| Last chance | Zadnja priložnost |
| Spots remaining | Preostalih mest |
| Book your seat | Rezervirajte svoje mesto |
| View in browser | Ogled v brskalniku |
| Forward to a friend | Posredujte prijatelju |

---

*This guide was prepared for AI Universa as a comprehensive GoHighLevel email platform setup document. Follow each section sequentially for a complete, professional-grade email marketing infrastructure. Total estimated setup time: 25–35 hours across 2 weeks.*

*For questions or implementation support, contact the content systems team.*
