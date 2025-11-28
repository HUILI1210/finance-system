import { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, InputNumber, DatePicker, Select, Card, Row, Col, Statistic, Popconfirm, message, Descriptions, List } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useExpenseStore, ExpenseReport, ExpenseItem } from '../../store/expenseStore'

const expenseCategories = ['差旅费', '招待费', '办公费', '交通费', '培训费', '其他']
const itemCategories = ['交通费', '住宿费', '餐饮费', '礼品费', '办公用品', '快递费', '其他']

export default function ExpenseReportList() {
  const { expenseReports, addExpenseReport, updateExpenseReport, deleteExpenseReport } = useExpenseStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null)
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([])
  const [form] = Form.useForm()
  const [itemForm] = Form.useForm()

  const pendingReports = expenseReports.filter(r => r.status === 'pending')
  const totalPending = pendingReports.reduce((sum, r) => sum + r.amount, 0)
  const totalPaid = expenseReports.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0)

  const openModal = (report?: ExpenseReport) => {
    setSelectedReport(report || null)
    if (report) {
      form.setFieldsValue({ ...report, applyDate: dayjs(report.applyDate) })
      setExpenseItems(report.items)
    } else {
      form.resetFields()
      setExpenseItems([])
    }
    setIsModalOpen(true)
  }

  const showDetail = (report: ExpenseReport) => {
    setSelectedReport(report)
    setDetailOpen(true)
  }

  const addItem = () => {
    itemForm.validateFields().then(values => {
      const newItem: ExpenseItem = {
        ...values,
        id: Date.now().toString(),
        date: values.date.format('YYYY-MM-DD'),
      }
      setExpenseItems([...expenseItems, newItem])
      itemForm.resetFields()
    })
  }

  const removeItem = (id: string) => {
    setExpenseItems(expenseItems.filter(i => i.id !== id))
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const totalAmount = expenseItems.reduce((sum, i) => sum + i.amount, 0)
      const data: ExpenseReport = {
        ...values,
        id: selectedReport?.id || Date.now().toString(),
        reportNo: selectedReport?.reportNo || `BX${dayjs().format('YYYYMMDD')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        applyDate: values.applyDate.format('YYYY-MM-DD'),
        items: expenseItems,
        amount: totalAmount,
        status: selectedReport?.status || 'pending',
      }
      if (selectedReport) {
        updateExpenseReport(selectedReport.id, data)
        message.success('更新成功')
      } else {
        addExpenseReport(data)
        message.success('提交成功')
      }
      setIsModalOpen(false)
    })
  }

  const handleApprove = (id: string) => {
    updateExpenseReport(id, { status: 'approved', approver: '管理员', approveDate: dayjs().format('YYYY-MM-DD') })
    message.success('审批通过')
  }

  const handleReject = (id: string) => {
    updateExpenseReport(id, { status: 'rejected', approver: '管理员', approveDate: dayjs().format('YYYY-MM-DD') })
    message.warning('已驳回')
  }

  const handlePay = (id: string) => {
    updateExpenseReport(id, { status: 'paid', paidDate: dayjs().format('YYYY-MM-DD') })
    message.success('已付款')
  }

  const handleDelete = (id: string) => {
    deleteExpenseReport(id)
    message.success('删除成功')
  }

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      pending: { color: 'orange', text: '待审批' },
      approved: { color: 'blue', text: '已批准' },
      rejected: { color: 'red', text: '已驳回' },
      paid: { color: 'green', text: '已付款' },
    }
    const item = map[status] || { color: 'default', text: status }
    return <Tag color={item.color}>{item.text}</Tag>
  }

  const columns = [
    { title: '报销单号', dataIndex: 'reportNo', key: 'reportNo', width: 140 },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 80 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 80 },
    { title: '类别', dataIndex: 'category', key: 'category', width: 80 },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 100, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '申请日期', dataIndex: 'applyDate', key: 'applyDate', width: 110 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s: string) => getStatusTag(s) },
    {
      title: '操作', key: 'action', width: 250,
      render: (_: unknown, record: ExpenseReport) => (
        <>
          <Button icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)}>详情</Button>
          {record.status === 'pending' && (
            <>
              <Button icon={<CheckOutlined />} size="small" type="primary" className="ml-1" onClick={() => handleApprove(record.id)}>通过</Button>
              <Button icon={<CloseOutlined />} size="small" danger className="ml-1" onClick={() => handleReject(record.id)}>驳回</Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button size="small" type="primary" className="ml-1" onClick={() => handlePay(record.id)}>付款</Button>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <>
              <Button icon={<EditOutlined />} size="small" className="ml-1" onClick={() => openModal(record)}>编辑</Button>
              <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
                <Button icon={<DeleteOutlined />} size="small" danger className="ml-1">删除</Button>
              </Popconfirm>
            </>
          )}
        </>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">费用报销</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增报销</Button>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card><Statistic title="报销总数" value={expenseReports.length} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待审批" value={pendingReports.length} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待审批金额" value={totalPending} prefix="¥" precision={2} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已报销金额" value={totalPaid} prefix="¥" precision={2} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={expenseReports} rowKey="id" scroll={{ x: 1100 }} />
      </Card>

      <Modal title={selectedReport ? '编辑报销单' : '新增报销单'} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)} width={700}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="applicant" label="申请人" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department" label="部门" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="applyDate" label="申请日期" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="报销类别" rules={[{ required: true }]}>
                <Select options={expenseCategories.map(c => ({ label: c, value: c }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="description" label="事由">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Card title="费用明细" size="small" className="mt-4">
          <Form form={itemForm} layout="inline" className="mb-2">
            <Form.Item name="category" rules={[{ required: true }]} style={{ width: 120 }}>
              <Select placeholder="类别" options={itemCategories.map(c => ({ label: c, value: c }))} />
            </Form.Item>
            <Form.Item name="amount" rules={[{ required: true }]} style={{ width: 100 }}>
              <InputNumber placeholder="金额" prefix="¥" />
            </Form.Item>
            <Form.Item name="date" rules={[{ required: true }]}>
              <DatePicker placeholder="日期" />
            </Form.Item>
            <Form.Item name="description" style={{ width: 150 }}>
              <Input placeholder="描述" />
            </Form.Item>
            <Button type="primary" onClick={addItem}>添加</Button>
          </Form>
          <Table
            size="small"
            pagination={false}
            dataSource={expenseItems}
            rowKey="id"
            columns={[
              { title: '类别', dataIndex: 'category', width: 80 },
              { title: '金额', dataIndex: 'amount', width: 80, render: (v: number) => `¥${v}` },
              { title: '日期', dataIndex: 'date', width: 100 },
              { title: '描述', dataIndex: 'description' },
              { title: '操作', width: 60, render: (_: unknown, r: ExpenseItem) => <Button size="small" danger onClick={() => removeItem(r.id)}>删除</Button> },
            ]}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><strong>合计</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1}><strong>¥{expenseItems.reduce((s, i) => s + i.amount, 0)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={3}></Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      </Modal>

      <Modal title="报销详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={650}>
        {selectedReport && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="报销单号">{selectedReport.reportNo}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(selectedReport.status)}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedReport.applicant}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedReport.department}</Descriptions.Item>
              <Descriptions.Item label="类别">{selectedReport.category}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedReport.applyDate}</Descriptions.Item>
              <Descriptions.Item label="报销金额" span={2}><span className="text-lg font-bold text-green-600">¥{selectedReport.amount.toLocaleString()}</span></Descriptions.Item>
              <Descriptions.Item label="事由" span={2}>{selectedReport.description}</Descriptions.Item>
              {selectedReport.approver && <Descriptions.Item label="审批人">{selectedReport.approver}</Descriptions.Item>}
              {selectedReport.approveDate && <Descriptions.Item label="审批日期">{selectedReport.approveDate}</Descriptions.Item>}
              {selectedReport.paidDate && <Descriptions.Item label="付款日期">{selectedReport.paidDate}</Descriptions.Item>}
            </Descriptions>
            <Card title="费用明细" size="small" className="mt-4">
              <List
                size="small"
                dataSource={selectedReport.items}
                renderItem={item => (
                  <List.Item>
                    <span>{item.date} - {item.category}</span>
                    <span className="font-bold">¥{item.amount}</span>
                    <span className="text-gray-500">{item.description}</span>
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}
      </Modal>
    </div>
  )
}
