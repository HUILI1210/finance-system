import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import IncomeList from './pages/Income/IncomeList'
import IncomeForm from './pages/Income/IncomeForm'
import ExpenseList from './pages/Expense/ExpenseList'
import ExpenseForm from './pages/Expense/ExpenseForm'
import BudgetList from './pages/Budget/BudgetList'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import EmployeeList from './pages/Salary/EmployeeList'
import PayrollList from './pages/Salary/PayrollList'
import BankAccounts from './pages/Bank/BankAccounts'
import ReceivableList from './pages/Receivable/ReceivableList'
import PayableList from './pages/Payable/PayableList'
import InvoiceList from './pages/Invoice/InvoiceList'
import TaxList from './pages/Tax/TaxList'
import ContractList from './pages/Contract/ContractList'
import ExpenseReportList from './pages/Expense/ExpenseReportList'
import { useAuthStore } from './store/authStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter basename="/finance-system">
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
          <Route path="bank" element={<BankAccounts />} />
          <Route path="receivable" element={<ReceivableList />} />
          <Route path="payable" element={<PayableList />} />
          <Route path="invoice" element={<InvoiceList />} />
          <Route path="tax" element={<TaxList />} />
          <Route path="contract" element={<ContractList />} />
          <Route path="expense-report" element={<ExpenseReportList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
