import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QuotationItem {
  id: string
  name: string
  description: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Quotation {
  id: string
  quotationNo: string
  customerId: string
  customerName: string
  customerContact: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  title: string
  items: QuotationItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  validUntil: string
  terms: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  createdAt: string
  updatedAt: string
}

interface QuotationState {
  quotations: Quotation[]
  addQuotation: (quotation: Quotation) => void
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void
  deleteQuotation: (id: string) => void
}

const initialQuotations: Quotation[] = [
  {
    id: '1',
    quotationNo: 'QT202401001',
    customerId: '1',
    customerName: '客户A公司',
    customerContact: '张经理',
    customerPhone: '13900139001',
    customerEmail: 'a@customer.com',
    customerAddress: '北京市朝阳区xxx路',
    title: '软件开发服务报价',
    items: [
      { id: '1', name: '需求分析', description: '业务需求调研与分析', unit: '项', quantity: 1, unitPrice: 50000, amount: 50000 },
      { id: '2', name: '系统设计', description: '系统架构与UI设计', unit: '项', quantity: 1, unitPrice: 80000, amount: 80000 },
      { id: '3', name: '开发实施', description: '前后端开发与测试', unit: '人天', quantity: 60, unitPrice: 2000, amount: 120000 },
      { id: '4', name: '部署上线', description: '系统部署与培训', unit: '项', quantity: 1, unitPrice: 30000, amount: 30000 },
    ],
    subtotal: 280000,
    taxRate: 6,
    taxAmount: 16800,
    totalAmount: 296800,
    validUntil: '2024-02-28',
    terms: '1. 付款方式：合同签订后支付30%，验收后支付70%\n2. 项目周期：约3个月\n3. 质保期：1年免费维护',
    status: 'sent',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    quotationNo: 'QT202401002',
    customerId: '2',
    customerName: '客户B公司',
    customerContact: '李总',
    customerPhone: '13900139002',
    customerEmail: 'b@customer.com',
    customerAddress: '上海市浦东新区xxx路',
    title: '年度咨询服务报价',
    items: [
      { id: '1', name: '管理咨询', description: '企业管理优化咨询', unit: '月', quantity: 12, unitPrice: 15000, amount: 180000 },
      { id: '2', name: '培训服务', description: '员工技能培训', unit: '次', quantity: 6, unitPrice: 5000, amount: 30000 },
    ],
    subtotal: 210000,
    taxRate: 6,
    taxAmount: 12600,
    totalAmount: 222600,
    validUntil: '2024-02-15',
    terms: '1. 按季度付款\n2. 服务期限：2024年全年',
    status: 'accepted',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20'
  },
  {
    id: '3',
    quotationNo: 'QT202401003',
    customerId: '3',
    customerName: '客户C公司',
    customerContact: '王主管',
    customerPhone: '13900139003',
    customerEmail: 'c@customer.com',
    customerAddress: '广州市天河区xxx路',
    title: '设备采购报价',
    items: [
      { id: '1', name: '服务器', description: '高性能服务器', unit: '台', quantity: 2, unitPrice: 35000, amount: 70000 },
      { id: '2', name: '交换机', description: '企业级交换机', unit: '台', quantity: 3, unitPrice: 8000, amount: 24000 },
      { id: '3', name: '安装调试', description: '设备安装与配置', unit: '项', quantity: 1, unitPrice: 6000, amount: 6000 },
    ],
    subtotal: 100000,
    taxRate: 13,
    taxAmount: 13000,
    totalAmount: 113000,
    validUntil: '2024-01-31',
    terms: '1. 款到发货\n2. 质保期：3年',
    status: 'draft',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22'
  },
]

export const useQuotationStore = create<QuotationState>()(
  persist(
    (set) => ({
      quotations: initialQuotations,
      addQuotation: (quotation) => set((state) => ({ quotations: [...state.quotations, quotation] })),
      updateQuotation: (id, updatedQuotation) => set((state) => ({
        quotations: state.quotations.map((q) => (q.id === id ? { ...q, ...updatedQuotation } : q)),
      })),
      deleteQuotation: (id) => set((state) => ({ quotations: state.quotations.filter((q) => q.id !== id) })),
    }),
    { name: 'quotation-storage' }
  )
)
