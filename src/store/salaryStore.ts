import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 工资计算公式类型
export type SalaryFormulaType = 'fixed' | 'hourly' | 'piece' | 'commission' | 'mixed'

// 工资公式定义
export interface SalaryFormula {
  id: string
  name: string
  type: SalaryFormulaType
  description: string
  // 固定工资配置
  baseSalary: number
  positionAllowance: number
  // 计时配置
  hourlyRate: number
  overtimeRate: number  // 加班倍率
  // 计件配置
  pieceRate: number
  // 提成配置
  commissionBase: number  // 提成底薪
  commissionRates: { min: number; max: number; rate: number }[]
  // 绩效配置
  performanceRatios: { level: string; ratio: number }[]
  // 扣款配置
  socialInsuranceRate: number
  housingFundRate: number
  // 是否激活
  isActive: boolean
}

export interface Employee {
  id: string
  name: string
  employeeNo: string
  department: string
  position: string
  entryDate: string
  phone: string
  email: string
  bankAccount: string
  bankName: string
  status: 'active' | 'inactive'
  salaryFormulaId?: string  // 关联的工资公式
}

export interface SalaryStructure {
  id: string
  employeeId: string
  baseSalary: number
  positionAllowance: number
  performanceBonus: number
  socialInsurance: number
  housingFund: number
  effectiveDate: string
  // 个性化参数
  hourlyRate?: number
  pieceRate?: number
  commissionRate?: number
}

export interface Payroll {
  id: string
  employeeId: string
  employeeName: string
  department: string
  month: string
  formulaType: SalaryFormulaType
  baseSalary: number
  positionAllowance: number
  performanceBonus: number
  overtime: number
  overtimeHours?: number
  hoursWorked?: number
  piecesCompleted?: number
  salesAmount?: number
  commission?: number
  deductions: number
  socialInsurance: number
  housingFund: number
  tax: number
  netSalary: number
  grossSalary: number
  status: 'pending' | 'paid'
  paidDate?: string
  calculationDetails?: string
}

interface SalaryState {
  employees: Employee[]
  salaryStructures: SalaryStructure[]
  payrolls: Payroll[]
  salaryFormulas: SalaryFormula[]
  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  addSalaryStructure: (structure: SalaryStructure) => void
  updateSalaryStructure: (id: string, structure: Partial<SalaryStructure>) => void
  addPayroll: (payroll: Payroll) => void
  updatePayroll: (id: string, payroll: Partial<Payroll>) => void
  addSalaryFormula: (formula: SalaryFormula) => void
  updateSalaryFormula: (id: string, formula: Partial<SalaryFormula>) => void
  deleteSalaryFormula: (id: string) => void
}

const initialEmployees: Employee[] = [
  { id: '1', name: '张三', employeeNo: 'EMP001', department: '技术部', position: '高级工程师', entryDate: '2022-03-15', phone: '13800138001', email: 'zhangsan@company.com', bankAccount: '6222021234567890123', bankName: '工商银行', status: 'active' },
  { id: '2', name: '李四', employeeNo: 'EMP002', department: '市场部', position: '市场经理', entryDate: '2021-06-01', phone: '13800138002', email: 'lisi@company.com', bankAccount: '6222021234567890124', bankName: '建设银行', status: 'active' },
  { id: '3', name: '王五', employeeNo: 'EMP003', department: '财务部', position: '财务专员', entryDate: '2023-01-10', phone: '13800138003', email: 'wangwu@company.com', bankAccount: '6222021234567890125', bankName: '农业银行', status: 'active' },
  { id: '4', name: '赵六', employeeNo: 'EMP004', department: '技术部', position: '初级工程师', entryDate: '2023-08-20', phone: '13800138004', email: 'zhaoliu@company.com', bankAccount: '6222021234567890126', bankName: '中国银行', status: 'active' },
]

const initialSalaryStructures: SalaryStructure[] = [
  { id: '1', employeeId: '1', baseSalary: 15000, positionAllowance: 3000, performanceBonus: 2000, socialInsurance: 1800, housingFund: 1500, effectiveDate: '2024-01-01' },
  { id: '2', employeeId: '2', baseSalary: 12000, positionAllowance: 2500, performanceBonus: 3000, socialInsurance: 1500, housingFund: 1200, effectiveDate: '2024-01-01' },
  { id: '3', employeeId: '3', baseSalary: 8000, positionAllowance: 1000, performanceBonus: 1000, socialInsurance: 900, housingFund: 800, effectiveDate: '2024-01-01' },
  { id: '4', employeeId: '4', baseSalary: 6000, positionAllowance: 500, performanceBonus: 500, socialInsurance: 600, housingFund: 500, effectiveDate: '2024-01-01' },
]

// 预设工资公式
const initialSalaryFormulas: SalaryFormula[] = [
  {
    id: '1', name: '标准月薪制', type: 'fixed', description: '适用于行政、财务等固定薪资岗位',
    baseSalary: 8000, positionAllowance: 1000, hourlyRate: 0, overtimeRate: 1.5,
    pieceRate: 0, commissionBase: 0, commissionRates: [],
    performanceRatios: [{ level: 'A', ratio: 1.2 }, { level: 'B', ratio: 1.0 }, { level: 'C', ratio: 0.8 }],
    socialInsuranceRate: 10, housingFundRate: 8, isActive: true
  },
  {
    id: '2', name: '技术岗绩效制', type: 'mixed', description: '底薪+绩效，适用于技术部门',
    baseSalary: 12000, positionAllowance: 2000, hourlyRate: 100, overtimeRate: 1.5,
    pieceRate: 0, commissionBase: 0, commissionRates: [],
    performanceRatios: [{ level: 'A', ratio: 1.5 }, { level: 'B', ratio: 1.2 }, { level: 'C', ratio: 1.0 }, { level: 'D', ratio: 0.8 }],
    socialInsuranceRate: 10, housingFundRate: 12, isActive: true
  },
  {
    id: '3', name: '销售提成制', type: 'commission', description: '底薪+阶梯提成，适用于销售部门',
    baseSalary: 5000, positionAllowance: 500, hourlyRate: 0, overtimeRate: 1,
    pieceRate: 0, commissionBase: 5000,
    commissionRates: [
      { min: 0, max: 50000, rate: 3 },
      { min: 50000, max: 100000, rate: 5 },
      { min: 100000, max: 999999999, rate: 8 }
    ],
    performanceRatios: [],
    socialInsuranceRate: 10, housingFundRate: 8, isActive: true
  },
  {
    id: '4', name: '生产计件制', type: 'piece', description: '按件计酬，适用于生产线员工',
    baseSalary: 2000, positionAllowance: 0, hourlyRate: 0, overtimeRate: 1,
    pieceRate: 15, commissionBase: 0, commissionRates: [],
    performanceRatios: [],
    socialInsuranceRate: 10, housingFundRate: 5, isActive: true
  },
  {
    id: '5', name: '临时计时制', type: 'hourly', description: '按小时计酬，适用于临时工、兼职',
    baseSalary: 0, positionAllowance: 0, hourlyRate: 50, overtimeRate: 1.5,
    pieceRate: 0, commissionBase: 0, commissionRates: [],
    performanceRatios: [],
    socialInsuranceRate: 0, housingFundRate: 0, isActive: true
  },
]

const initialPayrolls: Payroll[] = [
  { id: '1', employeeId: '1', employeeName: '张三', department: '技术部', month: '2024-01', formulaType: 'mixed', baseSalary: 15000, positionAllowance: 3000, performanceBonus: 2000, overtime: 500, deductions: 0, socialInsurance: 1800, housingFund: 1500, tax: 1200, grossSalary: 20500, netSalary: 16000, status: 'paid', paidDate: '2024-02-05' },
  { id: '2', employeeId: '2', employeeName: '李四', department: '市场部', month: '2024-01', formulaType: 'commission', baseSalary: 5000, positionAllowance: 500, performanceBonus: 0, overtime: 0, salesAmount: 80000, commission: 4000, deductions: 200, socialInsurance: 950, housingFund: 760, tax: 300, grossSalary: 9500, netSalary: 7290, status: 'paid', paidDate: '2024-02-05' },
  { id: '3', employeeId: '3', employeeName: '王五', department: '财务部', month: '2024-01', formulaType: 'fixed', baseSalary: 8000, positionAllowance: 1000, performanceBonus: 1000, overtime: 200, deductions: 0, socialInsurance: 900, housingFund: 800, tax: 300, grossSalary: 10200, netSalary: 8200, status: 'paid', paidDate: '2024-02-05' },
  { id: '4', employeeId: '4', employeeName: '赵六', department: '技术部', month: '2024-01', formulaType: 'mixed', baseSalary: 6000, positionAllowance: 500, performanceBonus: 500, overtime: 300, deductions: 100, socialInsurance: 600, housingFund: 500, tax: 100, grossSalary: 7300, netSalary: 6000, status: 'paid', paidDate: '2024-02-05' },
]

// 工资计算函数
export function calculateSalary(
  formula: SalaryFormula,
  params: {
    hoursWorked?: number
    overtimeHours?: number
    piecesCompleted?: number
    salesAmount?: number
    performanceLevel?: string
    baseSalaryOverride?: number
  }
): { grossSalary: number; details: Record<string, number>; description: string } {
  const details: Record<string, number> = {}
  let description = ''

  const baseSalary = params.baseSalaryOverride || formula.baseSalary
  details['基本工资'] = baseSalary

  switch (formula.type) {
    case 'fixed':
      details['岗位津贴'] = formula.positionAllowance
      if (params.performanceLevel) {
        const ratio = formula.performanceRatios.find(r => r.level === params.performanceLevel)?.ratio || 1
        details['绩效奖金'] = Math.round(baseSalary * 0.2 * ratio)
      }
      description = `固定月薪: ¥${baseSalary} + 津贴: ¥${formula.positionAllowance}`
      break

    case 'hourly':
      const hours = params.hoursWorked || 0
      const overtimeHours = params.overtimeHours || 0
      details['正常工时'] = hours * formula.hourlyRate
      details['加班工时'] = overtimeHours * formula.hourlyRate * formula.overtimeRate
      description = `工时: ${hours}h × ¥${formula.hourlyRate} + 加班: ${overtimeHours}h × ¥${formula.hourlyRate} × ${formula.overtimeRate}`
      break

    case 'piece':
      const pieces = params.piecesCompleted || 0
      details['计件工资'] = pieces * formula.pieceRate
      description = `计件: ${pieces}件 × ¥${formula.pieceRate}/件`
      break

    case 'commission':
      details['底薪'] = formula.commissionBase
      const sales = params.salesAmount || 0
      let commission = 0
      for (const rate of formula.commissionRates) {
        if (sales >= rate.min && sales < rate.max) {
          commission = sales * rate.rate / 100
          break
        }
      }
      details['销售提成'] = Math.round(commission)
      description = `底薪: ¥${formula.commissionBase} + 销售额: ¥${sales} × ${commission > 0 ? (commission / sales * 100).toFixed(1) : 0}%`
      break

    case 'mixed':
      details['岗位津贴'] = formula.positionAllowance
      if (params.performanceLevel) {
        const ratio = formula.performanceRatios.find(r => r.level === params.performanceLevel)?.ratio || 1
        details['绩效奖金'] = Math.round(baseSalary * 0.3 * ratio)
      }
      if (params.overtimeHours) {
        details['加班费'] = params.overtimeHours * formula.hourlyRate * formula.overtimeRate
      }
      description = `底薪: ¥${baseSalary} + 绩效 + 加班`
      break
  }

  const grossSalary = Object.values(details).reduce((sum, v) => sum + v, 0)
  return { grossSalary, details, description }
}

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set) => ({
      employees: initialEmployees,
      salaryStructures: initialSalaryStructures,
      payrolls: initialPayrolls,
      salaryFormulas: initialSalaryFormulas,
      addEmployee: (employee) => set((state) => ({ employees: [...state.employees, employee] })),
      updateEmployee: (id, updatedEmployee) => set((state) => ({
        employees: state.employees.map((e) => (e.id === id ? { ...e, ...updatedEmployee } : e)),
      })),
      deleteEmployee: (id) => set((state) => ({ employees: state.employees.filter((e) => e.id !== id) })),
      addSalaryStructure: (structure) => set((state) => ({ salaryStructures: [...state.salaryStructures, structure] })),
      updateSalaryStructure: (id, updatedStructure) => set((state) => ({
        salaryStructures: state.salaryStructures.map((s) => (s.id === id ? { ...s, ...updatedStructure } : s)),
      })),
      addPayroll: (payroll) => set((state) => ({ payrolls: [...state.payrolls, payroll] })),
      updatePayroll: (id, updatedPayroll) => set((state) => ({
        payrolls: state.payrolls.map((p) => (p.id === id ? { ...p, ...updatedPayroll } : p)),
      })),
      addSalaryFormula: (formula) => set((state) => ({ salaryFormulas: [...state.salaryFormulas, formula] })),
      updateSalaryFormula: (id, updatedFormula) => set((state) => ({
        salaryFormulas: state.salaryFormulas.map((f) => (f.id === id ? { ...f, ...updatedFormula } : f)),
      })),
      deleteSalaryFormula: (id) => set((state) => ({ salaryFormulas: state.salaryFormulas.filter((f) => f.id !== id) })),
    }),
    { name: 'salary-storage' }
  )
)
