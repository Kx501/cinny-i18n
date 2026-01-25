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
├── de-DE/                    # German translation files
└── .../                      # Other translation files

```

## Key Concepts

Before diving into the details, here are some important concepts:

- **Namespace**: Each translation file (like `features.json`) represents a namespace. When using translations, you specify the namespace with a colon: `features:room.new_messages`
- **Translation Key**: A unique identifier for each piece of text. Keys are generated from the original English text
- **Language Code**: Standard codes like `en-US` (English, United States), `zh-CN` (Chinese, Simplified), `fr-FR` (French, France)

## Translation Key Naming Convention

Each translation file is a namespace (e.g., `features.json` → namespace `features`). Key names are directly derived from the original text, cleaned and truncated:

### Key Naming Rules

- **Cleaning rules**: Remove special characters, convert spaces to underscores, lowercase
- **Direct truncation**: Truncate from the beginning of the original text to ensure key uniqueness
- **Duplicate handling**: When the parent key name is the same as the child group name, prefix the key with an underscore (e.g., `settings` group and `settings` key → `_settings`)
- **Key name reuse**: Key names can only be reused within the same group

### Organization Principles

- **Group by namespace**: Organize translations by namespace (`components`, `features`, `hooks`, `pages`, `util`, etc.)
- **Keep it simple**: Maintain a consistent format and structure
- **Variable usage**: Use double curly braces `{{variable}}` as placeholders. Variable names should reflect the actual content (e.g., `{{count}}`, `{{type}}`, `{{version}}`), avoid using generic names (e.g., `{{value}}`). Variable names must be preserved exactly when translating, but the order of placeholders can be adjusted according to different language grammar conventions.

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

## How to Use Translations in Code

To display translated text in a React component, use the `useTranslation` hook:

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

For translations with variables, use double curly brace interpolation:

```typescript
function RoomComponent({ isSpace }) {
  const { t } = useTranslation();
  
  return (
    <p>{t('features:room.creating', { type: isSpace ? 'space' : 'room' })}</p>
  );
}
```

## Adding a New Language

To add support for a new language, follow these steps:

### Step 1: Create Translation Files

1. Create a new directory in `public/locales/` with the language code (e.g., `fr-FR` for French)
2. Copy all JSON files from `public/locales/en-US/` to the new directory:
   - `components.json`
   - `features.json`
   - `hooks.json`
   - `pages.json`
   - `util.json`
   - ...
3. Translate all the English text in these files to your target language

### Step 2: Register the Language

Add the new language to `src/app/i18n.ts` in the `SUPPORTED_LANGUAGES` array:

```typescript
export const SUPPORTED_LANGUAGES = [
  // ... existing languages ...
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
] as const;
```

**Important**:

- `code`: Use the standard language code following [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag) standard (e.g., `fr-FR`, `es-ES`, `ja-JP`)
- `name`: The English name of the language
- `nativeName`: The name of the language in its own script (e.g., `Français` for French, `日本語` for Japanese)
- Keep the array sorted alphabetically by the `name` field

### Step 3: Verify

1. Restart the development server (if running)
2. Go to Settings > General > Language
3. Your new language should appear in the language selector
4. Select it to see your translations
5. Navigate through the application to verify all translations are working
