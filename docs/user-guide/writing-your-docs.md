---
title: Writing Markdown
---

# 写 Markdown 文档

MkDocs 基于 Python-Markdown，支持标准的 Markdown 语法以及丰富的扩展功能。

## 0x01. 可用的元素

### 标题与锚点

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

MkDocs 使用 `toc` 扩展自动为标题生成锚点 ID。锚点 ID 规则：
- 标题文本转小写
- 空格替换为连字符
- 移除非法字符
- 合并连续连字符

### 列表

**无序列表**：
```markdown
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
```

**有序列表**：
```markdown
1. 第一项
2. 第二项
3. 第三项
```

**任务列表**（需启用 `pymdownx.task_list` 扩展）：
```markdown
- [x] 已完成任务
- [ ] 待办任务
```

### 链接

**内部链接**：
```markdown
[链接文字](page.md)
[相对路径](../guide/index.md)
```

**外部链接**：
```markdown
[MkDocs](https://www.mkdocs.org/)
```

**锚点链接**：
```markdown
[跳转到标题](#标题文本)
```

### 图片与媒体

```markdown
![替代文字](image.png)
![替代文字](images/photo.jpg "可选标题")
```

支持的文件格式：PNG, JPG, GIF, SVG, PDF 等

### 代码块

**围栏代码块**：
~~~markdown
```python
def hello():
    print("Hello, World!")
```
~~~

**指定语言**：`python`, `javascript`, `bash`, `yaml`, `json`, `html`, `css` 等

**行号显示**（需 highlight 扩展）：
~~~markdown
```python linenums="1"
def hello():
    print("Hello")
```
~~~

### 表格

```markdown
| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
```

**对齐方式**：
```markdown
| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 内容   | 内容 |   内容 |
```

### 强调文本

```markdown
**粗体**
*斜体*
~~删除线~~
```

### 水平线

```markdown
---
```

## 0x02. MkDocs 扩展

### 内置扩展

MkDocs 默认启用的扩展：
- `meta` - 元数据支持
- `toc` - 目录生成
- `tables` - 表格语法
- `fenced_code` - 围栏代码块

### 推荐扩展

在 `mkdocs.yml` 中配置：

```yaml
markdown_extensions:
  # 目录
  - toc:
      permalink: true
  
  # 代码高亮
  - codehilite:
      guess_lang: false
      css_class: highlight
  
  # 警告框 (note, warning, tip, danger)
  - admonition
  
  # 可折叠警告框
  - pymdownx.details
  
  # 围栏代码块增强
  - pymdownx.superfences
  
  # 标记
  - pymdownx.mark
  
  # 高亮
  - pymdownx.highlight
  
  # 任务列表
  - pymdownx.task_list
  
  # 智能引号
  - smarty
```

### 警告框（Admonitions）

```markdown
!!! note "可选标题"
    这是一个备注

!!! warning "警告"
    这是一个警告

!!! tip "提示"
    这是一个技巧

!!! danger "危险"
    这是一个危险提示
```

渲染效果：
- `note` - 蓝色提示
- `warning` - 黄色警告
- `tip` - 绿色提示
- `danger` - 红色危险

## 0x03. 元数据（Front Matter）

每篇文档可以在开头添加 YAML 元数据：

```yaml
---
title: 页面标题
description: 页面描述
author: 作者
date: 2024-01-01
tags:
  - 教程
  - 入门
---

# 正文内容...
```

## 0x04. 最佳实践

1. **标题层级**：建议使用 H1-H3，避免过深嵌套
2. **代码块**：始终指定语言以启用语法高亮
3. **链接**：使用相对路径，避免硬编码 URL
4. **图片**：统一放在 `docs/images/` 目录
5. **表格**：保持简洁，避免过宽的表格
