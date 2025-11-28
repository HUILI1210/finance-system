import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, theme, Space, Tag } from 'antd'
import {
  DashboardOutlined,
  MoneyCollectOutlined,
  WalletOutlined,
  AccountBookOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
  AuditOutlined,
  FileProtectOutlined,
  PayCircleOutlined,
  SolutionOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import { PERMISSIONS, Role } from '../../store/permissionStore'
import DataBackup from '../DataBackup'
import AppVersion from '../AppVersion'
import Permission from '../Permission'

const { Header, Sider, Content } = Layout

const allMenuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/income', icon: <MoneyCollectOutlined />, label: '收入管理' },
  { key: '/expense', icon: <WalletOutlined />, label: '支出管理' },
  { key: '/budget', icon: <AccountBookOutlined />, label: '预算管理' },
  { 
    key: 'salary', 
    icon: <TeamOutlined />, 
    label: '薪资管理',
    children: [
      { key: '/salary/employees', label: '员工档案' },
      { key: '/salary/payroll', label: '工资单' },
    ]
  },
  { key: '/bank', icon: <BankOutlined />, label: '银行账户' },
  { key: '/receivable', icon: <MoneyCollectOutlined />, label: '应收账款' },
  { key: '/payable', icon: <WalletOutlined />, label: '应付账款' },
  { key: '/invoice', icon: <FileTextOutlined />, label: '发票管理' },
  { key: '/tax', icon: <AuditOutlined />, label: '税务管理' },
  { key: '/contract', icon: <FileProtectOutlined />, label: '合同管理' },
  { key: '/expense-report', icon: <PayCircleOutlined />, label: '费用报销' },
  { key: '/quotation', icon: <SolutionOutlined />, label: '报价管理' },
  { key: '/audit-log', icon: <FileTextOutlined />, label: '操作日志', adminOnly: true },
  { key: '/user-management', icon: <TeamOutlined />, label: '用户管理', adminOnly: true },
  { key: '/reports', icon: <BarChartOutlined />, label: '报表中心' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
]

// 根据角色过滤菜单
const filterMenuByRole = (role: Role) => {
  const hiddenMenus = PERMISSIONS[role].hiddenMenus
  return allMenuItems.filter(item => {
    if (item.adminOnly && role !== 'admin') return false
    return !hiddenMenus.includes(item.key)
  })
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

  // 根据用户角色获取菜单
  const menuItems = filterMenuByRole(user?.role || 'viewer')

  const getRoleTag = (role: string) => {
    const map: Record<string, { color: string; text: string }> = {
      admin: { color: 'red', text: '管理员' },
      accountant: { color: 'blue', text: '财务' },
      viewer: { color: 'green', text: '访客' },
    }
    return map[role] || { color: 'default', text: role }
  }

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div className="flex items-center justify-center h-16 text-white text-lg font-bold">
          {collapsed ? '财务' : '财务管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className="flex items-center justify-between">
          <div
            className="px-4 cursor-pointer text-lg"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div className="pr-6">
            <Space size="middle">
              <AppVersion />
              <Permission action="backup">
                <DataBackup />
              </Permission>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center cursor-pointer gap-2">
                  <Avatar icon={<UserOutlined />} />
                  <span>
                    {user?.name || '管理员'}
                    <Tag color={getRoleTag(user?.role || '').color} className="ml-2">
                      {getRoleTag(user?.role || '').text}
                    </Tag>
                  </span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
