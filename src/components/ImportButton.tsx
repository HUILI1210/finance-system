import { useRef } from 'react'
import { Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { readFileAsText, parseCSV } from '../utils/export'

interface ImportButtonProps {
  onImport: (data: Record<string, string>[]) => void
  accept?: string
}

export default function ImportButton({ onImport, accept = '.csv' }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await readFileAsText(file)
      const data = parseCSV(content)
      
      if (data.length === 0) {
        message.warning('文件为空或格式不正确')
        return
      }
      
      onImport(data)
      message.success(`成功导入 ${data.length} 条数据`)
    } catch {
      message.error('文件读取失败')
    }
    
    // 重置input以允许重复选择同一文件
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <Button icon={<UploadOutlined />} onClick={handleClick}>
        导入
      </Button>
    </>
  )
}
