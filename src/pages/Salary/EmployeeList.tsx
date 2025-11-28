import { useState } from 'react'
import { Table, Button, Space, Input, Modal, Form, Select, DatePicker, Tag, Popconfirm, message, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useSalaryStore, Employee } from '../../store/salaryStore'
import Permission from '../../components/Permission'

const departments = ['技术部', '市场部', '财务部', '人事部', '运营部']

export default function EmployeeList() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, salaryFormulas, salaryStructures, addSalaryStructure, updateSalaryStructure } = useSalaryStore()
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
      const structure = salaryStructures.find(s => s.employeeId === employee.id)
      form.setFieldsValue({ 
        ...employee, 
        entryDate: dayjs(employee.entryDate),
        baseSalary: structure?.baseSalary || 0,
        positionAllowance: structure?.positionAllowance || 0,
      })
    } else {
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const { baseSalary, positionAllowance, salaryFormulaId, ...employeeData } = values
      const data = { ...employeeData, entryDate: values.entryDate.format('YYYY-MM-DD'), salaryFormulaId }
      
      if (editingEmployee) {
        updateEmployee(editingEmployee.id, data)
        // 更新薪资结构
        const existingStructure = salaryStructures.find(s => s.employeeId === editingEmployee.id)
        if (existingStructure) {
          updateSalaryStructure(existingStructure.id, { baseSalary, positionAllowance })
        } else {
          addSalaryStructure({
            id: Date.now().toString(),
            employeeId: editingEmployee.id,
            baseSalary,
            positionAllowance,
            performanceBonus: 0,
            socialInsurance: Math.round(baseSalary * 0.1),
            housingFund: Math.round(baseSalary * 0.08),
            effectiveDate: new Date().toISOString().split('T')[0],
          })
        }
        message.success('更新成功')
      } else {
        const newId = Date.now().toString()
        addEmployee({ ...data, id: newId, status: 'active' })
        // 创建薪资结构
        addSalaryStructure({
          id: (Date.now() + 1).toString(),
          employeeId: newId,
          baseSalary,
          positionAllowance,
          performanceBonus: 0,
          socialInsurance: Math.round(baseSalary * 0.1),
          housingFund: Math.round(baseSalary * 0.08),
          effectiveDate: new Date().toISOString().split('T')[0],
        })
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const getFormulaName = (id?: string) => {
    if (!id) return '未设置'
    const formula = salaryFormulas.find(f => f.id === id)
    return formula?.name || '未知'
  }

  const handleDelete = (id: string) => {
    deleteEmployee(id)
    message.success('删除成功')
  }

  const columns = [
    { title: '工号', dataIndex: 'employeeNo', key: 'employeeNo', width: 90 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 80 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 90 },
    { title: '职位', dataIndex: 'position', key: 'position', width: 100 },
    { title: '工资公式', dataIndex: 'salaryFormulaId', key: 'salaryFormulaId', width: 120,
      render: (id: string) => <Tag color={id ? 'blue' : 'default'}>{getFormulaName(id)}</Tag>
    },
    { title: '基本工资', key: 'baseSalary', width: 100,
      render: (_: unknown, record: Employee) => {
        const structure = salaryStructures.find(s => s.employeeId === record.id)
        return structure ? `¥${structure.baseSalary.toLocaleString()}` : '-'
      }
    },
    { title: '入职日期', dataIndex: 'entryDate', key: 'entryDate', width: 110 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: (status: string) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '在职' : '离职'}</Tag>
    )},
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Employee) => (
        <Space>
          <Permission action="update">
            <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)}>编辑</Button>
          </Permission>
          <Permission action="delete">
            <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
              <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
            </Popconfirm>
          </Permission>
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
            <Form.Item name="salaryFormulaId" label="工资公式" rules={[{ required: true, message: '请选择工资公式' }]}>
              <Select 
                placeholder="选择工资计算方式"
                options={salaryFormulas.filter(f => f.isActive).map(f => ({ 
                  label: `${f.name} (${f.type === 'fixed' ? '固定月薪' : f.type === 'hourly' ? '计时' : f.type === 'piece' ? '计件' : f.type === 'commission' ? '提成' : '混合'})`, 
                  value: f.id 
                }))} 
              />
            </Form.Item>
            <Form.Item name="baseSalary" label="基本工资" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={0} prefix="¥" />
            </Form.Item>
            <Form.Item name="positionAllowance" label="岗位津贴">
              <InputNumber className="w-full" min={0} prefix="¥" />
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
