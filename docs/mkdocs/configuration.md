---
title: mkdocs.yml 配置
---

# mkdocs.yml 配置

`mkdocs.yml` 是 MkDocs 唯一的配置文件，站点的目录、主题、导航、插件全部在这里定义。本篇按功能分类列出常用配置项，**默认值均以 MkDocs 1.6.1 为准**。

## 0x01. 配置文件怎么被找到

- 默认读取当前工作目录下的 `mkdocs.yml`；也可以用 `mkdocs build -f 路径/配置.yml` 指定。
- 配置里的相对路径，**都相对于配置文件所在目录**解析，而不是当前工作目录。
- 顶层键写错名字会直接报错（`Unrecognised configuration name`），不会静默忽略——但也只覆盖 MkDocs 已知的键，主题私有键的拼写错误需要主题自己校验。

## 0x02. 站点基础信息

```yaml
site_name: 站点名称              # 必填，站点标题，同时用于 HTML <title>
site_url: https://example.com/   # 站点最终发布的根 URL，用于 sitemap、canonical 链接
site_description: 站点描述        # 写入 <meta name="description">
site_author: 作者名               # 写入 <meta name="author">
copyright: © 2026 作者            # 页脚版权（注意：smzhbook 主题未渲染此字段）
```

| 键 | 默认值 | 必填 |
| --- | --- | --- |
| `site_name` | 无 | 是 |
| `site_url` | 无 | 否，但使用 sitemap 类插件时建议填 |
| `site_description` | 无 | 否 |
| `site_author` | 无 | 否 |
| `copyright` | 无 | 否 |

## 0x03. 目录与输出

```yaml
docs_dir: docs    # 文档源目录
site_dir: site    # 构建输出目录
```

| 键 | 默认值 |
| --- | --- |
| `docs_dir` | `docs` |
| `site_dir` | `site` |

两个目录不能互相包含，`site_dir` 也不能落在 `docs_dir` 里。

## 0x04. 主题

```yaml
theme:
  name: smzhbook            # 主题名；写 null 表示不用任何主题（完全自定义时用）
  custom_dir: overrides     # 覆盖目录，优先级高于 name 指定的主题
  locale: zh                # 界面语言（主题需自带对应翻译）
  static_templates:         # 需要渲染成静态页面的模板
    - 404.html
  features: []              # 注意：这是主题自定义键，不是 MkDocs 通用键
```

要点：

- `name` 只写主题名，MkDocs 通过包入口点 `mkdocs.themes` 找到它。本例中 `smzhbook` 对应 Python 包 `mkdocs-smzhbook-theme`。
- `custom_dir` 里的文件会**逐文件覆盖** `name` 主题的同名文件，其余沿用。它是本地改主题最常用的手段。
- **主题私有键**（如 Material 的 `palette`、`features`）由主题模板自行读取，MkDocs 核心不认。在非 Material 主题下写这些不会生效也不会报错。
- `locale` 是 MkDocs 真正会读取的键，用来自动装载主题 `locales/` 下的翻译。

本主题（smzhbook）实际读取的 `theme` 下的键只有 `name`、`custom_dir`、`locale`、`static_templates` 和 `version`（由包元数据自动注入）。它的配色不通过配置项切换，而是顶栏按钮 + CSS 变量，详见 [定制与进阶配置](../theme/advanced-config.md)。

## 0x05. 导航 nav

`nav` 决定页面顺序与层级，同时驱动顶栏、侧边栏和「上一页 / 下一页」。**不写 `nav` 时，MkDocs 按文件名自动生成一份**。

```yaml
nav:
  - 首页: index.md
  - 指南:                  # 有子项 → 折叠分组
      - 安装: guide/install.md
      - 配置: guide/config.md
  - 关于:
      - 关于我: about/me.md
      - 许可证: about/license.md
  - 外部链接: https://example.com      # 直接写 URL 就是外链
```

规则与易错点：

- 叶子项的值是**相对 `docs_dir` 的路径**；分组项的值是一个列表。
- 分组可以只给标题不给页面（如上例的「指南」），此时它在界面上是不可点击的分组标签。
- 分组名里含冒号时要用引号包起来，例如 `- 'mkdocs.yml 配置': mkdocs/configuration.md`，否则 YAML 解析会出错。
- **没被 `nav` 提及的文档不会消失**，仍会被构建出来，只是不进导航。MkDocs 1.6 会给出 `omitted_files` 级别的提示。
- `nav` 里指向不存在的文件会在构建时报 `not_found` 警告，`--strict` 下直接中止。

## 0x06. 插件 plugins

```yaml
plugins:
  - search                      # 只写名字，用默认配置
  - search:                     # 或写成「名字 + 配置字典」
      lang: ['zh']
      min_search_length: 2
```

| 键 | 默认值 | 说明 |
| --- | --- | --- |
| `plugins` | `['search']` | 内置 `search` 默认启用 |

注意：**一旦显式写出 `plugins`，默认的 `search` 就不再自动加上**，需要自己列进去；只写 `plugins: []`（空列表）则表示不要任何插件，搜索会消失。

## 0x07. Markdown 扩展

`toc`、`tables`、`fenced_code` 三个扩展被 MkDocs **内置默认开启且无法关闭**（只能配置参数），所以 `markdown_extensions` 里只需声明你要**额外**加的：

```yaml
markdown_extensions:
  - toc:
      permalink: true     # 标题右侧生成锚点链接
      toc_depth: 3        # 目录最深到几级标题
      baselevel: 1
      # 中文站点建议：保留 Unicode 锚点，避免标题锚点退化成 #_1、#_2
      slugify: !!python/name:markdown.extensions.toc.slugify_unicode
  - admonition            # 警告框 !!! note
  - pymdownx.details      # 可折叠的 ??? note
  - pymdownx.superfences  # 更灵活的围栏代码块
  - attr_list             # 给元素加 {#id .class}
  - footnotes             # 脚注
```

| 键 | 默认值 |
| --- | --- |
| `markdown_extensions` | `[]`（加上内置的 `toc`/`tables`/`fenced_code`） |

可用的写法见 [Markdown 文档写作](writing-your-docs.md)。

## 0x08. 自定义资源

```yaml
extra_css:
  - stylesheets/custom.css

extra_javascript:
  - javascripts/custom.js

extra_templates:
  - custom.html         # 额外需要渲染的模板文件
```

| 键 | 默认值 |
| --- | --- |
| `extra_css` | `[]` |
| `extra_javascript` | `[]` |
| `extra_templates` | `[]` |

路径同样相对 `docs_dir` 解析。在模板中它们分别可通过 `config.extra_css`、`config.extra_javascript` 遍历渲染。

## 0x09. 仓库与编辑链接

```yaml
repo_url: https://github.com/user/repo    # 仓库地址
repo_name: user/repo                      # 仓库名称，默认从 repo_url 推导
edit_uri: edit/main/docs/                 # 「编辑此页」的链接前缀
```

| 键 | 默认值 | 说明 |
| --- | --- | --- |
| `repo_url` | 无 | 仓库地址 |
| `repo_name` | 由 `repo_url` 推导 | 链接显示文本 |
| `edit_uri` | 有 `repo_url` 时默认 `edit/master/docs/` | 编辑链接前缀；设为 `""` 可关闭 |

> **容易混淆的一对名字**：配置键是 `edit_uri`；而模板里用的是**页面变量** `page.edit_url`（由 `repo_url` + `edit_uri` 拼出的完整地址）。它们是两样东西，不要写成 `edit_url: true` 这种不存在的配置。

## 0x0A. 构建与开发服务器

```yaml
dev_addr: 127.0.0.1:8000     # mkdocs serve 监听地址
use_directory_urls: true     # 目录化 URL：/guide/ 而不是 /guide.html
strict: false                # 严格模式：任何警告即中止
remote_branch: gh-pages      # gh-deploy 的目标分支
remote_name: origin          # gh-deploy 的 remote
watch:                       # serve 时额外监听的路径（在 docs_dir 之外时用）
  - ../theme_src
```

| 键 | 默认值 |
| --- | --- |
| `dev_addr` | `127.0.0.1:8000` |
| `use_directory_urls` | `true` |
| `strict` | `false` |
| `remote_branch` | `gh-pages` |
| `remote_name` | `origin` |
| `watch` | `[]` |

`use_directory_urls: true` 时页面 URL 形如 `/guide/config/`（实际文件是 `guide/config/index.html`），对静态托管更友好；改成 `false` 则是 `/guide/config.html`。**部署后不要随意切换**，否则站内链接会大面积失效。

## 0x0B. 构建校验（1.6 新增）

`validation` 控制各类「有问题但不致命」的情况以什么级别报告，取值有 `warn`（警告）、`info`（提示）、`ignore`（忽略）：

```yaml
validation:
  nav:
    omitted_files: info      # 有文档文件没被 nav 提到
    not_found: warn          # nav 指向了不存在的文件
    absolute_links: info     # nav 里用了以 / 开头的绝对路径
  links:
    not_found: warn          # Markdown 里的相对链接指向不存在的文档
    absolute_links: info     # Markdown 里的绝对路径链接
    unrecognized_links: info # 看起来像站内链接但不是
```

配合 `strict: true`（或 `mkdocs build --strict`）就能把 `warn` 级别的链接问题变成硬错误，非常适合放进 CI ——**坏链、漏进导航的页面会被自动拦下**。

## 0x0C. 其他

```yaml
exclude_docs: |        # 构建时完全排除的文件（正则/多行匹配）
  drafts/
not_in_nav: |          # 会构建但不参与「漏进导航」告警
  changelog.md
extra:                 # 任意自定义数据，模板中通过 config.extra.xxx 读取
  logo: img/logo.svg
  social:
    - icon: github
      link: https://github.com/smallzh
```

`extra` 是主题作者最喜欢的万金油：MkDocs 不做任何校验，主题想读什么就约定什么。本主题就读取了 `extra.logo` 作为顶栏 Logo。

## 0x0D. 全部配置项速查

| 键 | 默认值 | 作用 |
| --- | --- | --- |
| `site_name` | 必填 | 站点标题 |
| `site_url` | 无 | 站点根 URL |
| `site_description` | 无 | meta 描述 |
| `site_author` | 无 | meta 作者 |
| `copyright` | 无 | 页脚版权 |
| `docs_dir` | `docs` | 文档源目录 |
| `site_dir` | `site` | 输出目录 |
| `theme` | `mkdocs` | 主题配置 |
| `nav` | 自动生成 | 导航结构 |
| `plugins` | `['search']` | 插件列表 |
| `markdown_extensions` | `[]` + 三个内置 | Markdown 扩展 |
| `extra_css` | `[]` | 追加样式表 |
| `extra_javascript` | `[]` | 追加脚本 |
| `extra_templates` | `[]` | 额外模板 |
| `repo_url` / `repo_name` / `edit_uri` | 无 | 仓库与编辑链接 |
| `dev_addr` | `127.0.0.1:8000` | 开发服务器地址 |
| `use_directory_urls` | `true` | 目录化 URL |
| `strict` | `false` | 严格模式 |
| `watch` | `[]` | 额外监听路径 |
| `validation` | 见 0x0B | 告警级别 |
| `exclude_docs` / `draft_docs` / `not_in_nav` | 无 | 文件级过滤 |
| `extra` | `{}` | 自定义数据 |
| `remote_branch` / `remote_name` | `gh-pages` / `origin` | gh-deploy 目标 |
