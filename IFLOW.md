# MkDocs Smzhbook Theme 项目说明

## 项目概述

这是一个为 smallzh.top 网站定制的 MkDocs 主题项目。该主题基于 MkDocs 静态站点生成器构建，提供了一个简洁、易用的文档展示方案。

**项目信息：**
- 项目名称：mkdocs-smzhbook-theme
- 版本：1.1
- 许可证：BSD-2-Clause
- 作者：smallzh (smallzh@yeah.net)
- 源码仓库：https://github.com/smallzh/mkdocs-smzhbook-theme

**主要技术栈：**
- Python 3.x（用于主题打包）
- Jinja2 模板引擎（用于 HTML 模板渲染）
- CSS（用于样式定制）
- JavaScript（用于前端交互）
- MkDocs >= 1.5（静态站点生成器）
- PureCSS（外部 CSS 框架）
- jQuery（外部 JavaScript 库）

**核心特性：**
- 支持多级导航递归渲染
- 集成搜索功能（基于 MkDocs 搜索插件）
- 支持页面目录（TOC）显示
- 支持上一页/下一页导航
- 支持编辑链接（指向源码仓库）
- 支持自定义 CSS 和 JavaScript
- 支持 Google Analytics 集成

## 项目结构

```
mkdocs-smzhbook-theme/
├── smzhbook_theme/          # 主题核心目录
│   ├── base.html           # 基础 HTML 模板（定义页面结构和元数据）
│   ├── main.html           # 主页面模板（继承自 base.html）
│   ├── nav.html            # 导航模板（支持递归多级导航）
│   ├── search.html         # 搜索页面模板
│   ├── mkdocs_theme.yml    # 主题配置文件
│   ├── css/
│   │   └── theme.css       # 主题样式文件
│   └── js/
│       └── theme.js        # 主题 JavaScript 文件
├── docs/                   # 文档目录（主题的使用文档）
│   ├── index.md            # 文档首页
│   ├── about/              # 关于主题的文档
│   │   ├── contributing.md
│   │   ├── license.md
│   │   └── release-notes/
│   └── user-guide/         # 用户指南
│       ├── configuration.md
│       ├── custom-themes.md
│       ├── deploying-your-docs.md
│       ├── styling-your-docs.md
│       └── writing-your-docs.md
├── mkdocs.yml              # MkDocs 配置示例文件
├── pyproject.toml          # Python 项目配置文件（用于打包发布）
├── README.md               # 项目说明文档
├── LICENSE                 # 许可证文件
└── .gitignore             # Git 忽略文件配置
```

## 构建和运行

### 开发环境设置

项目使用 `uv` 作为包管理器进行依赖管理。

**1. 创建虚拟环境**
```bash
uv venv .venv
```

**2. 安装依赖**
```bash
uv pip install mkdocs
```

**3. 启动开发服务器**
```bash
uv run mkdocs serve
```

这将启动一个本地开发服务器，通常在 `http://127.0.0.1:8000` 上运行，支持热重载。

### 构建静态站点

```bash
uv run mkdocs build
```

这将生成静态站点文件到 `site/` 目录。

### 打包和发布

项目使用 `hatchling` 作为构建后端。

**1. 安装构建工具**
```bash
# 如果尚未安装
pip install build twine
```

**2. 构建分发包**
```bash
python -m build
```

这将生成 `dist/` 目录，包含源码包和 wheel 包。

**3. 发布到 PyPI**
```bash
twine upload dist/*
```

**注意：** 发布前需要配置 PyPI 凭据。

## 开发约定

### 模板开发约定

1. **Jinja2 模板语法**
   - 使用 Jinja2 模板引擎进行模板开发
   - 使用 `{{ variable }}` 输出变量
   - 使用 `{% block %}` 定义可重写的块
   - 使用 `{% extends "base.html" %}` 继承模板

2. **模板继承结构**
   - `base.html`：基础模板，定义页面结构、头部信息、元数据
   - `main.html`：主页面模板，继承自 base.html
   - `nav.html`：导航模板，支持递归渲染多级导航
   - `search.html`：搜索页面，继承自 base.html

3. **MkDocs 变量使用**
   - `{{ config.site_name }}`：站点名称
   - `{{ page.title }}`：页面标题
   - `{{ page.content }}`：页面内容
   - `{{ nav }}`：导航结构
   - `{{ page.toc }}`：页面目录
   - `{{ base_url }}`：基础 URL

4. **资源引用**
   - 使用 `|url` 过滤器生成正确的 URL：`{{ "css/theme.css"|url }}`
   - 外部资源（如 PureCSS、jQuery）通过 CDN 引入

### CSS 开发约定

1. **样式文件位置**
   - 所有主题样式放在 `smzhbook_theme/css/theme.css`
   - 用户自定义样式通过 `extra_css` 配置添加

2. **类名约定**
   - 使用 `.active` 标记当前激活的导航项
   - 保持类名简洁明了

### JavaScript 开发约定

1. **脚本文件位置**
   - 所有主题脚本放在 `smzhbook_theme/js/theme.js`
   - 用户自定义脚本通过 `extra_javascript` 配置添加

2. **依赖管理**
   - jQuery 通过 CDN 引入（版本 3.3.1）
   - 避免使用过于复杂的依赖

### 配置文件约定

1. **mkdocs_theme.yml**
   - 定义主题特定配置
   - 当前配置：`include_search_page: true`（启用搜索页面）

2. **pyproject.toml**
   - 使用 `hatchling` 作为构建后端
   - 定义项目元数据、依赖、入口点
   - 入口点：`mkdocs.themes` -> `smzhbook = "smzhbook_theme"`

### 版本管理

1. **版本号格式**
   - 使用语义化版本号（Semantic Versioning）
   - 当前版本：1.1

2. **发布流程**
   - 更新 `pyproject.toml` 中的版本号
   - 更新 `docs/about/release-notes/` 中的发布说明
   - 运行构建和测试
   - 发布到 PyPI

### 代码风格

1. **HTML 模板**
   - 使用 2 空格缩进
   - 添加注释说明关键功能
   - 保持模板结构清晰

2. **CSS**
   - 使用 4 空格缩进
   - 保持样式简洁

3. **Python**
   - 遵循 PEP 8 规范
   - 使用 4 空格缩进

## 使用方式

### 在 MkDocs 项目中使用

1. **安装主题**
```bash
pip install mkdocs-smzhbook-theme
```

2. **配置 mkdocs.yml**
```yaml
site_name: Your Site Name
theme:
  name: smzhbook
```

3. **自定义样式和脚本**
```yaml
extra_css:
  - custom.css

extra_javascript:
  - custom.js
```

### 本地开发主题

1. 克隆仓库
2. 在 MkDocs 项目中通过 `theme.dir` 指向本地主题目录
```yaml
theme:
  name: null
  dir: /path/to/mkdocs-smzhbook-theme/smzhbook_theme
```

## 依赖项

**核心依赖：**
- mkdocs >= 1.5

**构建依赖：**
- hatchling

**外部资源（CDN）：**
- PureCSS 1.0.0
- jQuery 3.3.1

## 参考资源

- [MkDocs 官方文档](https://mkdocs.readthedocs.io/)
- [MkDocs 主题开发文档](https://www.mkdocs.org/user-guide/writing-your-theme/)
- [mkdocs-basic-theme](https://mkdocs.github.io/mkdocs-basic-theme/)（本主题的基础参考）
- [uv 文档](https://docs.astral.sh/uv/)
- [hatchling 文档](https://hatch.pypa.io/latest/)

## 注意事项

1. 主题使用外部 CDN 资源（PureCSS、jQuery），离线使用时需要考虑
2. 搜索功能依赖 MkDocs 搜索插件
3. 编辑链接功能需要配置 `repo_url` 和 `edit_url`
4. Google Analytics 需要在配置中启用
5. 主题支持自定义 CSS 和 JavaScript，通过 `extra_css` 和 `extra_javascript` 配置