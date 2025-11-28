import { Button, Dropdown, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { exportToCSV, exportToJSON, ExportColumn } from '../utils/export'

interface ExportButtonProps {
  data: Record<string, unknown>[]
  columns: ExportColumn[]
  filename: string
}

export default function ExportButton({ data, columns, filename }: ExportButtonProps) {
  const handleExport = (type: 'csv' | 'json') => {
    if (data.length === 0) {
      message.warning('没有数据可导出')
      return
    }
    
    if (type === 'csv') {
      exportToCSV(data, columns, filename)
      message.success('CSV导出成功')
    } else {
      exportToJSON(data, filename)
      message.success('JSON导出成功')
    }
  }

  const items = [
    { key: 'csv', label: '导出为CSV(Excel兼容)' },
    { key: 'json', label: '导出为JSON' },
  ]

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => handleExport(key as 'csv' | 'json'),
      }}
    >
      <Button icon={<DownloadOutlined />}>导出</Button>
    </Dropdown>
  )
}
