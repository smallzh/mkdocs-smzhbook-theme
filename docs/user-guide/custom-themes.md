---
title: Custom Themes
---

# 自定义自己的主题

MkDocs 提供了三种方式来支持主题的自定义，从简单到复杂如下：

## 0x01. 使用 extra_css 和 extra_javascript 属性

最简单的方式是通过 `mkdocs.yml` 配置自定义 CSS 和 JavaScript：

```yaml
extra_css:
  - css/custom.css

extra_javascript:
  - js/custom.js
```

**适用场景**：
- 修改颜色、字体、间距等样式
- 添加简单的交互功能
- 不需要修改 HTML 结构

## 0x02. 使用 theme.custom_dir

通过 `custom_dir` 覆盖父主题的部分模板和静态资源：

```yaml
theme:
  name: mkdocs        # 基于 mkdocs 主题
  custom_dir: themes/custom/
```

在 `themes/custom/` 目录下放置需要覆盖的文件：
- 模板文件（.html）
- CSS 文件
- JavaScript 文件
- 图片等静态资源

**覆盖规则**：
- 同名文件会覆盖父主题
- 其他文件沿用父主题
- 支持模板继承

```themes/custom/
├── base.html          # 覆盖基础模板
├── main.html          # 覆盖主模板
├── css/
│   └── theme.css      # 覆盖样式
└── js/
    └── custom.js      # 添加自定义脚本
```

**使用 super() 合并内容**：
```jinja2
{% block styles %}
{{ super() }}
<style>
  /* 自定义样式 */
</style>
{% endblock %}
```

## 0x03. 新建主题项目（独立主题包）

创建完全独立的主题包，类似本项目（smzhbook）的方式。

**项目结构**：
```
my_theme/
├── __init__.py              # Python 包标识
├── mkdocs_theme.yml         # 主题配置
├── base.html                # 基础模板（必需）
├── main.html                # 主模板
├── content.html             # 内容模板
├── nav.html                 # 导航模板
├── toc.html                 # 目录模板
├── 404.html                 # 404 页面
├── css/
│   └── theme.css            # 主题样式
└── js/
    └── theme.js              # 主题脚本
```

**主题配置文件 mkdocs_theme.yml**：
```yaml
# 主题名称
name: my_theme

# 主题特性
features:
  - navigation.instant    # 即时导航
  - navigation.tracking   # 链接跟踪
  - navigation.tabs       # 标签页导航
  - navigation.sections  # 分组导航
  - search.highlight     # 搜索高亮
  - search.suggest       # 搜索建议

# 静态模板
static_templates:
  - 404.html
```

**入口点配置 pyproject.toml**：
```toml
[project.entry-points."mkdocs.themes"]
my_theme = "my_theme"
```

## 主题继承机制

MkDocs 支持主题继承，通过 `extends` 指定父主题：

```yaml
# mkdocs_theme.yml
name: my_theme
extends: mkdocs
```

继承链：
```
custom_dir → 当前主题 → 父主题 → MkDocs 内置模板
```

## 模板变量参考

**全局上下文变量**：
- `config` - MkDocs 配置对象
- `nav` - 导航对象
- `pages` - 所有页面列表
- `base_url` - 基础 URL
- `mkdocs_version` - MkDocs 版本

**页面变量**：
- `page.title` - 页面标题
- `page.content` - 页面内容（HTML）
- `page.toc` - 页面目录
- `page.url` - 页面 URL
- `page.abs_url` - 绝对 URL
- `page.edit_url` - 编辑链接

## 模板块（Blocks）

base.html 中定义的可覆盖块：
- `site_meta` - meta 标签
- `htmltitle` - 页面标题
- `styles` - 样式表
- `libs` - 第三方库
- `extrahead` - 头部额外内容
- `site_name` - 站点名称
- `site_nav` - 站点导航
- `search_button` - 搜索按钮
- `next_prev` - 上一页/下一页
- `repo` - 仓库链接
- `content` - 页面内容
- `footer` - 页脚
- `scripts` - 脚本
