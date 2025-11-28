import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FinanceRecord {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  month: string
}

interface FinanceState {
  records: FinanceRecord[]
  budgets: Budget[]
  addRecord: (record: FinanceRecord) => void
  updateRecord: (id: string, record: Partial<FinanceRecord>) => void
  deleteRecord: (id: string) => void
  addBudget: (budget: Budget) => void
  updateBudget: (id: string, budget: Partial<Budget>) => void
}

const initialRecords: FinanceRecord[] = [
  { id: '1', type: 'income', amount: 150000, category: '销售收入', description: '产品销售', date: '2024-01-15', createdAt: '2024-01-15' },
  { id: '2', type: 'income', amount: 80000, category: '服务收入', description: '咨询服务', date: '2024-01-18', createdAt: '2024-01-18' },
  { id: '3', type: 'expense', amount: 25000, category: '办公费用', description: '办公设备采购', date: '2024-01-10', createdAt: '2024-01-10' },
  { id: '4', type: 'expense', amount: 45000, category: '人力成本', description: '员工工资', date: '2024-01-25', createdAt: '2024-01-25' },
  { id: '5', type: 'income', amount: 200000, category: '销售收入', description: '大客户订单', date: '2024-02-05', createdAt: '2024-02-05' },
  { id: '6', type: 'expense', amount: 15000, category: '营销费用', description: '广告推广', date: '2024-02-08', createdAt: '2024-02-08' },
]

const initialBudgets: Budget[] = [
  { id: '1', category: '办公费用', amount: 50000, spent: 25000, month: '2024-01' },
  { id: '2', category: '人力成本', amount: 200000, spent: 145000, month: '2024-01' },
  { id: '3', category: '营销费用', amount: 80000, spent: 35000, month: '2024-01' },
]

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      records: initialRecords,
      budgets: initialBudgets,
      addRecord: (record) => set((state) => ({ records: [...state.records, record] })),
      updateRecord: (id, updatedRecord) =>
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? { ...r, ...updatedRecord } : r)),
        })),
      deleteRecord: (id) => set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
      addBudget: (budget) => set((state) => ({ budgets: [...state.budgets, budget] })),
      updateBudget: (id, updatedBudget) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updatedBudget } : b)),
        })),
    }),
    { name: 'finance-storage' }
  )
)
