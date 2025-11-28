import { useEffect } from 'react'
import { Form, Input, InputNumber, DatePicker, Select, Button, Card, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useFinanceStore } from '../../store/financeStore'

const categories = ['销售收入', '服务收入', '投资收益', '其他收入']

export default function IncomeForm() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { id } = useParams()
  const { records, addRecord, updateRecord } = useFinanceStore()
  const isEdit = !!id

  useEffect(() => {
    if (isEdit) {
      const record = records.find(r => r.id === id)
      if (record) {
        form.setFieldsValue({
          ...record,
          date: dayjs(record.date),
        })
      }
    }
  }, [id, isEdit, records, form])

  const onFinish = (values: { category: string; description: string; amount: number; date: dayjs.Dayjs }) => {
    const data = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
      type: 'income' as const,
    }

    if (isEdit) {
      updateRecord(id, data)
      message.success('更新成功')
    } else {
      addRecord({
        ...data,
        id: Date.now().toString(),
        createdAt: dayjs().format('YYYY-MM-DD'),
      })
      message.success('添加成功')
    }
    navigate('/income')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card title={isEdit ? '编辑收入' : '新增收入'}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="category" label="类别" rules={[{ required: true, message: '请选择类别' }]}>
            <Select placeholder="选择类别" options={categories.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true, message: '请输入描述' }]}>
            <Input placeholder="输入描述" />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber className="w-full" min={0} precision={2} placeholder="输入金额" prefix="¥" />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item>
            <div className="flex gap-4">
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={() => navigate('/income')}>取消</Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
