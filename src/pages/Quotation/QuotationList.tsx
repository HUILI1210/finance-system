import { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, InputNumber, DatePicker, Select, Card, Row, Col, Statistic, Popconfirm, message, Descriptions, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SendOutlined, PrinterOutlined, CopyOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useQuotationStore, Quotation, QuotationItem } from '../../store/quotationStore'
import { useAccountsStore } from '../../store/accountsStore'

export default function QuotationList() {
  const { quotations, addQuotation, updateQuotation, deleteQuotation } = useQuotationStore()
  const { customers } = useAccountsStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [items, setItems] = useState<QuotationItem[]>([])
  const [form] = Form.useForm()
  const [itemForm] = Form.useForm()

  const totalAmount = quotations.reduce((sum, q) => sum + q.totalAmount, 0)
  const acceptedAmount = quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0)
  const pendingCount = quotations.filter(q => q.status === 'sent').length

  const openModal = (quotation?: Quotation) => {
    setSelectedQuotation(quotation || null)
    if (quotation) {
      form.setFieldsValue({
        ...quotation,
        validUntil: dayjs(quotation.validUntil),
      })
      setItems(quotation.items)
    } else {
      form.resetFields()
      setItems([])
    }
    setIsModalOpen(true)
  }

  const showDetail = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setDetailOpen(true)
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      form.setFieldsValue({
        customerName: customer.name,
        customerContact: customer.contact,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address,
      })
    }
  }

  const addItem = () => {
    itemForm.validateFields().then(values => {
      const amount = values.quantity * values.unitPrice
      const newItem: QuotationItem = {
        ...values,
        id: Date.now().toString(),
        amount,
      }
      setItems([...items, newItem])
      itemForm.resetFields()
    })
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0)
    const taxRate = form.getFieldValue('taxRate') || 0
    const taxAmount = Math.round(subtotal * taxRate / 100)
    return { subtotal, taxAmount, totalAmount: subtotal + taxAmount }
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const { subtotal, taxAmount, totalAmount } = calculateTotals()
      const now = dayjs().format('YYYY-MM-DD')
      const data: Quotation = {
        ...values,
        id: selectedQuotation?.id || Date.now().toString(),
        quotationNo: selectedQuotation?.quotationNo || `QT${dayjs().format('YYYYMMDD')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        items,
        subtotal,
        taxAmount,
        totalAmount,
        validUntil: values.validUntil.format('YYYY-MM-DD'),
        status: selectedQuotation?.status || 'draft',
        createdAt: selectedQuotation?.createdAt || now,
        updatedAt: now,
      }
      if (selectedQuotation) {
        updateQuotation(selectedQuotation.id, data)
        message.success('更新成功')
      } else {
        addQuotation(data)
        message.success('创建成功')
      }
      setIsModalOpen(false)
    })
  }

  const handleSend = (id: string) => {
    updateQuotation(id, { status: 'sent', updatedAt: dayjs().format('YYYY-MM-DD') })
    message.success('报价单已发送')
  }

  const handleStatusChange = (id: string, status: 'accepted' | 'rejected') => {
    updateQuotation(id, { status, updatedAt: dayjs().format('YYYY-MM-DD') })
    message.success(status === 'accepted' ? '客户已接受报价' : '客户已拒绝报价')
  }

  const handleCopy = (quotation: Quotation) => {
    const newQuotation: Quotation = {
      ...quotation,
      id: Date.now().toString(),
      quotationNo: `QT${dayjs().format('YYYYMMDD')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      status: 'draft',
      createdAt: dayjs().format('YYYY-MM-DD'),
      updatedAt: dayjs().format('YYYY-MM-DD'),
    }
    addQuotation(newQuotation)
    message.success('报价单已复制')
  }

  const handleDelete = (id: string) => {
    deleteQuotation(id)
    message.success('删除成功')
  }

  const handlePrint = (quotation: Quotation) => {
    const printContent = `
      <html>
      <head>
        <title>报价单 - ${quotation.quotationNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
          .info { margin: 20px 0; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
          .terms { margin-top: 30px; white-space: pre-line; }
        </style>
      </head>
      <body>
        <h1>报价单</h1>
        <div class="info">
          <p><strong>报价单号：</strong>${quotation.quotationNo}</p>
          <p><strong>客户名称：</strong>${quotation.customerName}</p>
          <p><strong>联系人：</strong>${quotation.customerContact} | ${quotation.customerPhone}</p>
          <p><strong>报价标题：</strong>${quotation.title}</p>
          <p><strong>有效期至：</strong>${quotation.validUntil}</p>
        </div>
        <table>
          <tr><th>项目名称</th><th>描述</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th></tr>
          ${quotation.items.map(i => `<tr><td>${i.name}</td><td>${i.description}</td><td>${i.unit}</td><td>${i.quantity}</td><td>¥${i.unitPrice.toLocaleString()}</td><td>¥${i.amount.toLocaleString()}</td></tr>`).join('')}
        </table>
        <div class="total">
          <p>小计：¥${quotation.subtotal.toLocaleString()}</p>
          <p>税额(${quotation.taxRate}%)：¥${quotation.taxAmount.toLocaleString()}</p>
          <p>总计：¥${quotation.totalAmount.toLocaleString()}</p>
        </div>
        <div class="terms"><strong>条款与说明：</strong><br/>${quotation.terms}</div>
      </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      sent: { color: 'blue', text: '已发送' },
      accepted: { color: 'green', text: '已接受' },
      rejected: { color: 'red', text: '已拒绝' },
      expired: { color: 'orange', text: '已过期' },
    }
    const item = map[status] || { color: 'default', text: status }
    return <Tag color={item.color}>{item.text}</Tag>
  }

  const columns = [
    { title: '报价单号', dataIndex: 'quotationNo', key: 'quotationNo', width: 130 },
    { title: '客户', dataIndex: 'customerName', key: 'customerName', width: 120 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (v: number) => <span className="font-bold">¥{v.toLocaleString()}</span> },
    { title: '有效期', dataIndex: 'validUntil', key: 'validUntil', width: 110 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s: string) => getStatusTag(s) },
    {
      title: '操作', key: 'action', width: 280,
      render: (_: unknown, record: Quotation) => (
        <>
          <Button icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)}>查看</Button>
          <Button icon={<PrinterOutlined />} size="small" className="ml-1" onClick={() => handlePrint(record)}>打印</Button>
          {record.status === 'draft' && (
            <>
              <Button icon={<SendOutlined />} size="small" type="primary" className="ml-1" onClick={() => handleSend(record.id)}>发送</Button>
              <Button icon={<EditOutlined />} size="small" className="ml-1" onClick={() => openModal(record)}>编辑</Button>
            </>
          )}
          {record.status === 'sent' && (
            <>
              <Button size="small" className="ml-1" onClick={() => handleStatusChange(record.id, 'accepted')}>接受</Button>
              <Button size="small" danger className="ml-1" onClick={() => handleStatusChange(record.id, 'rejected')}>拒绝</Button>
            </>
          )}
          <Button icon={<CopyOutlined />} size="small" className="ml-1" onClick={() => handleCopy(record)}>复制</Button>
          {record.status === 'draft' && (
            <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
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
        <h2 className="text-xl font-bold">报价管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新建报价单</Button>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card><Statistic title="报价单总数" value={quotations.length} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待确认" value={pendingCount} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="报价总金额" value={totalAmount} prefix="¥" precision={2} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已成交金额" value={acceptedAmount} prefix="¥" precision={2} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={quotations} rowKey="id" scroll={{ x: 1200 }} />
      </Card>

      <Modal title={selectedQuotation ? '编辑报价单' : '新建报价单'} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)} width={900}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="customerId" label="选择客户">
                <Select 
                  options={customers.map(c => ({ label: c.name, value: c.id }))} 
                  onChange={handleCustomerChange}
                  placeholder="选择已有客户"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customerName" label="客户名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customerContact" label="联系人" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="customerPhone" label="电话">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customerEmail" label="邮箱">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customerAddress" label="地址">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="报价标题" rules={[{ required: true }]}>
                <Input placeholder="如：软件开发服务报价" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="validUntil" label="有效期至" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="taxRate" label="税率(%)" initialValue={6}>
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider>报价明细</Divider>
        
        <Form form={itemForm} layout="inline" className="mb-3">
          <Form.Item name="name" rules={[{ required: true }]} style={{ width: 120 }}>
            <Input placeholder="项目名称" />
          </Form.Item>
          <Form.Item name="description" style={{ width: 150 }}>
            <Input placeholder="描述" />
          </Form.Item>
          <Form.Item name="unit" rules={[{ required: true }]} style={{ width: 80 }}>
            <Input placeholder="单位" />
          </Form.Item>
          <Form.Item name="quantity" rules={[{ required: true }]} style={{ width: 80 }}>
            <InputNumber placeholder="数量" min={1} />
          </Form.Item>
          <Form.Item name="unitPrice" rules={[{ required: true }]} style={{ width: 100 }}>
            <InputNumber placeholder="单价" min={0} />
          </Form.Item>
          <Button type="primary" onClick={addItem}>添加</Button>
        </Form>

        <Table
          size="small"
          pagination={false}
          dataSource={items}
          rowKey="id"
          columns={[
            { title: '项目', dataIndex: 'name', width: 120 },
            { title: '描述', dataIndex: 'description' },
            { title: '单位', dataIndex: 'unit', width: 60 },
            { title: '数量', dataIndex: 'quantity', width: 60 },
            { title: '单价', dataIndex: 'unitPrice', width: 100, render: (v: number) => `¥${v.toLocaleString()}` },
            { title: '金额', dataIndex: 'amount', width: 100, render: (v: number) => `¥${v.toLocaleString()}` },
            { title: '操作', width: 60, render: (_: unknown, r: QuotationItem) => <Button size="small" danger onClick={() => removeItem(r.id)}>删除</Button> },
          ]}
          summary={() => {
            const { subtotal, taxAmount, totalAmount } = calculateTotals()
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right"><strong>小计</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}><strong>¥{subtotal.toLocaleString()}</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={2}></Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">税额</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>¥{taxAmount.toLocaleString()}</Table.Summary.Cell>
                  <Table.Summary.Cell index={2}></Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right"><strong>总计</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}><strong className="text-lg text-green-600">¥{totalAmount.toLocaleString()}</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={2}></Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            )
          }}
        />

        <Form.Item name="terms" label="条款与说明" className="mt-4">
          <Input.TextArea rows={3} placeholder="付款方式、交付时间等说明" />
        </Form.Item>
      </Modal>

      <Modal title="报价单详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={800}>
        {selectedQuotation && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="报价单号">{selectedQuotation.quotationNo}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(selectedQuotation.status)}</Descriptions.Item>
              <Descriptions.Item label="客户名称">{selectedQuotation.customerName}</Descriptions.Item>
              <Descriptions.Item label="联系人">{selectedQuotation.customerContact}</Descriptions.Item>
              <Descriptions.Item label="电话">{selectedQuotation.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedQuotation.customerEmail}</Descriptions.Item>
              <Descriptions.Item label="报价标题" span={2}>{selectedQuotation.title}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{selectedQuotation.createdAt}</Descriptions.Item>
              <Descriptions.Item label="有效期至">{selectedQuotation.validUntil}</Descriptions.Item>
            </Descriptions>

            <Card title="报价明细" size="small" className="mt-4">
              <Table
                size="small"
                pagination={false}
                dataSource={selectedQuotation.items}
                rowKey="id"
                columns={[
                  { title: '项目', dataIndex: 'name' },
                  { title: '描述', dataIndex: 'description' },
                  { title: '单位', dataIndex: 'unit', width: 60 },
                  { title: '数量', dataIndex: 'quantity', width: 60 },
                  { title: '单价', dataIndex: 'unitPrice', render: (v: number) => `¥${v.toLocaleString()}` },
                  { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
                ]}
              />
              <div className="mt-4 text-right">
                <p>小计：¥{selectedQuotation.subtotal.toLocaleString()}</p>
                <p>税额({selectedQuotation.taxRate}%)：¥{selectedQuotation.taxAmount.toLocaleString()}</p>
                <p className="text-xl font-bold text-green-600">总计：¥{selectedQuotation.totalAmount.toLocaleString()}</p>
              </div>
            </Card>

            {selectedQuotation.terms && (
              <Card title="条款与说明" size="small" className="mt-4">
                <pre className="whitespace-pre-wrap">{selectedQuotation.terms}</pre>
              </Card>
            )}

            <div className="mt-4 text-right">
              <Button icon={<PrinterOutlined />} onClick={() => handlePrint(selectedQuotation)}>打印报价单</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
