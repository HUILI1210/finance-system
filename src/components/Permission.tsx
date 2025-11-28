import { ReactNode } from 'react'
import { Tooltip } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { Role, usePermission } from '../store/permissionStore'

interface PermissionProps {
  roles?: Role[]
  action?: 'create' | 'update' | 'delete' | 'export' | 'viewLogs' | 'manageUsers' | 'backup'
  children: ReactNode
  fallback?: ReactNode
  showLock?: boolean
}

/**
 * 权限包装组件
 * @param roles - 允许的角色列表
 * @param action - 需要的操作权限
 * @param children - 有权限时显示的内容
 * @param fallback - 无权限时显示的内容
 * @param showLock - 无权限时是否显示锁图标
 */
export default function Permission({ 
  roles, 
  action, 
  children, 
  fallback = null,
  showLock = false 
}: PermissionProps) {
  const { hasPermission, permissions } = usePermission(roles)

  // 检查角色权限
  if (roles && !hasPermission) {
    return showLock ? (
      <Tooltip title="无权限">
        <span className="text-gray-400 cursor-not-allowed">
          <LockOutlined className="mr-1" />
          {fallback}
        </span>
      </Tooltip>
    ) : <>{fallback}</>
  }

  // 检查操作权限
  if (action) {
    const actionMap = {
      create: permissions.canCreate,
      update: permissions.canUpdate,
      delete: permissions.canDelete,
      export: permissions.canExport,
      viewLogs: permissions.canViewLogs,
      manageUsers: permissions.canManageUsers,
      backup: permissions.canBackup,
    }
    
    if (!actionMap[action]) {
      return showLock ? (
        <Tooltip title="无权限">
          <span className="text-gray-400 cursor-not-allowed">
            <LockOutlined className="mr-1" />
            {fallback}
          </span>
        </Tooltip>
      ) : <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * 只读模式包装组件 - 用于表单等需要禁用编辑的场景
 */
export function ReadOnlyWrapper({ children }: { children: ReactNode }) {
  const { permissions } = usePermission()
  
  if (!permissions.canUpdate) {
    return (
      <div className="pointer-events-none opacity-75">
        {children}
      </div>
    )
  }
  
  return <>{children}</>
}
