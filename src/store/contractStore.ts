import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Contract {
  id: string
  contractNo: string
  title: string
  type: 'sales' | 'purchase' | 'service' | 'labor'
  partyA: string
  partyB: string
  amount: number
  signDate: string
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'expired' | 'terminated'
  description: string
  attachments?: string[]
}

interface ContractState {
  contracts: Contract[]
  addContract: (contract: Contract) => void
  updateContract: (id: string, contract: Partial<Contract>) => void
  deleteContract: (id: string) => void
}

const initialContracts: Contract[] = [
  { id: '1', contractNo: 'HT202401001', title: '软件开发服务合同', type: 'sales', partyA: '本公司', partyB: '客户A公司', amount: 500000, signDate: '2024-01-10', startDate: '2024-01-15', endDate: '2024-12-31', status: 'active', description: '为客户A提供软件开发服务' },
  { id: '2', contractNo: 'HT202401002', title: '办公设备采购合同', type: 'purchase', partyA: '本公司', partyB: '供应商A', amount: 80000, signDate: '2024-01-05', startDate: '2024-01-10', endDate: '2024-02-28', status: 'active', description: '采购办公电脑及设备' },
  { id: '3', contractNo: 'HT202401003', title: '年度咨询服务合同', type: 'service', partyA: '本公司', partyB: '客户B公司', amount: 200000, signDate: '2023-12-20', startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', description: '年度管理咨询服务' },
  { id: '4', contractNo: 'HT202312001', title: '员工劳动合同-张三', type: 'labor', partyA: '本公司', partyB: '张三', amount: 240000, signDate: '2022-03-15', startDate: '2022-03-15', endDate: '2025-03-14', status: 'active', description: '技术部高级工程师' },
  { id: '5', contractNo: 'HT202312002', title: '临时用工协议', type: 'labor', partyA: '本公司', partyB: '临时员工', amount: 15000, signDate: '2023-11-01', startDate: '2023-11-01', endDate: '2024-01-31', status: 'expired', description: '项目临时支援' },
]

export const useContractStore = create<ContractState>()(
  persist(
    (set) => ({
      contracts: initialContracts,
      addContract: (contract) => set((state) => ({ contracts: [...state.contracts, contract] })),
      updateContract: (id, updatedContract) => set((state) => ({
        contracts: state.contracts.map((c) => (c.id === id ? { ...c, ...updatedContract } : c)),
      })),
      deleteContract: (id) => set((state) => ({ contracts: state.contracts.filter((c) => c.id !== id) })),
    }),
    { name: 'contract-storage' }
  )
)
