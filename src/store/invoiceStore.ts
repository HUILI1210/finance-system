import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Invoice {
  id: string
  type: 'output' | 'input'
  invoiceNo: string
  invoiceCode: string
  amount: number
  taxAmount: number
  totalAmount: number
  counterparty: string
  invoiceDate: string
  status: 'pending' | 'verified' | 'cancelled'
  description: string
}

export interface TaxRecord {
  id: string
  taxType: 'vat' | 'corporate' | 'personal' | 'stamp'
  taxName: string
  period: string
  taxableAmount: number
  taxRate: number
  taxAmount: number
  status: 'pending' | 'declared' | 'paid'
  dueDate: string
  paidDate?: string
}

interface InvoiceState {
  invoices: Invoice[]
  taxRecords: TaxRecord[]
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  addTaxRecord: (record: TaxRecord) => void
  updateTaxRecord: (id: string, record: Partial<TaxRecord>) => void
}

const initialInvoices: Invoice[] = [
  { id: '1', type: 'output', invoiceNo: '12345678', invoiceCode: '044001900111', amount: 100000, taxAmount: 13000, totalAmount: 113000, counterparty: '客户A公司', invoiceDate: '2024-01-15', status: 'verified', description: '产品销售' },
  { id: '2', type: 'output', invoiceNo: '12345679', invoiceCode: '044001900111', amount: 50000, taxAmount: 6500, totalAmount: 56500, counterparty: '客户B公司', invoiceDate: '2024-01-20', status: 'verified', description: '服务费' },
  { id: '3', type: 'input', invoiceNo: '87654321', invoiceCode: '033001800222', amount: 30000, taxAmount: 3900, totalAmount: 33900, counterparty: '供应商A', invoiceDate: '2024-01-18', status: 'verified', description: '原材料采购' },
  { id: '4', type: 'input', invoiceNo: '87654322', invoiceCode: '033001800222', amount: 20000, taxAmount: 2600, totalAmount: 22600, counterparty: '供应商B', invoiceDate: '2024-01-22', status: 'pending', description: '设备采购' },
]

const initialTaxRecords: TaxRecord[] = [
  { id: '1', taxType: 'vat', taxName: '增值税', period: '2024-01', taxableAmount: 150000, taxRate: 13, taxAmount: 19500, status: 'declared', dueDate: '2024-02-15' },
  { id: '2', taxType: 'corporate', taxName: '企业所得税', period: '2024-Q1', taxableAmount: 200000, taxRate: 25, taxAmount: 50000, status: 'pending', dueDate: '2024-04-15' },
  { id: '3', taxType: 'personal', taxName: '个人所得税', period: '2024-01', taxableAmount: 80000, taxRate: 10, taxAmount: 2400, status: 'paid', dueDate: '2024-02-15', paidDate: '2024-02-10' },
  { id: '4', taxType: 'stamp', taxName: '印花税', period: '2024-01', taxableAmount: 500000, taxRate: 0.03, taxAmount: 150, status: 'paid', dueDate: '2024-02-15', paidDate: '2024-02-10' },
]

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set) => ({
      invoices: initialInvoices,
      taxRecords: initialTaxRecords,
      addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (id, updatedInvoice) => set((state) => ({
        invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...updatedInvoice } : i)),
      })),
      deleteInvoice: (id) => set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) })),
      addTaxRecord: (record) => set((state) => ({ taxRecords: [...state.taxRecords, record] })),
      updateTaxRecord: (id, updatedRecord) => set((state) => ({
        taxRecords: state.taxRecords.map((t) => (t.id === id ? { ...t, ...updatedRecord } : t)),
      })),
    }),
    { name: 'invoice-storage' }
  )
)
