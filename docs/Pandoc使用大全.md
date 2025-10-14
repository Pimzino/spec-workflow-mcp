# Pandoc 使用大全

## 📚 目录

- [简介](#简介)
- [安装](#安装)
- [基础用法](#基础用法)
- [常见格式转换](#常见格式转换)
- [高级功能](#高级功能)
- [实用案例](#实用案例)
- [最佳实践](#最佳实践)

---

## 简介

Pandoc 是一个强大的文档转换工具，被称为"文档转换的瑞士军刀"。它支持多种标记语言和文档格式之间的相互转换。

**支持的格式：**
- Markdown（多种变体）
- HTML
- LaTeX
- PDF
- Word (docx)
- EPUB
- reStructuredText
- MediaWiki
- Jupyter Notebook
- 等 40+ 种格式

---

## 安装

### macOS
```bash
# 使用 Homebrew
brew install pandoc

# 如果需要 PDF 支持，还需安装 LaTeX
brew install --cask mactex
# 或使用更轻量的版本
brew install basictex
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install pandoc

# PDF 支持
sudo apt-get install texlive-xetex texlive-fonts-recommended texlive-plain-generic
```

### Windows
```powershell
# 使用 Chocolatey
choco install pandoc

# 或下载安装包
# https://github.com/jgm/pandoc/releases
```

### 验证安装
```bash
pandoc --version
```

---

## 基础用法

### 基本语法
```bash
pandoc [选项] [输入文件] -o [输出文件]
```

### 简单转换示例
```bash
# Markdown 转 HTML
pandoc input.md -o output.html

# Markdown 转 PDF
pandoc input.md -o output.pdf

# HTML 转 Markdown
pandoc input.html -o output.md

# Word 转 Markdown
pandoc input.docx -o output.md
```

---

## 常见格式转换

### 1. Markdown 相关转换

#### Markdown → HTML
```bash
# 基础转换
pandoc input.md -o output.html

# 独立 HTML（包含 CSS）
pandoc input.md -s -o output.html

# 自定义 CSS
pandoc input.md -s --css=style.css -o output.html

# 包含目录
pandoc input.md -s --toc -o output.html

# 设置目录深度
pandoc input.md -s --toc --toc-depth=2 -o output.html
```

#### Markdown → PDF
```bash
# 基础转换
pandoc input.md -o output.pdf

# 指定 PDF 引擎
pandoc input.md --pdf-engine=xelatex -o output.pdf

# 支持中文
pandoc input.md --pdf-engine=xelatex -V mainfont="SimSun" -o output.pdf

# 设置页边距
pandoc input.md -V geometry:margin=1in -o output.pdf

# 添加封面、目录
pandoc input.md -s --toc --toc-depth=3 -o output.pdf

# 自定义 LaTeX 模板
pandoc input.md --template=mytemplate.tex -o output.pdf
```

#### Markdown → Word (docx)
```bash
# 基础转换
pandoc input.md -o output.docx

# 使用参考文档样式
pandoc input.md --reference-doc=template.docx -o output.docx

# 包含目录
pandoc input.md -s --toc -o output.docx
```

#### Markdown → PPT (pptx)
```bash
# 基础转换
pandoc input.md -o output.pptx

# 使用参考模板
pandoc input.md --reference-doc=template.pptx -o output.pptx

# 设置幻灯片级别
pandoc input.md -t pptx --slide-level=2 -o output.pptx
```

### 2. HTML 相关转换

#### HTML → Markdown
```bash
# 基础转换
pandoc input.html -o output.md

# 转换为 GitHub Flavored Markdown
pandoc input.html -f html -t gfm -o output.md

# 提取特定元素
pandoc input.html --css=style.css -o output.md
```

#### HTML → PDF
```bash
pandoc input.html -o output.pdf

# 自定义样式
pandoc input.html --css=style.css -o output.pdf
```

### 3. Word 相关转换

#### Word → Markdown
```bash
# 基础转换
pandoc input.docx -o output.md

# 转换为 GitHub Flavored Markdown
pandoc input.docx -t gfm -o output.md

# 提取图片到文件夹
pandoc input.docx --extract-media=./media -o output.md
```

#### Word → HTML
```bash
pandoc input.docx -o output.html

# 独立 HTML
pandoc input.docx -s -o output.html
```

### 4. LaTeX 相关转换

#### Markdown → LaTeX
```bash
pandoc input.md -o output.tex

# 独立文档
pandoc input.md -s -o output.tex
```

#### LaTeX → PDF
```bash
pandoc input.tex -o output.pdf
```

#### LaTeX → HTML
```bash
pandoc input.tex -s --mathjax -o output.html
```

### 5. EPUB 电子书

#### Markdown → EPUB
```bash
# 基础转换
pandoc input.md -o output.epub

# 添加元数据
pandoc input.md \
  --metadata title="我的书" \
  --metadata author="作者名" \
  --metadata lang=zh-CN \
  --toc \
  -o output.epub

# 使用封面图片
pandoc input.md --epub-cover-image=cover.jpg -o output.epub

# 自定义 CSS
pandoc input.md --css=epub.css -o output.epub
```

---

## 高级功能

### 1. 元数据设置

使用 YAML 前置元数据块：

```markdown
---
title: "文档标题"
author: "作者名"
date: "2025-01-12"
lang: zh-CN
toc: true
toc-depth: 3
geometry: margin=1in
fontsize: 12pt
---

# 正文内容
```

### 2. 模板使用

#### 查看默认模板
```bash
# 查看 HTML 模板
pandoc -D html

# 查看 LaTeX 模板
pandoc -D latex

# 导出模板到文件
pandoc -D html > template.html
pandoc -D latex > template.tex
```

#### 使用自定义模板
```bash
pandoc input.md --template=mytemplate.html -o output.html
```

### 3. 过滤器（Filters）

```bash
# 使用 Lua 过滤器
pandoc input.md --lua-filter=myfilter.lua -o output.html

# 使用 Python 过滤器
pandoc input.md --filter=myfilter.py -o output.html
```

### 4. 数学公式支持

```bash
# 使用 MathJax（在线）
pandoc input.md -s --mathjax -o output.html

# 使用 KaTeX（离线）
pandoc input.md -s --katex -o output.html

# LaTeX 数学环境
pandoc input.md --mathjax -t html5 -o output.html
```

### 5. 语法高亮

```bash
# 指定语法高亮样式
pandoc input.md --highlight-style=tango -o output.html

# 可用样式：pygments, tango, espresso, zenburn, kate, monochrome, breezedark, haddock

# 列出所有样式
pandoc --list-highlight-styles

# 保存样式到文件
pandoc --print-highlight-style=tango > my-style.theme
```

### 6. 引用和参考文献

```bash
# 使用 BibTeX 文件
pandoc input.md --bibliography=refs.bib --csl=chicago.csl -o output.pdf

# CSL 样式（Citation Style Language）
# 从 https://github.com/citation-style-language/styles 获取

# 在文档中引用
# [@smith2020] 或 @smith2020
```

---

## 实用案例

### 案例 1：多文件合并转换

```bash
# 合并多个 Markdown 文件为一个 PDF
pandoc chapter1.md chapter2.md chapter3.md -o book.pdf

# 使用通配符
pandoc *.md -o output.pdf

# 指定顺序
pandoc intro.md chapter*.md conclusion.md -o book.pdf
```

### 案例 2：批量转换

```bash
# Bash 批量转换
for file in *.md; do
  pandoc "$file" -o "${file%.md}.pdf"
done

# 批量 Markdown 转 HTML
for file in *.md; do
  pandoc "$file" -s --toc -o "${file%.md}.html"
done
```

### 案例 3：制作技术文档

```bash
# 完整的技术文档（含代码高亮、目录、数学公式）
pandoc technical-doc.md \
  -s \
  --toc \
  --toc-depth=3 \
  --highlight-style=tango \
  --mathjax \
  --css=doc-style.css \
  -o technical-doc.html
```

### 案例 4：生成演示文稿

```bash
# Markdown 转 reveal.js 幻灯片
pandoc slides.md -t revealjs -s -o slides.html

# 自定义主题
pandoc slides.md -t revealjs -s -V theme=moon -o slides.html

# Markdown 转 Beamer (LaTeX 幻灯片)
pandoc slides.md -t beamer -o slides.pdf
```

**slides.md 示例：**
```markdown
---
title: "我的演示"
author: "作者名"
date: "2025-01-12"
---

# 第一部分

## 子主题 1

内容...

## 子主题 2

- 要点 1
- 要点 2

# 第二部分

## 示例代码

```python
def hello():
    print("Hello, World!")
```
```

### 案例 5：制作电子书

```bash
# 完整的 EPUB 电子书
pandoc book.md \
  --toc \
  --epub-cover-image=cover.jpg \
  --epub-metadata=metadata.xml \
  --css=epub.css \
  --metadata title="我的电子书" \
  --metadata author="作者名" \
  --metadata lang=zh-CN \
  -o book.epub

# 转换为 Kindle 格式（需要 Calibre）
ebook-convert book.epub book.mobi
```

### 案例 6：学术论文

```bash
# 学术论文（含参考文献）
pandoc paper.md \
  --bibliography=references.bib \
  --csl=ieee.csl \
  --pdf-engine=xelatex \
  -V mainfont="Times New Roman" \
  -V fontsize=12pt \
  -V geometry:margin=1in \
  --toc \
  -o paper.pdf
```

**paper.md 示例：**
```markdown
---
title: "研究论文标题"
author: "张三"
date: "2025-01-12"
abstract: "这是摘要..."
---

# 引言

根据相关研究 [@smith2020; @jones2021]...

# 方法

$$
E = mc^2
$$

# 结论

# 参考文献
```

### 案例 7：项目文档生成

```bash
# 从 README 生成 HTML 文档
pandoc README.md \
  -s \
  --toc \
  --template=github.html \
  --css=github-markdown.css \
  --highlight-style=pygments \
  -o docs/index.html

# 生成 PDF 版本
pandoc README.md \
  --pdf-engine=xelatex \
  -V CJKmainfont="PingFang SC" \
  -V geometry:margin=0.75in \
  --toc \
  -o docs/README.pdf
```

### 案例 8：API 文档生成

```bash
# OpenAPI/Swagger 转 Markdown
pandoc api-spec.yaml -f openapi -o api-docs.md

# 再转为美化的 HTML
pandoc api-docs.md \
  -s \
  --toc \
  --template=api-template.html \
  --css=api-style.css \
  -o api-docs.html
```

### 案例 9：Jupyter Notebook 转换

```bash
# Notebook 转 Markdown
pandoc notebook.ipynb -o notebook.md

# Notebook 转 HTML
pandoc notebook.ipynb -s -o notebook.html

# Notebook 转 PDF
pandoc notebook.ipynb -o notebook.pdf
```

### 案例 10：创建简历

```bash
# Markdown 简历转 PDF
pandoc resume.md \
  --pdf-engine=xelatex \
  -V geometry:margin=0.5in \
  -V fontsize=11pt \
  -V mainfont="Helvetica" \
  -o resume.pdf

# 同时生成 HTML 版本
pandoc resume.md \
  -s \
  --css=resume.css \
  -o resume.html
```

---

## 最佳实践

### 1. 项目结构

```
project/
├── source/
│   ├── chapters/
│   │   ├── 01-intro.md
│   │   ├── 02-content.md
│   │   └── 03-conclusion.md
│   ├── references.bib
│   └── metadata.yaml
├── templates/
│   ├── html-template.html
│   └── latex-template.tex
├── styles/
│   ├── style.css
│   └── syntax-highlight.theme
├── assets/
│   ├── images/
│   └── cover.jpg
├── output/
└── build.sh
```

### 2. 构建脚本示例

**build.sh:**
```bash
#!/bin/bash

# 配置变量
SOURCE_DIR="source/chapters"
OUTPUT_DIR="output"
TEMPLATE_DIR="templates"
STYLE_DIR="styles"
METADATA="source/metadata.yaml"
BIBLIOGRAPHY="source/references.bib"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 生成 HTML
echo "生成 HTML..."
pandoc "$SOURCE_DIR"/*.md \
  "$METADATA" \
  -s \
  --toc \
  --toc-depth=3 \
  --template="$TEMPLATE_DIR/html-template.html" \
  --css="$STYLE_DIR/style.css" \
  --highlight-style="$STYLE_DIR/syntax-highlight.theme" \
  --mathjax \
  -o "$OUTPUT_DIR/document.html"

# 生成 PDF
echo "生成 PDF..."
pandoc "$SOURCE_DIR"/*.md \
  "$METADATA" \
  --pdf-engine=xelatex \
  --bibliography="$BIBLIOGRAPHY" \
  --toc \
  --toc-depth=3 \
  -V geometry:margin=1in \
  -V fontsize=12pt \
  -o "$OUTPUT_DIR/document.pdf"

# 生成 EPUB
echo "生成 EPUB..."
pandoc "$SOURCE_DIR"/*.md \
  "$METADATA" \
  --toc \
  --epub-cover-image=assets/cover.jpg \
  --css="$STYLE_DIR/epub.css" \
  -o "$OUTPUT_DIR/document.epub"

echo "构建完成！"
```

### 3. Makefile 示例

**Makefile:**
```makefile
# 变量定义
SOURCES := $(wildcard source/chapters/*.md)
OUTPUT_DIR := output
HTML_OUTPUT := $(OUTPUT_DIR)/document.html
PDF_OUTPUT := $(OUTPUT_DIR)/document.pdf
EPUB_OUTPUT := $(OUTPUT_DIR)/document.epub

# 默认目标
all: html pdf epub

# HTML 目标
html: $(HTML_OUTPUT)

$(HTML_OUTPUT): $(SOURCES)
	@mkdir -p $(OUTPUT_DIR)
	pandoc $(SOURCES) \
		-s --toc --toc-depth=3 \
		--template=templates/html-template.html \
		--css=styles/style.css \
		-o $(HTML_OUTPUT)

# PDF 目标
pdf: $(PDF_OUTPUT)

$(PDF_OUTPUT): $(SOURCES)
	@mkdir -p $(OUTPUT_DIR)
	pandoc $(SOURCES) \
		--pdf-engine=xelatex \
		--toc --toc-depth=3 \
		-V geometry:margin=1in \
		-o $(PDF_OUTPUT)

# EPUB 目标
epub: $(EPUB_OUTPUT)

$(EPUB_OUTPUT): $(SOURCES)
	@mkdir -p $(OUTPUT_DIR)
	pandoc $(SOURCES) \
		--toc \
		--epub-cover-image=assets/cover.jpg \
		-o $(EPUB_OUTPUT)

# 清理
clean:
	rm -rf $(OUTPUT_DIR)

# 监视文件变化（需要 entr 工具）
watch:
	find source -name "*.md" | entr make html

.PHONY: all html pdf epub clean watch
```

使用：
```bash
make              # 生成所有格式
make html         # 只生成 HTML
make pdf          # 只生成 PDF
make clean        # 清理输出
make watch        # 监视模式
```

### 4. 元数据文件

**metadata.yaml:**
```yaml
---
title: "项目文档"
subtitle: "完整的技术指南"
author:
  - 张三
  - 李四
date: "2025-01-12"
lang: zh-CN
abstract: |
  这是文档的摘要部分。
  可以包含多行内容。
keywords:
  - 技术文档
  - Pandoc
  - Markdown
toc: true
toc-depth: 3
numbersections: true
geometry:
  - margin=1in
fontsize: 12pt
mainfont: "SimSun"
sansfont: "SimHei"
monofont: "Courier New"
CJKmainfont: "PingFang SC"
---
```

### 5. 常用命令别名

在 `.bashrc` 或 `.zshrc` 中添加：

```bash
# Pandoc 别名
alias md2html='pandoc -s --toc --css=style.css'
alias md2pdf='pandoc --pdf-engine=xelatex -V CJKmainfont="PingFang SC"'
alias md2docx='pandoc -s --toc'

# 使用示例
md2html input.md -o output.html
md2pdf input.md -o output.pdf
```

---

## 故障排查

### 常见问题

#### 1. PDF 生成失败
```bash
# 错误：pdflatex not found
# 解决：安装 LaTeX
brew install basictex  # macOS

# 或尝试其他 PDF 引擎
pandoc input.md --pdf-engine=context -o output.pdf
```

#### 2. 中文支持问题
```bash
# 使用 XeLaTeX 并指定中文字体
pandoc input.md \
  --pdf-engine=xelatex \
  -V CJKmainfont="SimSun" \
  -V CJKsansfont="SimHei" \
  -V CJKmonofont="FangSong" \
  -o output.pdf
```

#### 3. 图片路径问题
```bash
# 使用 --resource-path 指定图片搜索路径
pandoc input.md --resource-path=.:images:assets -o output.pdf
```

#### 4. 查看详细错误信息
```bash
pandoc input.md -o output.pdf --verbose
```

---

## 参考资源

- **官方文档**: https://pandoc.org/MANUAL.html
- **GitHub**: https://github.com/jgm/pandoc
- **模板库**: https://github.com/jgm/pandoc-templates
- **CSL 样式**: https://github.com/citation-style-language/styles
- **过滤器**: https://github.com/pandoc/lua-filters

---

## 总结

Pandoc 是一个极其强大的文档转换工具，掌握它可以极大提高文档处理效率。本文档涵盖了从基础到高级的各种使用场景，建议：

1. **从简单开始**：先掌握基本的格式转换
2. **逐步深入**：学习使用模板、过滤器等高级功能
3. **自动化**：使用脚本和 Makefile 自动化文档生成
4. **版本控制**：将 Markdown 源文件纳入 Git 管理
5. **持续学习**：关注官方文档和社区最佳实践

Happy converting! 📝✨

