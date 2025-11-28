import { Card, Row, Col, DatePicker, Button, Table, Space, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useFinanceStore } from '../store/financeStore'
import { exportToCSV } from '../utils/export'

export default function Reports() {
  const { records } = useFinanceStore()

  const handleExportExcel = () => {
    const data = records.map(r => ({
      日期: r.date,
      类型: r.type === 'income' ? '收入' : '支出',
      类别: r.category,
      描述: r.description,
      金额: r.amount,
    }))
    exportToCSV(data as unknown as Record<string, unknown>[], [
      { title: '日期', dataIndex: '日期' },
      { title: '类型', dataIndex: '类型' },
      { title: '类别', dataIndex: '类别' },
      { title: '描述', dataIndex: '描述' },
      { title: '金额', dataIndex: '金额', render: (v: unknown) => String(v) },
    ], '财务报表')
    message.success('导出成功')
  }

  const handleExportPDF = () => {
    window.print()
    message.info('请使用浏览器打印功能保存为PDF')
  }

  const incomeByCategory = records
    .filter(r => r.type === 'income')
    .reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount
      return acc
    }, {} as Record<string, number>)

  const expenseByCategory = records
    .filter(r => r.type === 'expense')
    .reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount
      return acc
    }, {} as Record<string, number>)

  const incomePieOption = {
    title: { text: '收入构成', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: Object.entries(incomeByCategory).map(([name, value]) => ({ name, value })),
    }],
  }

  const expensePieOption = {
    title: { text: '支出构成', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })),
    }],
  }

  const summaryData = [
    { key: '1', item: '总收入', amount: records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0) },
    { key: '2', item: '总支出', amount: records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0) },
    { key: '3', item: '净利润', amount: records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0) - records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0) },
  ]

  const columns = [
    { title: '项目', dataIndex: 'item', key: 'item' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (val: number) => `¥${val.toLocaleString()}` },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">报表中心</h2>
        <Space>
          <DatePicker.RangePicker />
          <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>导出Excel</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportPDF}>导出PDF</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="收入分析">
            <ReactECharts option={incomePieOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="支出分析">
            <ReactECharts option={expensePieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Card title="财务摘要" className="mt-4">
        <Table columns={columns} dataSource={summaryData} pagination={false} />
      </Card>
    </div>
  )
}
