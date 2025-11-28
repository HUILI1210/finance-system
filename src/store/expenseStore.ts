import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ExpenseReport {
  id: string
  reportNo: string
  applicant: string
  department: string
  category: string
  amount: number
  items: ExpenseItem[]
  applyDate: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid'
  approver?: string
  approveDate?: string
  paidDate?: string
  description: string
}

export interface ExpenseItem {
  id: string
  category: string
  amount: number
  date: string
  description: string
  receipt?: string
}

interface ExpenseState {
  expenseReports: ExpenseReport[]
  addExpenseReport: (report: ExpenseReport) => void
  updateExpenseReport: (id: string, report: Partial<ExpenseReport>) => void
  deleteExpenseReport: (id: string) => void
}

const initialExpenseReports: ExpenseReport[] = [
  {
    id: '1',
    reportNo: 'BX202401001',
    applicant: '张三',
    department: '技术部',
    category: '差旅费',
    amount: 3500,
    items: [
      { id: '1', category: '交通费', amount: 1200, date: '2024-01-15', description: '北京-上海机票' },
      { id: '2', category: '住宿费', amount: 1800, date: '2024-01-15', description: '酒店住宿2晚' },
      { id: '3', category: '餐饮费', amount: 500, date: '2024-01-16', description: '出差期间餐费' },
    ],
    applyDate: '2024-01-18',
    status: 'approved',
    approver: '李经理',
    approveDate: '2024-01-19',
    description: '上海客户拜访'
  },
  {
    id: '2',
    reportNo: 'BX202401002',
    applicant: '李四',
    department: '市场部',
    category: '招待费',
    amount: 2800,
    items: [
      { id: '1', category: '餐饮费', amount: 1800, date: '2024-01-20', description: '客户晚宴' },
      { id: '2', category: '礼品费', amount: 1000, date: '2024-01-20', description: '客户礼品' },
    ],
    applyDate: '2024-01-21',
    status: 'pending',
    description: '客户A公司商务接待'
  },
  {
    id: '3',
    reportNo: 'BX202401003',
    applicant: '王五',
    department: '财务部',
    category: '办公费',
    amount: 680,
    items: [
      { id: '1', category: '办公用品', amount: 380, date: '2024-01-22', description: '打印纸、文具' },
      { id: '2', category: '快递费', amount: 300, date: '2024-01-23', description: '文件快递' },
    ],
    applyDate: '2024-01-24',
    status: 'paid',
    approver: '李经理',
    approveDate: '2024-01-24',
    paidDate: '2024-01-25',
    description: '日常办公费用'
  },
]

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenseReports: initialExpenseReports,
      addExpenseReport: (report) => set((state) => ({ expenseReports: [...state.expenseReports, report] })),
      updateExpenseReport: (id, updatedReport) => set((state) => ({
        expenseReports: state.expenseReports.map((r) => (r.id === id ? { ...r, ...updatedReport } : r)),
      })),
      deleteExpenseReport: (id) => set((state) => ({ expenseReports: state.expenseReports.filter((r) => r.id !== id) })),
    }),
    { name: 'expense-storage' }
  )
)
