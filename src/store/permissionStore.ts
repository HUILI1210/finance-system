import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'admin' | 'accountant' | 'viewer'

export interface User {
  id: string
  username: string
  name: string
  role: Role
  email?: string
  phone?: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: Role
  action: 'create' | 'update' | 'delete' | 'login' | 'logout'
  module: string
  targetId?: string
  description: string
  oldValue?: string
  newValue?: string
  timestamp: string
}

// 权限配置
export const PERMISSIONS = {
  admin: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
    canViewLogs: true,
    canManageUsers: true,
    canBackup: true,
    hiddenMenus: [] as string[],
  },
  accountant: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
    canViewLogs: false,
    canManageUsers: false,
    canBackup: false,
    hiddenMenus: ['/audit-log', '/user-management'],
  },
  viewer: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExport: false,
    canViewLogs: false,
    canManageUsers: false,
    canBackup: false,
    hiddenMenus: ['/audit-log', '/user-management', '/salary/payroll'],
  },
}

// 预设用户
const initialUsers: User[] = [
  { id: '1', username: 'admin', name: '系统管理员', role: 'admin', email: 'admin@company.com', status: 'active', createdAt: '2024-01-01' },
  { id: '2', username: 'finance', name: '财务专员', role: 'accountant', email: 'finance@company.com', status: 'active', createdAt: '2024-01-01' },
  { id: '3', username: 'guest', name: '访客用户', role: 'viewer', email: 'guest@company.com', status: 'active', createdAt: '2024-01-01' },
]

// 用户密码 (实际应用中应该加密存储)
export const USER_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  finance: 'finance123',
  guest: 'guest123',
}

interface PermissionState {
  users: User[]
  logs: AuditLog[]
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void
  clearLogs: () => void
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set) => ({
      users: initialUsers,
      logs: [],
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updatedUser) => set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
      })),
      deleteUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
      addLog: (log) => set((state) => ({
        logs: [...state.logs, { ...log, id: Date.now().toString(), timestamp: new Date().toISOString() }],
      })),
      clearLogs: () => set({ logs: [] }),
    }),
    { name: 'permission-storage' }
  )
)

// 权限检查Hook
export function usePermission(requiredRoles?: Role[]) {
  const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user as User | null
  
  if (!currentUser) return { hasPermission: false, permissions: PERMISSIONS.viewer, user: null }
  
  const permissions = PERMISSIONS[currentUser.role]
  const hasPermission = !requiredRoles || requiredRoles.includes(currentUser.role)
  
  return { hasPermission, permissions, user: currentUser }
}
