---
title: 首页
---

# MkDocs 文档站

本站是 [mkdocs-smzhbook-theme](https://github.com/smallzh/mkdocs-smzhbook-theme) 主题的配套文档站，主体内容围绕 **MkDocs 程序本身** 展开：从 `mkdocs.yml` 配置、Markdown 写作方式，到 `mkdocs build` 的完整构建流程、插件系统与搜索功能的实现原理。

文中涉及源码的部分，均以 **MkDocs 1.6.1** 为准。

## 一站导航

### 一、MkDocs 程序说明

**使用层面**

| 文档 | 内容 |
| --- | --- |
| [mkdocs.yml 配置](mkdocs/configuration.md) | 全部常用配置项、默认值与易错点，并标出本主题额外支持的键 |
| [Markdown 文档写作](mkdocs/writing-your-docs.md) | 标题锚点、列表、链接、代码块、表格、admonition、元数据 |

**原理层面**

| 文档 | 内容 |
| --- | --- |
| [构建流程全解析](mkdocs/build-process.md) | `mkdocs build` 从 CLI 入口到收尾的五个阶段，逐步对照源码走读 |
| [搜索插件原理](mkdocs/search.md) | 索引结构、预构建机制、前端检索流程、中文分词问题排查 |
| [自定义插件](mkdocs/custom-plugins.md) | 插件开发全流程、全部事件钩子、执行优先级、日志与调试、完整示例 |
| [自定义主题](mkdocs/custom-themes.md) | `extra_css` / `custom_dir` / 独立主题包三种定制方式与模板变量参考 |

> 不知道从哪一篇开始？先看 [MkDocs 板块导读](mkdocs/index.md)，那里按「应用者」和「原理探究者」给了两条阅读路径。

### 二、主题文档

| 文档 | 内容 |
| --- | --- |
| [主题总览与安装](theme/index.md) | 特性清单、安装方式、最小配置、本地开发 |
| [定制与进阶配置](theme/advanced-config.md) | 亮暗皮肤与切换按钮、CSS 变量、字体、Mermaid 图与放大、搜索 |
| [构建与性能优化](theme/performance.md) | 构建加速、搜索索引策略、静态资源体积、图片优化 |
| [发布到 PyPI](theme/publishing-to-pypi.md) | 主题打包、TestPyPI 试发布、正式发布与版本更新 |

### 三、关于

- [关于我](about/about_me.md)
- [License](about/license.md)

## 快速开始

```shell
pip install mkdocs-smzhbook-theme
```

在 `mkdocs.yml` 中启用主题：

```yaml
site_name: Your Site Name
theme:
  name: smzhbook
```

然后 `mkdocs serve` 即可在 `http://127.0.0.1:8000` 预览。完整说明见 [主题总览与安装](theme/index.md)。

## 本站构建方式

本站自身也由 MkDocs 构建，关键配置如下：

- 主题采用 `theme.name: mkdocs` + `custom_dir: smzhbook_theme`，即**直接加载本仓库内的主题源码**，而非安装到环境里的主题包。这样改模板和样式后刷新即可看到效果。
- 依赖只装 `mkdocs`（及搜索插件内置依赖），见 `docs/requirements.txt`。

## 感谢

1. [MkDocs](https://mkdocs.readthedocs.io/) —— 简单、好用的静态站点生成器
2. [mkdocs-gitbook-theme](https://gitlab.com/lramage/mkdocs-gitbook-theme) —— 本主题的风格参考
3. [uv](https://docs.astral.sh/uv/) —— Python 项目管理器
