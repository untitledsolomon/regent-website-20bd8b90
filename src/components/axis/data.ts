/**
 * Static sample data for the Axis app previews. Models the shape and feel of
 * the real app (client names, UGX money, status vocabulary) so the marketing
 * previews read like a genuine workspace. All values are fictional.
 */

export const formatMoney = (minor: number): string => {
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  if (abs >= 1_000_000) {
    const m = (abs / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1);
    return `${sign}UGX ${m}M`;
  }
  if (abs >= 1_000) {
    const k = (abs / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1);
    return `${sign}UGX ${k}K`;
  }
  return `${sign}UGX ${abs.toLocaleString("en-US")}`;
};

export const formatMoneyFull = (minor: number): string =>
  `${minor < 0 ? "-" : ""}UGX ${Math.abs(minor).toLocaleString("en-US")}`;

/* ---- App shell ---- */
export type NavItem = { label: string; icon: keyof typeof import("./icons").AxIcon; active?: boolean };

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", icon: "layout" },
      { label: "Clients", icon: "clients" },
      { label: "Quotations", icon: "file" },
      { label: "Job Orders", icon: "package" },
      { label: "Delivery Forms", icon: "truck" },
      { label: "Invoices", icon: "receipt" },
      { label: "Transactions", icon: "wallet" },
      { label: "Inventory", icon: "bag" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Chart of Accounts", icon: "book" },
      { label: "General Ledger", icon: "sheet" },
      { label: "Reports", icon: "chart" },
      { label: "Analytics", icon: "chart" },
      { label: "Banking", icon: "card" },
      { label: "Expenses", icon: "trend" },
      { label: "Quick Sales", icon: "bag" },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Employees", icon: "users" },
      { label: "Team", icon: "userCog" },
    ],
  },
  {
    title: "Others",
    items: [
      { label: "Settings", icon: "settings" },
      { label: "Billing", icon: "card" },
      { label: "Connections", icon: "plug" },
    ],
  },
];

/* ---- Dashboard ---- */
export const dashboardStats = [
  { label: "Revenue this month", value: formatMoney(18_400_000), trend: "+12.6%", up: true, icon: "wallet" as const },
  { label: "Outstanding", value: formatMoney(5_250_000), trend: "6 unpaid invoices", icon: "receipt" as const },
  { label: "Stock value", value: formatMoney(12_780_000), trend: "312 units on hand", icon: "bag" as const },
  { label: "Team on leave", value: "2", trend: "17 active employees", icon: "users" as const },
];

export const dashboardSummary = [
  { label: "Paid", value: formatMoney(12_480_000), tone: "success" },
  { label: "Overdue", value: formatMoney(1_640_000), tone: "danger" },
  { label: "Low stock", value: "3 items", tone: "warning" },
  { label: "On leave", value: "2 staff", tone: "navy" },
] as const;

export const revenueSeries = [42, 58, 49, 71, 63, 82, 78, 96, 88, 104, 112, 126];

export const recentActivity = [
  { when: "09:41", text: "Invoice INV-0043 paid — Tekowa Engineering", tone: "success" },
  { when: "09:12", text: "Quotation QUO-0121 accepted by Juba Logistics", tone: "teal" },
  { when: "08:47", text: "Stock — 40 units of Fuel (petrol) received", tone: "navy" },
  { when: "08:15", text: "Job order JO-0088 completed", tone: "navy" },
] as const;

/* ---- Invoices ---- */
export type InvoiceRow = {
  ref: string;
  client: string;
  issue: string;
  due: string;
  status: "paid" | "sent" | "partial" | "overdue";
  amount: string;
};

export const invoices: InvoiceRow[] = [
  { ref: "INV-0043", client: "Tekowa Engineering", issue: "11 Nov 2026", due: "11 Dec 2026", status: "paid", amount: formatMoneyFull(4_200_000) },
  { ref: "INV-0042", client: "Juba Logistics", issue: "08 Nov 2026", due: "08 Dec 2026", status: "sent", amount: formatMoneyFull(2_750_000) },
  { ref: "INV-0041", client: "Kampala Hardware", issue: "03 Nov 2026", due: "03 Dec 2026", status: "partial", amount: formatMoneyFull(1_240_000) },
  { ref: "INV-0039", client: "Soroti Fresh Foods", issue: "27 Oct 2026", due: "26 Nov 2026", status: "overdue", amount: formatMoneyFull(1_640_000) },
  { ref: "INV-0038", client: "Gulu Solar", issue: "21 Oct 2026", due: "20 Nov 2026", status: "paid", amount: formatMoneyFull(3_160_000) },
];

export const invoiceDetail = {
  ref: "INV-0042",
  status: "sent" as const,
  client: "Juba Logistics",
  clientContact: "Sandra Akech",
  issue: "08 Nov 2026",
  due: "08 Dec 2026",
  items: [
    { description: "Vehicle servicing — fleet of 6", qty: 1, unit: formatMoneyFull(1_800_000), total: formatMoneyFull(1_800_000) },
    { description: "Brake pads & filters", qty: 6, unit: formatMoneyFull(95_000), total: formatMoneyFull(570_000) },
    { description: "Field support call-out", qty: 1, unit: formatMoneyFull(380_000), total: formatMoneyFull(380_000) },
  ],
  subtotal: formatMoneyFull(2_750_000),
  discount: formatMoneyFull(0),
  tax: formatMoneyFull(275_000),
  total: formatMoneyFull(3_025_000),
};

/* ---- Quotations ---- */
export const quotations = [
  { ref: "QUO-0121", client: "Juba Logistics", issue: "10 Nov 2026", valid: "09 Dec 2026", status: "accepted", amount: formatMoneyFull(2_750_000) },
  { ref: "QUO-0120", client: "Kisoro Coffee", issue: "07 Nov 2026", valid: "06 Dec 2026", status: "awaiting", amount: formatMoneyFull(1_120_000) },
  { ref: "QUO-0118", client: "Soroti Fresh Foods", issue: "04 Nov 2026", valid: "03 Dec 2026", status: "converted", amount: formatMoneyFull(640_000) },
  { ref: "QUO-0117", client: "Gulu Solar", issue: "02 Nov 2026", valid: "01 Dec 2026", status: "awaiting", amount: formatMoneyFull(4_500_000) },
] as const;

/* ---- Ledger / accounts ---- */
export const ledgerEntries = [
  { date: "11 Nov 2026", ref: "INV-0043", description: "Invoice — Tekowa Engineering", status: "posted", amount: formatMoneyFull(4_200_000) },
  { date: "11 Nov 2026", ref: "PMT-0088", description: "Payment received — Tekowa Engineering", status: "posted", amount: formatMoneyFull(-4_200_000) },
  { date: "08 Nov 2026", ref: "INV-0042", description: "Invoice — Juba Logistics", status: "posted", amount: formatMoneyFull(2_750_000) },
  { date: "07 Nov 2026", ref: "EXP-0132", description: "Office rent — November", status: "posted", amount: formatMoneyFull(-1_000_000) },
  { date: "05 Nov 2026", ref: "JRNL-0004", description: "Opening balances — reclassification", status: "voided", amount: formatMoneyFull(0) },
] as const;

export const chartOfAccounts = [
  { code: "1000", name: "Cash & bank", category: "Asset", balance: formatMoneyFull(6_840_000), indent: false },
  { code: "1010", name: "Business bank account", category: "Asset", balance: formatMoneyFull(5_120_000), indent: true },
  { code: "1020", name: "Cash on hand", category: "Asset", balance: formatMoneyFull(1_720_000), indent: true },
  { code: "1200", name: "Accounts receivable", category: "Asset", balance: formatMoneyFull(5_250_000), indent: false },
  { code: "2000", name: "Accounts payable", category: "Liability", balance: formatMoneyFull(1_980_000), indent: false },
  { code: "4000", name: "Revenue", category: "Income", balance: formatMoneyFull(18_400_000), indent: false },
  { code: "5000", name: "Cost of goods sold", category: "Expense", balance: formatMoneyFull(9_120_000), indent: false },
] as const;

/* ---- Inventory ---- */
export const inventoryItems = [
  { name: "Fuel (petrol)", sku: "FUE-001", category: "Fuel", qty: 212, cost: formatMoneyFull(4_500), selling: formatMoneyFull(5_200), low: false },
  { name: "Cement (50kg)", sku: "MAT-002", category: "Materials", qty: 48, cost: formatMoneyFull(42_000), selling: formatMoneyFull(48_000), low: true },
  { name: "Brake pads", sku: "SPR-011", category: "Spares", qty: 36, cost: formatMoneyFull(48_000), selling: formatMoneyFull(58_000), low: false },
  { name: "Printer paper (ream)", sku: "OFF-003", category: "Office", qty: 4, cost: formatMoneyFull(28_000), selling: formatMoneyFull(32_000), low: true },
  { name: "Lubricant (5L)", sku: "SPR-014", category: "Spares", qty: 26, cost: formatMoneyFull(65_000), selling: formatMoneyFull(78_000), low: false },
] as const;

export const inventorySummary = [
  { label: "Items", value: "38", tone: "navy" },
  { label: "Units on hand", value: "312", tone: "navy" },
  { label: "Low stock", value: "3 items", tone: "warning" },
] as const;

export const custody = [
  { asset: "Laptop — HP ProBook", assignee: "Ruth Nakato", due: "Returns 20 Nov", status: "assigned" },
  { asset: "Camera — Canon EOS", assignee: "Naomi Alimo", due: "Returns 15 Nov", status: "due" },
  { asset: "Survey tools kit", assignee: "Ops room", due: "Available", status: "available" },
] as const;

/* ---- HR ---- */
export const employees = [
  { name: "Naomi Alimo", initials: "NA", role: "Field Supervisor", department: "Operations", hired: "12 Mar 2024", status: "active" },
  { name: "David Okello", initials: "DO", role: "Accountant", department: "Finance", hired: "02 Jun 2023", status: "active" },
  { name: "Grace Nabirye", initials: "GN", role: "Sales Lead", department: "Sales", hired: "19 Sep 2024", status: "on-leave" },
  { name: "Peter Mwangi", initials: "PM", role: "Workshop Tech", department: "Operations", hired: "25 Jan 2025", status: "active" },
  { name: "Amina Yusuf", initials: "AY", role: "HR Officer", department: "People", hired: "08 Apr 2025", status: "active" },
] as const;

export const employeeSummary = [
  { label: "Headcount", value: "17", tone: "navy" },
  { label: "Active", value: "15", tone: "success" },
  { label: "On leave", value: "2", tone: "warning" },
] as const;

export const shifts = [
  { name: "David Okello", initials: "DO", role: "Finance", time: "08:00 — 17:00", status: "here" },
  { name: "Grace Nabirye", initials: "GN", role: "Sales", time: "09:30 — 18:00", status: "on-leave" },
  { name: "Peter Mwangi", initials: "PM", role: "Operations", time: "07:00 — 16:00", status: "here" },
] as const;
