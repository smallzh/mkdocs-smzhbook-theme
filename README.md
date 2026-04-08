# MkDocs Smzhbook Theme

blog.smallzh.top网站使用的主题，基于[MkDocs](https://mkdocs.readthedocs.io/) 构建。


## 0x01.使用

### 安装主题

```shell
pip install mkdocs-smzhbook-theme
```

### 配置 MkDocs

在 `mkdocs.yml` 中设置主题：

```yaml
site_name: Your Site Name
theme:
  name: smzhbook
```

### 自定义样式和脚本

```yaml
extra_css:
  - custom.css

extra_javascript:
  - custom.js
```

### 本地开发主题

如果需要在本地直接使用主题源码（而非安装的包），可以在 `mkdocs.yml` 中直接指定主题目录：

```yaml
theme:
  name: null
  dir: /path/to/mkdocs-smzhbook-theme/smzhbook_theme
```

## 0x02.开发
先安装 [uv](https://docs.astral.sh/uv/) ，再执行以下命令

```shell
# 创建虚拟环境
uv sync
# 启动
uv run mkdocs serve
```

## 0xFF.感谢

1. [MkDocs](https://mkdocs.readthedocs.io/) ，简单易用的静态站点生成器
2. [mkdocs-basic-theme](https://mkdocs.github.io/mkdocs-basic-theme/) ， mkdocs的基础主题库

[![PyPI Downloads][pypi-dl-image]][pypi-dl-link]
[![PyPI Version][pypi-v-image]][pypi-v-link]

[pypi-dl-image]: https://img.shields.io/pypi/dm/mkdocs-smzhbook-theme.png
[pypi-dl-link]: https://pypi.python.org/pypi/mkdocs-smzhbook-theme
[pypi-v-image]: https://img.shields.io/pypi/v/mkdocs-smzhbook-theme.png
[pypi-v-link]: https://pypi.python.org/pypi/mkdocs-smzhbook-theme

