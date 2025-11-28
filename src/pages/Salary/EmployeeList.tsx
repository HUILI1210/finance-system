import { useState } from 'react'
import { Table, Button, Space, Input, Modal, Form, Select, DatePicker, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useSalaryStore, Employee } from '../../store/salaryStore'

const departments = ['技术部', '市场部', '财务部', '人事部', '运营部']

export default function EmployeeList() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useSalaryStore()
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form] = Form.useForm()

  const filteredEmployees = employees.filter(e =>
    e.name.includes(searchText) || e.employeeNo.includes(searchText) || e.department.includes(searchText)
  )

  const openModal = (employee?: Employee) => {
    setEditingEmployee(employee || null)
    if (employee) {
      form.setFieldsValue({ ...employee, entryDate: dayjs(employee.entryDate) })
    } else {
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const data = { ...values, entryDate: values.entryDate.format('YYYY-MM-DD') }
      if (editingEmployee) {
        updateEmployee(editingEmployee.id, data)
        message.success('更新成功')
      } else {
        addEmployee({ ...data, id: Date.now().toString(), status: 'active' })
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const handleDelete = (id: string) => {
    deleteEmployee(id)
    message.success('删除成功')
  }

  const columns = [
    { title: '工号', dataIndex: 'employeeNo', key: 'employeeNo', width: 100 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 100 },
    { title: '职位', dataIndex: 'position', key: 'position', width: 120 },
    { title: '入职日期', dataIndex: 'entryDate', key: 'entryDate', width: 120 },
    { title: '手机', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (status: string) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '在职' : '离职'}</Tag>
    )},
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Employee) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">员工档案</h2>
        <Space>
          <Input placeholder="搜索姓名/工号/部门" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>添加员工</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filteredEmployees} rowKey="id" scroll={{ x: 1000 }} />
      <Modal title={editingEmployee ? '编辑员工' : '添加员工'} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="employeeNo" label="工号" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="department" label="部门" rules={[{ required: true }]}>
              <Select options={departments.map(d => ({ label: d, value: d }))} />
            </Form.Item>
            <Form.Item name="position" label="职位" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="entryDate" label="入职日期" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="phone" label="手机" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="邮箱">
              <Input />
            </Form.Item>
            <Form.Item name="bankName" label="开户行">
              <Input />
            </Form.Item>
            <Form.Item name="bankAccount" label="银行账号" className="col-span-2">
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
