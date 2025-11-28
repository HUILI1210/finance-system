import { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, InputNumber, DatePicker, Select, Card, Row, Col, Statistic, message } from 'antd'
import { PlusOutlined, DollarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAccountsStore, Payable } from '../../store/accountsStore'

export default function PayableList() {
  const { payables, suppliers, addPayable, updatePayable } = useAccountsStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null)
  const [form] = Form.useForm()
  const [payForm] = Form.useForm()

  const totalAmount = payables.reduce((sum, p) => sum + p.amount, 0)
  const paidAmount = payables.reduce((sum, p) => sum + p.paidAmount, 0)

  const openModal = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const openPayModal = (payable: Payable) => {
    setSelectedPayable(payable)
    payForm.setFieldsValue({ amount: payable.amount - payable.paidAmount })
    setPayModalOpen(true)
  }

  const handleAdd = () => {
    form.validateFields().then(values => {
      const supplier = suppliers.find(s => s.id === values.supplierId)
      addPayable({
        ...values,
        id: Date.now().toString(),
        supplierName: supplier?.name || '',
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        paidAmount: 0,
        status: 'pending',
        createdAt: dayjs().format('YYYY-MM-DD'),
      })
      message.success('添加成功')
      setIsModalOpen(false)
    })
  }

  const handlePay = () => {
    payForm.validateFields().then(values => {
      if (!selectedPayable) return
      const newPaidAmount = selectedPayable.paidAmount + values.amount
      const newStatus = newPaidAmount >= selectedPayable.amount ? 'paid' : 'partial'
      updatePayable(selectedPayable.id, { paidAmount: newPaidAmount, status: newStatus })
      message.success('付款成功')
      setPayModalOpen(false)
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { pending: 'blue', partial: 'orange', paid: 'green', overdue: 'red' }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = { pending: '待付款', partial: '部分付款', paid: '已付款', overdue: '已逾期' }
    return texts[status] || status
  }

  const columns = [
    { title: '发票号', dataIndex: 'invoiceNo', key: 'invoiceNo' },
    { title: '供应商', dataIndex: 'supplierName', key: 'supplierName' },
    { title: '应付金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '已付金额', dataIndex: 'paidAmount', key: 'paidAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '待付金额', key: 'remaining', render: (_: unknown, r: Payable) => <span className="text-orange-600">¥{(r.amount - r.paidAmount).toLocaleString()}</span> },
    { title: '到期日', dataIndex: 'dueDate', key: 'dueDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag> },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: Payable) => (
        record.status !== 'paid' && (
          <Button icon={<DollarOutlined />} size="small" type="primary" onClick={() => openPayModal(record)}>付款</Button>
        )
      ),
    },
  ]

  // 付款计划 - 按到期日排序
  const upcomingPayments = payables
    .filter(p => p.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">应付账款</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>新增应付</Button>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card><Statistic title="应付总额" value={totalAmount} prefix="¥" precision={2} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="已付金额" value={paidAmount} prefix="¥" precision={2} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="待付金额" value={totalAmount - paidAmount} prefix="¥" precision={2} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
      </Row>

      <Card title="付款计划（按到期日）" className="mb-4">
        <Table 
          columns={[
            { title: '供应商', dataIndex: 'supplierName' },
            { title: '待付金额', render: (_: unknown, r: Payable) => `¥${(r.amount - r.paidAmount).toLocaleString()}` },
            { title: '到期日', dataIndex: 'dueDate' },
            { title: '剩余天数', render: (_: unknown, r: Payable) => {
              const days = dayjs(r.dueDate).diff(dayjs(), 'day')
              return <Tag color={days < 0 ? 'red' : days < 7 ? 'orange' : 'green'}>{days < 0 ? `逾期${-days}天` : `${days}天`}</Tag>
            }},
          ]} 
          dataSource={upcomingPayments} 
          rowKey="id" 
          pagination={false} 
          size="small" 
        />
      </Card>

      <Card title="应付明细">
        <Table columns={columns} dataSource={payables} rowKey="id" />
      </Card>

      <Modal title="新增应付" open={isModalOpen} onOk={handleAdd} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="supplierId" label="供应商" rules={[{ required: true }]}>
            <Select options={suppliers.map(s => ({ label: s.name, value: s.id }))} />
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

      <Modal title="付款" open={payModalOpen} onOk={handlePay} onCancel={() => setPayModalOpen(false)}>
        <Form form={payForm} layout="vertical">
          <Form.Item name="amount" label="付款金额" rules={[{ required: true }]}>
            <InputNumber className="w-full" prefix="¥" precision={2} min={0} max={selectedPayable ? selectedPayable.amount - selectedPayable.paidAmount : 0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
