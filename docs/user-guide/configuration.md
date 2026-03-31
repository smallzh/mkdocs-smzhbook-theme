---
title: mkdocs.yml
---

# mkdocs.yml 文件说明

[MkDocs](https://mkdocs.readthedocs.io/) 使用 `mkdocs.yml` 作为配置文件来定义站点的各个方面。本文档详细介绍所有可用的配置选项。

## 0x01. 站点基础信息

```yaml
site_name: 站点名称              # 必填，站点标题
site_url: https://example.com/   # 站点URL，用于canonical链接
site_description: 站点描述        # HTML meta描述
site_author: 作者名               # HTML meta作者
copyright: © 2024 公司名称        # 页脚版权信息
```

## 0x02. 文档与输出目录

```yaml
docs_dir: docs      # 文档源目录，默认 'docs'
site_dir: site      # 构建输出目录，默认 'site'
```

## 0x03. 主题配置

```yaml
theme:
  name: smzhbook           # 主题名称
  custom_dir: themes/      # 自定义主题目录
  palette:                 # 颜色方案
    primary: indigo
    accent: blue
  language: zh             # 语言设置
  features:                # 主题特性
    - navigation.instant
```

## 0x04. 导航配置

```yaml
nav:
  - Home: index.md
  - Guide: 
    - user-guide/index.md
    - user-guide/configuration.md
  - API: api.md
```

## 0x05. Markdown 扩展

```yaml
markdown_extensions:
  - toc:
      permalink: true     # 启用永久链接
      baselevel: 1
  - tables              # 表格支持
  - fenced_code         # 围栏代码块
  - codehilite:         # 代码高亮
      guess_lang: false
  - admonition          # 警告框
  - pymdownx.details   # 可折叠警告框
```

## 0x06. 插件配置

```yaml
plugins:
  - search:
      separator: '[\s\-\.]+'
      prebuild_index: true
  - minify:             # 可选插件
      minify_html: true
```

## 0x07. 自定义资源

```yaml
extra_css:
  - css/extra.css

extra_javascript:
  - js/extra.js
```

## 0x08. 其他常用配置

```yaml
repo_url: https://github.com/user/repo     # 仓库URL
repo_name: my-repo                         # 仓库名称
edit_url: true                             # 编辑链接

dev_addr: 127.0.0.1:8000   # 开发服务器地址

use_directory_urls: true   # 目录化URL（/dir/ vs /dir.html）

strict: false              # 严格模式，任何警告中止构建
```

## 核心配置项详解

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `site_name` | string | 必填 | 站点标题 |
| `site_url` | URL | - | 规范URL，用于canonical链接 |
| `docs_dir` | directory | docs | 文档源目录 |
| `site_dir` | directory | site | 构建输出目录 |
| `theme` | object | mkdocs | 主题配置 |
| `nav` | list | auto | 导航结构 |
| `plugins` | list | search | 插件列表 |
| `markdown_extensions` | list | 内置扩展 | Markdown扩展 |
| `extra_css` | list | - | 自定义CSS |
| `extra_javascript` | list | - | 自定义JS |
| `repo_url` | URL | - | 仓库地址 |
| `edit_url` | URL | - | 编辑链接模板 |
