---
title: MkDocs 板块导读
---

# MkDocs 程序说明 · 导读

本板块是本站的主体，内容是 **MkDocs 程序本身** 的使用说明与原理剖析，与 smzhbook 主题无关——换成任何其他主题，这些内容依然成立。

## 两条阅读路径

### 路径 A：我只想用起来

按顺序读这四篇，够用了：

1. [mkdocs.yml 配置](configuration.md) —— 搞清配置文件里每个键干什么
2. [Markdown 文档写作](writing-your-docs.md) —— 站内支持哪些 Markdown 写法
3. [自定义主题](custom-themes.md) —— 想改样式、改模板时怎么做
4. [发布到 PyPI](../theme/publishing-to-pypi.md) —— 把成果打包发出去（本站主题自己的发布流程）

### 路径 B：我想知道它内部怎么跑

按构建的时间顺序读，三篇正好串成一条链：

1. [构建流程全解析](build-process.md) —— `mkdocs build` 从命令行到产出 `site/` 的五个阶段，逐步对照 `mkdocs/commands/build.py` 走读
2. [自定义插件](custom-plugins.md) —— 上面那个流程里一共有哪些事件钩子、按什么顺序触发，你能在哪些点插手
3. [搜索插件原理](search.md) —— 用内置的 search 插件当范例，看一个真实插件如何贯穿整个构建流程并产出前端可用的索引

> 建议顺序不要颠倒：先有构建流程的全局印象，再看钩子在流程中的位置，最后看一个完整插件如何把所有钩子串起来。

## 各篇速览

| 文档 | 一句话 | 适合谁 |
| --- | --- | --- |
| [mkdocs.yml 配置](configuration.md) | MkDocs 全部常用配置项、默认值与易错点，并区分「MkDocs 通用键」和「主题自定义键」 | 所有人 |
| [Markdown 文档写作](writing-your-docs.md) | 站内可用的 Markdown 元素清单 + 内置与推荐扩展 + 元数据写法 | 所有人 |
| [构建流程全解析](build-process.md) | 逐行走读构建源码：配置加载、文件发现、导航树、页面渲染、静态模板、收尾，附事件时序表与 Dirty Build 机制 | 想改主题/写插件的人 |
| [搜索插件原理](search.md) | 搜索索引的数据结构、预构建（prebuild_index）机制、前端 worker 检索流程，以及中文分词踩坑 | 做站内搜索或排查搜索问题的人 |
| [自定义插件](custom-plugins.md) | BasePlugin 与 config_scheme、四类事件钩子全解、优先级与 CombinedEvent、日志、打包发布，含三个完整示例 | 想给构建流程加自动化的人 |
| [自定义主题](custom-themes.md) | 从 `extra_css` 到独立主题包的三级定制方式，以及模板变量与可覆盖块参考 | 想改外观的人 |

## 版本说明

本文档的内核版本是 **MkDocs 1.6.1**。较老的教程里常见的以下说法已经过时，阅读时注意区分：

- `theme.palette`、`theme.features`（如 `navigation.instant`）是 **Material for MkDocs** 主题的配置项，**不属于** MkDocs 核心，在非 Material 主题下写了也不会生效。
- 配置键是 `edit_uri`（可写 `edit_uri: edit/main/docs/` 这类模板），而 `edit_url` 是**页面变量**（`page.edit_url`），两者不是一回事。
- `prebuild_index` 在 1.6 中仍可用，但 `true` / `node` 两种取值属于旧语义，只有在构建环境里有 Node.js 时才推荐开启。

## 相关资源

- [MkDocs 官方文档](https://mkdocs.readthedocs.io/)
- [写作你的主题（官方）](https://www.mkdocs.org/dev-guide/themes/)
- [插件开发（官方）](https://www.mkdocs.org/dev-guide/plugins/)
