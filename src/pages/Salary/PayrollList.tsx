import { useState } from 'react'
import { Table, Button, Space, Select, Tag, Modal, Descriptions, message } from 'antd'
import { EyeOutlined, CheckOutlined, DownloadOutlined } from '@ant-design/icons'
import { useSalaryStore, Payroll } from '../../store/salaryStore'
import { useFinanceStore } from '../../store/financeStore'

export default function PayrollList() {
  const { payrolls, employees, salaryStructures, updatePayroll, addPayroll } = useSalaryStore()
  const { addRecord } = useFinanceStore()
  const [selectedMonth, setSelectedMonth] = useState('2024-01')
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)

  const filteredPayrolls = payrolls.filter(p => p.month === selectedMonth)

  const showDetail = (payroll: Payroll) => {
    setSelectedPayroll(payroll)
    setDetailVisible(true)
  }

  const handlePay = (id: string) => {
    const payroll = payrolls.find(p => p.id === id)
    if (payroll) {
      const today = new Date().toISOString().split('T')[0]
      updatePayroll(id, { status: 'paid', paidDate: today })
      // 自动创建支出记录
      addRecord({
        id: `salary-${id}-${Date.now()}`,
        type: 'expense',
        amount: payroll.netSalary,
        category: '人力成本',
        description: `${payroll.month} 工资发放 - ${payroll.employeeName}`,
        date: today,
        createdAt: today,
      })
      message.success('工资已发放，已自动生成支出记录')
    }
  }

  const generatePayroll = () => {
    const existingIds = payrolls.filter(p => p.month === selectedMonth).map(p => p.employeeId)
    const newPayrolls = employees
      .filter(e => e.status === 'active' && !existingIds.includes(e.id))
      .map(e => {
        const structure = salaryStructures.find(s => s.employeeId === e.id)
        if (!structure) return null
        const gross = structure.baseSalary + structure.positionAllowance + structure.performanceBonus
        const deductTotal = structure.socialInsurance + structure.housingFund
        const tax = Math.max(0, (gross - deductTotal - 5000) * 0.1)
        return {
          id: Date.now().toString() + e.id,
          employeeId: e.id,
          employeeName: e.name,
          department: e.department,
          month: selectedMonth,
          baseSalary: structure.baseSalary,
          positionAllowance: structure.positionAllowance,
          performanceBonus: structure.performanceBonus,
          overtime: 0,
          deductions: 0,
          socialInsurance: structure.socialInsurance,
          housingFund: structure.housingFund,
          tax: Math.round(tax),
          netSalary: Math.round(gross - deductTotal - tax),
          status: 'pending' as const,
        }
      })
      .filter(Boolean) as Payroll[]
    
    newPayrolls.forEach(p => addPayroll(p))
    message.success(`已生成 ${newPayrolls.length} 条工资单`)
  }

  const totalNet = filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0)
  const paidCount = filteredPayrolls.filter(p => p.status === 'paid').length

  const columns = [
    { title: '员工姓名', dataIndex: 'employeeName', key: 'employeeName' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '基本工资', dataIndex: 'baseSalary', key: 'baseSalary', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '津贴', dataIndex: 'positionAllowance', key: 'positionAllowance', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '绩效', dataIndex: 'performanceBonus', key: 'performanceBonus', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '扣款', key: 'deduct', render: (_: unknown, r: Payroll) => `¥${(r.socialInsurance + r.housingFund + r.tax).toLocaleString()}` },
    { title: '实发工资', dataIndex: 'netSalary', key: 'netSalary', render: (v: number) => <span className="font-bold text-green-600">¥{v.toLocaleString()}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s === 'paid' ? '已发放' : '待发放'}</Tag> },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: Payroll) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)}>详情</Button>
          {record.status === 'pending' && (
            <Button icon={<CheckOutlined />} size="small" type="primary" onClick={() => handlePay(record.id)}>发放</Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">工资单管理</h2>
        <Space>
          <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 150 }} options={[
            { label: '2024年1月', value: '2024-01' },
            { label: '2024年2月', value: '2024-02' },
            { label: '2024年3月', value: '2024-03' },
          ]} />
          <Button onClick={generatePayroll}>生成工资单</Button>
          <Button icon={<DownloadOutlined />}>导出</Button>
        </Space>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-gray-500">工资单数量</div>
          <div className="text-2xl font-bold">{filteredPayrolls.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <div className="text-gray-500">已发放 / 待发放</div>
          <div className="text-2xl font-bold">{paidCount} / {filteredPayrolls.length - paidCount}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded">
          <div className="text-gray-500">应发总额</div>
          <div className="text-2xl font-bold text-orange-600">¥{totalNet.toLocaleString()}</div>
        </div>
      </div>
      <Table columns={columns} dataSource={filteredPayrolls} rowKey="id" />
      <Modal title="工资条详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={600}>
        {selectedPayroll && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="员工姓名">{selectedPayroll.employeeName}</Descriptions.Item>
            <Descriptions.Item label="部门">{selectedPayroll.department}</Descriptions.Item>
            <Descriptions.Item label="工资月份">{selectedPayroll.month}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={selectedPayroll.status === 'paid' ? 'green' : 'orange'}>{selectedPayroll.status === 'paid' ? '已发放' : '待发放'}</Tag></Descriptions.Item>
            <Descriptions.Item label="基本工资">¥{selectedPayroll.baseSalary.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="岗位津贴">¥{selectedPayroll.positionAllowance.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="绩效奖金">¥{selectedPayroll.performanceBonus.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="加班费">¥{selectedPayroll.overtime.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="社保扣款">-¥{selectedPayroll.socialInsurance.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="公积金扣款">-¥{selectedPayroll.housingFund.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="个人所得税">-¥{selectedPayroll.tax.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="其他扣款">-¥{selectedPayroll.deductions.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="实发工资" span={2}><span className="text-xl font-bold text-green-600">¥{selectedPayroll.netSalary.toLocaleString()}</span></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
