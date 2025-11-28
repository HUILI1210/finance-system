import { useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Statistic, Row, Col, message } from 'antd'
import { PlusOutlined, BankOutlined, EditOutlined } from '@ant-design/icons'
import { useBankStore, BankAccount, BankTransaction } from '../../store/bankStore'

export default function BankAccounts() {
  const { accounts, transactions, addAccount, updateAccount } = useBankStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [form] = Form.useForm()

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  const openModal = (account?: BankAccount) => {
    setSelectedAccount(account || null)
    if (account) {
      form.setFieldsValue(account)
    } else {
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      if (selectedAccount) {
        updateAccount(selectedAccount.id, values)
        message.success('更新成功')
      } else {
        addAccount({ ...values, id: Date.now().toString(), balance: values.balance || 0, status: 'active' })
        message.success('添加成功')
      }
      setIsModalOpen(false)
    })
  }

  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => t.accountId === accountId).slice(0, 5)
  }

  const accountColumns = [
    { title: '账户名称', dataIndex: 'accountName', key: 'accountName' },
    { title: '账号', dataIndex: 'accountNo', key: 'accountNo' },
    { title: '开户行', dataIndex: 'bankName', key: 'bankName' },
    { title: '账户类型', dataIndex: 'type', key: 'type', render: (t: string) => {
      const types: Record<string, string> = { basic: '基本户', general: '一般户', special: '专用户' }
      return types[t] || t
    }},
    { title: '余额', dataIndex: 'balance', key: 'balance', render: (v: number) => <span className="font-bold">¥{v.toLocaleString()}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '正常' : '冻结'}</Tag> },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: BankAccount) => (
        <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)}>编辑</Button>
      ),
    },
  ]

  const transactionColumns = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 100 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (t: string) => {
      const colors: Record<string, string> = { income: 'green', expense: 'red', transfer: 'blue' }
      const names: Record<string, string> = { income: '收入', expense: '支出', transfer: '转账' }
      return <Tag color={colors[t]}>{names[t]}</Tag>
    }},
    { title: '对方', dataIndex: 'counterparty', key: 'counterparty' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number, r: BankTransaction) => (
      <span className={r.type === 'income' ? 'text-green-600' : 'text-red-600'}>
        {r.type === 'income' ? '+' : '-'}¥{v.toLocaleString()}
      </span>
    )},
    { title: '余额', dataIndex: 'balance', key: 'balance', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '摘要', dataIndex: 'description', key: 'description' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">银行账户管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>添加账户</Button>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic title="账户总数" value={accounts.length} prefix={<BankOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="总余额" value={totalBalance} prefix="¥" precision={2} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="本月交易数" value={transactions.length} />
          </Card>
        </Col>
      </Row>

      <Card title="账户列表" className="mb-4">
        <Table columns={accountColumns} dataSource={accounts} rowKey="id" pagination={false} />
      </Card>

      {accounts.map(account => (
        <Card key={account.id} title={`${account.accountName} - 最近交易`} className="mb-4" size="small">
          <Table columns={transactionColumns} dataSource={getAccountTransactions(account.id)} rowKey="id" pagination={false} size="small" />
        </Card>
      ))}

      <Modal title={selectedAccount ? '编辑账户' : '添加账户'} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="accountName" label="账户名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="accountNo" label="账号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bankName" label="开户行" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="账户类型" rules={[{ required: true }]}>
            <Select options={[
              { label: '基本户', value: 'basic' },
              { label: '一般户', value: 'general' },
              { label: '专用户', value: 'special' },
            ]} />
          </Form.Item>
          {!selectedAccount && (
            <Form.Item name="balance" label="初始余额">
              <InputNumber className="w-full" prefix="¥" precision={2} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
