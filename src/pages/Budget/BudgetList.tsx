import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Progress, message, Card, Row, Col, Statistic } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useFinanceStore, Budget } from '../../store/financeStore'

const categories = ['办公费用', '人力成本', '营销费用', '差旅费', '研发费用']

export default function BudgetList() {
  const { budgets, records, addBudget, updateBudget } = useFinanceStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [form] = Form.useForm()

  // 自动计算每个预算的实际使用金额
  const budgetsWithActualSpent = useMemo(() => {
    return budgets.map(budget => {
      const actualSpent = records
        .filter(r => r.type === 'expense' && r.category === budget.category && r.date.startsWith(budget.month))
        .reduce((sum, r) => sum + r.amount, 0)
      return { ...budget, actualSpent }
    })
  }, [budgets, records])

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgetsWithActualSpent.reduce((sum, b) => sum + b.actualSpent, 0)

  const openModal = (budget?: Budget) => {
    setEditingBudget(budget || null)
    if (budget) {
      form.setFieldsValue(budget)
    } else {
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingBudget) {
        updateBudget(editingBudget.id, values)
        message.success('更新成功')
      } else {
        addBudget({
          ...values,
          id: Date.now().toString(),
          spent: 0,
        })
        message.success('添加成功')
      }
      setIsModalOpen(false)
      form.resetFields()
    })
  }

  const columns = [
    { title: '类别', dataIndex: 'category', key: 'category' },
    { title: '预算月份', dataIndex: 'month', key: 'month' },
    { title: '预算金额', dataIndex: 'amount', key: 'amount', render: (val: number) => `¥${val.toLocaleString()}` },
    { title: '实际支出', dataIndex: 'actualSpent', key: 'actualSpent', render: (val: number) => <span className="text-red-600">¥{val.toLocaleString()}</span> },
    { title: '剩余', key: 'remaining', render: (_: unknown, record: Budget & { actualSpent: number }) => {
      const remaining = record.amount - record.actualSpent
      return <span className={remaining < 0 ? 'text-red-600 font-bold' : 'text-green-600'}>¥{remaining.toLocaleString()}</span>
    }},
    {
      title: '使用进度',
      key: 'progress',
      render: (_: unknown, record: Budget & { actualSpent: number }) => {
        const percent = Math.min(100, Math.round((record.actualSpent / record.amount) * 100))
        return <Progress percent={percent} status={percent > 100 ? 'exception' : percent > 80 ? 'exception' : 'active'} size="small" />
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Budget) => (
        <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)}>编辑</Button>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">预算管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          新增预算
        </Button>
      </div>
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card><Statistic title="预算总额" value={totalBudget} prefix="¥" precision={2} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="实际支出" value={totalSpent} prefix="¥" precision={2} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="预算使用率" value={(totalSpent / totalBudget * 100).toFixed(1)} suffix="%" valueStyle={{ color: totalSpent / totalBudget > 0.8 ? '#cf1322' : '#3f8600' }} /></Card>
        </Col>
      </Row>
      <Table columns={columns} dataSource={budgetsWithActualSpent} rowKey="id" />
      <Modal
        title={editingBudget ? '编辑预算' : '新增预算'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="category" label="类别" rules={[{ required: true }]}>
            <Select options={categories.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item name="month" label="预算月份" rules={[{ required: true }]}>
            <Input placeholder="格式：2024-01" />
          </Form.Item>
          <Form.Item name="amount" label="预算金额" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={0} precision={2} prefix="¥" />
          </Form.Item>
          <p className="text-gray-500 text-sm">提示：实际支出金额会自动根据支出记录计算</p>
        </Form>
      </Modal>
    </div>
  )
}
