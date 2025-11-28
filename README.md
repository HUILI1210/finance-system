# 财务管理系统

企业级财务管理系统前端，基于 React + TypeScript + Ant Design 构建。

## 功能模块

- **仪表盘** - 财务概览、收支趋势图、预算执行情况
- **收入管理** - 收入记录的增删改查、分类筛选
- **支出管理** - 支出记录的增删改查、分类筛选
- **预算管理** - 预算设置、预算vs实际对比
- **报表中心** - 收支分析、财务摘要、导出功能
- **系统设置** - 用户管理、个人信息、密码修改

## 技术栈

- React 18 + TypeScript
- Vite (构建工具)
- Ant Design 5 (UI组件)
- React Router v6 (路由)
- Zustand (状态管理)
- ECharts (图表)
- TailwindCSS (样式)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 默认登录账号

- 用户名: `admin`
- 密码: `admin123`

## 项目结构

```
src/
├── components/     # 通用组件
│   └── Layout/     # 布局组件
├── pages/          # 页面
│   ├── Income/     # 收入管理
│   ├── Expense/    # 支出管理
│   ├── Budget/     # 预算管理
│   └── ...
├── store/          # 状态管理
├── App.tsx         # 主应用
└── main.tsx        # 入口文件
```
