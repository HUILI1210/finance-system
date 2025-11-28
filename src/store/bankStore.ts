import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BankAccount {
  id: string
  accountName: string
  accountNo: string
  bankName: string
  balance: number
  type: 'basic' | 'general' | 'special'
  status: 'active' | 'frozen'
}

export interface BankTransaction {
  id: string
  accountId: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  balance: number
  counterparty: string
  description: string
  date: string
  relatedId?: string
}

interface BankState {
  accounts: BankAccount[]
  transactions: BankTransaction[]
  addAccount: (account: BankAccount) => void
  updateAccount: (id: string, account: Partial<BankAccount>) => void
  addTransaction: (transaction: BankTransaction) => void
}

const initialAccounts: BankAccount[] = [
  { id: '1', accountName: '基本户', accountNo: '1234567890123456789', bankName: '工商银行', balance: 1250000, type: 'basic', status: 'active' },
  { id: '2', accountName: '一般户', accountNo: '9876543210987654321', bankName: '建设银行', balance: 580000, type: 'general', status: 'active' },
  { id: '3', accountName: '备用金账户', accountNo: '5555666677778888999', bankName: '农业银行', balance: 50000, type: 'special', status: 'active' },
]

const initialTransactions: BankTransaction[] = [
  { id: '1', accountId: '1', type: 'income', amount: 150000, balance: 1250000, counterparty: '客户A公司', description: '销售回款', date: '2024-01-15' },
  { id: '2', accountId: '1', type: 'expense', amount: 45000, balance: 1100000, counterparty: '员工工资', description: '1月工资发放', date: '2024-01-25' },
  { id: '3', accountId: '2', type: 'income', amount: 80000, balance: 580000, counterparty: '客户B公司', description: '服务费收入', date: '2024-01-18' },
  { id: '4', accountId: '1', type: 'expense', amount: 25000, balance: 1075000, counterparty: '供应商C', description: '采购付款', date: '2024-01-20' },
  { id: '5', accountId: '3', type: 'transfer', amount: 20000, balance: 50000, counterparty: '基本户', description: '备用金补充', date: '2024-01-22' },
]

export const useBankStore = create<BankState>()(
  persist(
    (set) => ({
      accounts: initialAccounts,
      transactions: initialTransactions,
      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccount: (id, updatedAccount) => set((state) => ({
        accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updatedAccount } : a)),
      })),
      addTransaction: (transaction) => set((state) => ({ transactions: [...state.transactions, transaction] })),
    }),
    { name: 'bank-storage' }
  )
)
