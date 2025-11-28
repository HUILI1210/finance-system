import { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, Select, Card, Row, Col, Statistic, Popconfirm, message, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { usePermissionStore, User, Role, USER_PASSWORDS } from '../../store/permissionStore'

export default function UserList() {
  const { users, addUser, updateUser, deleteUser, addLog } = usePermissionStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user

  const openModal = (user?: User) => {
    setEditingUser(user || null)
    if (user) {
      form.setFieldsValue(user)
    } else {
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingUser) {
        updateUser(editingUser.id, values)
        addLog({
          userId: currentUser?.id || '',
          userName: currentUser?.name || '',
          userRole: currentUser?.role || 'admin',
          action: 'update',
          module: '用户管理',
          description: `修改用户 ${values.name}`,
        })
        message.success('更新成功')
      } else {
        const newUser: User = {
          ...values,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
        }
        addUser(newUser)
        // 添加默认密码
        USER_PASSWORDS[values.username] = 'password123'
        addLog({
          userId: currentUser?.id || '',
          userName: currentUser?.name || '',
          userRole: currentUser?.role || 'admin',
          action: 'create',
          module: '用户管理',
          description: `新增用户 ${values.name}`,
        })
        message.success('添加成功，默认密码: password123')
      }
      setIsModalOpen(false)
    })
  }

  const handleDelete = (user: User) => {
    if (user.username === 'admin') {
      message.error('不能删除管理员账号')
      return
    }
    deleteUser(user.id)
    addLog({
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      userRole: currentUser?.role || 'admin',
      action: 'delete',
      module: '用户管理',
      description: `删除用户 ${user.name}`,
    })
    message.success('删除成功')
  }

  const handleStatusChange = (user: User, status: boolean) => {
    updateUser(user.id, { status: status ? 'active' : 'inactive' })
    addLog({
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      userRole: currentUser?.role || 'admin',
      action: 'update',
      module: '用户管理',
      description: `${status ? '启用' : '禁用'}用户 ${user.name}`,
    })
    message.success(status ? '用户已启用' : '用户已禁用')
  }

  const getRoleTag = (role: Role) => {
    const map: Record<Role, { color: string; text: string }> = {
      admin: { color: 'red', text: '管理员' },
      accountant: { color: 'blue', text: '财务会计' },
      viewer: { color: 'green', text: '普通用户' },
    }
    return map[role]
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { 
      title: '角色', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: Role) => <Tag color={getRoleTag(role).color}>{getRoleTag(role).text}</Tag>
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string, record: User) => (
        <Switch 
          checked={status === 'active'} 
          onChange={(checked) => handleStatusChange(record, checked)}
          disabled={record.username === 'admin'}
        />
      )
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)}>编辑</Button>
          {record.username !== 'admin' && (
            <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record)}>
              <Button icon={<DeleteOutlined />} size="small" danger className="ml-1">删除</Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">用户管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增用户</Button>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card><Statistic title="用户总数" value={users.length} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="管理员" value={users.filter(u => u.role === 'admin').length} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="财务会计" value={users.filter(u => u.role === 'accountant').length} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="普通用户" value={users.filter(u => u.role === 'viewer').length} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={users} rowKey="id" />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '管理员', value: 'admin' },
                { label: '财务会计', value: 'accountant' },
                { label: '普通用户', value: 'viewer' },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select
              options={[
                { label: '启用', value: 'active' },
                { label: '禁用', value: 'inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
