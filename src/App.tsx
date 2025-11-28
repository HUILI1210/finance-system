import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import MainLayout from './components/Layout/MainLayout'
import Login from './pages/Login'
import ErrorBoundary from './components/ErrorBoundary'
import NetworkStatus from './components/NetworkStatus'
import { useAuthStore } from './store/authStore'

// 路由懒加载
const Dashboard = lazy(() => import('./pages/Dashboard'))
const IncomeList = lazy(() => import('./pages/Income/IncomeList'))
const IncomeForm = lazy(() => import('./pages/Income/IncomeForm'))
const ExpenseList = lazy(() => import('./pages/Expense/ExpenseList'))
const ExpenseForm = lazy(() => import('./pages/Expense/ExpenseForm'))
const BudgetList = lazy(() => import('./pages/Budget/BudgetList'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const EmployeeList = lazy(() => import('./pages/Salary/EmployeeList'))
const PayrollList = lazy(() => import('./pages/Salary/PayrollList'))
const SalaryFormulaList = lazy(() => import('./pages/Salary/SalaryFormulaList'))
const BankAccounts = lazy(() => import('./pages/Bank/BankAccounts'))
const ReceivableList = lazy(() => import('./pages/Receivable/ReceivableList'))
const PayableList = lazy(() => import('./pages/Payable/PayableList'))
const InvoiceList = lazy(() => import('./pages/Invoice/InvoiceList'))
const TaxList = lazy(() => import('./pages/Tax/TaxList'))
const ContractList = lazy(() => import('./pages/Contract/ContractList'))
const ExpenseReportList = lazy(() => import('./pages/Expense/ExpenseReportList'))
const QuotationList = lazy(() => import('./pages/Quotation/QuotationList'))
const AuditLogList = lazy(() => import('./pages/AuditLog/AuditLogList'))
const UserList = lazy(() => import('./pages/UserManagement/UserList'))

// 加载中组件
const PageLoading = () => (
  <div className="flex items-center justify-center h-64">
    <Spin size="large" tip="加载中..." />
  </div>
)

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/finance-system">
        <NetworkStatus />
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="income" element={<IncomeList />} />
              <Route path="income/create" element={<IncomeForm />} />
              <Route path="income/edit/:id" element={<IncomeForm />} />
              <Route path="expense" element={<ExpenseList />} />
              <Route path="expense/create" element={<ExpenseForm />} />
              <Route path="expense/edit/:id" element={<ExpenseForm />} />
              <Route path="budget" element={<BudgetList />} />
              <Route path="salary/employees" element={<EmployeeList />} />
              <Route path="salary/payroll" element={<PayrollList />} />
              <Route path="salary/formulas" element={<SalaryFormulaList />} />
              <Route path="bank" element={<BankAccounts />} />
              <Route path="receivable" element={<ReceivableList />} />
              <Route path="payable" element={<PayableList />} />
              <Route path="invoice" element={<InvoiceList />} />
              <Route path="tax" element={<TaxList />} />
              <Route path="contract" element={<ContractList />} />
              <Route path="expense-report" element={<ExpenseReportList />} />
              <Route path="quotation" element={<QuotationList />} />
              <Route path="audit-log" element={<AuditLogList />} />
              <Route path="user-management" element={<UserList />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
