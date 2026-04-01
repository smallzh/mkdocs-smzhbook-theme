# MkDocs SmallzhBook Theme

## 0x01. 介绍

这个项目是 [MkDocs工具](https://mkdocs.readthedocs.io/en/stable/) 的一个主题，风格参考 [mkdocs-gitbook-theme](https://gitlab.com/lramage/mkdocs-gitbook-theme) 进行开发。

这个主题主要用于：

1. smallzh.top网站
2. 我个人项目的文档说明

## 0x02.使用

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

## 0x03. 感谢

1. [MkDocs](https://mkdocs.readthedocs.io/en/stable/) , 一个简易、好用的静态站点生成器
2. [mkdocs-gitbook-theme](https://gitlab.com/lramage/mkdocs-gitbook-theme) , 一个gitbook风格的主题
3. [uv](https://docs.astral.sh/uv/) , python项目管理器
