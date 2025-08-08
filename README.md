# Cinny i18n

## 📚 文档概览

本项目包含i18n国际化实施计划和相关文档，系统性地将Cinny Matrix客户端从英文硬编码转换为多语言支持。

---

## 📋 文档列表

### 1. [I18N_IMPLEMENTATION_PLAN.md](./I18N_IMPLEMENTATION_PLAN.md)

**详细实施计划**

- 完整的项目概述和现状分析
- 分阶段的工作流程 (5个阶段，8-12周)
- 技术实现细节和代码示例
- 测试策略和资源链接

### 2. [I18N_PROGRESS_TRACKER.md](./I18N_PROGRESS_TRACKER.md)

**进度跟踪**

- 任务完成状态
- 里程碑跟踪
- 每阶段任务计划

### 3. [I18N_QUICK_REFERENCE.md](./I18N_QUICK_REFERENCE.md)

**快速参考指南**

- 常用代码示例
- 翻译键模板
- 高级用法说明
- 常见问题解答

---

## 🎯 项目现状

### ✅ 已完成

- i18n框架配置完整
- 支持3种语言 (英语、中文、德语)
- 基础翻译文件结构
- 400+个翻译键实现

### ❌ 待完成

- 语言选择器功能
- 95%+的UI文本翻译
- 完整的翻译键体系
- 多语言测试

### 📊 关键数据

- **总文件数**: 736个
- **当前翻译覆盖率**: 0.14%
- **目标翻译键**: 500-1000个
- **预期完成时间**: 8-12周

---

## 🚀 快速开始

### 1. 了解现状

阅读 [I18N_IMPLEMENTATION_PLAN.md](./I18N_IMPLEMENTATION_PLAN.md) 了解项目背景和整体计划。

### 2. 查看进度

查看 [I18N_PROGRESS_TRACKER.md](./I18N_PROGRESS_TRACKER.md) 了解当前进度和下一步任务。

### 3. 开始开发

参考 [I18N_QUICK_REFERENCE.md](./I18N_QUICK_REFERENCE.md) 获取代码示例和最佳实践。

---

## 📝 使用指南

### 翻译人员

1. **翻译文件**: 在 `public/locales/` 目录下添加翻译
2. **翻译键**: 遵循命名规范 `{模块}.{组件}.{功能}`
3. **质量检查**: 确保翻译的准确性和一致性
4. **现有代码修改**: 逐步替换硬编码文本
5. **测试**: 确保多语言环境下的正确显示

---

## 📚 相关资源

### 技术文档

- [i18next 官方文档](https://www.i18next.com/)
- [react-i18next 文档](https://react.i18next.com/)
- [Cinny 项目文档](https://github.com/ajbura/cinny)

---

**最后更新**: 2025年8月
**文档版本**: v1.0.0
**状态**: 计划中
