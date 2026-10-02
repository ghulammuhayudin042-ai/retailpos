import { useState, useCallback, lazy, Suspense } from 'react'
import { PanelLeftClose, PanelLeftOpen, Bell, Search, ChevronDown, Store, CheckCircle2, AlertCircle } from 'lucide-react'
import { NAV } from './nav.js'
import { EmptyState } from './components/ui.jsx'
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const POS = lazy(() => import('./pages/POS.jsx'))
const Reports = lazy(() => import('./pages/Reports.jsx'))
const Roles = lazy(() => import('./pages/Admin.jsx').then((m) => ({ default: m.Roles })))
const Settings = lazy(() => import('./pages/Admin.jsx').then((m) => ({ default: m.Settings })))
const Notifications = lazy(() => import('./pages/Extras.jsx').then((m) => ({ default: m.Notifications })))
const CashClose = lazy(() => import('./pages/Extras.jsx').then((m) => ({ default: m.CashClose })))
const DataPage = lazy(() => import('./pages/DataPage.jsx'))
const COLS = {
  sales: ['Invoice Number','Date','Customer','Cashier','Items','Subtotal','Discount','Tax','Total','Paid','Balance','Payment Status'],
  products: ['Product','SKU','Barcode','Category','Brand','Cost Price','Retail Price','Wholesale Price','Stock','Reorder Level','Status'],
  customers: ['Customer ID','Name','Phone','Total Sales','Total Paid','Outstanding','Credit Limit','Status'],
  suppliers: ['Supplier Name','Company','Phone','Opening Balance','Credit Limit','Current Payable','Status'],
  'customer-ledger': ['Date','Reference','Description','Debit','Credit','Balance'],
  'supplier-ledger': ['Date','Reference','Description','Debit','Credit','Balance'],
  'stock-movement': ['Date','Reference','Product','Type','Stock In','Stock Out','Balance','Cost','User'],
  'audit-logs': ['Date','User','Module','Action','Reference','Description'],
  'expiry-tracking': ['Product','Batch Number','Expiry Date','Quantity','Supplier','Status'],
  'low-stock': ['Product','Current Stock','Minimum Stock','Reorder Level','Supplier','Status'],
  quotations: ['Quotation Number','Customer','Date','Valid Until','Total','Status'],
  'held-sales': ['Hold Number','Customer','Items','Total','Date','Cashier'],
  expenses: ['Expense Number','Date','Category','Description','Amount','Payment Method','Status'],
}
const DEFAULT = ['Reference','Date','Name','Amount','Status']
export default function App() {
  const [page, setPage] = useState('pos'), [open, setOpen] = useState(true), [t, setT] = useState(null)
  const toast = useCallback((m, type = 'ok') => { setT({ m, type }); setTimeout(() => setT(null), 2500) }, [])
  const item = NAV.flatMap((g) => g.items).find((i) => i.id === page)
  const body = page === 'dashboard' ? <Dashboard /> : page === 'pos' ? <POS toast={toast} />
    : page === 'notifications' ? <Notifications />
    : ['cash-register', 'daily-closing'].includes(page) ? <CashClose title={item.title} />
    : page === 'roles-permissions' ? <Roles toast={toast} /> : page === 'settings' ? <Settings toast={toast} />
    : NAV.find((g) => g.group === 'Reports').items.some((i) => i.id === page) ? <Reports title={item.title} />
    : <DataPage key={page} title={item.title} cols={COLS[page] || DEFAULT} />
  return (
    <div className="flex h-screen">
      <aside className={`${open ? 'w-60' : 'w-16'} shrink-0 overflow-y-auto bg-brand-900 text-brand-100 transition-all`}>
        <div className="flex items-center gap-2 px-4 py-4 font-semibold text-white"><Store size={22} />{open && 'Blue Mart POS'}</div>
        {NAV.map((g) => (
          <div key={g.group} className="mb-2">
            {open ? <div className="px-4 py-1 text-xs text-brand-100/60">{g.group}</div> : <div className="mx-3 my-1 border-t border-white/10" />}
            {g.items.map((i) => { const I = g.icon; return (
              <button key={i.id} title={i.title} onClick={() => setPage(i.id)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-white/10 ${page === i.id ? 'bg-brand-600 text-white' : ''}`}>
                <I size={17} className="shrink-0" />{open && <span className="truncate">{i.title}</span>}</button>) })}
          </div>))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-brand-100 px-4 py-3">
          <button onClick={() => setOpen(!open)} aria-label="Toggle sidebar">{open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}</button>
          <h1 className="text-lg font-semibold text-brand-900">{item?.title}</h1>
          <div className="relative ml-auto hidden w-72 md:block"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input className="inp pl-9" placeholder="Global search" /></div>
          <button aria-label="Notifications"><Bell size={20} /></button>
          <span className="flex items-center gap-1 text-sm">Admin<ChevronDown size={14} /></span>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4">
          <Suspense fallback={<EmptyState text="Loading…" />}>{body}</Suspense>
        </main>
      </div>
      {t && <div className={`fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white shadow-lg ${t.type === 'error' ? 'bg-red-600' : 'bg-brand-600'}`}>
        {t.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}{t.m}</div>}
    </div>
  )
}
