# Cinny 国际化 (i18n) 指南

## 概述

本指南介绍如何在 Cinny 项目中实现国际化支持，使用 `react-i18next` 框架。

## 文件结构（预设）

```
public/locales/
├── en-US/                         # 英文翻译文件
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
- **嵌套 + 扁平化**：键名结构为 `命名空间:分组.[分组].键名`，其中分组基于文件所在目录的嵌套层级
- **快速定位**：键名与源码路径一一对应（如 `organisms:create-room.visibility` → `src/app/organisms/create-room/`）

### 键名生成策略

- **基于原文生成**：键名直接来源于原文文本，经过清理和截断处理
- **清理规则**：移除特殊字符，将空格转换为下划线，统一为小写
- **截断处理**：直接从原文开头开始截断5-6个不同的词汇，确保键名唯一性和可读性
- **示例转换**：
  - `"Enable end-to-end encryption"` → `"enable_end_to_end_encryption"`
  - `"Select who can join this room."` → `"select_who_can_join_this"`
  - `"Creating space..."` → `"creating_space"`
  - `"You can't disable this later."` → `"you_cant_disable_this_later"`
  - `"When someone you share a room with sends you an invite, it'll show up here."` → `"when_someone_you_share_a_room"`
  - `"Some of the following invites may contain harmful content..."` → `"some_of_the_following_invites"`

### 命名示例

```json
// organisms.json（基于文件路径的2级分组）
{
  "create-room": {
    "visibility": "Visibility",
    "space_address": "Space address",
    "room_address": "Room address",
    "enable_end_to_end_encrypt": "Enable end-to-end encryption",
    "select_your_role": "Select your role",
    "admin": "Admin",
    "founder": "Founder",
    "selecting_admin_sets_100": "Selecting Admin sets 100 power level whereas Founder sets 101.",
    "topic_optional": "Topic (optional)",
    "room_name": "{{type}} name",
    "create": "Create",
    "creating": "Creating {{type}}...",
    "home": "Home"
  },
  "room-settings": {
    "title": "Room Settings",
    "general": "General",
    "permissions": "Permissions"
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
  "create-room": {
    "creating": "Creating {{type}}...",
    "select_who_can_join": "Select who can join this {{type}}."
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
  'util'
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

### 2. 在组件中使用

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';

// 推荐：显式命名空间前缀，最稳妥
function CreateRoomComponent() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('organisms:create-room.visibility')}</h1>
      <p>{t('organisms:create-room.select_who_can_join_this', { type: isSpace ? 'space' : 'room' })}</p>
      <button>{t('organisms:create-room.create')}</button>
    </div>
  );
}

// 绑定单一命名空间：在文件顶部绑定后，键可不写前缀
function RoomComponent() {
  const { t } = useTranslation('organisms');

  return (
    <div>
      <h1>{t('create-room.visibility')}</h1> // 等价于 t('organisms:create-room.visibility')
      <p>{t('create-room.space_address')}</p>
    </div>
  );
}

// 绑定多个命名空间：按数组顺序加载并以第一个为默认
function MultiNSComponent() {
  const { t } = useTranslation(['organisms', 'features']);
  return (
    <div>
      {/* 显式前缀（推荐，避免歧义） */}
      <p>{t('organisms:create-room.visibility')}</p>
      <p>{t('features:room.create')}</p>
      {/* 或在选项里指定 ns */}
      <p>{t('create-room.visibility', { ns: 'organisms' })}</p>
    </div>
  );
}

// 带变量的翻译
function RoomComponent({ isSpace, addressValue, userHs }) {
  const { t } = useTranslation();

  return (
    <div>
      <p>{t('organisms:create-room.creating', { type: isSpace ? 'space' : 'room' })}</p>
      <p>{t('organisms:create-room.address_already_in_use', { 
        address: `#${addressValue}:${userHs}` 
      })}</p>
    </div>
  );
}
```

## 最佳实践

### 1. 键命名

- **使用小写字母和下划线**：`create_room`、`space_address`
- **基于文件路径分组**：`organisms:create-room.visibility`
- **避免过深的嵌套**：最多3级
- **基于原文生成**：直接使用原文文本，经过清理和截断处理（如 `enable_end_to_end_encrypt`）

### 2. 组织原则

- **按代码结构组织**：每个文件夹对应一个翻译文件
- **2级分组策略**：基于文件路径的前两级目录
- **通用翻译放在common**：按钮、状态、时间等
- **保持简洁**：避免过长的键名

### 3. 变量使用

- **使用有意义的变量名**：`{{type}}` 而不是 `{{value}}`
- **处理复数**：使用 `_one` 和 `_other` 后缀
- **模板字符串转换**：将复杂模板转换为简单变量插值

## 常见操作

### 添加新翻译

1. 在对应的语言文件中添加键值对
2. 在组件中使用 `t('命名空间:分组.键名')`

### 切换语言

```typescript
const { i18n } = useTranslation();
i18n.changeLanguage('zh-CN');
```

### 检查翻译完整性

可以编写脚本检查所有语言文件是否包含相同的键。

## 总结

通过遵循本指南，您可以：

1. **快速定位翻译键的位置**（`organisms:create-room.visibility` → `src/app/organisms/create-room/`）
2. **保持翻译文件的有序组织**（基于文件路径的分组）
3. **提高代码的可维护性**
