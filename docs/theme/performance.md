---
title: 构建与性能优化
---

# 构建与性能优化

"MkDocs 站点慢" 有两种完全不同的慢：**构建慢**（`mkdocs build` 要等很久）和**访问慢**（页面打开、搜索响应迟钝）。本篇分开讲。

## 0x01. 先量一下再优化

```shell
# 看构建各阶段耗时和事件调用，verbose 会打印大量细节
mkdocs build --verbose

# 严格模式：任何警告都中止构建（CI 里建议开，能提前发现坏链、缺文件）
mkdocs build --strict
```

构建完成后，MkDocs 会在日志里给出一行 `Documentation built in X.XX seconds`。如果同时想看每个插件、每个事件花了多久，`--verbose` 是唯一的信息来源。

## 0x02. 加速构建

### 只重建改动过的文件

```shell
mkdocs build --dirty
```

`--dirty` 不会清空 `site_dir`，只重建发生变化的页面。文档量大（数百页以上）时提升非常明显。

> 代价是：被**删除**的页面仍然留在 `site_dir` 里，改了 `nav` 或主题模板时也可能留下不一致的产物。**发布前务必跑一次不带 `--dirty` 的完整构建。**

### 开发时不要反复 build

```shell
mkdocs serve
```

`serve` 会监听 `docs_dir` 和配置文件的变更并自动重建，浏览器自动刷新，比手动 `build` 高效得多。只想改样式的话，直接编辑 `custom_dir` 里的 CSS 刷新即可，无需重启服务。

### 精简插件

每个插件都会在构建流程里挂上若干事件钩子。如果站点用不到某个插件的功能，就把它从 `plugins` 里去掉——尤其是那些在 `on_page_content` / `on_post_build` 里做全文处理的插件。

## 0x03. 站点的静态资源体积

本主题自带的资源大小如下，可以据此判断优化重点：

| 文件 | 大小 | 是否每页必载 |
| --- | --- | --- |
| `js/mermaid.min.js` | ≈ 3.3 MB | 是 |
| `js/jquery.min.js` | ≈ 88 KB | 是 |
| `js/theme.js` | ≈ 28 KB | 是 |
| `css/theme.css` | ≈ 40 KB | 是 |

**Mermaid 是绝对的体积大头**，而且它被放在了每一页上——即使那一页一张图都没有。

如果站点里只有少数页面用到 Mermaid，建议改成按需加载，例如在 `extra_javascript` 里放一个替换脚本，只在页面存在 `.mermaid` 时才注入 Mermaid：

```js
// javascripts/lazy-mermaid.js
document.addEventListener('DOMContentLoaded', function () {
    var hasDiagram = document.querySelector('pre code.language-mermaid, .mermaid');
    if (!hasDiagram) return;

    var s = document.createElement('script');
    s.src = base_url + 'js/mermaid.min.js';   // base_url 由主题模板提供
    s.onload = function () { window.smzhRenderMermaid(); };
    document.body.appendChild(s);
});
```

（这需要同时调整主题的 Mermaid 初始化脚本，把渲染时机推迟到脚本加载完成之后。）

## 0x04. 搜索索引的体积与召回

搜索索引在构建期生成，站点越大索引越大，而它是**在首次搜索时才下载**的，因此主要影响首次搜索的响应。

```yaml
plugins:
  - search:
      lang: ['zh']
      min_search_length: 2
      indexing: sections     # full（默认，索引全文） | sections | titles
      prebuild_index: false
```

| `indexing` | 索引内容 | 体积 | 适用 |
| --- | --- | --- | --- |
| `full` | 整页正文 | 最大 | 文档量不大、要求任意词都能命中 |
| `sections` | 按标题分节，只索引节的开头部分 | 中等 | **推荐值**，多数站点的最佳平衡 |
| `titles` | 只索引标题 | 最小 | 站点很大，只要求按标题跳转 |

`prebuild_index` 提前在构建期把索引转成 Lunr 的序列化格式，能省掉浏览器端的一次索引构建，但会让构建变慢，且 `true` / `node` 两种取值需要构建环境里有 Node.js。**除非确实测出首次搜索很慢，否则保持 `false`。**

## 0x05. 图片与字体

- 优先用 **WebP**，同画质下比 PNG 小很多。
- 大图加 `loading="lazy"`（Markdown 里直接写 HTML 也可以）：

  ```html
  <img src="assets/screenshot.webp" alt="截图" loading="lazy">
  ```

- 图片放进 `docs/assets/` 之类的目录统一管理，不要和 `.md` 混在一起。
- 自定义 Web 字体时只引入需要的字重，中文全字库字体动辄数 MB，**建议直接使用系统字体栈**（本主题默认就是中文优先的系统字体栈，不加载任何 Web 字体）。

## 0x06. 大站点的额外建议

- **拆分站点**：几千页的单一站点，构建和导航都会变沉。按主题拆成多个 MkDocs 项目，用顶栏链接互相跳转，往往比在一个站里堆下去更好维护。
- **CI 中缓存依赖**：构建耗时里有一部分是安装依赖，缓存 Python 环境能省下来。
- **不用 `use_directory_urls: false`** 除非有特殊需求：目录化 URL 对静态托管更友好。

## 0x07. 相关文档

- 构建流程各阶段的耗时分布：[构建流程全解析](../mkdocs/build-process.md)
- 搜索索引的数据结构与前端检索流程：[搜索插件原理](../mkdocs/search.md)
