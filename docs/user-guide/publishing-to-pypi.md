# 发布 MkDocs 主题到 PyPI

本指南将详细介绍如何将 MkDocs 主题发布到 PyPI，让其他用户可以通过 `pip install` 安装你的主题。

## 前置条件

### 1. 准备 PyPI 账户

在发布之前，你需要在以下平台注册账户：

- **PyPI**: [https://pypi.org/account/register/](https://pypi.org/account/register/)
- **TestPyPI**: [https://test.pypi.org/account/register/](https://test.pypi.org/account/register/)

### 2. 安装构建工具

```bash
# 安装构建和上传工具
pip install build twine

# 或者使用 uv（推荐）
uv pip install build twine
```

### 3. 配置认证

#### 方法一：使用 API Token（推荐）

1. 登录 PyPI，进入 [API tokens 页面](https://pypi.org/manage/account/token/)
2. 创建新的 API token，选择作用域为你的项目
3. 保存生成的 token（以 `pypi-` 开头）

创建 `~/.pypirc` 文件：

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
username = __token__
password = pypi-你的API-token

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-你的测试API-token
```

#### 方法二：使用用户名密码

```ini
[distutils]
index-servers = pypi

[pypi]
username = 你的用户名
password = 你的密码
```

## 项目配置

### pyproject.toml 配置

确保你的 `pyproject.toml` 文件包含以下必要配置：

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "mkdocs-你的主题名"
version = "1.0.0"
description = "你的主题描述"
readme = "README.md"
license = "BSD-2-Clause"
authors = [
    {name = "你的名字", email = "你的邮箱"},
]
classifiers = [
    "Development Status :: 4 - Beta",
    "Environment :: Web Environment",
    "Framework :: MkDocs",
    "Intended Audience :: Information Technology",
    "License :: OSI Approved :: BSD License",
    "Operating System :: OS Independent",
    "Topic :: Documentation",
]
dependencies = [
    "mkdocs>=1.5",
]

[project.urls]
Source = "https://github.com/你的用户名/你的仓库名"

# 关键配置：定义 MkDocs 主题入口点
[project.entry-points."mkdocs.themes"]
你的主题名 = "你的主题目录"

[tool.hatch.build]
include = ["/你的主题目录"]
```

### 重要配置说明

1. **name**: 包名，必须在 PyPI 上唯一
2. **version**: 版本号，遵循语义化版本
3. **classifiers**: 分类信息，必须包含 `"Framework :: MkDocs"`
4. **entry-points**: 定义 MkDocs 主题入口点，这是让 MkDocs 识别你主题的关键

### 文件结构

确保你的项目结构如下：

```
mkdocs-your-theme/
├── your_theme/          # 主题目录
│   ├── __init__.py     # 可以为空
│   ├── base.html       # 基础模板
│   ├── main.html       # 主模板
│   ├── css/
│   │   └── theme.css
│   ├── js/
│   │   └── theme.js
│   └── mkdocs_theme.yml
├── docs/               # 文档目录
├── pyproject.toml      # 项目配置
├── README.md           # 项目说明
└── LICENSE             # 许可证
```

## 构建和发布

### 第一步：构建分发包

```bash
# 清理旧的构建文件
rm -rf dist/ build/ *.egg-info

# 构建源码包和 wheel 包
uv build
```

构建成功后，会在 `dist/` 目录下生成两个文件：
- `mkdocs-your-theme-1.0.0.tar.gz`（源码包）
- `mkdocs_your_theme-1.0.0-py3-none-any.whl`（wheel 包）

### 第二步：验证构建结果

```bash
# 检查包的内容
tar -tzf dist/mkdocs-your-theme-1.0.0.tar.gz

# 检查 wheel 包内容
unzip -l dist/mkdocs_your_theme-1.0.0-py3-none-any.whl
```

确保包中包含了你的主题目录和所有必要文件。

### 第三步：测试发布（推荐）

先发布到 TestPyPI 进行测试：

```bash
# 上传到 TestPyPI
twine upload --repository testpypi dist/*

# 测试安装
pip install --index-url https://test.pypi.org/simple/ mkdocs-your-theme
```

### 第四步：正式发布

```bash
# 上传到 PyPI
twine upload dist/*
```

## 验证发布

### 1. 检查 PyPI 页面

访问 `https://pypi.org/project/你的包名/` 确认发布成功。

### 2. 测试安装

```bash
# 创建新的虚拟环境测试
python -m venv test_env
source test_env/bin/activate  # Linux/Mac
# 或 test_env\Scripts\activate  # Windows

# 安装你的主题
pip install mkdocs-your-theme

# 测试使用
mkdocs new test-project
cd test-project
```

编辑 `mkdocs.yml`：

```yaml
site_name: My Site
theme:
  name: 你的主题名
```

启动本地服务器：

```bash
mkdocs serve
```

## 版本更新

### 更新版本号

在 `pyproject.toml` 中更新版本号：

```toml
[project]
version = "1.1.0"  # 更新版本号
```

### 重新构建和发布

```bash
# 清理旧文件
rm -rf dist/ build/ *.egg-info

# 重新构建
python -m build

# 发布新版本
twine upload dist/*
```

## 常见问题

### 1. 包名已存在

如果包名已被占用，需要修改 `pyproject.toml` 中的 `name` 字段。

### 2. 认证失败

检查 `~/.pypirc` 文件配置是否正确，特别是 API token 格式。

### 3. 构建失败

确保所有必要文件都包含在 `[tool.hatch.build]` 的 `include` 配置中。

### 4. 主题无法识别

检查 `[project.entry-points."mkdocs.themes"]` 配置是否正确。

## 最佳实践

1. **使用 TestPyPI 测试**: 每次发布前先在 TestPyPI 上测试
2. **版本管理**: 遵循语义化版本规范
3. **文档完善**: 编写详细的 README 和使用文档
4. **许可证**: 选择合适的开源许可证
5. **持续集成**: 配置 GitHub Actions 自动化发布

## 自动化发布（可选）

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish to PyPI

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.x'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install build twine
    
    - name: Build package
      run: python -m build
    
    - name: Publish to PyPI
      env:
        TWINE_USERNAME: __token__
        TWINE_PASSWORD: ${{ secrets.PYPI_API_TOKEN }}
      run: twine upload dist/*
```

## 总结

发布 MkDocs 主题到 PyPI 的主要步骤：

1. 配置 `pyproject.toml`，特别是 entry-points
2. 构建分发包
3. 测试发布到 TestPyPI
4. 正式发布到 PyPI
5. 验证安装和使用

遵循本指南，你就可以成功发布你的 MkDocs 主题，让更多人使用你的作品。