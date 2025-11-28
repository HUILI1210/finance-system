import { useState } from 'react'
import { Table, Button, Tabs, Tag, Modal, Form, Input, InputNumber, DatePicker, Card, Row, Col, Statistic, message } from 'antd'
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons'
import { useInvoiceStore, Invoice } from '../../store/invoiceStore'

export default function InvoiceList() {
  const { invoices, addInvoice, updateInvoice } = useInvoiceStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'output' | 'input'>('output')
  const [form] = Form.useForm()

  const outputInvoices = invoices.filter(i => i.type === 'output')
  const inputInvoices = invoices.filter(i => i.type === 'input')

  const outputTotal = outputInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
  const outputTax = outputInvoices.reduce((sum, i) => sum + i.taxAmount, 0)
  const inputTotal = inputInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
  const inputTax = inputInvoices.reduce((sum, i) => sum + i.taxAmount, 0)

  const openModal = (type: 'output' | 'input') => {
    setInvoiceType(type)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    form.validateFields().then(values => {
      const taxAmount = Math.round(values.amount * 0.13)
      addInvoice({
        ...values,
        id: Date.now().toString(),
        type: invoiceType,
        taxAmount,
        totalAmount: values.amount + taxAmount,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        status: 'pending',
      })
      message.success('添加成功')
      setIsModalOpen(false)
    })
  }

  const handleVerify = (id: string) => {
    updateInvoice(id, { status: 'verified' })
    message.success('认证成功')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { pending: 'orange', verified: 'green', cancelled: 'red' }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = { pending: '待认证', verified: '已认证', cancelled: '已作废' }
    return texts[status] || status
  }

  const columns = [
    { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo' },
    { title: '发票代码', dataIndex: 'invoiceCode', key: 'invoiceCode' },
    { title: '对方单位', dataIndex: 'counterparty', key: 'counterparty' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '税额', dataIndex: 'taxAmount', key: 'taxAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '价税合计', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => <span className="font-bold">¥{v.toLocaleString()}</span> },
    { title: '开票日期', dataIndex: 'invoiceDate', key: 'invoiceDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag> },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: Invoice) => (
        record.status === 'pending' && record.type === 'input' && (
          <Button size="small" type="primary" onClick={() => handleVerify(record.id)}>认证</Button>
        )
      ),
    },
  ]

  const tabItems = [
    {
      key: 'output',
      label: '销项发票',
      children: (
        <div>
          <Row gutter={16} className="mb-4">
            <Col span={8}><Card><Statistic title="销项发票数" value={outputInvoices.length} prefix={<FileTextOutlined />} /></Card></Col>
            <Col span={8}><Card><Statistic title="销项金额" value={outputTotal} prefix="¥" precision={2} /></Card></Col>
            <Col span={8}><Card><Statistic title="销项税额" value={outputTax} prefix="¥" precision={2} valueStyle={{ color: '#cf1322' }} /></Card></Col>
          </Row>
          <div className="mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('output')}>开具发票</Button>
          </div>
          <Table columns={columns} dataSource={outputInvoices} rowKey="id" />
        </div>
      ),
    },
    {
      key: 'input',
      label: '进项发票',
      children: (
        <div>
          <Row gutter={16} className="mb-4">
            <Col span={8}><Card><Statistic title="进项发票数" value={inputInvoices.length} prefix={<FileTextOutlined />} /></Card></Col>
            <Col span={8}><Card><Statistic title="进项金额" value={inputTotal} prefix="¥" precision={2} /></Card></Col>
            <Col span={8}><Card><Statistic title="可抵扣税额" value={inputTax} prefix="¥" precision={2} valueStyle={{ color: '#3f8600' }} /></Card></Col>
          </Row>
          <div className="mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('input')}>录入发票</Button>
          </div>
          <Table columns={columns} dataSource={inputInvoices} rowKey="id" />
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">发票管理</h2>
      </div>

      <Card className="mb-4">
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="本期销项税额" value={outputTax} prefix="¥" precision={2} valueStyle={{ color: '#cf1322' }} />
          </Col>
          <Col span={12}>
            <Statistic title="本期进项税额" value={inputTax} prefix="¥" precision={2} valueStyle={{ color: '#3f8600' }} />
          </Col>
        </Row>
        <div className="mt-4 text-center">
          <span className="text-gray-500">应缴增值税：</span>
          <span className={`text-xl font-bold ${outputTax - inputTax > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ¥{(outputTax - inputTax).toLocaleString()}
          </span>
        </div>
      </Card>

      <Tabs items={tabItems} />

      <Modal title={invoiceType === 'output' ? '开具发票' : '录入发票'} open={isModalOpen} onOk={handleAdd} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="invoiceNo" label="发票号码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="invoiceCode" label="发票代码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="counterparty" label={invoiceType === 'output' ? '购方单位' : '销方单位'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="金额（不含税）" rules={[{ required: true }]}>
            <InputNumber className="w-full" prefix="¥" precision={2} />
          </Form.Item>
          <Form.Item name="invoiceDate" label="开票日期" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="摘要">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
