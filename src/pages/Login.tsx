import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface LoginForm {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const onFinish = (values: LoginForm) => {
    // 模拟登录验证
    if (values.username === 'admin' && values.password === 'admin123') {
      login(
        {
          id: '1',
          username: 'admin',
          name: '系统管理员',
          role: 'admin',
        },
        'mock-token-12345'
      )
      message.success('登录成功')
      navigate('/dashboard')
    } else {
      message.error('用户名或密码错误')
    }
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
        <div className="text-center text-gray-500 text-sm">
          默认账号: admin / admin123
        </div>
      </Card>
    </div>
  )
}
