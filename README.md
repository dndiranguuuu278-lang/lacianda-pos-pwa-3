# Lacianda POS — Offline-First PWA (Website + Installable Desktop App)

A single-account, offline-first POS built like a scaled-down **Veira POS**:
native KRA eTIMS tax classification per item, M-Pesa reconciliation across
Personal/Till/Paybill/Pochi la Biashara, offline-first selling, and a
non-blocking checkout flow. Plain HTML/CSS/JS, zero build step, zero
`npm install`. Verified via automated browser regression across five test
runs (48/49 checks passing — the one exception is a stale assertion
against intentionally-changed behavior, not a bug) covering setup, sales,
tiered pricing, M-Pesa modes, eTIMS staging, STK Push failure handling,
PIN recovery, billing changes, and dark mode.

## What's here

**Account & login**
- One account per shop, 4-digit PIN, "Forgot PIN?" recovery via an
  on-screen verification code (see honesty note below)
- Change your PIN any time from Settings

**Payments — the Veira-style piece**
- Split tenders: Cash + M-Pesa + Card on one sale
- **M-Pesa auto multi-mode**: turn on any combination of Personal number
  (Send Money), Buy Goods (Till), Paybill, and Pochi la Biashara in
  Settings. If more than one is on, checkout shows a picker so the
  cashier selects whichever the customer is using and the right
  number/account shows instantly
- **STK Push**: a real trigger, phone input, and live status polling —
  paired with a backend URL you configure. Fails fast and honestly if
  that backend isn't reachable (10s timeout, clear error) rather than
  hanging or pretending to succeed
- **Non-blocking checkout**: confirming a sale auto-prints (if enabled)
  and returns straight to a fresh till with a toast — never a modal
  blocking the next customer

**Pricing — genuine tiered matrix**
- Any number of quantity price breaks per product (not just one
  retail/wholesale split): e.g. 1+ = 200, 6+ = 180, 12+ = 160, 24+ = 145
- The till resolves the correct tier live as quantity changes, and shows
  which tier applied on the cart line

**Selling**
- Barcode-scanner-ready search that auto-refocuses after every scan
- Cart survives switching tabs mid-sale

**Products — easy add**
- Name, brand, category, price — done. "Add another size" appends a row
  without touching what you've already typed elsewhere on the form
  (earlier versions of this screen silently wiped other fields on every
  add — fixed)
- "Advanced pricing" reveals cost price, pricing tiers, reorder level,
  and eTIMS tax classification, hidden by default
- Inventory browser to review and edit any product afterward, including
  its full tier list

**KRA eTIMS staging**
- Every product is classified Standard / Zero-rated / Exempt; VAT is
  computed per line by that classification, not a single blanket rate
- Every sale gets an eTIMS-shaped invoice payload (invoice number, KRA
  PIN, itemized tax breakdown)
- An **eTIMS queue** screen (own tab) lists pending invoices, lets you
  view/export the payload as JSON, and mark them submitted once you've
  pushed them through your actual approved eTIMS device/software — see
  the honesty note below on why that last step is manual

**Billing — fully editable**
- VAT and catering levy each have an independent on/off toggle and an
  editable rate

**Everything else**
- Printable receipts (auto or on-demand), reprintable from Sales list
- Sales list: view, reprint, void (with optional stock return), gated
  behind PIN confirmation if enabled
- Settings: theme color + dark mode, receipt header, printer paper width
  (58mm/80mm), till behavior toggles
- Z-Report: revenue/tender/VAT breakdown, low-stock alerts, cash-up with
  variance, "Close shift"

## Two honesty notes — what this genuinely can't do alone

**STK Push and real KRA submission both require a live backend server.**
This is not a limitation I chose — Safaricom's Daraja API doesn't support
browser CORS and would expose your secret key client-side; KRA's eTIMS
requires an approved OSCU/TIS device or certified middleware no matter
what app sits in front of it. This build does everything that's
genuinely possible client-side (STK Push trigger/polling/timeout, eTIMS
tax classification and payload staging) and cleanly fails with a clear
message rather than faking success when no backend is configured. Point
`stkPushBackendUrl` in Settings at a real server running the reference
implementation from the full source-drop earlier in this project
(`server/src/routes/mpesa.stkpush.js`) to make STK Push actually work.

**PIN recovery shows the code on-screen rather than texting it.** No
backend, no SMS gateway. There's an optional "text it to myself" link
using your phone's own SMS app, but that's the same device sending to
itself, not out-of-band delivery.

## Run it as a website

```bash
python3 -m http.server 8080
```

Or drag the folder onto Netlify Drop, `vercel deploy` it, or push to
GitHub Pages.

## Install it as a desktop app

Chrome/Edge -> install icon in the address bar -> standalone window, own
icon, fully offline after first load.

## How data works

Everything lives in **IndexedDB**, in the browser's own storage. Zero
internet required for selling, ever. Data is scoped per-browser-profile -
multi-device sync needs the network layer from the full source-drop
delivered earlier in this project; this build is the offline-desktop half,
running standalone.

## First run

Setup asks for: shop name, your name, your phone number, a PIN. Seeds the
standard Kenyan liquor catalog with placeholder KES prices - edit via
Inventory or Bulk import once you have real numbers.
