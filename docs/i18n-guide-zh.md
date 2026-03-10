# Cinny 国际化 (i18n) 指南

本指南介绍如何在 Cinny 项目中实现国际化支持，使用 `react-i18next` 框架。

## 文件结构

```
public/locales/
├── en-US/                    # 英文翻译文件
├── zh-CN/                    # 中文翻译文件
│   ├── components.json       # 组件翻译
│   ├── features.json         # 功能翻译
│   ├── hooks.json            # Hook翻译
│   ├── pages.json            # 页面翻译
│   └── util.json             # 工具翻译
├── de-DE/                    # 德文翻译文件
└── .../                      # 其他翻译文件
```

## 核心概念

在深入了解细节之前，这里有一些重要概念：

- **命名空间**：每个翻译文件（如 `features.json`）代表一个命名空间。使用翻译时，用冒号指定命名空间：`features:room.new_messages`
- **翻译键**：每段文本的唯一标识符。键是从原始英文文本生成的
- **语言代码**：标准代码，如 `en-US`（英语，美国）、`zh-CN`（中文，简体）、`fr-FR`（法语，法国）

## 翻译键命名规范

每个翻译文件就是一个命名空间（如 `features.json` → 命名空间 `features`），键名直接来源于原文文本，经过清理和截断处理：

### 键命名规则

- **清理规则**：移除特殊字符，将空格转换为下划线，统一为小写
- **直接截断**：从原文开头开始截断，确保键名唯一性
- **重名处理**：当上一层键名与下一层分组名相同时，键名前面加下划线（如 `settings` 分组和 `settings` 键 → `_settings`）
- **键名复用**：键名只能在相同分组内复用

### 组织原则

- **按命名空间分组**：按命名空间组织翻译（`components`、`features`、`hooks`、`pages`、`util` 等）
- **保持简洁**：保持一致的格式和结构
- **变量使用**：使用双大括号 `{{variable}}` 作为占位符。变量名应反映实际内容（如 `{{count}}`、`{{type}}`、`{{version}}`），避免使用通用名称（如 `{{value}}`）。翻译时必须保留变量名不变，但占位符的顺序可以根据不同语言的语法习惯调整。

**转换示例**：

**文件结构示例**：

```
src/
├── features/
│   ├── room/
│   │   ├── RoomTimeline.tsx     // "New messages", " accepted "
│   │   ├── RoomSettings.tsx     // "Settings"
│   │   └── settings/            // 子文件夹
│   │       └── SecuritySettings.tsx // "You can't disable this later."
│   └── common/
│       └── Button.tsx           // "Submit "
└── components/
    └── Header.tsx               // "Loading..."
```

**转换结果**：

```json
// features.json
{
  "room": {
    "new_messages": "New messages",
    "_accepted_": " accepted ",
    "_settings": "Settings",
    "settings": {
      "you_cant_disable_this_later": "You can't disable this later."
    }
  },
  "common": {
    "submit_": "Submit "
  }
}

// components.json
{
  "loading": "Loading..."
}
```

## 如何在代码中使用翻译

要在 React 组件中显示翻译文本，请使用 `useTranslation` hook：

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';

function RoomComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('features:room.new_messages')}</h1>
      <button>{t('features:room.jump_to_unread')}</button>
      <p>{t('features:room.desktop')}</p>
    </div>
  );
}
```

带变量的翻译使用双大括号插值：

```typescript
function RoomComponent({ isSpace }) {
  const { t } = useTranslation();
  
  return (
    <p>{t('features:room.creating', { type: isSpace ? 'space' : 'room' })}</p>
  );
}
```

## 添加新语言

要添加对新语言的支持，请按照以下步骤操作：

### 步骤 1：创建翻译文件

1. 在 `public/locales/` 目录下创建一个新目录，使用语言代码（例如，`fr-FR` 表示法语）
2. 从 `public/locales/en-US/` 复制所有 JSON 文件到新目录：
   - `components.json`
   - `features.json`
   - `hooks.json`
   - `pages.json`
   - `util.json`
   - ...
3. 将这些文件中的所有英文文本翻译成目标语言

### 步骤 2：注册语言

在 `src/app/i18n.ts` 文件的 `SUPPORTED_LANGUAGES` 数组中添加新语言：

```typescript
export const SUPPORTED_LANGUAGES = [
  // ... 现有语言 ...
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
] as const;
```

**重要提示**：

- `code`：使用标准语言代码（遵循 [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag) 标准，例如，`fr-FR`、`es-ES`、`ja-JP`）
- `name`：语言的英文名称
- `nativeName`：语言本身的名称（例如，法语用 `Français`）
- 保持数组按 `name` 字段的字母顺序排序

### 步骤 3：验证

1. 重启开发服务器（如果正在运行）
2. 进入 设置 > 常规 > 语言
3. 您的新语言应该出现在语言选择器中
4. 选择它以查看您的翻译
5. 浏览应用程序以验证所有翻译是否正常工作
