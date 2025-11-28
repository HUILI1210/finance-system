import { useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, InputNumber, Select, Card, Row, Col, Statistic, Popconfirm, message, Descriptions, Space, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CalculatorOutlined } from '@ant-design/icons'
import { useSalaryStore, SalaryFormula, SalaryFormulaType, calculateSalary } from '../../store/salaryStore'

const formulaTypes: { value: SalaryFormulaType; label: string; color: string }[] = [
  { value: 'fixed', label: '固定月薪', color: 'blue' },
  { value: 'hourly', label: '计时工资', color: 'green' },
  { value: 'piece', label: '计件工资', color: 'orange' },
  { value: 'commission', label: '销售提成', color: 'purple' },
  { value: 'mixed', label: '混合制', color: 'cyan' },
]

export default function SalaryFormulaList() {
  const { salaryFormulas, addSalaryFormula, updateSalaryFormula, deleteSalaryFormula } = useSalaryStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [testOpen, setTestOpen] = useState(false)
  const [selectedFormula, setSelectedFormula] = useState<SalaryFormula | null>(null)
  const [testResult, setTestResult] = useState<{ grossSalary: number; details: Record<string, number>; description: string } | null>(null)
  const [form] = Form.useForm()
  const [testForm] = Form.useForm()

  const openModal = (formula?: SalaryFormula) => {
    setSelectedFormula(formula || null)
    if (formula) {
      form.setFieldsValue(formula)
    } else {
      form.resetFields()
      form.setFieldsValue({ 
        type: 'fixed', 
        isActive: true,
        socialInsuranceRate: 10,
        housingFundRate: 8,
        overtimeRate: 1.5,
        commissionRates: [],
        performanceRatios: [{ level: 'A', ratio: 1.2 }, { level: 'B', ratio: 1.0 }, { level: 'C', ratio: 0.8 }]
      })
    }
    setIsModalOpen(true)
  }

  const showDetail = (formula: SalaryFormula) => {
    setSelectedFormula(formula)
    setDetailOpen(true)
  }

  const openTest = (formula: SalaryFormula) => {
    setSelectedFormula(formula)
    testForm.resetFields()
    setTestResult(null)
    setTestOpen(true)
  }

  const handleTest = () => {
    if (!selectedFormula) return
    testForm.validateFields().then(values => {
      const result = calculateSalary(selectedFormula, values)
      setTestResult(result)
    })
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const data: SalaryFormula = {
        ...values,
        id: selectedFormula?.id || Date.now().toString(),
        commissionRates: values.commissionRates || [],
        performanceRatios: values.performanceRatios || [],
      }
      if (selectedFormula) {
        updateSalaryFormula(selectedFormula.id, data)
        message.success('更新成功')
      } else {
        addSalaryFormula(data)
        message.success('创建成功')
      }
      setIsModalOpen(false)
    })
  }

  const handleDelete = (id: string) => {
    deleteSalaryFormula(id)
    message.success('删除成功')
  }

  const getTypeTag = (type: SalaryFormulaType) => {
    const item = formulaTypes.find(t => t.value === type)
    return item ? <Tag color={item.color}>{item.label}</Tag> : <Tag>{type}</Tag>
  }

  const columns = [
    { title: '公式名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t: SalaryFormulaType) => getTypeTag(t) },
    { title: '描述', dataIndex: 'description', key: 'description', width: 250 },
    { title: '基本工资', dataIndex: 'baseSalary', key: 'baseSalary', render: (v: number) => v > 0 ? `¥${v.toLocaleString()}` : '-' },
    { title: '社保比例', dataIndex: 'socialInsuranceRate', key: 'socialInsuranceRate', render: (v: number) => `${v}%` },
    { title: '状态', dataIndex: 'isActive', key: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    {
      title: '操作', key: 'action', width: 220,
      render: (_: unknown, record: SalaryFormula) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)}>详情</Button>
          <Button icon={<CalculatorOutlined />} size="small" onClick={() => openTest(record)}>测试</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const formType = Form.useWatch('type', form)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">工资公式管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新建公式</Button>
      </div>

      <Row gutter={16} className="mb-4">
        {formulaTypes.map(t => (
          <Col span={4} key={t.value}>
            <Card size="small">
              <Statistic 
                title={t.label} 
                value={salaryFormulas.filter(f => f.type === t.value).length} 
                suffix="个"
              />
            </Card>
          </Col>
        ))}
        <Col span={4}>
          <Card size="small">
            <Statistic title="总计" value={salaryFormulas.length} suffix="个" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={salaryFormulas} rowKey="id" />
      </Card>

      {/* 新建/编辑公式弹窗 */}
      <Modal title={selectedFormula ? '编辑工资公式' : '新建工资公式'} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)} width={700}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="公式名称" rules={[{ required: true }]}>
                <Input placeholder="如：技术岗绩效制" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="计算类型" rules={[{ required: true }]}>
                <Select options={formulaTypes.map(t => ({ label: t.label, value: t.value }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="适用场景说明" />
          </Form.Item>

          <Divider>薪资配置</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="baseSalary" label="基本工资" initialValue={0}>
                <InputNumber className="w-full" min={0} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="positionAllowance" label="岗位津贴" initialValue={0}>
                <InputNumber className="w-full" min={0} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" label="状态" initialValue={true}>
                <Select options={[{ label: '启用', value: true }, { label: '停用', value: false }]} />
              </Form.Item>
            </Col>
          </Row>

          {(formType === 'hourly' || formType === 'mixed') && (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="hourlyRate" label="时薪" initialValue={0}>
                  <InputNumber className="w-full" min={0} prefix="¥" suffix="/小时" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="overtimeRate" label="加班倍率" initialValue={1.5}>
                  <InputNumber className="w-full" min={1} max={3} step={0.5} />
                </Form.Item>
              </Col>
            </Row>
          )}

          {formType === 'piece' && (
            <Form.Item name="pieceRate" label="计件单价" initialValue={0}>
              <InputNumber className="w-full" min={0} prefix="¥" suffix="/件" />
            </Form.Item>
          )}

          {formType === 'commission' && (
            <Form.Item name="commissionBase" label="提成底薪" initialValue={0}>
              <InputNumber className="w-full" min={0} prefix="¥" />
            </Form.Item>
          )}

          <Divider>扣款配置</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="socialInsuranceRate" label="社保比例(%)" initialValue={10}>
                <InputNumber className="w-full" min={0} max={30} suffix="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="housingFundRate" label="公积金比例(%)" initialValue={8}>
                <InputNumber className="w-full" min={0} max={20} suffix="%" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal title="公式详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={600}>
        {selectedFormula && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="公式名称">{selectedFormula.name}</Descriptions.Item>
            <Descriptions.Item label="类型">{getTypeTag(selectedFormula.type)}</Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{selectedFormula.description}</Descriptions.Item>
            <Descriptions.Item label="基本工资">¥{selectedFormula.baseSalary.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="岗位津贴">¥{selectedFormula.positionAllowance.toLocaleString()}</Descriptions.Item>
            {selectedFormula.hourlyRate > 0 && <Descriptions.Item label="时薪">¥{selectedFormula.hourlyRate}/小时</Descriptions.Item>}
            {selectedFormula.pieceRate > 0 && <Descriptions.Item label="计件单价">¥{selectedFormula.pieceRate}/件</Descriptions.Item>}
            {selectedFormula.commissionBase > 0 && <Descriptions.Item label="提成底薪">¥{selectedFormula.commissionBase}</Descriptions.Item>}
            <Descriptions.Item label="社保比例">{selectedFormula.socialInsuranceRate}%</Descriptions.Item>
            <Descriptions.Item label="公积金比例">{selectedFormula.housingFundRate}%</Descriptions.Item>
            {selectedFormula.commissionRates.length > 0 && (
              <Descriptions.Item label="提成阶梯" span={2}>
                {selectedFormula.commissionRates.map((r, i) => (
                  <Tag key={i}>¥{r.min.toLocaleString()}-{r.max.toLocaleString()}: {r.rate}%</Tag>
                ))}
              </Descriptions.Item>
            )}
            {selectedFormula.performanceRatios.length > 0 && (
              <Descriptions.Item label="绩效系数" span={2}>
                {selectedFormula.performanceRatios.map((r, i) => (
                  <Tag key={i}>{r.level}: ×{r.ratio}</Tag>
                ))}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 测试计算弹窗 */}
      <Modal title="工资计算测试" open={testOpen} onCancel={() => setTestOpen(false)} footer={null} width={500}>
        {selectedFormula && (
          <>
            <Card size="small" className="mb-4">
              <p><strong>公式：</strong>{selectedFormula.name}</p>
              <p><strong>类型：</strong>{getTypeTag(selectedFormula.type)}</p>
            </Card>
            <Form form={testForm} layout="vertical">
              {selectedFormula.type === 'hourly' && (
                <>
                  <Form.Item name="hoursWorked" label="工作小时数" initialValue={176}>
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                  <Form.Item name="overtimeHours" label="加班小时数" initialValue={0}>
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </>
              )}
              {selectedFormula.type === 'piece' && (
                <Form.Item name="piecesCompleted" label="完成件数" initialValue={0}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              )}
              {selectedFormula.type === 'commission' && (
                <Form.Item name="salesAmount" label="销售额" initialValue={0}>
                  <InputNumber className="w-full" min={0} prefix="¥" />
                </Form.Item>
              )}
              {(selectedFormula.type === 'fixed' || selectedFormula.type === 'mixed') && (
                <Form.Item name="performanceLevel" label="绩效等级">
                  <Select options={selectedFormula.performanceRatios.map(r => ({ label: `${r.level}级 (×${r.ratio})`, value: r.level }))} />
                </Form.Item>
              )}
              {selectedFormula.type === 'mixed' && (
                <Form.Item name="overtimeHours" label="加班小时数" initialValue={0}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              )}
              <Button type="primary" onClick={handleTest} block>计算</Button>
            </Form>
            {testResult && (
              <Card size="small" className="mt-4" title="计算结果">
                <p className="text-gray-500">{testResult.description}</p>
                <Divider />
                {Object.entries(testResult.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span>{key}</span>
                    <span>¥{value.toLocaleString()}</span>
                  </div>
                ))}
                <Divider />
                <div className="flex justify-between font-bold text-lg">
                  <span>应发合计</span>
                  <span className="text-green-600">¥{testResult.grossSalary.toLocaleString()}</span>
                </div>
              </Card>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
