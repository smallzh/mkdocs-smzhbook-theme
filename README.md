# MkDocs Smzhbook Theme

The theme used on the blog.smallzh.top website, built with [MkDocs](https://mkdocs.readthedocs.io/).

<div align="center">

English | [Chinese](./README_zh.md)

</div>

## 0x01.Usage

### Installing the Theme

```shell
pip install mkdocs-smzhbook-theme
```

### Configuring MkDocs

Setting the theme in `mkdocs.yml`:

```yaml
site_name: Your Site Name
theme:
  name: smzhbook
```

### Customizing Styles and Scripts

```yaml
extra_css:
  - custom.css

extra_javascript:
  - custom.js
```

### Local Theme Development

If you need to use the theme source code directly locally (rather than the installed package), you can specify the theme directory directly in `mkdocs.yml`:

```yaml
theme:
  name: null
  dir: /path/to/mkdocs-smzhbook-theme/smzhbook_theme
```

## 0x02.Development
First install [uv](https://docs.astral.sh/uv/), then run the following commands

```shell
# Create virtual environment
uv sync
# Start
uv run mkdocs serve
```

## 0xFF.Acknowledgments

1. [MkDocs](https://mkdocs.readthedocs.io/) - A simple and easy-to-use static site generator
2. [mkdocs-basic-theme](https://mkdocs.github.io/mkdocs-basic-theme/) - MkDocs' base theme library

[![PyPI Downloads][pypi-dl-image]][pypi-dl-link]
[![PyPI Version][pypi-v-image]][pypi-v-link]

[pypi-dl-image]: https://img.shields.io/pypi/dm/mkdocs-smzhbook-theme.png
[pypi-dl-link]: https://pypi.python.org/pypi/mkdocs-smzhbook-theme
[pypi-v-image]: https://img.shields.io/pypi/v/mkdocs-smzhbook-theme.png
[pypi-v-link]: https://pypi.python.org/pypi/mkdocs-smzhbook-theme