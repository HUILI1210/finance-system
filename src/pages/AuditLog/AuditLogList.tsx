import { Table, Card, Tag, Button, Space, Input, DatePicker, Select, Row, Col, Statistic, Popconfirm, message } from 'antd'
import { SearchOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import dayjs from 'dayjs'
import { usePermissionStore, AuditLog, Role } from '../../store/permissionStore'

export default function AuditLogList() {
  const { logs, clearLogs } = usePermissionStore()
  const [searchText, setSearchText] = useState('')
  const [filterAction, setFilterAction] = useState<string>()
  const [filterModule, setFilterModule] = useState<string>()

  const filteredLogs = logs
    .filter(log => {
      const matchText = log.description.includes(searchText) || log.userName.includes(searchText)
      const matchAction = !filterAction || log.action === filterAction
      const matchModule = !filterModule || log.module === filterModule
      return matchText && matchAction && matchModule
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getActionTag = (action: string) => {
    const map: Record<string, { color: string; text: string }> = {
      create: { color: 'green', text: '新增' },
      update: { color: 'blue', text: '修改' },
      delete: { color: 'red', text: '删除' },
      login: { color: 'cyan', text: '登录' },
      logout: { color: 'orange', text: '登出' },
    }
    return map[action] || { color: 'default', text: action }
  }

  const getRoleTag = (role: Role) => {
    const map: Record<Role, { color: string; text: string }> = {
      admin: { color: 'red', text: '管理员' },
      accountant: { color: 'blue', text: '财务' },
      viewer: { color: 'green', text: '访客' },
    }
    return map[role]
  }

  const modules = [...new Set(logs.map(l => l.module))]
  
  const todayLogs = logs.filter(l => dayjs(l.timestamp).isSame(dayjs(), 'day')).length
  const modifyLogs = logs.filter(l => ['create', 'update', 'delete'].includes(l.action)).length

  const columns = [
    { 
      title: '时间', 
      dataIndex: 'timestamp', 
      key: 'timestamp', 
      width: 180,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss')
    },
    { 
      title: '用户', 
      key: 'user',
      width: 150,
      render: (_: unknown, record: AuditLog) => (
        <Space>
          <Tag color={getRoleTag(record.userRole).color}>{getRoleTag(record.userRole).text}</Tag>
          {record.userName}
        </Space>
      )
    },
    { 
      title: '操作', 
      dataIndex: 'action', 
      key: 'action',
      width: 80,
      render: (a: string) => <Tag color={getActionTag(a).color}>{getActionTag(a).text}</Tag>
    },
    { title: '模块', dataIndex: 'module', key: 'module', width: 100 },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { 
      title: '变更详情', 
      key: 'changes',
      width: 200,
      render: (_: unknown, record: AuditLog) => {
        if (record.oldValue && record.newValue) {
          return (
            <span>
              <span className="line-through text-gray-400">{record.oldValue}</span>
              <span className="mx-1">→</span>
              <span className="text-blue-500">{record.newValue}</span>
            </span>
          )
        }
        return '-'
      }
    },
  ]

  const handleClearLogs = () => {
    clearLogs()
    message.success('日志已清空')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">操作日志</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>刷新</Button>
          <Popconfirm title="确定清空所有日志？" onConfirm={handleClearLogs}>
            <Button icon={<DeleteOutlined />} danger>清空日志</Button>
          </Popconfirm>
        </Space>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card><Statistic title="总日志数" value={logs.length} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="今日操作" value={todayLogs} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="数据变更" value={modifyLogs} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="登录次数" value={logs.filter(l => l.action === 'login').length} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="搜索描述或用户"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="操作类型"
            allowClear
            style={{ width: 120 }}
            value={filterAction}
            onChange={setFilterAction}
            options={[
              { label: '新增', value: 'create' },
              { label: '修改', value: 'update' },
              { label: '删除', value: 'delete' },
              { label: '登录', value: 'login' },
              { label: '登出', value: 'logout' },
            ]}
          />
          <Select
            placeholder="模块"
            allowClear
            style={{ width: 120 }}
            value={filterModule}
            onChange={setFilterModule}
            options={modules.map(m => ({ label: m, value: m }))}
          />
          <DatePicker.RangePicker />
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredLogs} 
          rowKey="id" 
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  )
}
