import { useState } from 'react'
import { Table, Button, Space, Select, Tag, Modal, Descriptions, message, InputNumber, Form } from 'antd'
import { EyeOutlined, CheckOutlined, DownloadOutlined } from '@ant-design/icons'
import { useSalaryStore, Payroll, calculateSalary, SalaryFormulaType } from '../../store/salaryStore'
import { useFinanceStore } from '../../store/financeStore'
import Permission from '../../components/Permission'

const formulaTypeNames: Record<SalaryFormulaType, string> = {
  fixed: '固定月薪',
  hourly: '计时工资',
  piece: '计件工资',
  commission: '销售提成',
  mixed: '混合制',
}

export default function PayrollList() {
  const { payrolls, employees, salaryStructures, salaryFormulas, updatePayroll, addPayroll } = useSalaryStore()
  const { addRecord } = useFinanceStore()
  const [selectedMonth, setSelectedMonth] = useState('2024-01')
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [generateForm] = Form.useForm()

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

  const openGenerateModal = () => {
    generateForm.resetFields()
    setGenerateModalOpen(true)
  }

  const handleGenerate = () => {
    generateForm.validateFields().then(formValues => {
      const existingIds = payrolls.filter(p => p.month === selectedMonth).map(p => p.employeeId)
      let generatedCount = 0
      
      employees
        .filter(e => e.status === 'active' && !existingIds.includes(e.id))
        .forEach(e => {
          const structure = salaryStructures.find(s => s.employeeId === e.id)
          const formula = salaryFormulas.find(f => f.id === e.salaryFormulaId)
          
          if (!structure) return
          
          // 使用工资公式计算
          let grossSalary = structure.baseSalary + structure.positionAllowance
          let performanceBonus = 0
          let overtime = 0
          let commission = 0
          let calculationDetails = ''
          const formulaType: SalaryFormulaType = formula?.type || 'fixed'
          
          if (formula) {
            const params = {
              baseSalaryOverride: structure.baseSalary,
              hoursWorked: formValues[`hours_${e.id}`] || 176,
              overtimeHours: formValues[`overtime_${e.id}`] || 0,
              piecesCompleted: formValues[`pieces_${e.id}`] || 0,
              salesAmount: formValues[`sales_${e.id}`] || 0,
              performanceLevel: formValues[`performance_${e.id}`] || 'B',
            }
            
            const result = calculateSalary(formula, params)
            grossSalary = result.grossSalary
            calculationDetails = result.description
            
            performanceBonus = result.details['绩效奖金'] || 0
            overtime = result.details['加班费'] || result.details['加班工时'] || 0
            commission = result.details['销售提成'] || 0
          }
          
          const socialInsurance = Math.round(structure.baseSalary * (formula?.socialInsuranceRate || 10) / 100)
          const housingFund = Math.round(structure.baseSalary * (formula?.housingFundRate || 8) / 100)
          const deductTotal = socialInsurance + housingFund
          const taxableIncome = grossSalary - deductTotal - 5000
          const tax = Math.max(0, Math.round(taxableIncome * 0.1))
          const netSalary = Math.round(grossSalary - deductTotal - tax)
          
          const payroll: Payroll = {
            id: Date.now().toString() + e.id,
            employeeId: e.id,
            employeeName: e.name,
            department: e.department,
            month: selectedMonth,
            formulaType,
            baseSalary: structure.baseSalary,
            positionAllowance: structure.positionAllowance,
            performanceBonus,
            overtime,
            commission,
            hoursWorked: formValues[`hours_${e.id}`],
            piecesCompleted: formValues[`pieces_${e.id}`],
            salesAmount: formValues[`sales_${e.id}`],
            deductions: 0,
            socialInsurance,
            housingFund,
            tax,
            grossSalary,
            netSalary,
            status: 'pending',
            calculationDetails,
          }
          
          addPayroll(payroll)
          generatedCount++
        })
      
      setGenerateModalOpen(false)
      message.success(`已生成 ${generatedCount} 条工资单`)
    })
  }

  const totalNet = filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0)
  const paidCount = filteredPayrolls.filter(p => p.status === 'paid').length

  const columns = [
    { title: '员工姓名', dataIndex: 'employeeName', key: 'employeeName', width: 90 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 80 },
    { title: '工资类型', dataIndex: 'formulaType', key: 'formulaType', width: 90,
      render: (t: SalaryFormulaType) => <Tag color="blue">{formulaTypeNames[t] || t}</Tag>
    },
    { title: '基本工资', dataIndex: 'baseSalary', key: 'baseSalary', width: 100, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '绩效/提成', key: 'bonus', width: 100,
      render: (_: unknown, r: Payroll) => `¥${((r.performanceBonus || 0) + (r.commission || 0)).toLocaleString()}`
    },
    { title: '扣款', key: 'deduct', width: 90, render: (_: unknown, r: Payroll) => `¥${(r.socialInsurance + r.housingFund + r.tax).toLocaleString()}` },
    { title: '实发工资', dataIndex: 'netSalary', key: 'netSalary', width: 100, render: (v: number) => <span className="font-bold text-green-600">¥{v.toLocaleString()}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s === 'paid' ? '已发放' : '待发放'}</Tag> },
    {
      title: '操作', key: 'action', width: 140,
      render: (_: unknown, record: Payroll) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)}>详情</Button>
          {record.status === 'pending' && (
            <Permission action="update">
              <Button icon={<CheckOutlined />} size="small" type="primary" onClick={() => handlePay(record.id)}>发放</Button>
            </Permission>
          )}
        </Space>
      ),
    },
  ]

  // 获取需要生成工资的员工列表
  const employeesToGenerate = employees.filter(e => {
    const existingIds = payrolls.filter(p => p.month === selectedMonth).map(p => p.employeeId)
    return e.status === 'active' && !existingIds.includes(e.id)
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">工资单管理</h2>
        <Space>
          <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 150 }} options={[
            { label: '2024年1月', value: '2024-01' },
            { label: '2024年2月', value: '2024-02' },
            { label: '2024年3月', value: '2024-03' },
            { label: '2024年11月', value: '2024-11' },
            { label: '2024年12月', value: '2024-12' },
          ]} />
          <Permission action="create">
            <Button onClick={openGenerateModal} disabled={employeesToGenerate.length === 0}>
              生成工资单 ({employeesToGenerate.length})
            </Button>
          </Permission>
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
            <Descriptions.Item label="工资类型"><Tag color="blue">{formulaTypeNames[selectedPayroll.formulaType]}</Tag></Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={selectedPayroll.status === 'paid' ? 'green' : 'orange'}>{selectedPayroll.status === 'paid' ? '已发放' : '待发放'}</Tag></Descriptions.Item>
            <Descriptions.Item label="计算说明">{selectedPayroll.calculationDetails || '-'}</Descriptions.Item>
            <Descriptions.Item label="基本工资">¥{selectedPayroll.baseSalary.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="岗位津贴">¥{selectedPayroll.positionAllowance.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="绩效奖金">¥{selectedPayroll.performanceBonus.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="提成/加班">¥{((selectedPayroll.commission || 0) + selectedPayroll.overtime).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="社保扣款">-¥{selectedPayroll.socialInsurance.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="公积金扣款">-¥{selectedPayroll.housingFund.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="个人所得税">-¥{selectedPayroll.tax.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="其他扣款">-¥{selectedPayroll.deductions.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="实发工资" span={2}><span className="text-xl font-bold text-green-600">¥{selectedPayroll.netSalary.toLocaleString()}</span></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 生成工资单Modal */}
      <Modal 
        title={`生成${selectedMonth}工资单`} 
        open={generateModalOpen} 
        onOk={handleGenerate} 
        onCancel={() => setGenerateModalOpen(false)} 
        width={700}
        okText="生成"
      >
        <p className="mb-4 text-gray-500">请为以下员工填写工资计算参数：</p>
        <Form form={generateForm} layout="vertical">
          {employeesToGenerate.map(e => {
            const formula = salaryFormulas.find(f => f.id === e.salaryFormulaId)
            return (
              <div key={e.id} className="border rounded p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{e.name} - {e.department}</span>
                  <Tag color="blue">{formula ? formulaTypeNames[formula.type] : '未设置公式'}</Tag>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(formula?.type === 'hourly' || formula?.type === 'mixed') && (
                    <>
                      <Form.Item name={`hours_${e.id}`} label="工作小时" initialValue={176}>
                        <InputNumber className="w-full" min={0} />
                      </Form.Item>
                      <Form.Item name={`overtime_${e.id}`} label="加班小时" initialValue={0}>
                        <InputNumber className="w-full" min={0} />
                      </Form.Item>
                    </>
                  )}
                  {formula?.type === 'piece' && (
                    <Form.Item name={`pieces_${e.id}`} label="完成件数" initialValue={0}>
                      <InputNumber className="w-full" min={0} />
                    </Form.Item>
                  )}
                  {formula?.type === 'commission' && (
                    <Form.Item name={`sales_${e.id}`} label="销售额" initialValue={0}>
                      <InputNumber className="w-full" min={0} prefix="¥" />
                    </Form.Item>
                  )}
                  {(formula?.type === 'fixed' || formula?.type === 'mixed') && (
                    <Form.Item name={`performance_${e.id}`} label="绩效等级" initialValue="B">
                      <Select options={[
                        { label: 'A级 (优秀)', value: 'A' },
                        { label: 'B级 (良好)', value: 'B' },
                        { label: 'C级 (合格)', value: 'C' },
                        { label: 'D级 (待改进)', value: 'D' },
                      ]} />
                    </Form.Item>
                  )}
                </div>
              </div>
            )
          })}
        </Form>
      </Modal>
    </div>
  )
}
