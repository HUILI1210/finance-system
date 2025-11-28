import { Tag, Tooltip } from 'antd'

const APP_VERSION = '1.0.0'
const BUILD_DATE = '2024-11-28'

export default function AppVersion() {
  return (
    <Tooltip title={`构建日期: ${BUILD_DATE}`}>
      <Tag color="blue" className="cursor-pointer">
        v{APP_VERSION}
      </Tag>
    </Tooltip>
  )
}

export { APP_VERSION, BUILD_DATE }
