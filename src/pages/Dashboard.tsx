import { Card, Row, Col, Statistic, Table, Tag, List } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, AccountBookOutlined, WalletOutlined, BankOutlined, TeamOutlined, AlertOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useFinanceStore } from '../store/financeStore'
import { useSalaryStore } from '../store/salaryStore'
import { useBankStore } from '../store/bankStore'
import { useAccountsStore } from '../store/accountsStore'
import { useInvoiceStore } from '../store/invoiceStore'

export default function Dashboard() {
  const { records, budgets } = useFinanceStore()
  const { employees, payrolls } = useSalaryStore()
  const { accounts } = useBankStore()
  const { receivables, payables } = useAccountsStore()
  const { taxRecords } = useInvoiceStore()

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  const profit = totalIncome - totalExpense
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

  const trendOption = {
    title: { text: '收支趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'], bottom: 0 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: [230000, 280000, 250000, 320000, 290000, 350000],
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        data: [120000, 135000, 148000, 156000, 142000, 168000],
        itemStyle: { color: '#ff4d4f' },
      },
    ],
  }

  const pieOption = {
    title: { text: '支出分类', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 45000, name: '人力成本' },
          { value: 25000, name: '办公费用' },
          { value: 15000, name: '营销费用' },
          { value: 10000, name: '其他' },
        ],
      },
    ],
  }

  const budgetOption = {
    title: { text: '预算执行情况', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: budgets.map(b => b.category),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '预算',
        type: 'bar',
        data: budgets.map(b => b.amount),
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '已用',
        type: 'bar',
        data: budgets.map(b => b.spent),
        itemStyle: { color: '#faad14' },
      },
    ],
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总收入"
              value={totalIncome}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总支出"
              value={totalExpense}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="净利润"
              value={profit}
              precision={2}
              valueStyle={{ color: profit >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={<AccountBookOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="预算使用率"
              value={(totalSpent / totalBudget * 100).toFixed(1)}
              precision={1}
              valueStyle={{ color: totalSpent / totalBudget > 0.8 ? '#cf1322' : '#1890ff' }}
              prefix={<WalletOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <Card>
            <ReactECharts option={trendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <ReactECharts option={pieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={budgetOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="财务健康指标">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="银行总余额" value={accounts.reduce((s, a) => s + a.balance, 0)} prefix={<BankOutlined />} precision={2} valueStyle={{ color: '#1890ff' }} />
              </Col>
              <Col span={12}>
                <Statistic title="员工数量" value={employees.filter(e => e.status === 'active').length} prefix={<TeamOutlined />} suffix="人" />
              </Col>
            </Row>
            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <Statistic title="应收账款" value={receivables.reduce((s, r) => s + (r.amount - r.paidAmount), 0)} prefix="¥" precision={2} valueStyle={{ color: '#fa8c16' }} />
              </Col>
              <Col span={12}>
                <Statistic title="应付账款" value={payables.reduce((s, p) => s + (p.amount - p.paidAmount), 0)} prefix="¥" precision={2} valueStyle={{ color: '#cf1322' }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card title={<><AlertOutlined className="text-orange-500 mr-2" />待办提醒</>} size="small">
            <List
              size="small"
              dataSource={[
                { title: '待发放工资', count: payrolls.filter(p => p.status === 'pending').length, color: 'orange' },
                { title: '逾期应收款', count: receivables.filter(r => r.status === 'overdue').length, color: 'red' },
                { title: '待申报税款', count: taxRecords.filter(t => t.status === 'pending').length, color: 'blue' },
                { title: '即将到期应付', count: payables.filter(p => p.status === 'pending').length, color: 'orange' },
              ]}
              renderItem={item => (
                <List.Item>
                  <span>{item.title}</span>
                  <Tag color={item.color}>{item.count}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近交易" size="small">
            <Table
              size="small"
              pagination={false}
              dataSource={records.slice(-5).reverse()}
              rowKey="id"
              columns={[
                { title: '日期', dataIndex: 'date', width: 100 },
                { title: '类型', dataIndex: 'type', width: 80, render: (t: string) => <Tag color={t === 'income' ? 'green' : 'red'}>{t === 'income' ? '收入' : '支出'}</Tag> },
                { title: '描述', dataIndex: 'description' },
                { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
