# AI Universa — Stripe + Klarna Payment Processing Setup Guide

**Business:** AI Universa (aiuniversa.si)
**Entity:** Slovenian d.o.o. or s.p.
**Products:** 3-Day Live AI Masterclass — Standard (€899) / VIP (€2,499)
**Target Market:** Slovenian professionals & entrepreneurs
**Document Version:** 1.0 | March 2026

---

## Table of Contents

1. [Part 1: Stripe Account Setup](#part-1-stripe-account-setup)
2. [Part 2: Product & Checkout Configuration](#part-2-product--checkout-configuration)
3. [Part 3: Tax, Invoicing & Compliance](#part-3-tax-invoicing--compliance)
4. [Part 4: Klarna Integration](#part-4-klarna-integration)
5. [Part 5: Website & GoHighLevel Integration](#part-5-website--gohighlevel-integration)
6. [Part 6: Testing & Go-Live](#part-6-testing--go-live)
7. [Part 7: Legal & Compliance (Slovenia)](#part-7-legal--compliance-slovenia)
8. [Pre-Launch Checklist](#pre-launch-checklist)

---

# Part 1: Stripe Account Setup

## Step 1 — Create a Stripe Account for a Slovenian Business

1. Go to [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Enter your email, full name, and set a strong password
3. Verify your email address
4. You will land on the Stripe Dashboard in **test mode** (indicated by the orange "TEST MODE" banner)

### Business Information Form

When prompted to activate your account, fill in:

| Field | What to Enter |
|---|---|
| **Country of registration** | Slovenia |
| **Business type** | Select **Company** for d.o.o. or **Individual / Sole proprietor** for s.p. |
| **Legal business name** | Exact name from AJPES register (e.g., "AI UNIVERSA, izobraževanje in svetovanje, d.o.o.") |
| **Doing business as (DBA)** | AI Universa |
| **Business registration number (matična številka)** | Your 7- or 10-digit AJPES registration number |
| **Tax ID (davčna številka)** | Your 8-digit Slovenian tax number (e.g., SI12345678) — include the "SI" prefix for EU VAT |
| **Business address** | Registered address exactly as it appears in the AJPES business register |
| **Industry / MCC** | Select **Education Services** → **Vocational/Trade Schools** or **Business/Secretarial Schools** (MCC 8241 or 8299) |
| **Business website** | https://aiuniversa.si |
| **Product description** | "Live 3-day AI masterclass events for professionals. In-person education with digital course materials." |

> **⚠️ Common Mistake:** Using your home address instead of your registered business address. Stripe cross-references against public registers. Mismatches delay verification by 1–2 weeks.

## Step 2 — Required Documents for Slovenian Company Verification

Stripe will request identity and business verification documents. Have these ready:

### For d.o.o. (Limited Liability Company):

| Document | Where to Get It | Notes |
|---|---|---|
| **Izpisek iz sodnega registra** (Court register extract) | AJPES (ajpes.si) or eSodstvo | Must be less than 3 months old. Download the PDF from AJPES — it's free. |
| **Sklep o registraciji** (Registration decision) | Your company formation documents | The original court decision establishing the company |
| **Davčna številka potrdilo** (Tax number confirmation) | FURS (eDavki portal) | Confirms your DDV registration |
| **Personal ID of director/owner** | — | Passport or Slovenian osebna izkaznica (front + back) |
| **Proof of address** (sometimes requested) | Utility bill or bank statement | Must match registered address, dated within 90 days |

### For s.p. (Sole Proprietor):

| Document | Where to Get It |
|---|---|
| **Izpisek iz Poslovnega registra Slovenije** (PRS extract) | AJPES (ajpes.si) |
| **Personal ID** | Passport or osebna izkaznica |
| **Davčna številka** | FURS confirmation |

> **💡 Pro Tip:** Download your AJPES extract in English if available — it speeds up Stripe's review. If only Slovenian is available, that's fine; Stripe has EU-language reviewers.

### Upload Process:
1. Go to **Settings** → **Business details** → **Verification**
2. Upload each document as a clear, legible PDF or high-resolution photo
3. Stripe typically verifies Slovenian businesses within **2–5 business days**
4. You'll receive an email at each stage: documents received, under review, approved

> **⚠️ Warning:** If you're VAT-registered (obvezni DDV zavezanec), you MUST provide the VAT number with the SI prefix. Without this, Stripe cannot properly handle reverse-charge mechanisms for B2B EU transactions.

## Step 3 — Business Settings Configuration

### Currency & Settlement

1. Go to **Settings** → **Business settings** → **Settlement currency**
2. Set to **EUR** (this should auto-detect for Slovenia)
3. Under **Bank accounts and scheduling**:
   - Add your Slovenian IBAN (starts with SI56)
   - Set payout schedule: **Daily (2-day rolling)** for best cash flow, or **Weekly** for simplicity
   - Minimum payout: leave at €0.00 unless you prefer batching

### Statement Descriptor

1. Go to **Settings** → **Business settings** → **Public details**
2. **Statement descriptor:** `AIUNIVERSA` (max 22 chars, uppercase, no special chars) — this is what appears on customer bank statements
3. **Shortened descriptor:** `AIUNIV` (for card statements with limited space)
4. **Support phone:** Your Slovenian business phone with country code (+386...)
5. **Support email:** support@aiuniversa.si (or your customer-facing email)
6. **Support URL:** https://aiuniversa.si/podpora or /support

> **💡 Pro Tip:** Test your statement descriptor by making a small test purchase. Customers who don't recognize the charge on their bank statement will issue chargebacks — a clean descriptor prevents this.

### Branding

1. Go to **Settings** → **Business settings** → **Branding**
2. Upload:
   - **Icon:** Square logo (min 128×128px, recommended 512×512px) — appears on checkout and receipts
   - **Logo:** Full brand logo — appears on invoices and email receipts
3. Set **Brand color:** Your primary brand color hex code (used in Checkout pages)
4. Set **Accent color:** Secondary brand color

---

# Part 2: Product & Checkout Configuration

## Step 4 — Create Products in Stripe

### Product 1: Standard Ticket (€899)

1. Go to **Products** → **+ Add product**
2. Fill in:

| Field | Value |
|---|---|
| **Name** | AI Universa Masterclass — Standard Ticket |
| **Description** | 3-day live AI masterclass. Includes all sessions, course materials, certificate of completion, and networking lunch. |
| **Image** | Upload a compelling event image (1200×630px recommended) |
| **Pricing model** | Standard pricing |
| **Price** | €899.00 |
| **Currency** | EUR |
| **Billing period** | One time |
| **Tax behavior** | Tax inclusive (important for B2C in Slovenia — prices shown must include DDV) |
| **Tax code** | Select **General - Education Services** or txcd_10000000 |

3. Under **Additional options**:
   - **Unit label:** ticket
   - Check **This is a shippable product:** NO (it's an event/service)
4. Click **Save product**
5. Note the **Price ID** (e.g., `price_1ABC...`) — you'll need this for checkout links

### Product 2: VIP Ticket (€2,499)

1. **Products** → **+ Add product**
2. Fill in:

| Field | Value |
|---|---|
| **Name** | AI Universa Masterclass — VIP Ticket |
| **Description** | Everything in Standard PLUS: 1-on-1 coaching session (60 min), priority seating, exclusive VIP dinner, direct access to speakers, and premium resource pack. |
| **Image** | Upload a VIP-branded event image |
| **Price** | €2,499.00 |
| **Currency** | EUR |
| **Billing period** | One time |
| **Tax behavior** | Tax inclusive |
| **Tax code** | General - Education Services |

3. Save and note the **Price ID**

> **💡 Pro Tip:** Add a third product — **Early Bird Standard** at €699 — even if you're not using it yet. Having it pre-configured lets you run flash promotions in minutes.

### Product Metadata (for automation)

For each product, add custom metadata under **Metadata** section:

| Key | Standard Value | VIP Value |
|---|---|---|
| `ticket_type` | `standard` | `vip` |
| `event_name` | `ai_masterclass_2026` | `ai_masterclass_2026` |
| `includes_coaching` | `false` | `true` |
| `ghl_tag` | `masterclass-standard` | `masterclass-vip` |

This metadata flows through webhooks to GoHighLevel and your automation stack.

## Step 5 — Checkout Page Configuration

### Option A: Stripe Payment Links (Fastest — No Code)

1. Go to **Payment Links** → **+ New**
2. Select your product (Standard or VIP)
3. Configure:

| Setting | Value |
|---|---|
| **Quantity** | Fixed at 1 |
| **Allow promotion codes** | ✅ Yes (lets you create discount codes later) |
| **Collect tax automatically** | ✅ Yes |
| **Require phone number** | ✅ Yes (needed for SMS confirmations) |
| **Custom fields** | Add: "Company name" (optional), "How did you hear about us?" (optional) |
| **After payment** | Redirect to confirmation page: `https://aiuniversa.si/hvala` or `/thank-you` |
| **Confirmation page message** | "Hvala za prijavo! 🎉 Potrditveno e-pošto boste prejeli v nekaj minutah." |

4. Under **Advanced settings**:
   - **Payment methods:** Enable Cards, Klarna, Bancontact, iDEAL, SEPA Direct Debit
   - **Invoice/receipt:** Enable automatic email receipts
5. Click **Create link**
6. You'll get a URL like `https://buy.stripe.com/abc123` — this is your payment link

Create **separate payment links** for:
- Standard Ticket → `https://buy.stripe.com/standard_abc`
- VIP Ticket → `https://buy.stripe.com/vip_xyz`

> **💡 Pro Tip:** Create UTM-tagged versions of your payment links for tracking. Append `?client_reference_id=facebook_ad_march` to track acquisition source.

### Option B: Stripe Checkout (More Control — Requires Code)

If you want full control over the checkout experience, use Stripe Checkout via API:

```javascript
// Server-side (Node.js example)
const stripe = require('stripe')('sk_live_YOUR_SECRET_KEY');

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'klarna'],
  line_items: [{
    price: 'price_STANDARD_TICKET_ID', // or price_VIP_TICKET_ID
    quantity: 1,
  }],
  mode: 'payment',
  locale: 'sl', // Slovenian language checkout
  currency: 'eur',
  customer_email: customerEmail, // pre-fill if known
  allow_promotion_codes: true,
  automatic_tax: { enabled: true },
  phone_number_collection: { enabled: true },
  custom_fields: [
    {
      key: 'company',
      label: { type: 'custom', custom: 'Podjetje (neobvezno)' },
      type: 'text',
      optional: true,
    },
  ],
  metadata: {
    ticket_type: 'standard', // or 'vip'
    source: 'website',
  },
  success_url: 'https://aiuniversa.si/hvala?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://aiuniversa.si/masterclass#pricing',
  consent_collection: {
    terms_of_service: 'required',
  },
  custom_text: {
    terms_of_service_acceptance: {
      message: 'Strinjam se s [pogoji poslovanja](https://aiuniversa.si/pogoji) in [politiko zasebnosti](https://aiuniversa.si/zasebnost).',
    },
  },
});
```

> **⚠️ Important:** Set `locale: 'sl'` to display the checkout page in Slovenian. This significantly increases conversion for Slovenian customers.

## Step 6 — Stripe Checkout Branding Customization

1. Go to **Settings** → **Branding** → **Checkout and Payment Links**
2. Configure:

| Setting | Recommendation |
|---|---|
| **Background color** | Match your brand (e.g., dark navy for premium feel) |
| **Button color** | High-contrast CTA color |
| **Font** | Select a clean, modern font |
| **Shape (border radius)** | Rounded (modern) or Sharp (professional) |
| **Header** | Show logo + product image |

3. Preview the checkout on both desktop and mobile — over 60% of Slovenian traffic is mobile

---

# Part 3: Tax, Invoicing & Compliance

## Step 7 — Tax/VAT (DDV) Configuration

### Slovenian DDV Rules for AI Universa:

- **Standard DDV rate:** 22% (applies to education/training services that are NOT formally accredited)
- **Reduced rate (9.5%):** Only applies to certain printed educational materials — not to event tickets
- **Your pricing MUST be DDV-inclusive** for B2C sales (Consumer Rights Directive / ZVPot-1)

> **⚠️ Critical:** If your AI masterclass is NOT accredited by the Slovenian Ministry of Education (MIZ), the 22% standard DDV rate applies. Formally accredited education programs may qualify for DDV exemption under Article 42 of ZDDV-1. Consult your računovodja (accountant) on this.

### Stripe Tax Setup:

1. Go to **Settings** → **Tax** → **Tax settings**
2. **Origin address:** Your Slovenian business address
3. **Tax registration:** Click **+ Add registration**
   - Country: **Slovenia**
   - Registration type: **Standard**
   - Tax ID: Your SI-prefixed VAT number (e.g., `SI12345678`)
   - Effective date: Your DDV registration date
4. **Tax behavior default:** Set to **Inclusive** (price includes tax)
5. **Product tax codes:** Verify each product has the correct tax code
6. Enable **Automatic tax calculation**

### Tax ID Collection (for B2B Invoicing):

1. In your Checkout Session or Payment Link settings:
   - Enable **Tax ID collection** — this lets businesses provide their VAT number
   - When a valid EU VAT number is provided, Stripe can apply **reverse charge** (0% VAT for B2B cross-border)

> **💡 Pro Tip:** For intra-EU B2B sales where a valid VAT number is provided, the reverse charge mechanism applies. The buyer self-assesses VAT in their country. Stripe Tax handles this automatically when properly configured.

## Step 8 — Refund Policy Configuration (365-Day Guarantee)

### Positioning the Guarantee:

Your 365-day money-back guarantee is a powerful conversion tool. Configure it in Stripe:

1. Go to **Settings** → **Payments** → **Refund policy**
2. Set refund window to **365 days**
3. Create a refund policy page at `https://aiuniversa.si/vracilo` with:
   - Clear statement: "365-dnevna garancija vračila denarja — brez vprašanj"
   - Process: email to support@aiuniversa.si with order number
   - Timeline: refunds processed within 14 days (required by ZVPot-1)
   - Refund method: original payment method

### Processing Refunds:

1. Go to **Payments** → find the charge → **Refund**
2. Select **Full** or **Partial** refund
3. **Reason:** Select the appropriate reason (Customer request, Duplicate, Fraudulent)
4. For Klarna payments: refund is processed through Stripe; Klarna handles customer communication

> **⚠️ Legal Note:** Under Slovenian Consumer Protection Act (ZVPot-1), customers have a **14-day withdrawal right** for online purchases (distance selling). Your 365-day guarantee exceeds this, which is fine — but you CANNOT offer less than 14 days.

> **⚠️ Event Exception:** The 14-day withdrawal right does NOT apply to "services related to leisure activities if the contract provides for a specific date or period of performance" (Article 43d(12) ZVPot-1). Since your masterclass has specific dates, you may legally exclude the withdrawal right — BUT you must clearly inform the customer before purchase and get explicit consent. Your 365-day guarantee makes this moot, but document it anyway.

## Step 9 — Receipt & Invoice Customization

### Slovenian Legal Requirements for Invoices (ZDavP-2, Article 81):

Every invoice (račun) MUST contain:

| Required Field | Where to Configure in Stripe |
|---|---|
| **Zaporedna številka računa** (Sequential invoice number) | Automatic — Stripe generates sequential numbers |
| **Datum izdaje** (Date of issue) | Automatic |
| **Ime in naslov prodajalca** (Seller name & address) | Settings → Business details |
| **Davčna številka prodajalca** (Seller tax ID) | Settings → Business details → Tax ID |
| **Ime in naslov kupca** (Buyer name & address) | Collected at checkout |
| **Davčna številka kupca** (Buyer tax ID — if B2B) | Tax ID collection enabled |
| **Opis blaga/storitve** (Description of goods/service) | Product description |
| **Količina in cena** (Quantity and price) | From line items |
| **Stopnja DDV** (VAT rate) | Automatic from Tax settings — 22% |
| **Znesek DDV** (VAT amount) | Automatic calculation |
| **Skupni znesek** (Total amount) | Automatic |

### Configure Email Receipts:

1. Go to **Settings** → **Emails** → **Customer emails**
2. Enable **Successful payments** — sends receipt automatically
3. Enable **Refunds** — sends refund confirmation
4. Customize the receipt template:
   - Include your logo
   - Include business registration number (matična številka)
   - Include DDV number
   - Add custom footer: "AI Universa d.o.o. | Matična št.: XXXXXXX | Davčna št.: SI12345678"

### Stripe Invoicing (for B2B / formal invoices):

1. Go to **Invoicing** → **Settings**
2. Set **Default payment terms:** Due on receipt
3. Set **Invoice prefix:** `AIU-` (creates invoice numbers like AIU-0001)
4. Add **Default footer:**
```
AI Universa d.o.o.
[Naslov], [Poštna številka] [Mesto], Slovenija
Matična številka: XXXXXXX
Davčna številka: SI12345678
IBAN: SI56 XXXX XXXX XXXX XXX
Transakcijski račun odprt pri [Banka]
Vpis v sodni register: Okrožno sodišče v [Mesto], vložna številka: XXXX
Osnovni kapital: XX.XXX,XX EUR
```

> **💡 Pro Tip:** Slovenian invoices for DDV zavezanci MUST be kept for **10 years** (ZDavP-2, Article 86). Stripe stores all data, but also export quarterly backups to your accounting software (e.g., Cebelca.biz, Vasco, or e-Računi).

## Step 10 — Stripe Dashboard Monitoring & Fraud Prevention

### Dashboard Setup:

1. **Home screen widgets** — customize to show:
   - Gross volume (last 30 days)
   - Successful payments count
   - Net revenue after fees
   - Dispute rate (keep below 0.75% — Stripe threshold)

2. **Alerts** — Go to **Settings** → **Team and security** → **Email alerts**:
   - ✅ Successful payments over €500
   - ✅ Failed payments
   - ✅ Disputes and chargebacks
   - ✅ Payout failures
   - ✅ Account updates

### Fraud Prevention (Stripe Radar):

1. Go to **More** → **Radar** → **Rules**
2. **Recommended rules for AI Universa:**

| Rule | Action | Reason |
|---|---|---|
| Block payments where card country ≠ IP country | Review | Catches stolen cards, but legitimate travelers exist |
| Block if >3 failed attempts in 24h on same card | Block | Brute force card testing |
| Block if email domain is disposable | Block | Fraudsters use temp emails |
| Review payments >€2,000 | Review | Extra check for VIP tickets |
| Allow if customer has previous successful payment | Allow | Returning customers are low risk |

3. Enable **3D Secure** for all card payments:
   - Go to **Settings** → **Payments** → **Payment methods** → **Card settings**
   - Set 3D Secure to **Requested** (attempts 3DS on every payment)
   - This shifts chargeback liability to the card issuer (SCA compliance under PSD2)

> **⚠️ PSD2/SCA Compliance:** Strong Customer Authentication is MANDATORY in the EU/EEA. Stripe handles this automatically via 3D Secure, but make sure it's not disabled. Non-compliance = you lose chargeback protection.

### Webhook Configuration:

1. Go to **Developers** → **Webhooks** → **+ Add endpoint**
2. Add these endpoints:

| Endpoint URL | Events to Listen For |
|---|---|
| `https://aiuniversa.si/api/webhooks/stripe` | `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`, `charge.dispute.created` |
| Your GoHighLevel webhook URL | `checkout.session.completed` |

3. **Signing secret:** Copy the `whsec_...` value and store it securely in your environment variables

> **⚠️ Security:** ALWAYS verify webhook signatures server-side. Never trust unverified webhook payloads. Use Stripe's official library:

```javascript
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Trigger order confirmation email
      // Add to GoHighLevel
      // Update inventory/capacity
      break;
    case 'charge.dispute.created':
      // Alert team immediately
      break;
  }

  res.status(200).json({ received: true });
});
```

---

# Part 4: Klarna Integration

## Step 11 — Understanding Klarna Availability for Slovenia

### Klarna + Stripe in Slovenia:

- **Klarna is available through Stripe** for Slovenian merchants as of 2024
- Klarna supports **EUR** transactions for Slovenian buyers
- Klarna availability for the **buyer** depends on their country — Klarna performs real-time eligibility checks
- **Slovenian consumers** can use Klarna if they pass Klarna's soft credit check (no hard credit inquiry)

### Klarna Payment Options Available:

| Option | Description | Best For |
|---|---|---|
| **Pay in 3 (Klarna Ratenkauf)** | 3 interest-free installments | Standard Ticket (3 × €299.67) |
| **Pay in 6–12** | Extended installments (may include interest) | VIP Ticket (e.g., 6 × €416.50 or 12 × ~€215/mo) |
| **Pay Later (30 days)** | Full amount due in 30 days | Customers who need time to arrange funds |
| **Pay Now** | Instant bank transfer via Klarna | Alternative to card payment |

> **⚠️ Important:** Klarna determines which options to show each customer based on their credit profile, purchase amount, and country. You enable Klarna as a payment method; Klarna decides which plans to offer at checkout. You cannot force specific installment plans.

> **💡 Pro Tip:** For the €2,499 VIP ticket, Klarna's "Pay in 3" makes it €833/installment — much more accessible. Highlight this on your pricing page: "že od €833/mesec z Klarna" ("from €833/month with Klarna").

## Step 12 — Enable Klarna in Stripe

### Activation:

1. Go to **Settings** → **Payments** → **Payment methods**
2. Find **Klarna** in the list of payment methods
3. Click **Turn on**
4. Stripe may require additional information:
   - Business category confirmation
   - Expected monthly volume
   - Average transaction amount
5. Klarna activation is typically **instant** for verified Stripe accounts

### Supported Currencies & Countries:

Verify these settings after enabling:
- **Settlement currency:** EUR ✅
- **Presentment currency:** EUR ✅
- **Buyer countries:** Ensure Slovenia (SI) is in the list

> **⚠️ Common Mistake:** Enabling Klarna but not testing if Slovenian customers actually see it. Klarna's availability varies by buyer country and amount. Always test with a real Slovenian phone number and address in test mode.

## Step 13 — Klarna Checkout Flow Configuration

### In Payment Links:

1. When creating/editing a Payment Link:
   - Under **Payment methods**, ensure **Klarna** is checked ✅
   - Stripe automatically handles which Klarna options appear

### In Stripe Checkout API:

```javascript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'klarna'],
  // ... other settings
  payment_method_options: {
    klarna: {
      preferred_locale: 'sl-SI', // Slovenian locale
    },
  },
});
```

### Klarna-Specific Checkout UX:

When a customer selects Klarna at checkout:
1. They're redirected to Klarna's hosted page
2. Klarna performs a soft credit check (no impact on credit score)
3. Klarna shows available payment plans (Pay in 3, Pay Later, etc.)
4. Customer selects a plan and confirms with their details
5. Klarna pays YOU the full amount upfront (minus Klarna fees)
6. Klarna collects from the customer over time — their risk, not yours

### Klarna Fees (as of 2025/2026):

| Fee Type | Typical Range |
|---|---|
| **Transaction fee** | 2.49% – 3.29% + €0.35 per transaction |
| **Variable rate** | Depends on your volume and business category |

> **💡 Pro Tip:** Klarna fees are higher than card fees (~1.4% + €0.25 for EU cards). But the conversion uplift on €2,499 VIP tickets typically more than compensates. Run the math: even a 10% increase in VIP conversions at €2,499 far exceeds the extra ~1% fee.

## Step 14 — Klarna UX Best Practices for Your Checkout

### On Your Pricing Page (aiuniversa.si):

Display Klarna messaging BEFORE the checkout:

```html
<!-- Klarna On-Site Messaging (optional but recommended) -->
<!-- Shows "3 interest-free payments of €833.00" next to VIP price -->
<script src="https://js.klarna.com/web-sdk/v1/klarna.js"
  data-client-id="YOUR_KLARNA_CLIENT_ID"></script>

<!-- Or simply add text: -->
<p class="klarna-teaser">
  💳 Plačajte na 3 obroke brez obresti z Klarna — že od €833/mesec
</p>
```

### Pricing Display Recommendations:

**Standard Ticket Section:**
```
€899
ali 3x €299,67 brez obresti s Klarna
```

**VIP Ticket Section:**
```
€2.499
ali 3x €833 brez obresti s Klarna
```

> **💡 Pro Tip:** A/B test showing the monthly Klarna price first vs. the full price first. For high-ticket items (>€1,000), leading with the installment price often increases clicks to checkout by 20–35%.

## Step 15 — Klarna Compliance for Slovenia

### Klarna-Specific Legal Requirements:

1. **Credit information:** When advertising Klarna installments, include:
   - The total cost of the product
   - The number and amount of installments
   - Whether interest applies
   - A note that Klarna performs a credit assessment

2. **Not a credit agreement:** Klarna's "Pay in 3" is typically NOT classified as a consumer credit agreement under Slovenian ZPotK-2 (Consumer Credit Act) because it's interest-free and short-term. However, longer installment plans with interest may fall under ZPotK-2. Consult your legal advisor.

3. **Clear disclosure:** On your checkout page and terms of service, state:
   - Klarna is a third-party payment provider (Klarna Bank AB, Sweden)
   - Customer data is shared with Klarna for payment processing
   - Link to Klarna's terms: https://www.klarna.com/sl/pogoji/

4. **Right of withdrawal:** If the customer uses the 14-day withdrawal right (or your 365-day guarantee), the Klarna plan is also cancelled and remaining installments are voided

---

# Part 5: Website & GoHighLevel Integration

## Step 16 — Connecting Stripe to aiuniversa.si

### Option A: Payment Links (Simplest)

Embed payment links directly as buttons on your website:

```html
<!-- Standard Ticket CTA -->
<a href="https://buy.stripe.com/YOUR_STANDARD_LINK"
   class="cta-button cta-standard"
   target="_blank">
  Rezerviraj mesto — €899
</a>

<!-- VIP Ticket CTA -->
<a href="https://buy.stripe.com/YOUR_VIP_LINK"
   class="cta-button cta-vip"
   target="_blank">
  Rezerviraj VIP mesto — €2.499
  <span class="klarna-note">ali 3x €833 s Klarna</span>
</a>
```

### Option B: Embedded Checkout (Better UX — Keeps Users on Site)

Use Stripe's embedded checkout for a seamless experience:

```html
<script src="https://js.stripe.com/v3/"></script>
<script>
  const stripe = Stripe('pk_live_YOUR_PUBLISHABLE_KEY');

  document.getElementById('checkout-standard').addEventListener('click', async () => {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketType: 'standard',
        referral: new URLSearchParams(window.location.search).get('ref') || 'direct',
      }),
    });
    const { sessionId } = await response.json();
    await stripe.redirectToCheckout({ sessionId });
  });
</script>
```

### Option C: Stripe Pricing Table (No Code — Embed Component)

1. Go to **Products** → **Pricing tables** → **+ Create pricing table**
2. Add both products (Standard, VIP)
3. Customize the table appearance
4. Copy the embed code:
```html
<script async src="https://js.stripe.com/v3/pricing-table.js"></script>
<stripe-pricing-table
  pricing-table-id="prctbl_XXXXX"
  publishable-key="pk_live_YOUR_KEY">
</stripe-pricing-table>
```
5. Paste into your website's pricing section

## Step 17 — GoHighLevel (GHL) Integration

### Method 1: Direct Webhook Integration

1. In GoHighLevel, go to **Settings** → **Business Profile** → **Integrations**
2. Or go to **Automations** → **Webhooks**
3. Create a new **Inbound Webhook** — copy the webhook URL
4. In Stripe: **Developers** → **Webhooks** → **+ Add endpoint**
   - URL: Your GHL webhook URL
   - Events: `checkout.session.completed`

### Method 2: Zapier/Make.com Bridge (More Flexible)

If GHL's native webhook handling is limited:

**Zapier Setup:**
1. Trigger: **Stripe** → New Payment / Checkout Session Completed
2. Action 1: **GoHighLevel** → Create/Update Contact
   - Map email, name, phone from Stripe data
   - Add tag: `masterclass-standard` or `masterclass-vip` (from metadata)
3. Action 2: **GoHighLevel** → Add to Pipeline
   - Pipeline: "Masterclass Sales"
   - Stage: "Paid — Awaiting Event"

**Make.com Setup (often cheaper for high volume):**
1. Webhook trigger from Stripe
2. Router: split by `metadata.ticket_type`
3. Standard path → GHL create contact + tag `masterclass-standard`
4. VIP path → GHL create contact + tag `masterclass-vip` + trigger coaching scheduling

### GHL Automation Triggers:

Set up these workflows in GoHighLevel:

| Trigger | Automation |
|---|---|
| Tag added: `masterclass-standard` | Send welcome email sequence, add to Standard calendar event, SMS confirmation |
| Tag added: `masterclass-vip` | Send VIP welcome email, schedule 1-on-1 coaching call, add to VIP calendar event, assign to account manager |
| Tag added: `masterclass-refund` | Send refund confirmation, remove from events, trigger feedback survey |

## Step 18 — Order Confirmation → Email Automation Flow

### Immediate Post-Purchase Flow:

**Trigger:** `checkout.session.completed` webhook received

**Within 0–2 minutes:**
1. ✅ Stripe sends automatic email receipt
2. ✅ GHL creates/updates contact with purchase tag
3. ✅ GHL triggers Welcome Email #1:

```
Subject: 🎉 Potrjeno! Vaše mesto na AI Universa Masterclass je rezervirano

Pozdravljeni [Ime],

Vaša prijava na AI Universa 3-dnevni Masterclass je potrjena!

📅 Datum: [Datum dogodka]
📍 Lokacija: [Naslov]
🎟️ Tip vstopnice: [Standard/VIP]

{IF VIP}
Kot VIP udeleženec imate pravico do:
✅ 60-minutne 1-na-1 coaching seje — link za rezervacijo termina: [Calendly/GHL link]
✅ VIP večerje s predavatelji
✅ Premium gradiv
{ENDIF}

Naslednji koraki:
1. Dodajte dogodek v svoj koledar: [ICS link]
2. Pridružite se naši pripravljalni skupini: [Link]
3. Izpolnite kratek vprašalnik: [Link] — da prilagodimo vsebino

Se vidimo na dogodku! 🚀

Ekipa AI Universa
```

**Within 24 hours:**
4. ✅ Email #2: Event preparation guide + what to bring
5. ✅ SMS: Short confirmation with date and venue

**Within 7 days:**
6. ✅ Email #3: Speaker highlights + agenda teaser

**1 week before event:**
7. ✅ Email: Logistics reminder (parking, schedule, what to bring)
8. ✅ SMS: "Čez teden dni se vidimo! 🎯"

**Day before event:**
9. ✅ Email: Final logistics + excitement builder
10. ✅ SMS: Time and location reminder

## Step 19 — Revenue Tracking & Reporting

### Stripe Dashboard Reports:

1. Go to **Reports** → **Financial reports**
2. Set up monthly exports:
   - **Balance summary:** Net revenue after Stripe fees
   - **Payout reconciliation:** Match Stripe payouts to bank deposits
   - **Tax summary:** DDV collected — feed this to your accountant

3. Create **custom reports** for:
   - Revenue by product (Standard vs VIP split)
   - Revenue by payment method (Card vs Klarna breakdown)
   - Refund rate tracking
   - Geographic breakdown of buyers

### KPI Dashboard (Build in Google Sheets / GHL Dashboard):

| Metric | Formula | Target |
|---|---|---|
| **Gross Revenue** | Sum of all successful payments | Track weekly |
| **Net Revenue** | Gross − Stripe fees − Klarna fees − refunds | Track weekly |
| **Conversion Rate** | Payments ÷ Checkout sessions started | >3% for cold traffic, >15% for email traffic |
| **Klarna Adoption** | Klarna payments ÷ Total payments | Track — expect 15–30% for VIP |
| **Average Order Value** | Total revenue ÷ Number of orders | Between €899 and €2,499 |
| **VIP:Standard Ratio** | VIP tickets ÷ Total tickets | Goal: >20% VIP |
| **Refund Rate** | Refunded ÷ Total paid | Keep <5% |
| **Chargeback Rate** | Disputes ÷ Total charges | MUST stay <0.75% |

### Accounting Integration:

Export Stripe data monthly to your Slovenian accounting software:
- **Cebelca.biz** — popular Slovenian cloud accounting, has Stripe import
- **Vasco** — also supports Stripe
- **e-Računi** — Slovenian e-invoicing
- Or export CSV and import manually

> **💡 Pro Tip:** Set a monthly calendar reminder on the 1st: "Export Stripe data to accounting." Slovenian tax authorities (FURS) require DDV-O (VAT return) filing by the last business day of the month following the reporting period. Don't wait until deadline day.

---

# Part 6: Testing & Go-Live

## Step 20 — Test Mode Walkthrough

### Before going live, complete EVERY step below:

**1. Verify Test Mode is Active:**
- Dashboard shows orange "TEST MODE" banner
- API keys start with `sk_test_` and `pk_test_`

**2. Test Card Payments:**

Use these test card numbers:

| Scenario | Card Number | Expected Result |
|---|---|---|
| Successful payment | `4242 4242 4242 4242` | Payment succeeds |
| 3D Secure required | `4000 0027 6000 3184` | 3DS authentication popup |
| Declined card | `4000 0000 0000 0002` | Payment fails gracefully |
| Insufficient funds | `4000 0000 0000 9995` | Decline with reason |
| Fraud warning (Radar) | `4100 0000 0000 0019` | Highest risk level — test Radar rules |

For all test cards: any future expiry date, any 3-digit CVC, any postal code.

**3. Test Klarna:**

- In test mode, select Klarna at checkout
- Use Klarna's test credentials (provided in Stripe test mode)
- Verify the Klarna redirect works
- Verify the return to your success page works
- Verify the webhook fires for Klarna payments

**4. Test Webhook Flow:**

1. Go to **Developers** → **Webhooks** → select your endpoint → **Send test webhook**
2. Send `checkout.session.completed` event
3. Verify:
   - ✅ Your server responds with `200 OK`
   - ✅ GoHighLevel creates the contact
   - ✅ Welcome email is triggered
   - ✅ Correct tags are applied

**5. Test Refund Flow:**

1. Make a test payment
2. Issue a refund from the Dashboard
3. Verify:
   - ✅ Customer receives refund notification email
   - ✅ Refund webhook fires
   - ✅ GHL tag is updated (remove purchase tag, add refund tag)

**6. Test Full Customer Journey:**

Walk through as if you're a customer:
1. Land on aiuniversa.si
2. Click "Rezerviraj mesto"
3. Complete checkout (test card)
4. Arrive at thank-you page
5. Receive email receipt (Stripe)
6. Receive welcome email (GHL)
7. Check that GHL shows the contact with correct tags

### Go-Live Procedure:

1. **Switch to live mode** — toggle in top-left of Stripe Dashboard
2. **Replace all API keys** — `sk_test_` → `sk_live_`, `pk_test_` → `pk_live_`
3. **Replace webhook endpoints** — create new live webhook endpoints (test and live are separate)
4. **Update Payment Links** — generate new live payment links (test links won't work in production)
5. **Verify bank account** — ensure your Slovenian IBAN is connected and verified for live payouts
6. **Make a real €1 payment** — use your own card, verify everything works, then refund yourself
7. **Monitor first 10 transactions closely** — check each one completes the full flow

> **⚠️ Critical:** Test and Live modes have SEPARATE API keys, webhook endpoints, and payment links. The #1 launch mistake is leaving test keys in production code.

---

# Part 7: Legal & Compliance (Slovenia)

## Step 21 — Slovenian E-Commerce Legal Requirements

### Required Legal Pages on aiuniversa.si:

You MUST have the following pages, linked in the footer and at checkout:

#### 1. Splošni pogoji poslovanja (Terms of Service)

URL: `https://aiuniversa.si/pogoji`

Must include:
- Full legal name and address of the company
- Registration number (matična številka) and tax number (davčna številka)
- Contact information (email, phone)
- Description of services offered
- Pricing (including DDV)
- Payment methods accepted
- Delivery/access terms (event date, venue, what's included)
- Right of withdrawal / cancellation policy
- Complaint handling procedure
- Governing law: Slovenian law
- Competent court: Court in your registered city
- ADR (Alternative Dispute Resolution): Link to EU ODR platform (ec.europa.eu/consumers/odr)

#### 2. Politika zasebnosti (Privacy Policy)

URL: `https://aiuniversa.si/zasebnost`

Must comply with GDPR and ZVOP-2 (Slovenian data protection act):
- Data controller identity and contact
- DPO contact (if applicable — required if processing data on a large scale)
- Categories of personal data collected
- Legal basis for processing (contract performance for payment, consent for marketing)
- Data recipients (Stripe, Klarna, GoHighLevel, email provider)
- International data transfers (Stripe is US-based — requires Standard Contractual Clauses reference)
- Data retention periods
- Data subject rights (access, rectification, erasure, portability, objection)
- Right to file complaint with Information Commissioner (Informacijski pooblaščenec, ip-rs.si)

#### 3. Politika piškotkov (Cookie Policy)

URL: `https://aiuniversa.si/piskotki`

- List all cookies used (Stripe, analytics, etc.)
- Purpose of each cookie
- Duration
- Cookie consent banner (required before non-essential cookies are set)

#### 4. Politika vračil (Refund Policy)

URL: `https://aiuniversa.si/vracilo`

Already covered in Step 8. Must be clearly linked.

## Step 22 — Consumer Protection Compliance (ZVPot-1)

### Pre-Purchase Information Requirements (Article 43b ZVPot-1):

Before the customer clicks "Pay," they must have been informed of:

| Requirement | Implementation |
|---|---|
| Main characteristics of the service | Product description on pricing page |
| Identity and address of the business | Footer + terms of service |
| Total price including DDV | Displayed prominently on pricing page |
| Payment method and delivery arrangements | Checkout page |
| Right of withdrawal (or exclusion + reason) | Terms of service + checkout consent |
| Duration of the contract | Event dates clearly stated |
| Digital content compatibility (if applicable) | If providing digital materials — specify format |

### Consent Checkboxes at Checkout:

Your checkout MUST include (configured via Stripe Checkout's `consent_collection`):

1. ✅ "Strinjam se s splošnimi pogoji poslovanja in politiko zasebnosti" (Required — cannot proceed without)
2. ☐ "Želim prejemati novice in posebne ponudbe po e-pošti" (Optional — explicit opt-in for marketing, NOT pre-checked)

> **⚠️ Critical GDPR Point:** The marketing consent checkbox MUST be unchecked by default. Pre-checked boxes do NOT constitute valid consent under GDPR (Planet49 ruling, CJEU C-673/17).

### Post-Purchase Confirmation:

Under Article 43č ZVPot-1, you must send a **durable medium** confirmation (email counts) that includes:
- All pre-contractual information listed above
- Confirmation that the customer agreed to waive withdrawal rights (if event exception applies)
- Withdrawal form template (if withdrawal rights apply)

> **💡 Pro Tip:** Your Stripe email receipt + GHL welcome email together satisfy this requirement, as long as the welcome email includes links to your terms and states the withdrawal policy clearly.

## Step 23 — GDPR Data Processing for Payments

### Data Processing Agreements (DPAs):

You need DPAs with all data processors. Here's your checklist:

| Processor | Role | DPA Status |
|---|---|---|
| **Stripe** | Payment processing | ✅ Auto-accepted in Stripe's terms (stripe.com/privacy) |
| **Klarna** | Payment processing (via Stripe) | ✅ Covered under Stripe's Klarna integration |
| **GoHighLevel** | CRM / email automation | ⚠️ Sign GHL's DPA — download from their legal page |
| **Email provider** (if separate) | Email delivery | ⚠️ Sign their DPA |
| **Hosting provider** | Website hosting | ⚠️ Sign their DPA |
| **Google Analytics** (if used) | Analytics | ⚠️ Configure GA4 with EU data residency |

### Data Minimization:

Only collect what you need at checkout:
- ✅ Email (required for receipt & communication)
- ✅ Full name (required for invoice)
- ✅ Phone (useful for SMS reminders — justify in privacy policy)
- ✅ Address (required by Stripe for payment processing)
- ☐ Company name (optional — for B2B invoicing)
- ❌ Don't collect: date of birth, national ID numbers, or anything beyond what's necessary

### Data Retention Schedule:

| Data Type | Retention Period | Legal Basis |
|---|---|---|
| Invoice/payment records | 10 years | ZDavP-2 (Slovenian tax law) |
| Customer contact data | Duration of business relationship + 2 years | Legitimate interest |
| Marketing consent records | As long as consent is active + 3 years after withdrawal | GDPR accountability |
| Dispute/chargeback records | 7 years | Legal obligation |

### International Data Transfers:

Stripe transfers data to the US. Ensure:
1. Stripe operates under EU-US Data Privacy Framework (as of 2023)
2. Standard Contractual Clauses (SCCs) are in place as backup
3. Mention this in your privacy policy with legal basis

## Step 24 — Invoice Requirements Under Slovenian Law

### Full Slovenian Invoice (Račun) Requirements:

Per ZDDV-1 (VAT Act), ZDavP-2 (Tax Procedure Act), and SRS (Slovenian Accounting Standards):

**Every invoice must contain:**

1. **Oznaka "RAČUN"** — The word "Račun" (Invoice) must appear
2. **Zaporedna številka** — Sequential number (e.g., AIU-2026-0001)
3. **Datum izdaje računa** — Date of issue
4. **Datum opravljene storitve** — Date of service delivery (event date)
5. **Podatki o izdajatelju** — Issuer details:
   - Full company name
   - Address
   - Matična številka
   - Davčna številka (with SI prefix for DDV)
6. **Podatki o kupcu** — Buyer details:
   - Name (and company name + tax ID for B2B)
   - Address
7. **Opis storitve** — Service description (e.g., "Vstopnica za AI Universa 3-dnevni Masterclass — Standard")
8. **Količina in enota** — Quantity and unit (1 × ticket)
9. **Cena brez DDV** — Price excluding VAT
10. **Stopnja DDV** — VAT rate (22%)
11. **Znesek DDV** — VAT amount
12. **Skupni znesek z DDV** — Total amount including VAT
13. **Plačilni pogoji** — Payment terms (e.g., "Plačano" if already paid)
14. **Način plačila** — Payment method (kartično plačilo / Klarna)

### Fiscal Cash Register (Davčna blagajna):

> **⚠️ CRITICAL:** If you sell tickets at the event or in person, you MUST use a **certified fiscal cash register** connected to FURS in real-time (davčno potrjevanje računov). For **online-only sales processed through Stripe**, the fiscal cash register requirement typically does NOT apply as Stripe acts as the payment processor and the transaction is electronic. **HOWEVER**, this is a gray area — consult your davčni svetovalec (tax advisor) to confirm whether your specific setup requires davčno potrjevanje.

> **💡 Pro Tip:** If in doubt, use a simple certified fiscal solution like Cebelca.biz or FiscalBox that can issue fiscally compliant invoices even for online sales. Better safe than sorry with FURS.

---

# Pre-Launch Checklist

## ✅ Stripe Account

- [ ] Stripe account created with Slovenian business details
- [ ] All verification documents uploaded and approved
- [ ] Statement descriptor set to `AIUNIVERSA`
- [ ] Bank account (IBAN) connected and verified
- [ ] Payout schedule configured
- [ ] Branding (logo, colors) uploaded

## ✅ Products & Pricing

- [ ] Standard Ticket product created (€899, tax inclusive)
- [ ] VIP Ticket product created (€2,499, tax inclusive)
- [ ] Metadata tags added to both products
- [ ] Payment Links OR Checkout Sessions configured
- [ ] Promotion codes created (if using early-bird or referral discounts)

## ✅ Payment Methods

- [ ] Card payments enabled with 3D Secure
- [ ] Klarna enabled and tested
- [ ] SEPA Direct Debit enabled (optional, for B2B)
- [ ] Payment method logos displayed on website

## ✅ Tax & Invoicing

- [ ] DDV/VAT registration added to Stripe Tax
- [ ] Tax behavior set to "inclusive" on all products
- [ ] Tax ID collection enabled for B2B buyers
- [ ] Invoice template customized with all Slovenian legal fields
- [ ] Invoice prefix set (AIU-)
- [ ] Email receipts enabled and branded

## ✅ Legal Pages (aiuniversa.si)

- [ ] Splošni pogoji poslovanja (Terms of Service) — published
- [ ] Politika zasebnosti (Privacy Policy) — published
- [ ] Politika piškotkov (Cookie Policy) — published
- [ ] Politika vračil (Refund Policy) — published
- [ ] Pravno obvestilo / Impressum (Legal Notice) — in footer
- [ ] EU ODR link in footer: `https://ec.europa.eu/consumers/odr`
- [ ] Cookie consent banner implemented

## ✅ Checkout Experience

- [ ] Checkout page loads in Slovenian (`locale: 'sl'`)
- [ ] ToS consent checkbox present and required
- [ ] Marketing opt-in checkbox present and UNCHECKED by default
- [ ] Phone number collection enabled
- [ ] Success page (`/hvala`) built and working
- [ ] Cancel/back URL returns to pricing section

## ✅ Integrations

- [ ] Webhook endpoint configured in Stripe (live mode)
- [ ] Webhook signing secret stored in environment variables
- [ ] GoHighLevel webhook receiving events
- [ ] Contact creation working (name, email, phone, tags)
- [ ] Welcome email sequence built (Standard + VIP variants)
- [ ] SMS confirmation configured

## ✅ Automation Flow

- [ ] Payment → Contact created in GHL
- [ ] Correct tag applied (standard vs VIP)
- [ ] Welcome email sent within 2 minutes
- [ ] VIP coaching scheduling link sent (VIP only)
- [ ] Calendar event invitation sent
- [ ] Refund flow tested (tag update, email notification)

## ✅ Fraud & Security

- [ ] Stripe Radar rules configured
- [ ] 3D Secure enabled (SCA/PSD2 compliance)
- [ ] Webhook signature verification in code
- [ ] Rate limiting on checkout API endpoint
- [ ] HTTPS verified on all pages

## ✅ Testing (ALL Must Pass)

- [ ] Successful card payment (test mode) → full flow verified
- [ ] 3D Secure payment → authentication flow works
- [ ] Declined card → graceful error message shown
- [ ] Klarna payment → redirect and return flow works
- [ ] Refund → customer notification + GHL tag update
- [ ] Webhook → server responds 200 + triggers automation
- [ ] Mobile checkout → fully responsive and functional
- [ ] Real €1 payment (live mode) → complete flow → refund yourself

## ✅ Go-Live

- [ ] All test-mode keys replaced with live-mode keys
- [ ] Live webhook endpoints created (separate from test)
- [ ] Live Payment Links generated
- [ ] DNS and SSL verified on aiuniversa.si
- [ ] First real transaction monitored end-to-end
- [ ] Accounting software connected for monthly exports
- [ ] Team briefed on refund process and dashboard access
- [ ] Celebration beer purchased 🍺

---

## Appendix A: Stripe Fee Summary (Slovenia)

| Payment Method | Fee (EU cards) | Fee (Non-EU cards) |
|---|---|---|
| Cards (Visa, MC) | 1.5% + €0.25 | 2.9% + €0.25 |
| Klarna | ~2.49–3.29% + €0.35 | Same |
| SEPA Direct Debit | 0.35% (capped at €5) | N/A |
| iDEAL | €0.29 | N/A |
| Bancontact | 1.4% + €0.25 | N/A |

### Revenue Projections (After Fees):

| Scenario | Gross | Stripe Fees (~) | Klarna Fees (~) | Net Revenue |
|---|---|---|---|---|
| 1 Standard (Card) | €899 | ~€13.74 | — | ~€885.26 |
| 1 VIP (Card) | €2,499 | ~€37.74 | — | ~€2,461.26 |
| 1 VIP (Klarna) | €2,499 | — | ~€62.47 + €0.35 | ~€2,436.18 |
| 50 Standard + 15 VIP (mixed) | €82,435 | ~€1,650 | ~€310 | ~€80,475 |

## Appendix B: Useful Slovenian Tax & Legal Resources

| Resource | URL | Purpose |
|---|---|---|
| FURS (Financial Administration) | fu.gov.si | Tax authority — DDV registration and filing |
| eDavki | edavki.durs.si | Online tax portal — file DDV-O returns |
| AJPES | ajpes.si | Business register — company extracts |
| Informacijski pooblaščenec | ip-rs.si | Data protection authority (GDPR complaints) |
| EU ODR Platform | ec.europa.eu/consumers/odr | Consumer dispute resolution |
| Tržni inšpektorat | ti.gov.si | Market inspectorate — e-commerce compliance |
| ZVPot-1 (Consumer Protection Act) | pisrs.si | Full text of the law |
| ZDDV-1 (VAT Act) | pisrs.si | Full text of the VAT law |
| ZVOP-2 (Data Protection Act) | pisrs.si | Slovenian GDPR implementation |

## Appendix C: Emergency Contacts & Support

| Issue | Contact |
|---|---|
| Stripe support (urgent) | dashboard.stripe.com → Help → Chat (priority for live accounts) |
| Klarna merchant support | klarna.com/merchant-support |
| FURS tax questions | Call center: 08 200 1001 |
| Chargeback received | Respond within 7 days via Stripe Dashboard → Disputes |
| GoHighLevel support | support.gohighlevel.com |

---

*This guide was prepared for AI Universa. It covers payment processing, legal compliance, and automation for Slovenian market operations. While comprehensive, it does not constitute legal or tax advice. Consult a Slovenian davčni svetovalec (tax advisor) and pravni svetovalec (legal advisor) before launch to verify your specific obligations.*

*Last updated: March 2026*
