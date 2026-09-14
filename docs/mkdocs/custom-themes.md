---
title: 自定义主题
---

# 自定义自己的主题

MkDocs 支持三种由浅入深的主题定制方式，分别对应「只改样式」「改模板」「另做一个主题包」三种需求。

## 0x01. 使用 extra_css 和 extra_javascript

最简单的方式，不动模板，只通过 `mkdocs.yml` 追加样式和脚本：

```yaml
extra_css:
  - stylesheets/custom.css

extra_javascript:
  - javascripts/custom.js
```

**适用场景**：

- 修改颜色、字体、间距等样式
- 添加简单的交互功能
- 不需要改动 HTML 结构

这两个键注入的位置由主题决定。以本主题为例，`extra_css` 在主题样式之后、`extra_javascript` 在主题脚本之前，见 [定制与进阶配置](../theme/advanced-config.md)。

## 0x02. 使用 theme.custom_dir

通过 `custom_dir` **逐文件覆盖**主题的模板和静态资源：

```yaml
theme:
  name: mkdocs          # 基于 mkdocs 主题改造
  custom_dir: overrides
```

在 `overrides/` 里放置需要覆盖的文件，路径与主题目录内保持一致：

```
overrides/
├── main.html          # 覆盖主模板
├── base.html          # 覆盖基础模板
├── css/
│   └── theme.css      # 覆盖样式
└── js/
    └── custom.js      # 追加脚本（也可通过 extra_javascript）
```

**覆盖规则**：

- 同名文件覆盖主题的同名文件，其余文件沿用主题；
- 覆盖的模板可以用 `{% extends %}` 继承原模板，因此能只改一部分；
- 模板继承环境中只有 `extrahead` 之类的**块**可覆盖，具体有哪些块取决于主题，见 [0x07](#0x07-模板块blocks)。

**用 `super()` 在原内容之外追加**：

```jinja2
{# overrides/main.html #}
{% extends "base.html" %}

{% block extrahead %}
{{ super() }}
<link rel="stylesheet" href="{{ 'css/site.css'|url }}">
{% endblock %}
```

还可以用 `static_templates` 声明需要额外渲染成静态页面的模板：

```yaml
theme:
  static_templates:
    - 404.html
```

## 0x03. 新建主题项目（独立主题包）

要做一个能被 `pip install` 的主题，就得把它做成 Python 包并在入口点里注册。

**最小可用结构**：

```
my_theme/                    # Python 包
├── __init__.py              # 必需：MkDocs 靠它定位主题目录
├── mkdocs_theme.yml         # 必需：主题配置，缺失会直接报错
├── main.html                # 必需：每个页面都用它渲染
├── base.html                # 被 main.html 继承（约定俗成）
├── 404.html                 # 可选：静态模板
├── css/
│   └── theme.css
└── js/
    └── theme.js
```

为什么 `__init__.py` 是必需的：MkDocs 解析主题目录的方式是**加载入口点指向的模块，再取其 `__file__` 所在的目录**。所以入口点的值必须指向主题目录**里面**的那个模块。

**注册入口点（`pyproject.toml`）**：

```toml
[project.entry-points."mkdocs.themes"]
my_theme = "my_theme"
```

装好之后，站点里就能写 `theme: {name: my_theme}` 了。本文档站的主题 `smzhbook` 就是这么注册的。

## 0x04. 主题继承机制

继承父主题有两条链，作用相同、写法不同：

| 方式 | 写在哪 | 典型用途 |
| --- | --- | --- |
| `theme.custom_dir` | 站点自己的 `mkdocs.yml` | 站点临时改造某个主题 |
| `extends` | 主题包的 `mkdocs_theme.yml` | 主题基于另一个主题做分支 |

```yaml
# mkdocs_theme.yml —— 声明本主题的父主题
extends: mkdocs
```

查找顺序（**越靠前优先级越高**，同名文件前者覆盖后者）：

```
custom_dir → 当前主题 → extends 指定的父主题 → MkDocs 内置兜底
```

一个容易踩的坑：**通过 `custom_dir` 加载时，该目录下的 `mkdocs_theme.yml` 不会被读取**。主题级配置只有在以 `name: <主题名>` 加载时才生效。

## 0x05. 主题配置的读取机制

`mkdocs_theme.yml` 里的键，MkDocs 只挑走固定的几个，**其余键原样合并进模板上下文**，用 `config.theme.<键名>` 读取。

MkDocs 自己认的键只有四个：

| 键 | 作用 |
| --- | --- |
| `extends` | 父主题名 |
| `static_templates` | 需要渲染成静态页面的模板列表 |
| `locale` | 界面语言，用于自动装载主题 `locales/` 下的翻译 |
| `version` | 主题版本号，模板里读 `config.theme.version` |

其余一切都看**有没有人读它**：

- `include_search_page`、`search_index_only` —— 被内置的 search 插件读取，是**真有效**的键；
- `navigation.tabs`、`search.highlight` 这类长在 `features:` 列表里的开关 —— 那是 **Material for MkDocs** 的约定，由 Material 自己的模板读取。写在别的主题里，MkDocs 不会报错，但**也不会有任何效果**；
- 你自己定义的键（比如 `sidebar_collapsed: true`）—— 只要你的模板里写 `{{ config.theme.sidebar_collapsed }}`，它就能用。

## 0x06. 模板变量参考

MkDocs 给每个模板注入的上下文（源码见 `mkdocs/commands/build.py` 的 `get_context()`）：

| 变量 | 说明 |
| --- | --- |
| `config` | 配置对象：`config.site_name`、`config.theme.xxx`、`config.extra.xxx` |
| `nav` | 导航对象：`nav.items`（当前层级项列表）、`nav.homepage`，项可递归取 `children` |
| `pages` | 全部文档页面列表 |
| `page` | 当前页面（渲染页面时存在） |
| `base_url` | 当前页面到站点根的相对路径，如 `../..` |
| `extra_css` / `extra_javascript` | 已解析成相对当前页 URL 的列表 |
| `mkdocs_version` | MkDocs 版本号 |
| `build_date_utc` | 构建时间 |

常用的页面属性：

| 变量 | 说明 |
| --- | --- |
| `page.title` | 页面标题（nav 标签 > front matter `title` > 正文 H1，按此优先级） |
| `page.content` | 正文 HTML |
| `page.toc` | 本页目录树，每项有 `title` / `url` / `children` |
| `page.url` / `page.abs_url` | 相对 / 绝对 URL |
| `page.previous_page` / `page.next_page` | 上一页 / 下一页对象 |
| `page.edit_url` | 编辑链接，由 `repo_url` + `edit_uri` 拼出，**需要自己在模板里渲染** |

`nav` 和 `config.nav` 不是一回事：`nav` 是渲染好的 `Navigation` 对象（项有 `title`、`url`、`children`、`active`）；`config.nav` 是 `mkdocs.yml` 里的**原始字典列表**（形如 `{'标题': '路径.md'}`），取不到 `title`/`url`，遍历时要用 `nav`。

## 0x07. 模板块（Blocks）

MkDocs 核心**不定义任何块**，"可覆盖块"完全由主题自己的模板决定——所以换一个主题，可用的块就完全不同。

**本主题（smzhbook）**只定义了两个块：

| 块 | 位置 | 用途 |
| --- | --- | --- |
| `extrahead` | `base.html` 的 `<head>` 内 | 注入 meta / link / style |
| `content` | `base.html` 的 `.vp-doc` 内 | 覆盖正文区 |

所以要覆盖样式表、脚本、页脚等位置时，本主题没有对应的块可用，只能：

1. 用 `extra_css` / `extra_javascript` 注入（推荐）；
2. 或在 `custom_dir` 里放一份自己的 `base.html` 直接改。

作为对照，MkDocs 内置的 `mkdocs` 主题定义了 `site_meta`、`htmltitle`、`styles`、`contents`、`footer`、`scripts` 等块——在别的主题文档里看到的块名，未必对当前主题有效。

## 0x08. 模板里可用的过滤器

MkDocs 为模板环境注入了两个自定义过滤器：

```jinja2
{# 相对当前页解析路径，自动处理 ../ 层级 #}
<link rel="stylesheet" href="{{ 'css/site.css'|url }}">

{# 生成带 defer 的 <script> 标签 #}
{{ 'js/site.js'|script_tag }}
```

跨页面引用资源时务必走 `|url`，直接写 `/css/site.css` 会在非根路径的子目录部署下失效。

## 0x09. 参考

- 内置主题源码：`mkdocs/themes/mkdocs/`（可直接对照学习）
- 本站主题源码：本仓库根目录的 `smzhbook_theme/`
- [官方主题开发文档](https://www.mkdocs.org/dev-guide/themes/)
