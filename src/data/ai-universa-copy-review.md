# AI Universa — Copy Review Report

**Reviewer:** Copy Department (Slovenian Market)  
**Date:** 2026-03-11  
**Files Reviewed:**  
1. Landing Page: `src/app/lp/ai-universa/page.tsx`  
2. Email Sequence: `src/data/ai-universa-emails.md`

---

## 1. Overall Assessment

| Dimension | Score | Notes |
|---|---|---|
| Slovenian Naturalness | 7.5/10 | Mostly natural, a few translated-from-English phrases and one critical error ("kolena" instead of "na potezi") |
| Brand Voice Consistency | 8.5/10 | Confident, direct, conversational — fits Nepridiprav/Pici well |
| "Ti" Form Consistency | 8/10 | Mostly correct; one switch to "vi" form in Email 7 P.S. |
| CTAs | 9/10 | Punchy, action-oriented, good variety |
| Grammar/Spelling | 7/10 | Several errors: gender agreement, typo, one meaning-breaking mistake |
| 4 Limiting Beliefs Strategy | 8/10 | Well addressed: no experience needed, no tech skills, no money (guarantee), no time (AI agents work for you) |
| Sweepstakes/Offers/Social Proof | 9/10 | Consistently referenced throughout both LP and emails |

**Overall: 8/10** — Solid foundation, needs targeted fixes before launch.

---

## 2. Landing Page Issues

### ISSUE LP-1 — "natančen" is non-standard Slovenian
- **Location:** Hero subheadline
- **Current:** `kjer ti pokažemo natančen sistem`
- **Problem:** "Natančen" is a non-standard pseudo-adjective. Not in SSKJ. Sounds awkward in written copy.
- **Fix:** `kjer ti pokažemo točen sistem`

### ISSUE LP-2 — Missing comma in video placeholder
- **Location:** VSL video overlay text
- **Current:** `Poglej zakaj je to zate`
- **Problem:** Missing comma before subordinate clause (zakaj).
- **Fix:** `Poglej, zakaj je to zate`

### ISSUE LP-3 — "lažne profile" is brand-risky
- **Location:** Day 2 card item
- **Current:** `AI influencer model: kako ustvariš lažne profile z 500k sledilcev`
- **Problem:** "Lažne" (fake/false) has strong negative connotations. Signals scam/fraud. Bad for ads compliance and brand trust.
- **Fix:** `AI influencer model: kako ustvariš AI profile z 500k sledilcev`

### ISSUE LP-4 — "SAAS" incorrect capitalization
- **Location:** Day 3 card item
- **Current:** `SAAS: zgradi in prodaj lastno AI rešitev`
- **Problem:** Standard industry capitalization is "SaaS" (Software as a Service).
- **Fix:** `SaaS: zgradi in prodaj lastno AI rešitev`

### ISSUE LP-5 — "Od nikogar" sounds unnatural
- **Location:** About section
- **Current:** `Od nikogar do enega najbolj prepoznavnih imen v AI prostoru na Balkanu.`
- **Problem:** "Od nikogar" is technically possible but sounds unnatural and translated. Slovenian doesn't naturally say "from nobody."
- **Fix:** `Iz popolne anonimnosti do enega najbolj prepoznavnih imen v AI prostoru na Balkanu.`

### ISSUE LP-6 — "500k+" stat label unclear
- **Location:** Social proof stats row
- **Current:** `{ stat: "500k+", label: "profil iz nič" }`
- **Problem:** "500k+ profil iz nič" is ambiguous — 500k what? Needs context. Other stats are clear (ogledov, sledilcev, dobička).
- **Fix:** `{ stat: "500k+", label: "sledilcev — profil iz nič" }`

### ISSUE LP-7 — "za upravljanje poslov" slightly awkward
- **Location:** Prize card (iPhone)
- **Current:** `Najnovejši model za upravljanje poslov`
- **Problem:** "Poslov" (genitive plural of "posel") is technically correct but stilted. "Poslovanja" flows better.
- **Fix:** `Najnovejši model za upravljanje poslovanja`

### ISSUE LP-8 — Shortened infinitives inconsistency
- **Location:** P.S. section
- **Current:** `Imaš samo 30 sekund za izgubit — in potencialno celotno prihodnost za pridobit.`
- **Note:** Shortened infinitives ("izgubit" instead of "izgubiti") are intentional brand voice — conversational, casual Slovenian. Consistent with the tone. **No fix needed** — just flagging for awareness.

---

## 3. Email Issues

### ISSUE E6-1 — CRITICAL: Wrong gender agreement on "darilo"
- **Email:** 6 (Dobrodošlica)
- **Current:** `tukaj je tvoj darilo za prijavo`
- **Problem:** "Darilo" is neuter gender → possessive must be "tvoje" not "tvoj." Clear grammatical error.
- **Fix:** `tukaj je tvoje darilo za prijavo`

### ISSUE E7-1 — Ti/Vi inconsistency
- **Email:** 7 (2 dni pred dogodkom)
- **Current:** `P.S. Spomnite se — vsi udeleženci so avtomatično v nagradni igri`
- **Problem:** "Spomnite se" is vi-form (formal/plural), but entire email sequence uses "ti" form. Inconsistent.
- **Fix:** `P.S. Spomni se — vsi udeleženci so avtomatično v nagradni igri`

### ISSUE E9-1 — CRITICAL: "kolena" means "knee," not "turn"
- **Email:** 9 (Cart Open Dan 1)
- **Current:** `Zdaj je tvoja kolena.`
- **Problem:** "Kolena" = knee (body part). This is a meaning-breaking error. Intended meaning is "your turn" / "your move." Likely a bad auto-translation or confusion with another language.
- **Fix:** `Zdaj si na potezi.` (= "Now it's your move" — natural, punchy Slovenian)

### ISSUE E2-1 — Misgendered reference to female student
- **Email:** 2 (Social proof)
- **Current:** `Od 16-letnika do podjetnika.`
- **Problem:** In testimonials, the 16-year-old is female (Sara K. on LP, Ana in emails). "16-letnika" and "podjetnika" are masculine. Should be feminine or gender-neutral.
- **Fix:** `Od 16-letnice do podjetnice.`

### ISSUE E10-1 — Name inconsistency with Landing Page
- **Email:** 10 (Cart Open Dan 2)
- **Current:** `Ana — 16 let` (in email), but Landing Page has `Sara K.` as the 16-year-old testimonial
- **Problem:** Inconsistent character names between LP and emails damages credibility. Pick one and stick with it.
- **Fix:** Change email to match LP: `Sara — 16 let` (and update details to match LP testimonial)

### ISSUE E5-1 — Gender-exclusive "neumen"
- **Email:** 5 (Zadnji klic)
- **Current:** `bi bil neumen, če bi to izpustil`
- **Problem:** "bil neumen" and "izpustil" are masculine-only. Other emails use "prijavil/a" and "bil/a" for inclusivity. Inconsistent.
- **Fix:** `bi bil/a neumen/na, če bi to izpustil/a`

### ISSUE E13-1 — "izmed" is archaic
- **Email:** 13 (Zadnji dan) & Email 16 (24 ur)
- **Current:** `eden izmed tistih` (appears in both)
- **Problem:** "Izmed" is archaic/literary. Modern conversational Slovenian uses "od."
- **Fix:** `eden od tistih`

### ISSUE E6-2 — "Da ne pozabiš" slightly off
- **Email:** 6 (Dobrodošlica)
- **Current:** `Da ne pozabiš!`
- **Problem:** "Pozabiš" is colloquial but the standard form is "pozabiš" — actually this is fine colloquially. **No fix needed.**

### ISSUE E7-2 — "Notes" in English
- **Email:** 7 (2 dni pred dogodkom)
- **Current:** `📝 Notes — imel boš kar nekaj "aha" momentov`
- **Problem:** "Notes" is English. Should be Slovenian for consistency.
- **Fix:** `📝 Beležke — imel boš kar nekaj "aha" momentov`

### ISSUE E7-3 — "imel boš" masculine assumption
- **Email:** 7 (2 dni pred dogodkom)
- **Current:** `imel boš kar nekaj "aha" momentov`
- **Problem:** "imel" is masculine. For consistency with other gender-inclusive forms used in the sequence.
- **Fix:** `imel/a boš kar nekaj "aha" momentov`

---

## 4. Recommended Changes — Priority Order

### 🔴 P0 — Must fix before launch (meaning-breaking / brand-damaging)

| # | File | Issue | Impact |
|---|---|---|---|
| 1 | Emails | E9-1: "kolena" → "na potezi" | Meaning-breaking — says "knee" instead of "your turn" |
| 2 | LP | LP-3: "lažne profile" → "AI profile" | Brand risk — implies creating fake/fraudulent profiles |
| 3 | Emails | E6-1: "tvoj darilo" → "tvoje darilo" | Basic grammar error — looks unprofessional |

### 🟡 P1 — Should fix (grammar, consistency)

| # | File | Issue |
|---|---|---|
| 4 | Emails | E10-1: Ana → Sara (name consistency with LP) |
| 5 | Emails | E7-1: "Spomnite se" → "Spomni se" (ti/vi consistency) |
| 6 | Emails | E2-1: "16-letnika" → "16-letnice" (gender match) |
| 7 | LP | LP-1: "natančen" → "točen" (non-standard word) |
| 8 | LP | LP-2: Missing comma in "Poglej zakaj" |
| 9 | LP | LP-4: "SAAS" → "SaaS" |
| 10 | Emails | E7-2: "Notes" → "Beležke" (English word in Slovenian copy) |

### 🟢 P2 — Nice to fix (polish, naturalness)

| # | File | Issue |
|---|---|---|
| 11 | LP | LP-5: "Od nikogar" → "Iz popolne anonimnosti" |
| 12 | LP | LP-6: "500k+" label → add "sledilcev" for clarity |
| 13 | LP | LP-7: "poslov" → "poslovanja" |
| 14 | Emails | E5-1, E7-3: Gender-inclusive forms for consistency |
| 15 | Emails | E13-1: "izmed" → "od" (2 occurrences) |

---

## 5. Summary

The copy is strong overall — the brand voice comes through well, CTAs are punchy, and the narrative arc from warm-up to urgency is well-structured. The critical "kolena" error in Email 9 needs immediate fixing as it's a meaning-breaking mistake that would confuse readers. The "lažne profile" wording on the LP is a brand/compliance risk. After applying these fixes, the copy is launch-ready.

**Total issues found:** 15  
**Critical (P0):** 3  
**Important (P1):** 7  
**Polish (P2):** 5
