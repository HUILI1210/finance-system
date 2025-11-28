import { useEffect, useState } from 'react'
import { Alert } from 'antd'
import { WifiOutlined } from '@ant-design/icons'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <Alert
      message={
        <span>
          <WifiOutlined className="mr-2" />
          网络已断开，部分功能可能不可用
        </span>
      }
      type="warning"
      banner
      closable
    />
  )
}
