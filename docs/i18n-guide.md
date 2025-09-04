# Cinny Internationalization (i18n) Guide

This guide explains how to implement internationalization support in the Cinny project using the `react-i18next` framework.

## File Structure

```
public/locales/
├── en-US/                    # English translation files
│   ├── components.json       # Component translations
│   ├── features.json         # Feature translations
│   ├── hooks.json            # Hook translations
│   ├── pages.json            # Page translations
│   └── util.json             # Utility translations
├── zh-CN/                    # Chinese translation files
└── de/                       # German translation files
```

## Translation Key Naming Convention

Each translation file is a namespace (e.g., `features.json` → namespace `features`). Key names are directly derived from the original text, cleaned and truncated:

- **Cleaning rules**: Remove special characters, convert spaces to underscores, lowercase
- **Direct truncation**: Truncate from the beginning of the original text to ensure key uniqueness
- **Space handling**: Replace leading or trailing spaces with underscores
- **Duplicate handling**: When the parent key name is the same as the child group name, prefix the key with an underscore (e.g., `settings` group and `settings` key → `_settings`)

**Example conversions**:

**File structure example**:
```
src/
├── features/
│   ├── room/
│   │   ├── RoomTimeline.tsx     // "New messages", " accepted "
│   │   ├── RoomSettings.tsx     // "Settings"
│   │   └── settings/            // Subfolder
│   │       └── SecuritySettings.tsx // "You can't disable this later."
│   └── common/
│       └── Button.tsx           // "Submit "
└── components/
    └── Header.tsx               // "Loading..."
```

**Conversion result**:
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

## Usage

Use the `useTranslation` hook in components:

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';

function RoomComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('features:room.new_messages')}</h1>
      <button>{t('features:room.jump_to_unread')}</button>
      <p>{t('hooks:desktop')}</p>
    </div>
  );
}
```

For translations with variables, use double curly brace interpolation:

```typescript
function RoomComponent({ isSpace }) {
  const { t } = useTranslation();
  
  return (
    <p>{t('features:room.creating', { type: isSpace ? 'space' : 'room' })}</p>
  );
}
```

## Best Practices

- **Key naming**: Use lowercase letters and underscores, generate based on original text, replace leading/trailing spaces with underscores
- **Organization principles**: Group by functionality (`components`, `features`, `hooks`, `pages`, `util`, etc.), keep it simple, maintain consistent format
- **Variable usage**: Use meaningful variable names (`{{type}}` instead of `{{value}}`), double curly brace interpolation

## Common Operations

**Adding new translations**:
1. Add key-value pairs to the corresponding language file
2. Use `t('namespace:key')` in components

**Switching language**:
```typescript
const { i18n } = useTranslation();
i18n.changeLanguage('en-US');
```