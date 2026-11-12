// Axis module landing pages. Feature claims come verbatim from /axis and
// /axis/pricing (see the "01 — Invoicing & Clients", "02 — Full Ledger
// Accounting", "03 — Inventory & Custody" rows and the HR & Attendance trio).
// Deliberately absent: payroll/PAYE/NSSF/statutory claims, offline mode, POS,
// EFRIS, WhatsApp, Flutterwave, API keys/webhooks, roadmaps, and plan limits
// beyond what /axis/pricing states.
export type AxisModule = {
  slug: string
  name: string
  // Full <title>. Each ends with the brand, so it must be set via
  // title.absolute (the layout template would otherwise append it twice).
  title: string
  // H1, meta description and og:title MUST name Axis — the <title> above
  // deliberately does not.
  h1: string
  ogTitle: string
  description: string
  intro: string
  features: { title: string; body: string }[]
  connects: string
  whoFor: string
  faq: { q: string; a: string }[]
}

export const AXIS_MODULES: AxisModule[] = [
  {
    slug: 'invoicing',
    name: 'Invoicing',
    title: 'Invoicing Software for Small Business | Regent Technologies',
    h1: 'Invoice clients and get paid, all inside Axis',
    ogTitle: 'Axis Invoicing — Invoicing Software for Small Business',
    description:
      'Axis invoicing for small business: send branded PDF invoices, track payment status, and keep clients and ledger linked in one system.',
    intro:
      'Axis invoicing replaces spreadsheets and email-stitched invoices with one record: create an invoice, send it to the client, and watch it link straight into your books — no separate reconciliation step.',
    features: [
      {
        title: 'Branded PDF invoices in one click',
        body: 'Send professional, branded PDF invoices to your clients the same way, every time.',
      },
      {
        title: 'Auto-linked to client and ledger',
        body: 'Every invoice ties directly into your books and onto the client record — payment shows up where it belongs.',
      },
      {
        title: 'Payment status tracking',
        body: 'See what has been paid and what is still outstanding from the same record your invoices live on.',
        },
    ],
    connects:
      'Because Axis modules share the same clients, items and ledger, the invoices you send post straight to your accounts and the items on them are the same records inventory counts — nothing falls out of sync.',
    whoFor:
      'For small businesses in Uganda that have outgrown spreadsheets — retail, services and operations that need invoicing connected to the rest of the business, not another separate tool.',
    faq: [
      {
        q: 'Can I try Axis invoicing for free?',
        a: 'Yes. Every Axis plan starts with a 7-day free trial — no credit card required.',
      },
      {
        q: 'Does Axis invoicing connect to accounting and inventory?',
        a: 'Yes. Invoices post to the ledger automatically, and the items on an invoice are the same records your inventory counts from.',
      },
      {
        q: 'Is Axis invoicing for small businesses in Uganda?',
        a: 'Axis is built for growing small businesses, including businesses in Uganda, that have outgrown spreadsheets.',
      },
    ],
  },
  {
    slug: 'accounting',
    name: 'Accounting',
    title: 'Accounting Software for Small Business | Regent Technologies',
    h1: 'A real ledger for your small business, inside Axis',
    ogTitle: 'Axis Ledger Accounting — Accounting Software for Small Business',
    description:
      'Axis accounting for small business: a double-entry ledger with auto-posted journal entries — in sync with invoicing, inventory and HR.',
    intro:
      'Axis accounting is a real double-entry ledger, not a spreadsheet. Expenses, daily sales and invoices post journal entries automatically, so your books stay current as work happens.',
    features: [
      {
        title: 'Auto-posted journal entries',
        body: 'Expenses, daily sales and invoices all post journal entries automatically — no manual data entry.',
      },
      {
        title: 'Chart of accounts built in',
        body: 'A real double-entry ledger with a chart of accounts, not a running total in a sheet.',
      },
      {
        title: 'Void one side, clean up the other',
        body: 'Voiding a posted entry cleans up the other side too, keeping your books consistent.',
      },
    ],
    connects:
      'Axis modules share the same clients, items and ledger, so an invoice sent in invoicing posts to the ledger the moment it is created, and inventory and HR sit on the same books — nothing falls out of sync.',
    whoFor:
      'For small businesses in Uganda that need proper books without building them by hand — owners who want the ledger connected to invoicing, inventory and people in one system.',
    faq: [
      {
        q: 'Can I try Axis accounting for free?',
        a: 'Yes. Every Axis plan starts with a 7-day free trial — no credit card required.',
      },
      {
        q: 'Is Axis accounting double-entry?',
        a: 'Yes. Axis runs on a real double-entry ledger, with journal entries posted automatically from invoices, daily sales and expenses.',
      },
      {
        q: 'Does accounting stay in sync with the rest of the business?',
        a: 'Yes. The ledger, invoicing and inventory share one record, so posted entries match the invoices and stock movements behind them.',
      },
    ],
  },
  {
    slug: 'inventory',
    name: 'Inventory',
    title: 'Inventory Management Software Uganda | Regent Technologies',
    h1: 'Know what is on hand and who has it, inside Axis',
    ogTitle: 'Axis Inventory & Custody — Inventory Management Software Uganda',
    description:
      'Axis inventory management for businesses in Uganda: live stock counts, custody handoff tracking, and item records shared with invoicing and your ledger.',
    intro:
      'Axis inventory tracks stock on hand and which items are out on custody with a team member — all from the same item records your invoices use, so what you count is what you sell.',
    features: [
      {
        title: 'Live stock counts',
        body: 'Track stock on hand and item sales from the same records your invoices use.',
      },
      {
        title: 'Custody handoff tracking',
        body: 'See which items are out on custody with a team member, and who has them.',
      },
      {
        title: 'Shared item records with invoicing',
        body: 'One item record feeds invoicing, stock and the ledger — no separate inventory lists to keep in step.',
      },
    ],
    connects:
      'Axis modules share the same clients, items and ledger, so stock levels move as invoices are sent and item records stay the same across invoicing, inventory and the ledger — nothing falls out of sync.',
    whoFor:
      'For small businesses in Uganda that hold stock or equipment — retailers, traders and service businesses that need to know what is on hand and where it is without a separate spreadsheets stack.',
    faq: [
      {
        q: 'Can I try Axis inventory for free?',
        a: 'Yes. Every Axis plan starts with a 7-day free trial — no credit card required.',
      },
      {
        q: 'Does Axis inventory track items in the field?',
        a: 'Yes. Axis tracks custody handoffs, so you can see which items are out with a team member and which are on hand.',
      },
      {
        q: 'Does inventory connect to my invoices?',
        a: 'Yes. Inventory and invoicing share the same item records, so selling an item updates stock automatically.',
      },
    ],
  },
  {
    slug: 'hr',
    name: 'HR',
    title: 'HR & Attendance Software for Business | Regent Technologies',
    h1: 'Employee profiles, shifts and attendance, inside Axis',
    ogTitle: 'Axis HR & Attendance — HR & Attendance Software for Business',
    description:
      'Axis HR for business: employee profiles, shifts and attendance records connected to invoicing, accounting and inventory in one system.',
    intro:
      'Axis HR keeps employee profiles, shifts and attendance alongside the money — no separate HR tool, no re-keying people data into payroll or reporting later.',
    features: [
      {
        title: 'Employee profiles',
        body: 'Keep each employee record connected to the same organization the rest of Axis runs on.',
      },
      {
        title: 'Shifts',
        body: 'Schedule and record shifts in the same place you run the business.',
      },
      {
        title: 'Attendance',
        body: 'Record attendance without a separate tool, alongside the accounts and inventory it affects.',
      },
    ],
    connects:
      'Axis modules share the same clients, items and ledger, so employee profiles and attendance sit on the same organization records as invoicing, accounting and inventory — nothing falls out of sync.',
    whoFor:
      'For small businesses in Uganda with a team — owners who need people, shifts and attendance tracked alongside the money, without buying payroll features they do not need or a standalone HR app.',
    faq: [
      {
        q: 'Can I try Axis HR for free?',
        a: 'Yes. Every Axis plan starts with a 7-day free trial — no credit card required.',
      },
      {
        q: 'Does Axis HR replace payroll?',
        a: 'No. Axis HR covers employee profiles, shifts and attendance. Payroll is not part of Axis.',
      },
      {
        q: 'Does HR connect to the rest of the business?',
        a: 'Yes. HR records sit on the same organization and ledger records as invoicing, accounting and inventory.',
      },
    ],
  },
]
