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
└── de-DE/                    # 德文翻译文件
```

## 翻译键命名规范

每个翻译文件就是一个命名空间（如 `features.json` → 命名空间 `features`），键名直接来源于原文文本，经过清理和截断处理：

- **清理规则**：移除特殊字符，将空格转换为下划线，统一为小写
- **直接截断**：从原文开头开始截断，确保键名唯一性
- **空格处理**：原文开头或结尾的空格用下划线替代
- **重名处理**：当上一层键名与下一层分组名相同时，键名前面加下划线（如 `settings` 分组和 `settings` 键 → `_settings`）
- **键名复用**：键名只能在相同分组内复用

**示例转换**：

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

## 使用方法

在组件中使用 `useTranslation` hook：

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

## 最佳实践

- **键命名**：使用小写字母和下划线，基于原文生成，开头或结尾的空格用下划线替代
- **组织原则**：按文件目录分组（`features`、`pages`、`hooks` 等），保持简洁，统一格式
- **变量使用**：使用有意义的变量名（`{{type}}` 而不是 `{{value}}`），双大括号插值

## 常见操作

**添加新翻译**：
1. 在对应的语言文件中添加键值对
2. 在组件中使用 `t('命名空间:键名')`

**切换语言**：
```typescript
const { i18n } = useTranslation();
i18n.changeLanguage('zh-CN');
```