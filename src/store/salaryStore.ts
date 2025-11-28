import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

export interface Payroll {
  id: string
  employeeId: string
  employeeName: string
  department: string
  month: string
  baseSalary: number
  positionAllowance: number
  performanceBonus: number
  overtime: number
  deductions: number
  socialInsurance: number
  housingFund: number
  tax: number
  netSalary: number
  status: 'pending' | 'paid'
  paidDate?: string
}

interface SalaryState {
  employees: Employee[]
  salaryStructures: SalaryStructure[]
  payrolls: Payroll[]
  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  addSalaryStructure: (structure: SalaryStructure) => void
  updateSalaryStructure: (id: string, structure: Partial<SalaryStructure>) => void
  addPayroll: (payroll: Payroll) => void
  updatePayroll: (id: string, payroll: Partial<Payroll>) => void
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

const initialPayrolls: Payroll[] = [
  { id: '1', employeeId: '1', employeeName: '张三', department: '技术部', month: '2024-01', baseSalary: 15000, positionAllowance: 3000, performanceBonus: 2000, overtime: 500, deductions: 0, socialInsurance: 1800, housingFund: 1500, tax: 1200, netSalary: 16000, status: 'paid', paidDate: '2024-02-05' },
  { id: '2', employeeId: '2', employeeName: '李四', department: '市场部', month: '2024-01', baseSalary: 12000, positionAllowance: 2500, performanceBonus: 3000, overtime: 0, deductions: 200, socialInsurance: 1500, housingFund: 1200, tax: 800, netSalary: 13800, status: 'paid', paidDate: '2024-02-05' },
  { id: '3', employeeId: '3', employeeName: '王五', department: '财务部', month: '2024-01', baseSalary: 8000, positionAllowance: 1000, performanceBonus: 1000, overtime: 200, deductions: 0, socialInsurance: 900, housingFund: 800, tax: 300, netSalary: 8200, status: 'paid', paidDate: '2024-02-05' },
  { id: '4', employeeId: '4', employeeName: '赵六', department: '技术部', month: '2024-01', baseSalary: 6000, positionAllowance: 500, performanceBonus: 500, overtime: 300, deductions: 100, socialInsurance: 600, housingFund: 500, tax: 100, netSalary: 6000, status: 'paid', paidDate: '2024-02-05' },
]

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set) => ({
      employees: initialEmployees,
      salaryStructures: initialSalaryStructures,
      payrolls: initialPayrolls,
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
    }),
    { name: 'salary-storage' }
  )
)
