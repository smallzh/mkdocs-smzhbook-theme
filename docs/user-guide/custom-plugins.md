---
title: Custom Plugins
---

# 自定义 MkDocs 插件

MkDocs 的插件系统是其最强大的扩展机制之一。通过插件，你可以在构建流程的各个环节注入自定义逻辑——修改配置、处理 Markdown 源码、操作 HTML 输出、调整导航结构、生成额外文件，甚至扩展开发服务器。

## 0x01. 插件系统概述

### 什么是 MkDocs 插件？

MkDocs 插件本质上是一个 Python 包，它通过 **事件钩子（Event Hooks）** 机制在构建流程的特定时机执行自定义代码。MkDocs 的构建过程被拆分为多个阶段，每个阶段都会触发对应的事件，插件可以监听并响应这些事件。

### 插件的工作原理

```
mkdocs build 启动
    │
    ├── on_startup          ← 插件初始化（仅一次）
    │
    ├── on_config           ← 配置加载并验证后
    │
    ├── on_pre_build        ← 构建开始前
    │
    ├── on_files            ← 文件集合收集后
    │
    ├── on_nav              ← 导航结构生成后
    │
    ├── on_env              ← Jinja 环境创建后
    │
    ├── on_post_build       ← 构建完成后
    │
    ├── on_serve            ← 开发服务器启动后（仅 serve 命令）
    │
    └── on_shutdown         ← 退出前（仅一次）
```

对于每个 Markdown 页面，还会触发**页面事件**：

```
遍历每个页面
    │
    ├── on_pre_page              ← 页面处理前
    │
    ├── on_page_read_source      ← 读取页面源码时
    │
    ├── on_page_markdown         ← Markdown 源码加载后
    │
    ├── on_page_content          ← Markdown 渲染为 HTML 后
    │
    ├── on_page_context          ← 模板上下文创建后
    │
    └── on_post_page             ← 模板渲染完成后
```

## 0x02. 安装和使用插件

### 安装插件

在 MkDocs 中安装插件等同于安装 Python 包：

```bash
pip install mkdocs-foo-plugin
```

> **警告**：安装 MkDocs 插件意味着安装并执行第三方 Python 代码。请保持通常的安全警惕，MkDocs 不会对插件代码进行沙箱隔离。

### 在配置中启用插件

在 `mkdocs.yml` 中通过 `plugins` 配置项启用插件：

```yaml
plugins:
  - search
```

如果插件支持配置选项，可以嵌套键值映射：

```yaml
plugins:
  - search:
      lang: en
      separator: '[\s\-\.]+'
```

### 默认插件

MkDocs 默认启用了 `search` 插件。如果你在 `plugins` 配置项中列出了其他插件，需要显式地重新添加 `search`，否则它将被禁用：

```yaml
plugins:
  - search
  - my-custom-plugin
```

## 0x03. 开发自己的插件

### 最小插件结构

一个 MkDocs 插件至少包含两个核心要素：

1. **一个继承 `BasePlugin` 的 Python 类**——定义插件的行为
2. **一个 setuptools 入口点（entry point）**——让 MkDocs 发现并加载插件

#### 项目结构

```
mkdocs-my-plugin/
├── mkdocs_my_plugin/
│   ├── __init__.py
│   └── plugin.py          # 插件核心代码
├── tests/
│   └── test_plugin.py
├── pyproject.toml          # 项目配置（含入口点）
├── README.md
└── LICENSE
```

### BasePlugin 基类

所有 MkDocs 插件都必须继承 `mkdocs.plugins.BasePlugin` 类。

#### 最简单的插件

```python
# mkdocs_my_plugin/plugin.py

from mkdocs.plugins import BasePlugin


class MyPlugin(BasePlugin):
    """一个最简单的 MkDocs 插件。"""

    def on_config(self, config, **kwargs):
        """在配置加载后触发。"""
        print("MyPlugin is loaded!")
        return config
```

这个插件虽然什么都不做，但它已经是一个完整的 MkDocs 插件——它会在每次构建时打印一条消息。

### 插件配置方案（config_scheme）

插件可以通过 `config_scheme` 定义自己的配置选项，让用户在 `mkdocs.yml` 中进行配置。

#### 传统方式（config_scheme）

```python
# mkdocs_my_plugin/plugin.py

import mkdocs
from mkdocs.plugins import BasePlugin


class MyPlugin(BasePlugin):
    """带配置选项的插件。"""

    # 定义配置方案
    config_scheme = (
        ('enabled', mkdocs.config.config_options.Type(bool, default=True)),
        ('verbose', mkdocs.config.config_options.Type(bool, default=False)),
        ('output_dir', mkdocs.config.config_options.Type(str, default='output')),
    )

    def on_config(self, config, **kwargs):
        # 访问用户配置
        if not self.config['enabled']:
            return config

        if self.config['verbose']:
            print(f"MyPlugin output directory: {self.config['output_dir']}")

        return config
```

对应的 `mkdocs.yml` 配置：

```yaml
plugins:
  - my-plugin:
      enabled: true
      verbose: true
      output_dir: custom_output
```

#### 现代方式（MkDocs 1.4+，类型安全）

MkDocs 1.4+ 支持通过定义 `Config` 子类来获得类型安全的配置访问：

```python
# mkdocs_my_plugin/plugin.py

from mkdocs.config import base, config_options as c
from mkdocs.plugins import BasePlugin


# 定义配置类
class MyPluginConfig(base.Config):
    enabled = c.Type(bool, default=True)
    verbose = c.Type(bool, default=False)
    output_dir = c.Type(str, default='output')
    max_items = c.Type(int, default=10)


# 使用泛型参数绑定配置类
class MyPlugin(BasePlugin[MyPluginConfig]):
    """类型安全的插件配置。"""

    def on_pre_build(self, config, **kwargs):
        # 属性访问（类型安全）
        if self.config.enabled:
            print(f"Output: {self.config.output_dir}")
            print(f"Max items: {self.config.max_items}")
```

#### 复杂配置示例

对于更复杂的配置需求，可以使用 `SubConfig` 和 `ListOfItems`：

```python
from mkdocs.config import base, config_options as c


class _ValidationOptions(base.Config):
    """嵌套配置示例。"""
    enabled = c.Type(bool, default=True)
    verbose = c.Type(bool, default=False)
    skip_checks = c.ListOfItems(c.Choice(('foo', 'bar', 'baz')), default=[])


class MyPluginConfig(base.Config):
    definition_file = c.File(exists=True)  # 必填
    checksum_file = c.Optional(c.File(exists=True))  # 可选
    validation = c.SubConfig(_ValidationOptions)
```

对应的 `mkdocs.yml`：

```yaml
plugins:
  - my-plugin:
      definition_file: configs/test.ini
      validation:
        enabled: !ENV [CI, false]
        verbose: true
        skip_checks:
          - foo
          - baz
```

## 0x04. 事件钩子详解

MkDocs 提供三类事件：**全局事件**、**页面事件**和**模板事件**。

### 全局事件（Global Events）

全局事件在构建过程中仅执行一次，影响整个站点。

#### on_startup

在 `mkdocs` 命令开始时触发，**整个命令执行期间仅运行一次**。

```python
def on_startup(self, command, dirty):
    """
    参数:
        command: Literal['build', 'gh-deploy', 'serve'] — 执行的命令
        dirty: bool — 是否传递了 --dirty 标志
    """
    print(f"Starting MkDocs {command} (dirty={dirty})")
```

> **注意**：定义 `on_startup` 方法（即使为空）会将插件迁移到新系统——插件对象在 `mkdocs serve` 的多次构建之间保持存活。

#### on_config

配置加载并验证后触发，是**第一个被调用的构建事件**。

```python
def on_config(self, config):
    """
    参数:
        config: MkDocsConfig — 全局配置对象
    返回:
        MkDocsConfig | None — 修改后的配置
    """
    # 修改站点描述
    config.site_description = "Modified by MyPlugin"

    # 添加额外的静态模板
    config.theme.static_templates.add('my_custom_page.html')

    # 添加额外的 CSS
    config.extra_css.append('css/my-plugin.css')

    return config
```

> **关键**：如果修改了 `config` 对象，必须返回它。返回 `None` 表示不修改配置。

#### on_pre_build

构建正式开始前触发，不修改任何变量。

```python
def on_pre_build(self, config):
    """
    参数:
        config: MkDocsConfig — 全局配置对象
    """
    # 创建输出目录
    import os
    output_dir = os.path.join(config.site_dir, 'my-plugin')
    os.makedirs(output_dir, exist_ok=True)
```

#### on_files

文件集合从 `docs_dir` 收集完毕后触发。

```python
def on_files(self, files, config):
    """
    参数:
        files: Files — 全局文件集合
        config: MkDocsConfig — 全局配置对象
    返回:
        Files | None — 修改后的文件集合
    """
    from mkdocs.structure.files import File

    # 添加一个额外生成的文件
    extra_file = File(
        path='generated/sitemap.xml',
        src_dir=config.docs_dir,
        dest_dir=config.site_dir,
        use_directory_urls=config.use_directory_urls,
    )
    files.append(extra_file)

    return files
```

#### on_nav

站点导航结构生成后触发。

```python
def on_nav(self, nav, config, files):
    """
    参数:
        nav: Navigation — 导航对象
        config: MkDocsConfig — 全局配置对象
        files: Files — 文件集合
    返回:
        Navigation | None — 修改后的导航对象
    """
    # 遍历导航项
    for item in nav:
        print(f"Nav item: {item.title}")

    return nav
```

#### on_env

Jinja2 模板环境创建后触发。

```python
def on_env(self, env, config, files):
    """
    参数:
        env: jinja2.Environment — Jinja2 环境对象
        config: MkDocsConfig — 全局配置对象
        files: Files — 文件集合
    返回:
        Environment | None — 修改后的环境对象
    """
    # 添加自定义 Jinja2 过滤器
    def my_filter(value):
        return value.upper()

    env.filters['my_filter'] = my_filter

    return env
```

#### on_post_build

构建完成后触发。

```python
def on_post_build(self, config):
    """
    参数:
        config: MkDocsConfig — 全局配置对象
    """
    import shutil

    # 复制额外资源到输出目录
    src = 'my-plugin-assets/'
    dst = config.site_dir
    shutil.copytree(src, dst, dirs_exist_ok=True)
```

#### on_build_error

构建过程中发生异常时触发。

```python
from mkdocs.exceptions import PluginError


def on_build_error(self, error, **kwargs):
    """
    参数:
        error: Exception — 捕获到的异常
    """
    # 清理临时文件
    import shutil
    shutil.rmtree('/tmp/my-plugin-cache', ignore_errors=True)
```

### 页面事件（Page Events）

页面事件对每个 Markdown 页面各执行一次。

#### on_pre_page

页面处理前触发。

```python
def on_pre_page(self, page, config, files):
    """
    参数:
        page: Page — 页面对象
        config: MkDocsConfig — 全局配置对象
        files: Files — 文件集合
    返回:
        Page | None — 修改后的页面对象
    """
    # 修改页面标题
    if page.title == 'Untitled':
        page.title = 'Auto-generated Title'

    return page
```

#### on_page_markdown

Markdown 源码从文件加载后触发，**可以修改 Markdown 源码**。

```python
def on_page_markdown(self, markdown, page, config, files):
    """
    参数:
        markdown: str — 页面 Markdown 源码
        page: Page — 页面对象
        config: MkDocsConfig — 全局配置对象
        files: Files — 文件集合
    返回:
        str | None — 修改后的 Markdown 源码
    """
    # 在所有标题前添加前缀
    import re
    markdown = re.sub(r'^(#{1,6})\s', r'\1 [MyPlugin] ', markdown, flags=re.MULTILINE)

    # 替换自定义标记
    markdown = markdown.replace('{{VERSION}}', '1.0.0')

    return markdown
```

#### on_page_content

Markdown 渲染为 HTML 后、传入模板前触发。

```python
def on_page_content(self, html, page, config, files):
    """
    参数:
        html: str — 渲染后的 HTML
        page: Page — 页面对象
        config: MkDocsConfig — 全局配置对象
        files: Files — 文件集合
    返回:
        str | None — 修改后的 HTML
    """
    # 在所有代码块外包裹额外容器
    import re
    html = re.sub(
        r'<pre><code',
        r'<div class="code-wrapper"><pre><code',
        html
    )
    html = re.sub(
        r'</code></pre>',
        r'</code></pre></div>',
        html
    )

    return html
```

#### on_page_context

页面模板上下文创建后触发。

```python
def on_page_context(self, context, page, config, nav):
    """
    参数:
        context: dict — 模板上下文变量
        page: Page — 页面对象
        config: MkDocsConfig — 全局配置对象
        nav: Navigation — 导航对象
    返回:
        dict | None — 修改后的上下文
    """
    # 添加自定义变量到模板上下文
    context['my_custom_var'] = 'Hello from MyPlugin'
    context['build_time'] = '2024-01-01'

    return context
```

在模板中使用：

```jinja2
<p>{{ my_custom_var }}</p>
<p>Build time: {{ build_time }}</p>
```

#### on_post_page

模板渲染完成后、写入磁盘前触发。

```python
def on_post_page(self, output, page, config):
    """
    参数:
        output: str — 渲染后的页面 HTML
        page: Page — 页面对象
        config: MkDocsConfig — 全局配置对象
    返回:
        str | None — 修改后的输出。返回空字符串则跳过该页面
    """
    # 在页面底部添加自定义信息
    footer = '<div class="plugin-footer">Generated by MyPlugin</div>'
    output = output.replace('</body>', f'{footer}</body>')

    return output
```

### 模板事件（Template Events）

模板事件对每个非页面模板执行一次（包括 `extra_templates` 和 `static_templates` 中定义的模板）。

#### on_pre_template

模板加载后触发。

```python
def on_pre_template(self, template, template_name, config):
    """
    参数:
        template: jinja2.Template — 模板对象
        template_name: str — 模板文件名
        config: MkDocsConfig — 全局配置对象
    返回:
        Template | None — 修改后的模板
    """
    if template_name == 'sitemap.xml':
        # 修改 sitemap 模板
        pass
    return template
```

#### on_template_context

模板上下文创建后触发。

```python
def on_template_context(self, context, template_name, config):
    """
    参数:
        context: dict — 模板上下文
        template_name: str — 模板文件名
        config: MkDocsConfig — 全局配置对象
    返回:
        dict | None — 修改后的上下文
    """
    context['template_info'] = f'Template: {template_name}'
    return context
```

#### on_post_template

模板渲染完成后、写入磁盘前触发。

```python
def on_post_template(self, output_content, template_name, config):
    """
    参数:
        output_content: str — 渲染后的模板输出
        template_name: str — 模板文件名
        config: MkDocsConfig — 全局配置对象
    返回:
        str | None — 修改后的输出。返回空字符串则跳过该模板
    """
    if template_name == 'sitemap.xml':
        # 修改 sitemap 输出
        output_content = output_content.replace('<url>', '<url>\n  <priority>0.8</priority>')

    return output_content
```

### 一次性事件（One-time Events）

这些事件在 `mkdocs` 命令执行期间**仅运行一次**，与全局事件的区别在于：在 `mkdocs serve` 中，全局事件会在每次构建时运行，而一次性事件只在命令开始时运行一次。

#### on_shutdown

在 `mkdocs` 命令退出前触发。

```python
def on_shutdown(self):
    """在 MkDocs 退出前触发。"""
    # 清理资源
    print("MyPlugin shutting down...")
```

> **注意**：`on_post_build` 仍然是首选的清理方式，因为它有更高的执行概率。`on_shutdown` 依赖于 MkDocs 的优雅退出，是"尽力而为"的。

#### on_serve

仅在 `mkdocs serve` 命令下触发，在首次构建完成后执行。

```python
def on_serve(self, server, config, builder):
    """
    参数:
        server: LiveReloadServer — 开发服务器实例
        config: MkDocsConfig — 全局配置对象
        builder: Callable — 构建函数
    返回:
        LiveReloadServer | None — 修改后的服务器
    """
    # 添加额外的监控目录
    extra_dir = 'my-plugin-assets/'
    server.watch(extra_dir, builder)

    return server
```

## 0x05. 事件优先级

默认情况下，插件事件按照 `plugins` 配置列表中插件的出现顺序执行。

从 MkDocs 1.4 开始，插件可以通过 `@event_priority` 装饰器设置事件的优先级：

```python
from mkdocs.plugins import BasePlugin, event_priority


class MyPlugin(BasePlugin):

    @event_priority(100)  # 最先执行
    def on_config(self, config, **kwargs):
        config.site_name = "First!"
        return config

    @event_priority(-100)  # 最后执行
    def on_post_build(self, config, **kwargs):
        print("Running last")
```

**推荐优先级值**：

| 优先级 | 含义 |
|--------|------|
| `100` | 最先执行 |
| `50` | 较早执行 |
| `0` | 默认优先级 |
| `-50` | 较晚执行 |
| `-100` | 最后执行 |

### CombinedEvent（多优先级处理器）

MkDocs 1.6+ 支持在同一事件上注册多个不同优先级的处理器：

```python
from mkdocs.plugins import BasePlugin, event_priority, CombinedEvent


class MyPlugin(BasePlugin):

    @event_priority(100)
    def _on_page_markdown_early(self, markdown: str, **kwargs):
        # 早期处理：预处理
        return markdown

    @event_priority(-50)
    def _on_page_markdown_late(self, markdown: str, **kwargs):
        # 晚期处理：后处理
        return markdown

    on_page_markdown = CombinedEvent(_on_page_markdown_early, _on_page_markdown_late)
```

> **注意**：子方法的名称**不能**以 `on_` 开头，应以 `_on_` 或其他前缀开头。

### 兼容性处理

如果你的插件需要兼容 MkDocs 1.4 之前的版本：

```python
try:
    from mkdocs.plugins import event_priority
except ImportError:
    # MkDocs < 1.4 的降级处理
    event_priority = lambda priority: lambda f: f
```

## 0x06. 错误处理

MkDocs 定义了四种异常类型：

| 异常类型 | 说明 |
|----------|------|
| `MkDocsException` | 所有 MkDocs 异常的基类 |
| `ConfigurationError` | 配置验证错误 |
| `BuildError` | 构建过程中的错误 |
| `PluginError` | 插件应抛出的错误 |

**最佳实践**：插件应抛出 `PluginError` 而非让 Python 异常直接暴露：

```python
from mkdocs.exceptions import PluginError
from mkdocs.plugins import BasePlugin


class MyPlugin(BasePlugin):

    def on_page_markdown(self, markdown, page, config, files):
        try:
            # 可能抛出 KeyError 的代码
            result = self.process(markdown, page.meta['required_key'])
            return result
        except KeyError as error:
            raise PluginError(f"页面 '{page.file.src_path}' 缺少必需的元数据键: '{error}'")
        except Exception as error:
            raise PluginError(f"处理页面 '{page.file.src_path}' 时出错: {error}")

    def on_build_error(self, error, **kwargs):
        # 构建失败时的清理工作
        import shutil
        shutil.rmtree('/tmp/my-plugin-temp', ignore_errors=True)
```

使用 `PluginError` 的好处：
- 用户看到的是清晰的错误消息，而非完整的 Python 堆栈跟踪
- MkDocs 会捕获该错误并优雅地退出构建

## 0x07. 日志系统

为了让插件的日志消息与 MkDocs 的格式和 `--verbose`/`--debug` 标志保持一致，请使用 `mkdocs.plugins.` 命名空间下的 logger。

### 方式一：手动创建 logger

```python
import logging

log = logging.getLogger(f"mkdocs.plugins.{__name__}")

log.warning("文件 '%s' 未找到", filename)
log.info("这条消息正常显示")
log.debug("仅在 --verbose 时显示")

if log.getEffectiveLevel() <= logging.DEBUG:
    log.debug("仅调试时执行的昂贵计算: %s", get_diagnostics())
```

### 方式二：使用 get_plugin_logger（MkDocs 1.5+）

```python
from mkdocs.plugins import get_plugin_logger

log = get_plugin_logger(__name__)

log.info("MyPlugin: 初始化完成")
log.warning("MyPlugin: 配置文件未找到，使用默认值")
```

`get_plugin_logger()` 返回的 logger 会自动在每条消息前加上插件名称前缀。

> **注意**：`log.error()` 在外观上与 `warning` 不同，但功能相同。如果插件遇到真正的错误，最佳做法是直接抛出 `PluginError`（它也会记录一条 ERROR 消息并中断构建）。

## 0x08. 注册插件入口点

### 使用 pyproject.toml（推荐）

现代 Python 打包推荐使用 `pyproject.toml`：

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "mkdocs-my-plugin"
version = "1.0.0"
description = "My custom MkDocs plugin"
readme = "README.md"
license = "MIT"
authors = [
    {name = "Your Name", email = "your@email.com"},
]
classifiers = [
    "Development Status :: 4 - Beta",
    "Environment :: Plugins",
    "Framework :: MkDocs",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python",
    "Programming Language :: Python :: 3",
]
dependencies = [
    "mkdocs>=1.5",
]

[project.urls]
Homepage = "https://github.com/yourname/mkdocs-my-plugin"
Repository = "https://github.com/yourname/mkdocs-my-plugin"

# 关键：注册 MkDocs 插件入口点
[project.entry-points."mkdocs.plugins"]
my-plugin = "mkdocs_my_plugin.plugin:MyPlugin"

[tool.hatch.build]
include = ["/mkdocs_my_plugin"]
```

### 使用 setup.py（传统方式）

```python
from setuptools import setup, find_packages

setup(
    name='mkdocs-my-plugin',
    version='1.0.0',
    description='My custom MkDocs plugin',
    author='Your Name',
    author_email='your@email.com',
    packages=find_packages(),
    install_requires=[
        'mkdocs>=1.5',
    ],
    entry_points={
        'mkdocs.plugins': [
            'my-plugin = mkdocs_my_plugin.plugin:MyPlugin',
        ]
    },
)
```

### 入口点命名规则

- 入口点名称（如 `my-plugin`）是用户在 `mkdocs.yml` 中使用的名称
- 等号右侧是插件类的完整导入路径
- 同一个模块可以注册多个入口点：

```python
entry_points={
    'mkdocs.plugins': [
        'feature-a = my_plugins:PluginA',
        'feature-b = my_plugins:PluginB',
    ]
}
```

> **注意**：注册插件并不会自动启用它。用户仍需在 `mkdocs.yml` 的 `plugins` 配置项中显式启用。

## 0x09. 完整示例：页面信息统计插件

以下是一个完整的插件示例，它会在每个页面底部添加统计信息（字数、预估阅读时间）。

### 项目结构

```
mkdocs-page-stats/
├── mkdocs_page_stats/
│   ├── __init__.py
│   └── plugin.py
├── pyproject.toml
└── README.md
```

### 插件代码

```python
# mkdocs_page_stats/plugin.py

import re
from mkdocs.plugins import BasePlugin, get_plugin_logger
from mkdocs.config import base, config_options as c

log = get_plugin_logger(__name__)


class PageStatsConfig(base.Config):
    """插件配置。"""
    enabled = c.Type(bool, default=True)
    show_word_count = c.Type(bool, default=True)
    show_reading_time = c.Type(bool, default=True)
    words_per_minute = c.Type(int, default=200)
    template = c.Type(str, default='<div class="page-stats">{stats}</div>')
    format_string = c.Type(str, default='{word_count} 字 · 约 {reading_time} 分钟阅读')


class PageStatsPlugin(BasePlugin[PageStatsConfig]):
    """页面统计信息插件。"""

    def on_config(self, config):
        """在配置加载后添加自定义 CSS。"""
        if not self.config.enabled:
            log.info("PageStats plugin is disabled")
            return config

        # 注入统计信息样式
        custom_css = """
        .page-stats {
            font-size: 0.85em;
            color: #666;
            padding: 0.5em 0;
            margin-top: 1em;
            border-top: 1px solid #eee;
        }
        """
        # 将 CSS 添加到 extra_css（需要用户创建对应文件）
        log.info("PageStats plugin enabled")
        return config

    def on_page_markdown(self, markdown, page, config, files):
        """统计 Markdown 字数并存储到页面元数据。"""
        if not self.config.enabled:
            return markdown

        # 计算字数（去除代码块和空行）
        # 移除代码块
        text = re.sub(r'```[\s\S]*?```', '', markdown)
        # 移除行内代码
        text = re.sub(r'`[^`]+`', '', text)
        # 移除链接和图像的语法标记
        text = re.sub(r'[!\[\]()]', '', text)
        # 移除标题标记
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)

        # 统计中文字符和英文单词
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        english_words = len(re.findall(r'\b[a-zA-Z]+\b', text))
        word_count = chinese_chars + english_words

        # 存储到页面元数据
        if not hasattr(page, 'meta'):
            page.meta = {}
        page.meta['word_count'] = word_count

        return markdown

    def on_page_context(self, context, page, config, nav):
        """将统计信息添加到页面上下文。"""
        if not self.config.enabled:
            return context

        word_count = page.meta.get('word_count', 0)
        reading_time = max(1, word_count // self.config.words_per_minute)

        # 构建统计信息字符串
        stats_text = self.config.format_string.format(
            word_count=word_count,
            reading_time=reading_time,
        )

        # 将统计信息添加到上下文
        context['page_stats'] = self.config.template.format(stats=stats_text)

        return context

    def on_post_page(self, output, page, config):
        """在页面底部插入统计信息。"""
        if not self.config.enabled:
            return output

        # 检查是否有统计信息
        page_stats = page.meta.get('word_count')
        if not page_stats:
            return output

        # 在 </article> 或 </main> 前插入
        stats_html = context.get('page_stats', '')
        if stats_html:
            # 尝试在 </article> 前插入
            if '</article>' in output:
                output = output.replace('</article>', f'{stats_html}</article>')
            elif '</main>' in output:
                output = output.replace('</main>', f'{stats_html}</main>')

        return output
```

### pyproject.toml

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "mkdocs-page-stats"
version = "1.0.0"
description = "MkDocs 插件：在页面底部显示字数统计和预估阅读时间"
readme = "README.md"
license = "MIT"
authors = [
    {name = "smallzh", email = "smallzh@yeah.net"},
]
classifiers = [
    "Framework :: MkDocs",
    "Programming Language :: Python :: 3",
]
dependencies = [
    "mkdocs>=1.5",
]

[project.entry-points."mkdocs.plugins"]
page-stats = "mkdocs_page_stats.plugin:PageStatsPlugin"

[tool.hatch.build]
include = ["/mkdocs_page_stats"]
```

### 使用方式

安装插件后，在 `mkdocs.yml` 中配置：

```yaml
plugins:
  - search
  - page-stats:
      enabled: true
      show_word_count: true
      show_reading_time: true
      words_per_minute: 250
      format_string: '📝 {word_count} 字 · 约 {reading_time} 分钟阅读'
```

## 0x10. 完整示例：自动生成版本信息插件

以下示例展示如何在构建时自动生成版本信息页面。

```python
# mkdocs_version_info/plugin.py

import subprocess
from datetime import datetime
from pathlib import Path

from mkdocs.plugins import BasePlugin, get_plugin_logger
from mkdocs.config import base, config_options as c

log = get_plugin_logger(__name__)


class VersionInfoConfig(base.Config):
    output_file = c.Type(str, default='version-info.md')
    include_commit_hash = c.Type(bool, default=True)
    include_build_time = c.Type(bool, default=True)


class VersionInfoPlugin(BasePlugin[VersionInfoConfig]):
    """自动生成版本信息页面。"""

    def on_pre_build(self, config):
        """在构建前生成版本信息文件。"""
        output_path = Path(config.docs_dir) / self.config.output_file

        content = ["# 版本信息\n"]

        if self.config.include_commit_hash:
            try:
                commit_hash = subprocess.check_output(
                    ['git', 'rev-parse', '--short', 'HEAD'],
                    cwd=config.docs_dir,
                    stderr=subprocess.DEVNULL,
                ).decode().strip()
                content.append(f"- **Git Commit**: `{commit_hash}`")
            except (subprocess.CalledProcessError, FileNotFoundError):
                content.append("- **Git Commit**: 不可用")

        if self.config.include_build_time:
            build_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            content.append(f"- **构建时间**: {build_time}")

        content.append(f"- **MkDocs 版本**: {config.mkdocs_version}")

        output_path.write_text('\n'.join(content) + '\n', encoding='utf-8')
        log.info(f"Generated version info at {output_path}")

    def on_nav(self, nav, config, files):
        """将版本信息页面添加到导航。"""
        # 可以在这里修改导航结构
        return nav
```

## 0x11. 完整示例：外部文件包含插件

以下示例展示如何在 Markdown 中包含外部文件内容。

```python
# mkdocs_include_file/plugin.py

import os
import re
from pathlib import Path

from mkdocs.plugins import BasePlugin, get_plugin_logger
from mkdocs.config import base, config_options as c
from mkdocs.exceptions import PluginError

log = get_plugin_logger(__name__)


class IncludeFileConfig(base.Config):
    base_path = c.Type(str, default='')
    encoding = c.Type(str, default='utf-8')
    fail_on_missing = c.Type(bool, default=True)


class IncludeFilePlugin(BasePlugin[IncludeFileConfig]):
    """在 Markdown 中包含外部文件内容。

    用法：在 Markdown 中使用 `--8<--` 语法：
    --8<-- "path/to/file.md"
    """

    INCLUDE_PATTERN = re.compile(
        r'^--8<--\s+"([^"]+)"\s*$',
        re.MULTILINE
    )

    def on_page_markdown(self, markdown, page, config, files):
        """处理文件包含标记。"""
        base_path = self.config.base_path or config.docs_dir

        def replace_include(match):
            file_path = match.group(1)
            full_path = Path(base_path) / file_path

            if not full_path.exists():
                if self.config.fail_on_missing:
                    raise PluginError(
                        f"包含文件未找到: {full_path}\n"
                        f"在页面: {page.file.src_path}"
                    )
                else:
                    log.warning(f"包含文件未找到: {full_path}")
                    return f'<!-- 文件未找到: {file_path} -->'

            try:
                content = full_path.read_text(encoding=self.config.encoding)
                return content
            except Exception as e:
                raise PluginError(f"读取文件失败 {full_path}: {e}")

        return self.INCLUDE_PATTERN.sub(replace_include, markdown)
```

使用方式：

```yaml
plugins:
  - include-file:
      base_path: docs/includes
      encoding: utf-8
      fail_on_missing: false
```

在 Markdown 中：

```markdown
# 我的文档

以下是外部文件的内容：

--8<-- "snippets/intro.md"
--8<-- "code-examples/example.py"
```

## 0x12. 调试和测试

### 本地开发调试

在开发插件时，可以使用 `pip install -e` 进行可编辑安装：

```bash
# 进入插件项目目录
cd mkdocs-my-plugin/

# 可编辑安装
pip install -e .

# 在 MkDocs 项目中使用
cd /path/to/mkdocs-project/
mkdocs serve
```

### 使用 MkDocs Catalog

开发完成后，可以将插件发布到 [MkDocs Catalog](https://github.com/mkdocs/catalog) 以便其他用户发现。

### 测试插件

推荐使用 `pytest` 测试插件：

```python
# tests/test_plugin.py

import pytest
from mkdocs.config import load_config
from mkdocs.plugins import BasePlugin
from mkdocs_my_plugin.plugin import MyPlugin


def test_plugin_config_defaults():
    """测试配置默认值。"""
    plugin = MyPlugin()
    plugin.load_config({})
    assert plugin.config['enabled'] is True


def test_plugin_on_config():
    """测试 on_config 事件。"""
    plugin = MyPlugin()
    plugin.load_config({})

    config = load_config()
    result = plugin.on_config(config)

    assert result is not None


def test_plugin_on_page_markdown():
    """测试 Markdown 处理。"""
    plugin = MyPlugin()
    plugin.load_config({})

    markdown = "# Hello World"
    result = plugin.on_page_markdown(markdown, page=None, config=None, files=None)

    assert result is not None
```

## 0x13. 发布插件

### 构建和发布到 PyPI

```bash
# 安装构建工具
pip install build twine

# 构建分发包
python -m build

# 发布到 TestPyPI（测试）
twine upload --repository testpypi dist/*

# 发布到 PyPI（正式）
twine upload dist/*
```

详细的发布流程请参考 [发布 MkDocs 主题到 PyPI](publishing-to-pypi.md) 文档。

### 命名规范

- 包名：`mkdocs-插件名`（如 `mkdocs-page-stats`）
- 入口点名称：简洁的描述性名称（如 `page-stats`）
- 模块名：使用下划线（如 `mkdocs_page_stats`）

## 0x14. 事件执行顺序总结

以下是 MkDocs 构建过程中所有事件的完整执行顺序：

```
1.  on_startup(command, dirty)              ← 命令启动（仅一次）
2.  on_config(config)                       ← 配置加载后
3.  on_pre_build(config)                    ← 构建前
4.  on_files(files, config)                 ← 文件集合收集后
5.  on_nav(nav, config, files)              ← 导航生成后
6.  on_env(env, config, files)              ← Jinja 环境创建后
7.  ┌─ 对每个非页面模板 ──────────────────┐
    │   on_pre_template(template, ...)      │
    │   on_template_context(context, ...)   │
    │   on_post_template(output, ...)       │
    └───────────────────────────────────────┘
8.  ┌─ 对每个页面 ─────────────────────────┐
    │   on_pre_page(page, ...)              │
    │   on_page_read_source(page, ...)      │
    │   on_page_markdown(markdown, ...)     │
    │   on_page_content(html, ...)          │
    │   on_page_context(context, ...)       │
    │   on_post_page(output, ...)           │
    └───────────────────────────────────────┘
9.  on_post_build(config)                   ← 构建完成
10. on_serve(server, config, builder)       ← 仅 serve 命令
11. on_shutdown()                           ← 退出前（仅一次）
```

> **注意**：如果构建过程中发生错误，`on_build_error(error)` 事件将被触发，后续事件将被跳过。

## 0x15. 参考资源

- [MkDocs 官方插件文档](https://www.mkdocs.org/dev-guide/plugins/)
- [MkDocs API 参考](https://www.mkdocs.org/dev-guide/api/)
- [MkDocs Catalog（插件列表）](https://github.com/mkdocs/catalog)
- [MkDocs 源码](https://github.com/mkdocs/mkdocs)
- [MkDocs 配置文档](configuration.md)

### 优秀插件示例

| 插件 | 功能 | 参考 |
|------|------|------|
| mkdocs-redirects | 页面重定向 | [GitHub](https://github.com/ProperDocs/mkdocs-redirects) |
| mkdocs-macros-plugin | 宏系统 | [GitHub](https://github.com/fralau/mkdocs-macros-plugin) |
| mkdocs-include-markdown-plugin | 包含外部 Markdown | [GitHub](https://github.com/mondeja/mkdocs-include-markdown-plugin) |
| mkdocs-git-revision-date-localized-plugin | Git 提交日期 | [GitHub](https://github.com/timvink/mkdocs-git-revision-date-localized-plugin) |
| mkdocs-minify-plugin | 压缩输出 | [GitHub](https://github.com/byrnereese/mkdocs-minify-plugin) |
