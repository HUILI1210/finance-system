import { Form, Input, Button, Card, message, Divider, Tag } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usePermissionStore, USER_PASSWORDS } from '../store/permissionStore'

interface LoginForm {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { users, addLog } = usePermissionStore()

  const onFinish = (values: LoginForm) => {
    // 查找用户
    const user = users.find(u => u.username === values.username && u.status === 'active')
    const correctPassword = USER_PASSWORDS[values.username]

    if (user && correctPassword === values.password) {
      login(
        {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
        `token-${Date.now()}`
      )
      // 记录登录日志
      addLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'login',
        module: '系统',
        description: `${user.name} 登录系统`,
      })
      message.success(`欢迎回来，${user.name}`)
      navigate('/dashboard')
    } else {
      message.error('用户名或密码错误')
    }
  }

  const getRoleTag = (role: string) => {
    const map: Record<string, { color: string; text: string }> = {
      admin: { color: 'red', text: '管理员' },
      accountant: { color: 'blue', text: '财务' },
      viewer: { color: 'green', text: '访客' },
    }
    return map[role] || { color: 'default', text: role }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <Card className="w-96 shadow-2xl" title={
        <div className="text-center text-xl font-bold py-2">财务管理系统</div>
      }>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              登录
            </Button>
          </Form.Item>
        </Form>
        <Divider>测试账号</Divider>
        <div className="space-y-2 text-sm">
          {users.filter(u => u.status === 'active').map(u => (
            <div key={u.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>
                <Tag color={getRoleTag(u.role).color}>{getRoleTag(u.role).text}</Tag>
                {u.username}
              </span>
              <span className="text-gray-400">{USER_PASSWORDS[u.username]}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
