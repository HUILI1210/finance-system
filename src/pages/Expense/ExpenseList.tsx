import { useState } from 'react'
import { Table, Button, Space, Input, Select, Popconfirm, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useFinanceStore, FinanceRecord } from '../../store/financeStore'

const categories = ['办公费用', '人力成本', '营销费用', '差旅费', '其他支出']

export default function ExpenseList() {
  const navigate = useNavigate()
  const { records, deleteRecord } = useFinanceStore()
  const expenseRecords = records.filter(r => r.type === 'expense')
  
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const filteredRecords = expenseRecords.filter(record => {
    const matchText = record.description.includes(searchText) || record.category.includes(searchText)
    const matchCategory = !selectedCategory || record.category === selectedCategory
    return matchText && matchCategory
  })

  const handleDelete = (id: string) => {
    deleteRecord(id)
    message.success('删除成功')
  }

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date', sorter: (a: FinanceRecord, b: FinanceRecord) => dayjs(a.date).unix() - dayjs(b.date).unix() },
    { title: '类别', dataIndex: 'category', key: 'category', render: (cat: string) => <Tag color="red">{cat}</Tag> },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (val: number) => `¥${val.toLocaleString()}`, sorter: (a: FinanceRecord, b: FinanceRecord) => a.amount - b.amount },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: FinanceRecord) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/expense/edit/${record.id}`)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">支出管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/expense/create')}>
          新增支出
        </Button>
      </div>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="搜索描述或类别"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
        <Select
          placeholder="选择类别"
          allowClear
          style={{ width: 150 }}
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categories.map(c => ({ label: c, value: c }))}
        />
      </div>
      <Table columns={columns} dataSource={filteredRecords} rowKey="id" />
    </div>
  )
}
