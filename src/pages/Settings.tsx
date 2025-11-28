import { Card, Form, Input, Button, Switch, Select, Tabs, Table, message } from 'antd'
import { UserOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons'

const users = [
  { id: '1', username: 'admin', name: '系统管理员', role: '管理员', status: true },
  { id: '2', username: 'finance', name: '财务专员', role: '财务', status: true },
  { id: '3', username: 'viewer', name: '查看员', role: '只读', status: false },
]

export default function Settings() {
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  const handleProfileSave = () => {
    message.success('个人信息已更新')
  }

  const handlePasswordSave = () => {
    passwordForm.validateFields().then(() => {
      message.success('密码已更新')
      passwordForm.resetFields()
    })
  }

  const userColumns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (val: boolean) => <Switch checked={val} size="small" /> },
    { title: '操作', key: 'action', render: () => <Button size="small">编辑</Button> },
  ]

  const items = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />,
      children: (
        <Card>
          <Form form={profileForm} layout="vertical" className="max-w-md">
            <Form.Item label="用户名" name="username" initialValue="admin">
              <Input disabled />
            </Form.Item>
            <Form.Item label="姓名" name="name" initialValue="系统管理员">
              <Input />
            </Form.Item>
            <Form.Item label="邮箱" name="email" initialValue="admin@company.com">
              <Input />
            </Form.Item>
            <Form.Item label="手机" name="phone">
              <Input />
            </Form.Item>
            <Button type="primary" onClick={handleProfileSave}>保存</Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'password',
      label: '修改密码',
      icon: <LockOutlined />,
      children: (
        <Card>
          <Form form={passwordForm} layout="vertical" className="max-w-md">
            <Form.Item label="当前密码" name="currentPassword" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item label="新密码" name="newPassword" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Button type="primary" onClick={handlePasswordSave}>更新密码</Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'users',
      label: '用户管理',
      icon: <SettingOutlined />,
      children: (
        <Card>
          <div className="mb-4">
            <Button type="primary">添加用户</Button>
          </div>
          <Table columns={userColumns} dataSource={users} rowKey="id" />
        </Card>
      ),
    },
    {
      key: 'system',
      label: '系统设置',
      icon: <SettingOutlined />,
      children: (
        <Card>
          <Form layout="vertical" className="max-w-md">
            <Form.Item label="公司名称">
              <Input defaultValue="示例科技有限公司" />
            </Form.Item>
            <Form.Item label="默认货币">
              <Select defaultValue="CNY" options={[
                { label: '人民币 (CNY)', value: 'CNY' },
                { label: '美元 (USD)', value: 'USD' },
              ]} />
            </Form.Item>
            <Form.Item label="财年起始月">
              <Select defaultValue="1" options={Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: String(i + 1) }))} />
            </Form.Item>
            <Form.Item label="自动备份">
              <Switch defaultChecked />
            </Form.Item>
            <Button type="primary">保存设置</Button>
          </Form>
        </Card>
      ),
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">系统设置</h2>
      <Tabs items={items} tabPosition="left" />
    </div>
  )
}
