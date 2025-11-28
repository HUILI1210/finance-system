// Excel导出工具 - 使用原生实现，无需额外依赖

export interface ExportColumn {
  title: string
  dataIndex: string
  render?: (value: unknown, record: Record<string, unknown>) => string
}

export function exportToCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string
): void {
  // 生成表头
  const headers = columns.map(col => col.title).join(',')
  
  // 生成数据行
  const rows = data.map(record => {
    return columns.map(col => {
      const value = record[col.dataIndex]
      let cellValue = col.render ? col.render(value, record) : String(value ?? '')
      // 处理包含逗号或换行的单元格
      if (cellValue.includes(',') || cellValue.includes('\n') || cellValue.includes('"')) {
        cellValue = `"${cellValue.replace(/"/g, '""')}"`
      }
      return cellValue
    }).join(',')
  }).join('\n')
  
  // 添加BOM头以支持中文
  const BOM = '\uFEFF'
  const csvContent = BOM + headers + '\n' + rows
  
  // 创建Blob并下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function exportToJSON(
  data: Record<string, unknown>[],
  filename: string
): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

// 解析CSV文件
export function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const data: Record<string, string>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = values[index] || ''
    })
    data.push(record)
  }
  
  return data
}

// 读取文件内容
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}
