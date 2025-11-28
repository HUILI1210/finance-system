import { useState } from 'react'
import { Modal, Button, Upload, message, Space, Card, Typography, Divider } from 'antd'
import { DownloadOutlined, UploadOutlined, DatabaseOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

const STORAGE_KEYS = [
  'finance-storage',
  'salary-storage',
  'bank-storage',
  'accounts-storage',
  'invoice-storage',
  'contract-storage',
  'expense-storage',
  'quotation-storage',
  'auth-storage',
]

export default function DataBackup() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExportBackup = () => {
    const dataObj: Record<string, unknown> = {}
    
    STORAGE_KEYS.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          dataObj[key] = JSON.parse(data)
        } catch {
          dataObj[key] = data
        }
      }
    })

    const backupData = {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      data: dataObj
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    message.success('数据备份成功！')
  }

  const handleImportBackup = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string)
        
        if (!backupData.data || !backupData.version) {
          message.error('无效的备份文件格式')
          return
        }

        Modal.confirm({
          title: '确认恢复数据？',
          icon: <ExclamationCircleOutlined />,
          content: (
            <div>
              <p>备份时间: {backupData.exportTime}</p>
              <p className="text-red-500">警告: 这将覆盖当前所有数据！</p>
            </div>
          ),
          okText: '确认恢复',
          cancelText: '取消',
          okType: 'danger',
          onOk: () => {
            Object.entries(backupData.data).forEach(([key, value]) => {
              localStorage.setItem(key, JSON.stringify(value))
            })
            message.success('数据恢复成功！页面将自动刷新...')
            setTimeout(() => window.location.reload(), 1500)
          },
        })
      } catch {
        message.error('备份文件解析失败')
      }
    }
    reader.readAsText(file)
    return false
  }

  const handleClearData = () => {
    Modal.confirm({
      title: '确认清空所有数据？',
      icon: <ExclamationCircleOutlined />,
      content: <p className="text-red-500">警告: 此操作不可恢复！建议先备份数据。</p>,
      okText: '确认清空',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        STORAGE_KEYS.forEach(key => localStorage.removeItem(key))
        message.success('数据已清空！页面将自动刷新...')
        setTimeout(() => window.location.reload(), 1500)
      },
    })
  }

  const getDataSize = () => {
    let total = 0
    STORAGE_KEYS.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) total += data.length
    })
    return (total / 1024).toFixed(2)
  }

  return (
    <>
      <Button icon={<DatabaseOutlined />} onClick={() => setIsModalOpen(true)}>
        数据管理
      </Button>

      <Modal
        title={<><DatabaseOutlined className="mr-2" />数据备份与恢复</>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        <Card size="small" className="mb-4">
          <Text type="secondary">当前数据大小: </Text>
          <Text strong>{getDataSize()} KB</Text>
        </Card>

        <Paragraph type="secondary">
          数据存储在浏览器本地，清除浏览器数据会导致丢失。建议定期备份。
        </Paragraph>

        <Divider />

        <Space direction="vertical" className="w-full" size="middle">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExportBackup}
            block
          >
            导出备份文件
          </Button>

          <Upload
            accept=".json"
            showUploadList={false}
            beforeUpload={handleImportBackup}
          >
            <Button icon={<UploadOutlined />} block>
              导入备份文件
            </Button>
          </Upload>

          <Button danger onClick={handleClearData} block>
            清空所有数据
          </Button>
        </Space>
      </Modal>
    </>
  )
}
