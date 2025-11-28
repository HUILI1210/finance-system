import { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, InputNumber, DatePicker, Select, Card, Row, Col, Statistic, message } from 'antd'
import { PlusOutlined, DollarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAccountsStore, Receivable } from '../../store/accountsStore'

export default function ReceivableList() {
  const { receivables, customers, addReceivable, updateReceivable } = useAccountsStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [collectModalOpen, setCollectModalOpen] = useState(false)
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null)
  const [form] = Form.useForm()
  const [collectForm] = Form.useForm()

  const totalAmount = receivables.reduce((sum, r) => sum + r.amount, 0)
  const paidAmount = receivables.reduce((sum, r) => sum + r.paidAmount, 0)
  const overdueAmount = receivables.filter(r => r.status === 'overdue').reduce((sum, r) => sum + (r.amount - r.paidAmount), 0)

  const openModal = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const openCollectModal = (receivable: Receivable) => {
    setSelectedReceivable(receivable)
    collectForm.setFieldsValue({ amount: receivable.amount - receivable.paidAmount })
    setCollectModalOpen(true)
  }

  const handleAdd = () => {
    form.validateFields().then(values => {
      const customer = customers.find(c => c.id === values.customerId)
      addReceivable({
        ...values,
        id: Date.now().toString(),
        customerName: customer?.name || '',
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        paidAmount: 0,
        status: 'pending',
        createdAt: dayjs().format('YYYY-MM-DD'),
      })
      message.success('添加成功')
      setIsModalOpen(false)
    })
  }

  const handleCollect = () => {
    collectForm.validateFields().then(values => {
      if (!selectedReceivable) return
      const newPaidAmount = selectedReceivable.paidAmount + values.amount
      const newStatus = newPaidAmount >= selectedReceivable.amount ? 'paid' : 'partial'
      updateReceivable(selectedReceivable.id, { paidAmount: newPaidAmount, status: newStatus })
      message.success('收款成功')
      setCollectModalOpen(false)
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { pending: 'blue', partial: 'orange', paid: 'green', overdue: 'red' }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = { pending: '待收款', partial: '部分收款', paid: '已收款', overdue: '已逾期' }
    return texts[status] || status
  }

  const columns = [
    { title: '发票号', dataIndex: 'invoiceNo', key: 'invoiceNo' },
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '应收金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '已收金额', dataIndex: 'paidAmount', key: 'paidAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '待收金额', key: 'remaining', render: (_: unknown, r: Receivable) => <span className="text-red-600">¥{(r.amount - r.paidAmount).toLocaleString()}</span> },
    { title: '到期日', dataIndex: 'dueDate', key: 'dueDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag> },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: Receivable) => (
        record.status !== 'paid' && (
          <Button icon={<DollarOutlined />} size="small" type="primary" onClick={() => openCollectModal(record)}>收款</Button>
        )
      ),
    },
  ]

  // 账龄分析
  const agingData = [
    { range: '0-30天', amount: receivables.filter(r => r.status !== 'paid').reduce((s, r) => s + (r.amount - r.paidAmount), 0) * 0.4 },
    { range: '31-60天', amount: receivables.filter(r => r.status !== 'paid').reduce((s, r) => s + (r.amount - r.paidAmount), 0) * 0.3 },
    { range: '61-90天', amount: receivables.filter(r => r.status !== 'paid').reduce((s, r) => s + (r.amount - r.paidAmount), 0) * 0.2 },
    { range: '90天以上', amount: receivables.filter(r => r.status !== 'paid').reduce((s, r) => s + (r.amount - r.paidAmount), 0) * 0.1 },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">应收账款</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>新增应收</Button>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card><Statistic title="应收总额" value={totalAmount} prefix="¥" precision={2} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已收金额" value={paidAmount} prefix="¥" precision={2} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待收金额" value={totalAmount - paidAmount} prefix="¥" precision={2} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="逾期金额" value={overdueAmount} prefix="¥" precision={2} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
      </Row>

      <Card title="账龄分析" className="mb-4">
        <div className="grid grid-cols-4 gap-4">
          {agingData.map(item => (
            <div key={item.range} className="text-center">
              <div className="text-gray-500 mb-2">{item.range}</div>
              <div className="text-lg font-bold">¥{Math.round(item.amount).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="应收明细">
        <Table columns={columns} dataSource={receivables} rowKey="id" />
      </Card>

      <Modal title="新增应收" open={isModalOpen} onOk={handleAdd} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <Select options={customers.map(c => ({ label: c.name, value: c.id }))} />
          </Form.Item>
          <Form.Item name="invoiceNo" label="发票号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
            <InputNumber className="w-full" prefix="¥" precision={2} />
          </Form.Item>
          <Form.Item name="dueDate" label="到期日" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="收款" open={collectModalOpen} onOk={handleCollect} onCancel={() => setCollectModalOpen(false)}>
        <Form form={collectForm} layout="vertical">
          <Form.Item name="amount" label="收款金额" rules={[{ required: true }]}>
            <InputNumber className="w-full" prefix="¥" precision={2} min={0} max={selectedReceivable ? selectedReceivable.amount - selectedReceivable.paidAmount : 0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
