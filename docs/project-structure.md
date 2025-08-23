# Cinny 项目结构说明

## 概述

Cinny 是一个基于 React + TypeScript 的 Matrix 客户端，采用原子设计模式（Atomic Design）组织代码结构。项目使用 Vite 作为构建工具，Jotai 作为状态管理库。

## 目录结构

```
src/
├── app/                           # 主应用目录
│   ├── atoms/                     # 原子组件（最基础的UI组件）
│   ├── molecules/                 # 分子组件（由原子组件组合）
│   ├── organisms/                 # 有机体组件（由分子组件组合）
│   ├── components/                # 独立组件（不属于原子设计层级）
│   ├── features/                  # 功能模块（具体业务功能）
│   ├── pages/                     # 页面组件（完整页面）
│   ├── hooks/                     # 自定义Hook（状态逻辑复用）
│   ├── state/                     # 状态管理（Jotai atoms）
│   ├── utils/                     # 工具函数
│   ├── styles/                    # 样式文件
│   ├── plugins/                   # 插件系统
│   ├── partials/                  # 样式片段
│   └── i18n.ts                    # 国际化配置
├── client/                        # Matrix客户端相关
├── types/                         # TypeScript类型定义
├── util/                          # 通用工具函数
└── index.tsx                      # 应用入口
```

## 详细说明

<details>
<summary><strong>1. atoms（原子组件）</strong></summary>

最基础的UI组件，不可再分割的最小单位。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `button/` | 按钮组件 | 各种样式的按钮 |
| `input/` | 输入框组件 | 文本输入、搜索框等 |
| `modal/` | 弹窗组件 | 模态对话框 |
| `text/` | 文本组件 | 标题、段落、标签等 |
| `avatar/` | 头像组件 | 用户头像显示 |
| `badge/` | 徽章组件 | 数字徽章、状态徽章 |
| `spinner/` | 加载器组件 | 加载动画 |
| `tooltip/` | 提示组件 | 悬停提示 |
| `card/` | 卡片组件 | 内容卡片容器 |
| `chip/` | 标签组件 | 可删除的标签 |
| `context-menu/` | 右键菜单 | 上下文菜单 |
| `header/` | 头部组件 | 页面头部 |
| `scroll/` | 滚动组件 | 滚动容器 |
| `tabs/` | 标签页组件 | 标签页切换 |
| `time/` | 时间组件 | 时间显示 |
| `system-icons/` | 系统图标 | 系统级图标 |
| `segmented-controls/` | 分段控制器 | 分段选择控件 |
| `divider/` | 分割线组件 | 内容分割线 |

</details>

<details>
<summary><strong>2. molecules（分子组件）</strong></summary>

由多个原子组件组合而成的复合组件。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `dialog/` | 对话框 | 完整的对话框组件 |
| `image-upload/` | 图片上传 | 图片上传功能 |
| `people-selector/` | 人员选择器 | 选择用户组件 |
| `room-selector/` | 房间选择器 | 选择房间组件 |
| `setting-tile/` | 设置项 | 设置页面中的选项 |
| `power-level-selector/` | 权限选择器 | 选择用户权限级别 |
| `room-tile/` | 房间卡片 | 房间信息卡片 |
| `space-add-existing/` | 添加现有空间 | 添加已存在的空间 |
| `popup-window/` | 弹出窗口 | 弹出式窗口 |
| `confirm-dialog/` | 确认对话框 | 确认操作的对话框 |

</details>

<details>
<summary><strong>3. organisms（有机体组件）</strong></summary>

由多个分子组件组合而成的复杂组件，通常对应一个完整的功能。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `create-room/` | 创建房间 | 完整的房间创建流程 |
| `invite-user/` | 邀请用户 | 邀请用户到房间 |
| `join-alias/` | 加入别名 | 通过别名加入房间 |
| `profile-viewer/` | 个人资料查看器 | 查看用户资料 |
| `search/` | 搜索功能 | 消息和用户搜索 |
| `emoji-board/` | 表情面板 | 表情选择面板 |
| `pw/` | 密码相关 | 密码管理功能 |

</details>

<details>
<summary><strong>4. components（独立组件）</strong></summary>

不属于原子设计层级的独立组件，通常是特定功能的实现。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `message/` | 消息组件 | 消息显示和编辑 |
| `room-avatar/` | 房间头像 | 房间头像显示 |
| `user-avatar/` | 用户头像 | 用户头像显示 |
| `sidebar/` | 侧边栏 | 主界面侧边栏 |
| `nav/` | 导航组件 | 导航菜单 |
| `editor/` | 编辑器 | 消息编辑器 |
| `media/` | 媒体组件 | 图片、视频等媒体显示 |
| `url-preview/` | 链接预览 | 链接内容预览 |
| `upload-card/` | 上传卡片 | 文件上传界面 |
| `image-viewer/` | 图片查看器 | 图片全屏查看 |
| `pdf-viewer/` | PDF查看器 | PDF文件查看 |
| `time-date/` | 时间日期 | 时间日期显示 |
| `typing-indicator/` | 输入指示器 | 显示用户正在输入 |
| `unread-badge/` | 未读徽章 | 未读消息数量 |
| `virtualizer/` | 虚拟化组件 | 长列表虚拟化 |
| `page/` | 页面组件 | 页面布局组件 |
| `splash-screen/` | 启动画面 | 应用启动画面 |
| `sequence-card/` | 序列卡片 | 步骤序列显示 |
| `server-badge/` | 服务器徽章 | 服务器状态显示 |
| `room-card/` | 房间卡片 | 房间信息卡片 |
| `room-intro/` | 房间介绍 | 房间介绍信息 |
| `room-topic-viewer/` | 房间主题查看器 | 查看房间主题 |
| `scroll-top-container/` | 滚动到顶部容器 | 滚动控制组件 |
| `setting-tile/` | 设置项 | 设置页面选项 |
| `info-card/` | 信息卡片 | 信息显示卡片 |
| `cutout-card/` | 裁剪卡片 | 特殊形状卡片 |
| `user-profile/` | 用户资料 | 用户资料管理 |
| `presence/` | 在线状态 | 用户在线状态 |
| `power/` | 权限管理 | 用户权限管理 |
| `password-input/` | 密码输入 | 密码输入组件 |
| `member-tile/` | 成员卡片 | 房间成员信息 |
| `leave-room-prompt/` | 离开房间提示 | 离开房间确认 |
| `leave-space-prompt/` | 离开空间提示 | 离开空间确认 |
| `image-pack-view/` | 图片包查看器 | 图片包显示 |
| `image-editor/` | 图片编辑器 | 图片编辑功能 |
| `emoji-board/` | 表情面板 | 表情选择 |
| `event-readers/` | 事件读取器 | 事件内容解析 |
| `create-room/` | 创建房间 | 房间创建流程 |
| `context-menu/` | 上下文菜单 | 右键菜单 |
| `badge/` | 徽章组件 | 状态徽章 |

</details>

<details>
<summary><strong>5. features（功能模块）</strong></summary>

具体的业务功能实现，通常包含完整的业务逻辑。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `auth/` | 认证功能 | 登录、注册、密码重置 |
| `room/` | 房间功能 | 房间管理、消息处理 |
| `settings/` | 设置功能 | 用户设置、应用配置 |
| `space/` | 空间功能 | 空间管理、组织架构 |
| `user/` | 用户功能 | 用户资料、权限管理 |
| `messages/` | 消息功能 | 消息发送、编辑、删除 |
| `navigation/` | 导航功能 | 页面导航、路由管理 |
| `notifications/` | 通知功能 | 消息通知、提醒 |
| `media/` | 媒体功能 | 图片、文件上传下载 |
| `commands/` | 命令功能 | 聊天命令处理 |
| `developer/` | 开发者工具 | 调试工具、日志查看 |
| `time/` | 时间功能 | 时间显示、格式化 |
| `lobby/` | 大厅功能 | 房间大厅、欢迎页面 |
| `create-room/` | 创建房间 | 房间创建流程 |
| `create-space/` | 创建空间 | 空间创建流程 |
| `room-settings/` | 房间设置 | 房间配置管理 |
| `space-settings/` | 空间设置 | 空间配置管理 |
| `common-settings/` | 通用设置 | 通用配置选项 |
| `room-nav/` | 房间导航 | 房间列表导航 |
| `message-search/` | 消息搜索 | 消息内容搜索 |
| `join-before-navigate/` | 加入前导航 | 加入房间前的处理 |

</details>

<details>
<summary><strong>6. pages（页面组件）</strong></summary>

完整的页面组件，通常对应一个路由。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `auth/` | 认证页面 | 登录、注册、密码重置页面 |
| `client/` | 客户端页面 | 主应用界面、侧边栏、空间页面 |

</details>

<details>
<summary><strong>7. hooks（自定义Hook）</strong></summary>

状态逻辑复用的自定义Hook。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `media/` | 媒体相关Hook | 媒体处理逻辑 |
| `router/` | 路由相关Hook | 路由管理逻辑 |
| 其他文件 | 各种业务Hook | 状态管理、数据获取等 |

</details>

<details>
<summary><strong>8. state（状态管理）</strong></summary>

Jotai状态管理相关的atoms和状态逻辑。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `hooks/` | 状态Hook | 状态相关的自定义Hook |
| `room/` | 房间状态 | 房间相关的状态管理 |
| `room-list/` | 房间列表状态 | 房间列表状态管理 |
| `utils/` | 状态工具 | 状态管理工具函数 |
| 其他文件 | 各种状态atoms | 应用状态定义 |

</details>

<details>
<summary><strong>9. 其他目录</strong></summary>

| 目录 | 用途 | 说明 |
|------|------|------|
| `utils/` | 工具函数 | 通用工具函数 |
| `styles/` | 样式文件 | CSS样式定义 |
| `plugins/` | 插件系统 | 功能插件 |
| `partials/` | 样式片段 | SCSS样式片段 |

</details>

## 根目录下的其他重要目录

<details>
<summary><strong>10. client（Matrix客户端核心）</strong></summary>

Matrix协议相关的核心代码，负责与Matrix服务器的通信。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `action/` | 客户端操作 | 认证、导航等客户端操作 |
| `state/` | 客户端状态 | Matrix客户端状态管理 |
| `dispatcher.js` | 事件分发器 | 事件分发机制 |
| `initMatrix.ts` | 客户端初始化 | Matrix客户端初始化逻辑 |

</details>

<details>
<summary><strong>11. types（类型定义）</strong></summary>

TypeScript类型定义文件。

| 文件夹 | 用途 | 说明 |
|--------|------|------|
| `matrix/` | Matrix类型 | Matrix协议相关的类型定义 |
| `utils.ts` | 工具类型 | 通用工具函数的类型定义 |

</details>

<details>
<summary><strong>12. util（通用工具函数）</strong></summary>

通用工具函数，不依赖React或UI组件。

| 文件 | 用途 | 说明 |
|------|------|------|
| `matrixUtil.js` | Matrix工具 | Matrix协议相关的工具函数 |
| `sort.js` | 排序工具 | 数据排序相关函数 |
| `colorMXID.js` | 用户ID颜色 | 根据用户ID生成颜色 |
| `common.js` | 通用工具 | 通用工具函数集合 |
| `cryptE2ERoomKeys.js` | 端到端加密 | 房间密钥加密相关 |
| `AsyncSearch.js` | 异步搜索 | 异步搜索功能实现 |

</details>

<details>
<summary><strong>13. 根目录下的重要文件</strong></summary>

| 文件 | 用途 | 说明 |
|------|------|------|
| `index.tsx` | 应用入口 | React应用的根组件 |
| `index.scss` | 全局样式 | 全局SCSS样式文件 |
| `sw.ts` | Service Worker | 服务工作线程 |
| `colors.css.ts` | 颜色配置 | CSS-in-JS颜色定义 |
| `config.css.ts` | 配置样式 | CSS-in-JS配置样式 |
| `ext.d.ts` | 扩展类型 | TypeScript扩展类型定义 |

</details>

## 设计原则

1. **原子设计模式**：从原子组件到有机体组件的层次化设计
2. **功能模块化**：按业务功能组织代码
3. **组件复用**：通过组合实现组件复用
4. **状态集中管理**：使用Jotai进行状态管理
