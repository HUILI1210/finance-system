import { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, InputNumber, DatePicker, Select, Card, Row, Col, Statistic, Popconfirm, message, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useContractStore, Contract } from '../../store/contractStore'

const contractTypes = [
  { label: '销售合同', value: 'sales' },
  { label: '采购合同', value: 'purchase' },
  { label: '服务合同', value: 'service' },
  { label: '劳动合同', value: 'labor' },
]

export default function ContractList() {
  const { contracts, addContract, updateContract, deleteContract } = useContractStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [form] = Form.useForm()

  const activeContracts = contracts.filter(c => c.status === 'active')
  const totalAmount = activeContracts.reduce((sum, c) => sum + c.amount, 0)
  const expiringContracts = contracts.filter(c => {
    if (c.status !== 'active') return false
    const daysToExpire = dayjs(c.endDate).diff(dayjs(), 'day')
    return daysToExpire >= 0 && daysToExpire <= 30
  })

  const openModal = (contract?: Contract) => {
    setSelectedContract(contract || null)
    if (contract) {
      form.setFieldsValue({
        ...contract,
        signDate: dayjs(contract.signDate),
        startDate: dayjs(contract.startDate),
        endDate: dayjs(contract.endDate),
      })
    } else {
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const showDetail = (contract: Contract) => {
    setSelectedContract(contract)
    setDetailOpen(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const data = {
        ...values,
        signDate: values.signDate.format('YYYY-MM-DD'),
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      }
      if (selectedContract) {
        updateContract(selectedContract.id, data)
        message.success('更新成功')
      } else {
        addContract({ ...data, id: Date.now().toString(), status: 'active' })
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const handleDelete = (id: string) => {
    deleteContract(id)
    message.success('删除成功')
  }

  const getTypeText = (type: string) => {
    const item = contractTypes.find(t => t.value === type)
    return item?.label || type
  }

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      active: { color: 'green', text: '生效中' },
      expired: { color: 'orange', text: '已过期' },
      terminated: { color: 'red', text: '已终止' },
    }
    const item = map[status] || { color: 'default', text: status }
    return <Tag color={item.color}>{item.text}</Tag>
  }

  const columns = [
    { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo', width: 130 },
    { title: '合同名称', dataIndex: 'title', key: 'title' },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (t: string) => getTypeText(t) },
    { title: '乙方', dataIndex: 'partyB', key: 'partyB', width: 120 },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 110 },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 110 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s: string) => getStatusTag(s) },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: unknown, record: Contract) => (
        <>
          <Button icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)}>详情</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} className="ml-1">编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger className="ml-1">删除</Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">合同管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增合同</Button>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card><Statistic title="合同总数" value={contracts.length} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="生效中" value={activeContracts.length} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="合同总金额" value={totalAmount} prefix="¥" precision={2} /></Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="即将到期(30天内)" 
              value={expiringContracts.length} 
              prefix={<WarningOutlined />}
              valueStyle={{ color: expiringContracts.length > 0 ? '#cf1322' : '#3f8600' }} 
            />
          </Card>
        </Col>
      </Row>

      {expiringContracts.length > 0 && (
        <Card title={<><WarningOutlined className="text-orange-500 mr-2" />即将到期合同</>} className="mb-4" size="small">
          <Table
            size="small"
            pagination={false}
            dataSource={expiringContracts}
            rowKey="id"
            columns={[
              { title: '合同编号', dataIndex: 'contractNo' },
              { title: '合同名称', dataIndex: 'title' },
              { title: '乙方', dataIndex: 'partyB' },
              { title: '到期日', dataIndex: 'endDate' },
              { title: '剩余天数', render: (_: unknown, r: Contract) => {
                const days = dayjs(r.endDate).diff(dayjs(), 'day')
                return <Tag color={days < 7 ? 'red' : 'orange'}>{days}天</Tag>
              }},
            ]}
          />
        </Card>
      )}

      <Card>
        <Table columns={columns} dataSource={contracts} rowKey="id" scroll={{ x: 1200 }} />
      </Card>

      <Modal title={selectedContract ? '编辑合同' : '新增合同'} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)} width={700}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contractNo" label="合同编号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="合同类型" rules={[{ required: true }]}>
                <Select options={contractTypes} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="title" label="合同名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="partyA" label="甲方" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="partyB" label="乙方" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="signDate" label="签订日期" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="startDate" label="开始日期" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="endDate" label="结束日期" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="amount" label="合同金额" rules={[{ required: true }]}>
            <InputNumber className="w-full" prefix="¥" precision={2} />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="合同详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={600}>
        {selectedContract && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="合同编号">{selectedContract.contractNo}</Descriptions.Item>
            <Descriptions.Item label="合同类型">{getTypeText(selectedContract.type)}</Descriptions.Item>
            <Descriptions.Item label="合同名称" span={2}>{selectedContract.title}</Descriptions.Item>
            <Descriptions.Item label="甲方">{selectedContract.partyA}</Descriptions.Item>
            <Descriptions.Item label="乙方">{selectedContract.partyB}</Descriptions.Item>
            <Descriptions.Item label="合同金额">¥{selectedContract.amount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(selectedContract.status)}</Descriptions.Item>
            <Descriptions.Item label="签订日期">{selectedContract.signDate}</Descriptions.Item>
            <Descriptions.Item label="生效日期">{selectedContract.startDate}</Descriptions.Item>
            <Descriptions.Item label="到期日期" span={2}>{selectedContract.endDate}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{selectedContract.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
