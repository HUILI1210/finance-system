import { useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Progress, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useFinanceStore, Budget } from '../../store/financeStore'

const categories = ['办公费用', '人力成本', '营销费用', '差旅费', '研发费用']

export default function BudgetList() {
  const { budgets, addBudget, updateBudget } = useFinanceStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [form] = Form.useForm()

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
    { title: '已使用', dataIndex: 'spent', key: 'spent', render: (val: number) => `¥${val.toLocaleString()}` },
    {
      title: '使用进度',
      key: 'progress',
      render: (_: unknown, record: Budget) => {
        const percent = Math.round((record.spent / record.amount) * 100)
        return <Progress percent={percent} status={percent > 80 ? 'exception' : 'active'} size="small" />
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
      <Table columns={columns} dataSource={budgets} rowKey="id" />
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
          {editingBudget && (
            <Form.Item name="spent" label="已使用金额">
              <InputNumber className="w-full" min={0} precision={2} prefix="¥" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
