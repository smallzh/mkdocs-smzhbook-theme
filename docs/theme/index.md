---
title: 主题总览与安装
---

# smzhbook 主题总览与安装

## 0x01. 这是什么

`mkdocs-smzhbook-theme` 是 [MkDocs](https://mkdocs.readthedocs.io/) 的一个主题，视觉风格参考 [mkdocs-gitbook-theme](https://gitlab.com/lramage/mkdocs-gitbook-theme) 并融入了 VitePress 式的布局与交互。它主要用于 smallzh.top 站点以及作者个人项目的文档。

主题名（在 `mkdocs.yml` 中引用的名字）是 `smzhbook`，Python 包名是 `mkdocs-smzhbook-theme`。

## 0x02. 功能特性

### 布局与导航

- **顶部导航栏**：渲染 `nav` 的一级项；一级项带子级时自动生成下拉菜单。
- **左侧侧边栏**：递归渲染完整的多级 `nav`，支持「分组 → 子组 → 叶子」三层级：
  - 一级可折叠项作为**分组标签**展示，子级默认展开；
  - 分组可点击右侧箭头手动折叠 / 展开；
  - 当前页面所在链路自动高亮。
- **右侧页面目录**：自动提取本文各级标题生成 TOC，滚动时高亮当前小节。
- **上一页 / 下一页**：依据 `nav` 顺序自动生成。
- **移动端**：侧边栏转为抽屉式，由左上角按钮开关。

### 亮 / 暗双皮肤

- 内置两套配色（GitHub 风格的浅色与深色），点击顶栏右侧的**月亮 / 太阳按钮**即可切换。
- 用户的选择写入 `localStorage`（键名 `smzh-theme`），刷新后保持；从未手动选择过的用户**跟随系统**的 `prefers-color-scheme`。
- 主题色在首屏渲染前就由一小段内联脚本应用到 `<html>` 上，因此暗色用户不会看到一闪而过的白屏。

### 站内搜索

- 依赖 MkDocs 内置的 `search` 插件，搜索入口是顶栏的搜索按钮或快捷键 <kbd>Ctrl</kbd>+<kbd>K</kbd>，结果以弹窗形式呈现，<kbd>Esc</kbd> 关闭。
- 索引由 search 插件在构建期生成，前端是纯本地检索，不依赖任何外部搜索服务。其工作原理见 [搜索插件原理](../mkdocs/search.md)。

### Mermaid 图表

- 正文里用 ` ```mermaid ` 代码块书写即可自动渲染成图。
- 点击图表可**全屏放大**：滚轮以指针为锚点缩放（1×~4×）、按住拖拽平移、双击在 1× / 2.5× 间切换，<kbd>Esc</kbd>、点击遮罩或关闭按钮退出。
- 图表会**跟随亮暗皮肤**切换配色（用 Mermaid 的 `dark` 主题重绘）。

### 其他

- **404 页面**：主题自带 `404.html`。
- **自定义样式与脚本**：通过 `extra_css` / `extra_javascript` 注入。
- **对外 API**：`window.SmzhbookTheme` 暴露了菜单、搜索、主题切换、Mermaid 放大等控制方法。

## 0x03. 主题不提供的功能

以下功能在很多主题（尤其是 Material for MkDocs）里存在，但**本主题的模板并未实现**，配置了不会有任何效果，请注意：

| 不提供 | 说明 |
| --- | --- |
| 仓库链接 / "编辑此页" | 模板不读取 `repo_url`、`edit_uri`，顶栏与正文都不会出现对应链接 |
| 页脚版权 | 不读取 `copyright` |
| Google Analytics | 不读取 `extra.analytics` / `gtag` |
| `theme.palette` | 配色方案不是通过配置项切换的，而是顶栏按钮 + CSS 变量 |
| `theme.features` | `navigation.instant` / `navigation.tabs` 等 Material 专属开关均无效 |
| `theme.logo` 之外的图标体系 | 只支持 `extra.logo` 一个图片 Logo |

需要这些能力时，可以自行在 `extra_css` / `extra_javascript` 里补，或者改写模板（见 [自定义主题](../mkdocs/custom-themes.md)）。

## 0x04. 安装

```shell
pip install mkdocs-smzhbook-theme
```

或者用 uv：

```shell
uv add mkdocs-smzhbook-theme
```

## 0x05. 最小配置

```yaml
site_name: Your Site Name

theme:
  name: smzhbook

plugins:
  - search
```

`mkdocs serve` 之后访问 `http://127.0.0.1:8000` 即可。搜索功能需要 `plugins` 里有 `search`（MkDocs 默认就会启用它，显式写出更清晰）。

## 0x06. 主题包目录结构

```
smzhbook_theme/
├── __init__.py          # Python 包标识
├── mkdocs_theme.yml     # 主题自身的配置文件
├── base.html            # 基础模板：整页骨架、顶栏、侧边栏、TOC
├── main.html            # 主模板：继承 base.html
├── nav.html             # 导航项递归模板（被 base.html 循环 include）
├── 404.html             # 404 页面
├── css/
│   └── theme.css        # 全部样式（含亮/暗两套皮肤）
└── js/
    ├── theme.js         # 全部交互（菜单、搜索、TOC、主题切换、Mermaid 放大）
    ├── jquery.min.js    # 搜索插件依赖
    └── mermaid.min.js   # Mermaid 渲染器
```

## 0x07. 本地开发（直接用源码，不装包）

改模板或样式时，更顺手的方式是让 MkDocs 直接加载仓库里的主题目录：

```yaml
theme:
  name: mkdocs            # 指定一个「父亲」，用它的模板补齐本主题没有的文件
  custom_dir: smzhbook_theme
```

这种写法下：

- `custom_dir` 里的文件会**覆盖**同名内置模板，未覆盖的沿用 `name` 指定的主题；
- **主题自己的 `mkdocs_theme.yml` 不会生效**——只有通过 `name: smzhbook` 加载时，MkDocs 才会去读它。所以本地开发时主题级配置项需要在 `mkdocs.yml` 的 `theme:` 下直接写。

本站（也就是你正在看的这个文档站）就是用这种方式构建的。

## 0x08. 主题级配置项

主题可以自带一份 `mkdocs_theme.yml` 来声明默认配置。这个文件里的键分两类：

1. **MkDocs 自己认的**：`extends`（继承父主题）、`static_templates`（需要渲染的静态模板）、`locale`（语言）。
2. **主题或插件自行读取的**：其余键会原样合并进模板上下文，通过 `config.theme.<键名>` 读取；插件也可以直接读。

本主题目前只声明了一项：

```yaml
# 提示 search 插件把 search.html 加入静态模板
include_search_page: true
```

> 注意：本主题的搜索是以**弹窗**形式提供的，并不依赖独立的搜索页。若以 `name: smzhbook` 安装使用，构建时可能提示 `Template skipped: 'search.html' not found`——它不影响功能，但如果你的构建开启了 `strict`，需要先把这一项改为 `false`。

## 0x09. 下一步

- 想改颜色、字体、开关皮肤：[定制与进阶配置](advanced-config.md)
- 想让构建更快、页面更轻：[构建与性能优化](performance.md)
- 想把主题发布成包：[发布到 PyPI](publishing-to-pypi.md)
