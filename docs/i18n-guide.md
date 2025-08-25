# Cinny 国际化 (i18n) 指南

## 概述

本指南介绍如何在 Cinny 项目中实现国际化支持，使用 `react-i18next` 框架。

## 文件结构

```
public/locales/
├── en/                         # 英文翻译文件
│   ├── common.json             # 通用翻译（按钮、状态、时间等）
│   ├── atoms.json              # app/atoms/ 组件翻译
│   ├── molecules.json          # app/molecules/ 组件翻译
│   ├── organisms.json          # app/organisms/ 组件翻译
│   ├── components.json         # app/components/ 组件翻译
│   ├── features.json           # app/features/ 功能翻译
│   ├── pages.json              # app/pages/ 页面翻译
│   ├── hooks.json              # app/hooks/ Hook翻译
│   ├── utils.json              # app/utils/ 工具翻译
│   ├── state.json              # app/state/ 状态翻译
│   ├── styles.json             # app/styles/ 样式翻译
│   ├── plugins.json            # app/plugins/ 插件翻译
│   ├── partials.json           # app/partials/ 部分组件翻译
│   ├── client.json             # client/ 客户端翻译
│   ├── util.json               # util/ 工具翻译
│   └── types.json              # types/ 类型翻译
├── zh-CN/                      # 中文翻译文件
└── de/                         # 德文翻译文件
```

## 翻译键命名规范

### 基本原则
- **文件即命名空间**：每个翻译文件就是一个命名空间（如 `organisms.json` → 命名空间 `organisms`）
- **文件内不包同名根键**：直接从分组开始（如 `room.*`），避免 `organisms.room.*` 这类重复前缀
- **快速定位**：键名与源码路径一一对应（如 `organisms:room.changed_room_name` → `src/app/organisms/room/*`）
- **内部使用扁平结构**：最多 2-3 级，便于维护

### 命名示例

```json
// atoms.json（不包同名根键，直接从分组开始）
{
  "button": {
    "primary": "主要按钮",
    "secondary": "次要按钮",
    "danger": "危险按钮"
  },
  "input": {
    "placeholder": "请输入...",
    "error": "输入错误"
  }
}

// features.json（同理）
{
  "settings": {
    "title": "设置",
    "language": "语言",
    "theme": "主题"
  },
  "room": {
    "create": "创建房间",
    "join": "加入房间",
    "leave": "离开房间"
  }
}
```

### 变量插值
使用双大括号 `{{变量名}}` 进行变量插值：

```json
{
  "features": {
    "room": {
      "member_joined": "{{name}} 加入了房间",
      "unread_count": "{{count}} 条未读消息"
    }
  }
}
```

## 技术实现

### 1. 基础配置

```typescript
// src/app/i18n.ts
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { trimTrailingSlash } from './utils/common';

// 定义命名空间列表
export const NAMESPACES = [
  'common',
  'atoms',
  'molecules', 
  'organisms',
  'components',
  'features',
  'pages',
  'hooks',
  'utils',
  'state',
  'styles',
  'plugins',
  'partials',
  'client',
  'util',
  'types'
] as const;

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }
] as const;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
    ns: NAMESPACES,
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: `${trimTrailingSlash(import.meta.env.BASE_URL)}/public/locales/{{lng}}/{{ns}}.json`,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### 2. 在组件中使用（含多命名空间）

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';

// 推荐：显式命名空间前缀，最稳妥
function MyComponent() {
  const { t } = useTranslation();
  return (
    <div>
      <button>{t('atoms:button.primary')}</button>
      <h1>{t('features:settings.title')}</h1>
    </div>
  );
}

// 绑定单一命名空间：在文件顶部绑定后，键可不写前缀
function ButtonComponent() {
  const { t } = useTranslation('atoms');

  return (
    <button>{t('button.primary')}</button> // 等价于 t('atoms:button.primary')
  );
}

// 绑定多个命名空间：按数组顺序加载并以第一个为默认
function MultiNSComponent() {
  const { t } = useTranslation(['organisms', 'features']);
  return (
    <div>
      {/* 显式前缀（推荐，避免歧义） */}
      <p>{t('organisms:room.changed_room_name')}</p>
      {/* 或在选项里指定 ns */}
      <p>{t('room.changed_room_name', { ns: 'organisms' })}</p>
    </div>
  );
}

// 带变量的翻译
function RoomComponent({ userName, messageCount }) {
  const { t } = useTranslation();

  return (
    <div>
      <p>{t('features:room.member_joined', { name: userName })}</p>
      <p>{t('features:room.unread_count', { count: messageCount })}</p>
    </div>
  );
}
```

## 最佳实践

### 1. 键命名
- **使用小写字母和下划线**：`member_joined`
- **避免过深的嵌套**：最多3级
- **使用描述性的名称**：`room.create` 而不是 `create`

### 2. 组织原则
- **按代码结构组织**：每个文件夹对应一个翻译文件
- **通用翻译放在common**：按钮、状态、时间等
- **保持简洁**：避免过长的键名

### 3. 变量使用
- **使用有意义的变量名**：`{{userName}}` 而不是 `{{name}}`
- **处理复数**：使用 `_one` 和 `_other` 后缀

## 常见操作

### 添加新翻译
1. 在对应的语言文件中添加键值对
2. 在组件中使用 `t('文件名.键名')`

### 切换语言
```typescript
const { i18n } = useTranslation();
i18n.changeLanguage('zh-CN');
```

### 检查翻译完整性
可以编写脚本检查所有语言文件是否包含相同的键。

## 总结

通过遵循本指南，您可以：
1. 快速定位翻译键的位置（`atoms.button.primary` → `src/app/atoms/button/`）
2. 保持翻译文件的有序组织
3. 提高代码的可维护性
