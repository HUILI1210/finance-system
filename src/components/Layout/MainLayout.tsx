import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd'
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
} from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'

const { Header, Sider, Content } = Layout

const menuItems = [
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
  { key: '/reports', icon: <BarChartOutlined />, label: '报表中心' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

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
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer gap-2">
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || '管理员'}</span>
              </div>
            </Dropdown>
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
