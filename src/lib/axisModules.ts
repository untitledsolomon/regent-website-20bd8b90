// Axis module landing pages. Feature claims come verbatim from /axis and
// /axis/pricing (see the "01 — Invoicing & Clients", "02 — Full Ledger
// Accounting", "03 — Inventory & Custody" rows and the HR & Attendance trio).
// Deliberately absent: payroll/PAYE/NSSF/statutory claims, offline mode, POS,
// EFRIS, WhatsApp, Flutterwave, API keys/webhooks, roadmaps, and plan limits
// beyond what /axis/pricing states.
//
// Audience is phrased as "growing small businesses" — deliberately no country,
// so the pages read for any market Regent serves.
import { Icons } from '@/components/Icons'

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
  features: { icon: keyof typeof Icons; title: string; body: string }[]
  howItWorks: { title: string; body: string }[]
  whatItReplaces: string
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
        icon: 'FileText',
        title: 'Branded PDF invoices in one click',
        body: 'Send professional, branded PDF invoices to your clients the same way, every time.',
      },
      {
        icon: 'Workflow',
        title: 'Quotations and invoices in one flow',
        body: 'Quotations are sent the same way as invoices, so a quote can become an invoice without recreating it.',
      },
      {
        icon: 'Integration',
        title: 'Auto-linked to client and ledger',
        body: 'Every invoice ties directly into your books and onto the client record — payment shows up where it belongs.',
      },
      {
        icon: 'BarChart',
        title: 'Payment status tracking',
        body: 'See what has been paid and what is still outstanding from the same record your invoices live on.',
      },
      {
        icon: 'Database',
        title: 'Items shared with inventory',
        body: 'The items on an invoice are the same records inventory counts from, so what you bill is what you hold.',
      },
    ],
    howItWorks: [
      {
        title: 'Create the invoice from a client record',
        body: 'Items come from the same list inventory uses, and your branding and terms apply automatically — no retyping.',
      },
      {
        title: 'Send it as a branded PDF',
        body: 'Quote or invoice, it goes to the client the same way, and payment status follows the document from unpaid to paid.',
      },
      {
        title: 'It posts to your books',
        body: 'The moment it is sent, the ledger and client record update — there is no separate step where you re-enter the sale.',
      },
      {
        title: 'Follow up on what is outstanding',
        body: 'Paid and unpaid live on the same record, so you know exactly which clients owe what, and when.',
      },
    ],
    whatItReplaces:
      'Invoicing in Axis replaces the spreadsheets you keep for clients, the invoices you build by hand in a word processor or email, and the quiet work of checking which invoices have actually been paid.',
    connects:
      'Because Axis modules share the same clients, items and ledger, the invoices you send post straight to your accounts and the items on them are the same records inventory counts — nothing falls out of sync.',
    whoFor:
      'For growing small businesses that have outgrown spreadsheets — retail, services and operations that need invoicing connected to the rest of the business, not another separate tool.',
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
        q: 'Can I send quotations and partial payments?',
        a: 'Yes. Quotations are sent the same way as invoices, and invoices can record part or full payment against the amount due.',
      },
      {
        q: 'What does invoicing cost on each plan?',
        a: 'Quotations, invoicing and client management are in Starter. Pro and Advanced include everything in Starter, plus inventory, advanced reporting and more users. See the Axis pricing page for current prices.',
      },
      {
        q: 'How many users can send invoices?',
        a: 'Starter is for one user. Pro supports up to 5 users and Advanced up to 20 users, with role-based access.',
      },
      {
        q: 'Is Axis invoicing only for small businesses?',
        a: 'Axis is built for growing small businesses that have outgrown spreadsheets. It runs on the same shared clients, items and ledger across every module.',
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
        icon: 'Zap',
        title: 'Auto-posted journal entries',
        body: 'Expenses, daily sales and invoices all post journal entries automatically — no manual data entry.',
      },
      {
        icon: 'Database',
        title: 'Chart of accounts built in',
        body: 'A real double-entry ledger with a chart of accounts, not a running total in a sheet.',
      },
      {
        icon: 'Workflow',
        title: 'Invoices post from invoicing',
        body: 'An invoice sent in invoicing lands in the ledger the moment it is created — you never enter it twice.',
      },
      {
        icon: 'Shield',
        title: 'Void one side, clean up the other',
        body: 'Voiding a posted entry cleans up the other side too, keeping your books consistent.',
      },
      {
        icon: 'Integration',
        title: 'Ledger connected to the whole business',
        body: 'Inventory and HR sit on the same books, so what you sell and who you pay are already in the ledger.',
      },
    ],
    howItWorks: [
      {
        title: 'Record expenses and daily sales',
        body: 'Journal entries post automatically as work happens — no month-end scramble to catch up.',
      },
      {
        title: 'Invoices arrive from invoicing',
        body: 'Send an invoice and the ledger updates itself; the invoice and the entry are one story, not two records.',
      },
      {
        title: 'Void entries cleanly',
        body: 'When you void a posted entry, the opposite side cleans up too, so the books never lose their balance.',
      },
      {
        title: 'See the books as they are',
        body: 'Because everything posts immediately, the ledger reflects today — not the state of your spreadsheet last week.',
      },
    ],
    whatItReplaces:
      'Axis accounting replaces the spreadsheet you balance by hand, the separate records for sales, expenses and invoices, and the work of reconciling them against each other at the end of the month.',
    connects:
      'Axis modules share the same clients, items and ledger, so an invoice sent in invoicing posts to the ledger the moment it is created, and inventory and HR sit on the same books — nothing falls out of sync.',
    whoFor:
      'For growing small businesses that need proper books without building them by hand — owners who want the ledger connected to invoicing, inventory and people in one system.',
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
        q: 'Is accounting built into every Axis plan?',
        a: 'Core financial tracking and the ledger are in Starter. Pro and Advanced build on it with inventory, advanced reporting and more users. See the Axis pricing page for current prices.',
      },
      {
        q: 'How many users can work on the books?',
        a: 'Starter is for one user. Pro supports up to 5 users and Advanced up to 20 users, with role-based access so only the right people see the ledger.',
      },
      {
        q: 'Does the ledger stay in sync with invoicing and inventory?',
        a: 'Yes. The ledger, invoicing and inventory share one record, so posted entries match the invoices and stock movements behind them.',
      },
      {
        q: 'Does Axis handle payroll?',
        a: 'No. Payroll is not part of Axis. Axis HR covers employee profiles, shifts and attendance, and accounting keeps the books those activities sit on.',
      },
    ],
  },
  {
    slug: 'inventory',
    name: 'Inventory',
    title: 'Inventory Software for Business | Regent Technologies',
    h1: 'Know what is on hand and who has it, inside Axis',
    ogTitle: 'Axis Inventory & Custody — Inventory Management Software for Business',
    description:
      'Axis inventory management for small business: live stock counts, custody handoff tracking, and item records shared with invoicing and your ledger.',
    intro:
      'Axis inventory tracks stock on hand and which items are out on custody with a team member — all from the same item records your invoices use, so what you count is what you sell.',
    features: [
      {
        icon: 'Database',
        title: 'Live stock counts',
        body: 'Track stock on hand and item sales from the same records your invoices use.',
      },
      {
        icon: 'Building',
        title: 'Custody handoff tracking',
        body: 'See which items are out on custody with a team member, and who has them.',
      },
      {
        icon: 'Integration',
        title: 'Shared item records with invoicing',
        body: 'One item record feeds invoicing, stock and the ledger — no separate inventory lists to keep in step.',
      },
      {
        icon: 'BarChart',
        title: 'Stock moves as you sell',
        body: 'Invoice an item and on-hand updates automatically — the number moves because the record is shared.',
      },
      {
        icon: 'Workflow',
        title: 'Items that track their own history',
        body: 'Every movement — a sale, a receipt, a custody handoff — lives on the same item record, so you can trace it.',
      },
    ],
    howItWorks: [
      {
        title: 'Add an item once',
        body: 'The same record is what you hold in stock, what you put on an invoice and what the ledger values.',
      },
      {
        title: 'Watch stock move as you sell',
        body: 'Send an invoice and on-hand updates automatically — there is no separate step where you decrement a sheet.',
      },
      {
        title: 'Hand items out on custody',
        body: 'Record which team member has which items and when, so equipment and goods are trackable, not loaned into the void.',
      },
      {
        title: 'Count against the same record',
        body: 'Stock counts reconcile against the records your invoices use, so what you count is what you can sell.',
      },
    ],
    whatItReplaces:
      'Inventory in Axis replaces the stock sheet nobody updates, the separate lists for what you hold, what you sell and who has equipment, and the manual reconciliation between those lists every time you count.',
    connects:
      'Axis modules share the same clients, items and ledger, so stock levels move as invoices are sent and item records stay the same across invoicing, inventory and the ledger — nothing falls out of sync.',
    whoFor:
      'For growing small businesses that hold stock or equipment — retailers, traders and service businesses that need to know what is on hand and where it is without a separate spreadsheets stack.',
    faq: [
      {
        q: 'Can I try Axis inventory for free?',
        a: 'Yes. Every Axis plan starts with a 7-day free trial — no credit card required.',
      },
      {
        q: 'Is inventory included on every plan?',
        a: 'No. Inventory tracking is in Pro and above. Starter covers quotations, invoicing and core accounting. See the Axis pricing page for current prices.',
      },
      {
        q: 'Does Axis inventory track items in the field?',
        a: 'Yes. Axis tracks custody handoffs, so you can see which items are out with a team member and which are on hand.',
      },
      {
        q: 'Does inventory connect to my invoices?',
        a: 'Yes. Inventory and invoicing share the same item records, so selling an item updates stock automatically.',
      },
      {
        q: 'How many users can manage stock?',
        a: 'Starter is for one user. Pro supports up to 5 users and Advanced up to 20 users, with role-based access so team members see the stock that matters to them.',
      },
      {
        q: 'Can I track items with a team across locations?',
        a: 'Axis tracks who has an item and what is on hand from the same records. Multi-organization accounts are available on Advanced.',
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
      'Axis HR keeps employee profiles, shifts and attendance alongside the money — no separate HR tool, no re-keying people data into payroll or reporting later. For a growing team, the people running the business are part of the record; Axis HR keeps them in it.',
    features: [
      {
        icon: 'Building',
        title: 'Employee profiles',
        body: 'Keep each employee record connected to the same organization the rest of Axis runs on.',
      },
      {
        icon: 'Workflow',
        title: 'Shifts',
        body: 'Schedule and record shifts in the same place you run the business.',
      },
      {
        icon: 'Check',
        title: 'Attendance',
        body: 'Record attendance without a separate tool, alongside the accounts and inventory it affects.',
      },
      {
        icon: 'Integration',
        title: 'Connected to the money',
        body: 'People records sit on the same ledger and organization records as invoicing, accounting and inventory.',
      },
    ],
    howItWorks: [
      {
        title: 'Create employee profiles',
        body: 'Each employee record connects to the same organization the rest of Axis runs on — who they are, what they work, and which role they hold.',
      },
      {
        title: 'Schedule and record shifts',
        body: 'Shifts are tracked in the same place you run the business — not in a rotating message thread.',
      },
      {
        title: 'Record attendance',
        body: 'Attendance is captured alongside the accounts and inventory it affects, so the people side of the business and the money side tell one story.',
      },
      {
        title: 'Run reports without exporting',
        body: 'Because people data lives next to the money, reporting pulls from one system instead of several files.',
      },
    ],
    whatItReplaces:
      'Axis HR replaces the employee file nobody updates, the shift rota in a message thread or wall chart, the separate attendance book, and the re-keying of people data into other tools — along with the gaps that appear between them, when the file, the rota and the book disagree about what actually happened.',
    connects:
      'Axis modules share the same clients, items and ledger, so employee profiles and attendance sit on the same organization records as invoicing, accounting and inventory — nothing falls out of sync.',
    whoFor:
      'For growing small businesses with a team — owners who need people, shifts and attendance tracked alongside the money, without buying payroll features they do not need or a standalone HR app. Axis keeps people data in the same place as the money, so the two stay connected and one can always be reconciled against the other.',
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
        q: 'Is employee management available on every plan?',
        a: 'No. Employee management is in Advanced. Starter and Pro cover invoicing, accounting and (on Pro) inventory. See the Axis pricing page for current prices.',
      },
      {
        q: 'Does HR connect to the rest of the business?',
        a: 'Yes. HR records sit on the same organization and ledger records as invoicing, accounting and inventory.',
      },
      {
        q: 'How many users can manage HR records?',
        a: 'Starter is for one user, Pro up to 5, and Advanced up to 20 — with role-based access so HR records are only visible to the right people.',
      },
      {
        q: 'Who is Axis HR for?',
        a: 'Growing small businesses with a team that need employee profiles, shifts and attendance tracked in one place — without a standalone HR app or payroll features they do not need.',
      },
    ],
  },
]
