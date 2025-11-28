import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Customer {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  creditLimit: number
  balance: number
}

export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  paymentTerms: number
  balance: number
}

export interface Receivable {
  id: string
  customerId: string
  customerName: string
  invoiceNo: string
  amount: number
  paidAmount: number
  dueDate: string
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  description: string
  createdAt: string
}

export interface Payable {
  id: string
  supplierId: string
  supplierName: string
  invoiceNo: string
  amount: number
  paidAmount: number
  dueDate: string
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  description: string
  createdAt: string
}

interface AccountsState {
  customers: Customer[]
  suppliers: Supplier[]
  receivables: Receivable[]
  payables: Payable[]
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  addSupplier: (supplier: Supplier) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  addReceivable: (receivable: Receivable) => void
  updateReceivable: (id: string, receivable: Partial<Receivable>) => void
  addPayable: (payable: Payable) => void
  updatePayable: (id: string, payable: Partial<Payable>) => void
}

const initialCustomers: Customer[] = [
  { id: '1', name: '客户A公司', contact: '张经理', phone: '13900139001', email: 'a@customer.com', address: '北京市朝阳区xxx路', creditLimit: 500000, balance: 120000 },
  { id: '2', name: '客户B公司', contact: '李总', phone: '13900139002', email: 'b@customer.com', address: '上海市浦东新区xxx路', creditLimit: 300000, balance: 85000 },
  { id: '3', name: '客户C公司', contact: '王主管', phone: '13900139003', email: 'c@customer.com', address: '广州市天河区xxx路', creditLimit: 200000, balance: 0 },
]

const initialSuppliers: Supplier[] = [
  { id: '1', name: '供应商A', contact: '刘经理', phone: '13800138001', email: 'a@supplier.com', address: '深圳市南山区xxx路', paymentTerms: 30, balance: 45000 },
  { id: '2', name: '供应商B', contact: '陈总', phone: '13800138002', email: 'b@supplier.com', address: '杭州市西湖区xxx路', paymentTerms: 45, balance: 28000 },
  { id: '3', name: '供应商C', contact: '赵主管', phone: '13800138003', email: 'c@supplier.com', address: '成都市武侯区xxx路', paymentTerms: 60, balance: 0 },
]

const initialReceivables: Receivable[] = [
  { id: '1', customerId: '1', customerName: '客户A公司', invoiceNo: 'INV202401001', amount: 80000, paidAmount: 0, dueDate: '2024-02-15', status: 'pending', description: '产品销售', createdAt: '2024-01-15' },
  { id: '2', customerId: '1', customerName: '客户A公司', invoiceNo: 'INV202401002', amount: 40000, paidAmount: 20000, dueDate: '2024-02-20', status: 'partial', description: '服务费', createdAt: '2024-01-20' },
  { id: '3', customerId: '2', customerName: '客户B公司', invoiceNo: 'INV202401003', amount: 85000, paidAmount: 0, dueDate: '2024-01-30', status: 'overdue', description: '项目款', createdAt: '2024-01-05' },
]

const initialPayables: Payable[] = [
  { id: '1', supplierId: '1', supplierName: '供应商A', invoiceNo: 'PO202401001', amount: 45000, paidAmount: 0, dueDate: '2024-02-28', status: 'pending', description: '原材料采购', createdAt: '2024-01-28' },
  { id: '2', supplierId: '2', supplierName: '供应商B', invoiceNo: 'PO202401002', amount: 28000, paidAmount: 15000, dueDate: '2024-02-15', status: 'partial', description: '设备采购', createdAt: '2024-01-15' },
]

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set) => ({
      customers: initialCustomers,
      suppliers: initialSuppliers,
      receivables: initialReceivables,
      payables: initialPayables,
      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (id, updatedCustomer) => set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? { ...c, ...updatedCustomer } : c)),
      })),
      addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, supplier] })),
      updateSupplier: (id, updatedSupplier) => set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updatedSupplier } : s)),
      })),
      addReceivable: (receivable) => set((state) => ({ receivables: [...state.receivables, receivable] })),
      updateReceivable: (id, updatedReceivable) => set((state) => ({
        receivables: state.receivables.map((r) => (r.id === id ? { ...r, ...updatedReceivable } : r)),
      })),
      addPayable: (payable) => set((state) => ({ payables: [...state.payables, payable] })),
      updatePayable: (id, updatedPayable) => set((state) => ({
        payables: state.payables.map((p) => (p.id === id ? { ...p, ...updatedPayable } : p)),
      })),
    }),
    { name: 'accounts-storage' }
  )
)
