import { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, InputNumber, DatePicker, Select, Card, Row, Col, Statistic, message } from 'antd'
import { PlusOutlined, CheckOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useInvoiceStore, TaxRecord } from '../../store/invoiceStore'

export default function TaxList() {
  const { taxRecords, addTaxRecord, updateTaxRecord } = useInvoiceStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const pendingTax = taxRecords.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.taxAmount, 0)
  const declaredTax = taxRecords.filter(t => t.status === 'declared').reduce((sum, t) => sum + t.taxAmount, 0)
  const paidTax = taxRecords.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.taxAmount, 0)

  const openModal = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    form.validateFields().then(values => {
      const taxAmount = values.taxableAmount * (values.taxRate / 100)
      addTaxRecord({
        ...values,
        id: Date.now().toString(),
        taxAmount: Math.round(taxAmount * 100) / 100,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        status: 'pending',
      })
      message.success('添加成功')
      setIsModalOpen(false)
    })
  }

  const handleDeclare = (id: string) => {
    updateTaxRecord(id, { status: 'declared' })
    message.success('已申报')
  }

  const handlePay = (id: string) => {
    updateTaxRecord(id, { status: 'paid', paidDate: dayjs().format('YYYY-MM-DD') })
    message.success('已缴纳')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { pending: 'orange', declared: 'blue', paid: 'green' }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = { pending: '待申报', declared: '已申报', paid: '已缴纳' }
    return texts[status] || status
  }

  const getTaxTypeName = (type: string) => {
    const names: Record<string, string> = { vat: '增值税', corporate: '企业所得税', personal: '个人所得税', stamp: '印花税' }
    return names[type] || type
  }

  const columns = [
    { title: '税种', dataIndex: 'taxType', key: 'taxType', render: (t: string) => getTaxTypeName(t) },
    { title: '税目', dataIndex: 'taxName', key: 'taxName' },
    { title: '所属期', dataIndex: 'period', key: 'period' },
    { title: '计税依据', dataIndex: 'taxableAmount', key: 'taxableAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '税率', dataIndex: 'taxRate', key: 'taxRate', render: (v: number) => `${v}%` },
    { title: '应纳税额', dataIndex: 'taxAmount', key: 'taxAmount', render: (v: number) => <span className="font-bold text-red-600">¥{v.toLocaleString()}</span> },
    { title: '申报截止', dataIndex: 'dueDate', key: 'dueDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag> },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: TaxRecord) => (
        <>
          {record.status === 'pending' && (
            <Button size="small" onClick={() => handleDeclare(record.id)}>申报</Button>
          )}
          {record.status === 'declared' && (
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handlePay(record.id)}>缴纳</Button>
          )}
        </>
      ),
    },
  ]

  // 税务日历 - 即将到期的税务
  const upcomingTax = taxRecords
    .filter(t => t.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">税务管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>添加税务记录</Button>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic title="待申报税额" value={pendingTax} prefix="¥" precision={2} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="已申报待缴" value={declaredTax} prefix="¥" precision={2} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="本年已缴税款" value={paidTax} prefix="¥" precision={2} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
      </Row>

      <Card title="税务日历" className="mb-4">
        <Table 
          columns={[
            { title: '税种', dataIndex: 'taxName' },
            { title: '所属期', dataIndex: 'period' },
            { title: '应纳税额', dataIndex: 'taxAmount', render: (v: number) => `¥${v.toLocaleString()}` },
            { title: '截止日期', dataIndex: 'dueDate' },
            { title: '剩余天数', render: (_: unknown, r: TaxRecord) => {
              const days = dayjs(r.dueDate).diff(dayjs(), 'day')
              return <Tag color={days < 0 ? 'red' : days < 7 ? 'orange' : 'green'}>{days < 0 ? `逾期${-days}天` : `${days}天`}</Tag>
            }},
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag> },
          ]} 
          dataSource={upcomingTax} 
          rowKey="id" 
          pagination={false} 
          size="small" 
        />
      </Card>

      <Card title="税务明细">
        <Table columns={columns} dataSource={taxRecords} rowKey="id" />
      </Card>

      <Modal title="添加税务记录" open={isModalOpen} onOk={handleAdd} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="taxType" label="税种" rules={[{ required: true }]}>
            <Select options={[
              { label: '增值税', value: 'vat' },
              { label: '企业所得税', value: 'corporate' },
              { label: '个人所得税', value: 'personal' },
              { label: '印花税', value: 'stamp' },
            ]} />
          </Form.Item>
          <Form.Item name="taxName" label="税目" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="period" label="所属期" rules={[{ required: true }]}>
            <Input placeholder="如：2024-01 或 2024-Q1" />
          </Form.Item>
          <Form.Item name="taxableAmount" label="计税依据" rules={[{ required: true }]}>
            <InputNumber className="w-full" prefix="¥" precision={2} />
          </Form.Item>
          <Form.Item name="taxRate" label="税率(%)" rules={[{ required: true }]}>
            <InputNumber className="w-full" suffix="%" precision={2} />
          </Form.Item>
          <Form.Item name="dueDate" label="申报截止日" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
