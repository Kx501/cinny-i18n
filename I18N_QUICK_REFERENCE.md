# i18n 快速参考指南

## 🚀 快速开始

### 1. 在组件中使用翻译

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <button>{t('common.save')}</button>
  );
}
```

### 2. 添加新的翻译键

1. **在组件中替换硬编码文本**:

```typescript
// 之前
<Text>Login</Text>

// 之后
<Text>{t('auth.login.title')}</Text>
```

2. **在翻译文件中添加对应翻译**:

```json
// public/locales/en.json
{
  "auth": {
    "login": {
      "title": "Login"
    }
  }
}

// public/locales/zh.json
{
  "auth": {
    "login": {
      "title": "登录"
    }
  }
}
```

---

## 📝 常用翻译键模板

### 认证模块 (已完成)

```json
{
  "auth": {
    "login": {
      "title": "Login",
      "username": "Username",
      "password": "Password",
      "loginButton": "Login",
      "forgotPassword": "Forget Password?",
      "noAccount": "Do not have an account?",
      "register": "Register",
      "hint": {
        "title": "Hint",
        "username": "Username:",
        "matrixId": "Matrix ID:",
        "email": "Email:"
      },
      "errors": {
        "serverNotSupported": "This client does not support login on \"{server}\" homeserver.",
        "serverNotAllowed": "Login with custom server not allowed by your client instance.",
        "invalidServer": "Failed to find your Matrix ID server.",
        "invalidCredentials": "Invalid Username or Password.",
        "accountDeactivated": "This account has been deactivated.",
        "invalidRequest": "Failed to login. Part of your request data is invalid.",
        "rateLimited": "Failed to login. Your login request has been rate-limited by server.",
        "unknown": "Failed to login. Unknown reason.",
        "invalidToken": "Invalid login token."
      }
    }
  }
}
```

### 设置模块 (已完成)

```json
{
  "settings": {
    "general": {
      "title": "General",
      "language": "Language",
      "languageDescription": "Choose your preferred language for the interface."
    },
    "appearance": {
      "title": "Appearance",
      "systemTheme": {
        "title": "System Theme",
        "description": "Choose between light and dark theme based on system preference."
      },
      "theme": {
        "title": "Theme",
        "description": "Theme to use when system theme is not enabled."
      }
    },
    "notifications": {
      "title": "Notifications",
      "modes": {
        "disable": "Disable",
        "notifySilent": "Notify Silent",
        "notifyLoud": "Notify Loud"
      }
    },
    "devices": {
      "title": "Devices",
      "security": "Security",
      "current": "Current Device",
      "other": {
        "title": "Other Devices",
        "deviceDashboard": {
          "title": "Device Dashboard",
          "open": "Open",
          "description": "Open device dashboard to manage your devices."
        }
      }
    }
  }
}
```

### 通用操作 (已完成)

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "loading": "Loading...",
    "logout": "Logout",
    "unknown": "Unknown",
    "settings": "Settings"
  }
}
```

### 导航模块 (已完成)

```json
{
  "navigation": {
    "search": "Search",
    "inbox": "Inbox",
    "notifications": "Notifications",
    "lobby": "Lobby",
    "messageSearch": "Message Search"
  }
}
```

---

## 🛠️ 高级用法

### 1. 插值用法

```typescript
// 翻译文件
{
  "auth": {
    "login": {
      "errors": {
        "serverNotSupported": "This client does not support login on \"{server}\" homeserver."
      }
    }
  }
}

// 组件中使用
<Text>{t('auth.login.errors.serverNotSupported', { server: serverUrl })}</Text>
```

### 2. 复数形式

```typescript
// 翻译文件
{
  "settings": {
    "devices": {
      "total": "Total: {{count}}",
      "total_plural": "Total: {{count}}"
    }
  }
}

// 组件中使用
<Text>{t('settings.devices.total', { count: deviceCount })}</Text>
```

### 3. 嵌套对象

```typescript
// 翻译文件
{
  "settings": {
    "devices": {
      "verification": {
        "steps": {
          "title": "Steps to verify from other device.",
          "openDevice": "Open your other verified device.",
          "openSettings": "Open Settings."
        }
      }
    }
  }
}

// 组件中使用
<Text>{t('settings.devices.verification.steps.title')}</Text>
```

---

## 📁 文件结构

### 翻译文件位置

```
public/locales/
├── en.json (英语)
├── zh.json (中文)
└── de.json (德语)
```

### 组件文件位置

```
src/app/
├── pages/
│   ├── auth/login/          # 认证模块
│   └── client/              # 客户端页面
├── features/
│   ├── settings/            # 设置模块
│   └── room/                # 房间模块
└── components/              # 通用组件
```

---

## 🔧 工具和脚本

### 1. 硬编码字符串检测脚本

```bash
# 运行检测脚本
node scripts/find-ui-strings.js
```

### 2. 翻译键命名规范

```
{模块}.{组件}.{功能}
示例:
- auth.login.title
- settings.general.language
- room.message.send
- error.network.connection
```

### 3. 语言切换实现

```typescript
// 语言选择器组件
const handleLanguageChange = (language: string) => {
  i18n.changeLanguage(language);
  localStorage.setItem('cinny-language', language);
};
```

---

## 📊 当前翻译状态

### 已完成模块

1. **认证模块** (100%)
   - 登录页面、密码表单、Token登录
   - 错误消息和提示信息

2. **设置界面** (95%)
   - 通用设置、通知、设备、开发者工具、表情包
   - 语言选择器功能

3. **导航组件** (80%)
   - 侧边栏、收件箱、空间页面

### 进行中模块

1. **聊天界面** (0%)
   - 房间时间线、消息组件、编辑器

2. **错误处理** (0%)
   - 网络错误、认证错误、设备管理错误

### 待办模块

1. **账户设置** (0%)
   - Profile、MatrixId、ContactInfo、IgnoredUserList

2. **关于页面** (0%)
   - 版本信息、帮助文档

---

## 🚨 常见问题

### 1. 翻译键不存在

```typescript
// 错误: 翻译键不存在
<Text>{t('nonexistent.key')}</Text>

// 解决: 检查翻译文件是否包含该键
// 或在翻译文件中添加
{
  "nonexistent": {
    "key": "Default Text"
  }
}
```

### 2. 语言切换不生效

```typescript
// 检查语言设置
console.log('Current language:', i18n.language);

// 检查localStorage
console.log('Stored language:', localStorage.getItem('cinny-language'));
```

### 3. 翻译文件加载失败

```typescript
// 检查文件路径
// public/locales/en.json 应该存在

// 检查vite配置
// vite.config.js 中应该有静态文件复制配置
```

---

## 📝 最佳实践

### 1. 翻译键命名

- 使用点分隔的层次结构
- 保持命名一致性
- 避免过长的键名

```typescript
// 好的命名
t('auth.login.title')
t('settings.general.language')

// 避免的命名
t('auth_login_title')
t('settings.general.language.setting')
```

### 2. 组件集成

- 在组件顶部导入 `useTranslation`
- 使用 `const { t } = useTranslation()`
- 替换所有硬编码文本

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('component.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 3. 翻译文件维护

- 保持所有语言文件结构一致
- 定期清理未使用的翻译键
- 使用脚本检测硬编码字符串

---

## 🔗 相关资源

- [i18next 官方文档](https://www.i18next.com/)
- [react-i18next 文档](https://react.i18next.com/)
- [Cinny 项目文档](https://github.com/ajbura/cinny)

---

**最后更新**: 2025年8月
**状态**: 持续更新中
