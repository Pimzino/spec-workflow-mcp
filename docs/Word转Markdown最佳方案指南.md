# Word 转 Markdown 最佳方案指南

## 📋 目录

- [方案对比](#方案对比)
- [详细方案说明](#详细方案说明)
- [最佳实践建议](#最佳实践建议)
- [提升还原度的技巧](#提升还原度的技巧)
- [方案对比总结](#方案对比总结)
- [实战示例](#实战示例)

---

## 🥇 方案对比

### 1. Pandoc（推荐⭐⭐⭐⭐⭐）

最强大和通用的方案，还原度最高。

#### 基础转换

```bash
pandoc input.docx -o output.md
```

#### 高还原度配置（推荐）

```bash
pandoc input.docx \
  -f docx \
  -t gfm \
  --extract-media=./media \
  --wrap=none \
  --markdown-headings=atx \
  --reference-links \
  -o output.md
```

**参数说明：**
- `-f docx`: 指定输入格式为 Word
- `-t gfm`: 输出为 GitHub Flavored Markdown（更好的表格、任务列表支持）
- `--extract-media=./media`: 提取图片到指定文件夹（保留图片）
- `--wrap=none`: 不自动换行，保持原始段落格式
- `--markdown-headings=atx`: 使用 `#` 风格标题（而非下划线风格）
- `--reference-links`: 使用引用式链接，更整洁

#### 最大化还原配置

```bash
pandoc input.docx \
  -f docx+styles \
  -t gfm+raw_html \
  --extract-media=./media \
  --wrap=none \
  --markdown-headings=atx \
  --standalone \
  --toc \
  --atx-headers \
  -o output.md
```

**优势：**
- ✅ 表格格式完整保留
- ✅ 图片自动提取并保持引用
- ✅ 标题层级准确
- ✅ 列表（有序/无序）正确转换
- ✅ 支持复杂格式（脚注、引用等）
- ✅ 代码块识别

**劣势：**
- ⚠️ 需要安装 Pandoc
- ⚠️ 命令行操作，有一定学习曲线

---

### 2. Mammoth（针对 Web 场景）

专门优化过的 Word 转 Markdown 工具。

#### 安装

```bash
npm install -g mammoth
```

#### 使用

```bash
# 基础转换
mammoth input.docx --output-format=markdown > output.md

# 带选项的转换
mammoth input.docx \
  --output-format=markdown \
  --style-map=style-map.txt \
  > output.md
```

#### 自定义样式映射 (style-map.txt)

```
p[style-name='Heading 1'] => h1
p[style-name='Heading 2'] => h2
p[style-name='Code'] => pre
```

**优势：**
- ✅ 专注于 Word 转换
- ✅ 样式映射更智能
- ✅ 处理复杂样式更好
- ✅ Node.js 生态友好
- ✅ 可编程定制

**劣势：**
- ⚠️ 需要 Node.js 环境
- ⚠️ 表格支持不如 Pandoc

---

### 3. Writage + Pandoc（Windows 最佳）

Writage 是 Word 插件，配合 Pandoc 使用。

#### 安装

1. 下载并安装 [Writage](http://www.writage.com/)
2. 安装 [Pandoc](https://pandoc.org/installing.html)

#### 使用方式

1. 在 Word 中打开 .docx 文件
2. 点击 "文件" → "另存为"
3. 选择保存类型为 "Markdown (*.md)"
4. 保存即可

**优势：**
- ✅ 所见即所得
- ✅ 适合非技术人员
- ✅ 与 Word 深度集成
- ✅ 无需命令行操作
- ✅ 支持双向转换（MD ↔ DOCX）

**劣势：**
- ⚠️ 仅支持 Windows
- ⚠️ 需要安装 Word 软件
- ⚠️ 依赖 Pandoc

---

### 4. docx2md（Python）

Python 实现的转换工具。

#### 安装

```bash
pip install docx2md
```

#### 使用

```bash
# 基础转换
docx2md input.docx -o output.md

# 提取图片
docx2md input.docx -o output.md --image-dir=./images

# Python 代码调用
```

```python
from docx2md import docx2md

# 转换文件
docx2md('input.docx', 'output.md')

# 带图片提取
docx2md('input.docx', 'output.md', image_dir='./images')
```

**优势：**
- ✅ Python 生态友好
- ✅ 可编程定制
- ✅ 易于集成到 Python 项目
- ✅ 支持批量处理

**劣势：**
- ⚠️ 功能不如 Pandoc 全面
- ⚠️ 社区支持较少

---

### 5. docx2txt + 自定义脚本

提取纯文本，然后手动或脚本处理。

#### 安装

```bash
pip install docx2txt
```

#### 使用

```python
import docx2txt

# 提取文本
text = docx2txt.process("input.docx")

# 提取文本和图片
text = docx2txt.process("input.docx", "img_dir/")

# 保存为 Markdown
with open("output.md", "w", encoding="utf-8") as f:
    f.write(text)
```

**优势：**
- ✅ 轻量级
- ✅ 可完全自定义处理逻辑

**劣势：**
- ⚠️ 需要大量手动处理
- ⚠️ 格式信息丢失较多

---

### 6. LibreOffice + Pandoc（跨平台免费方案）

使用 LibreOffice 作为中间层。

#### 安装

1. 安装 [LibreOffice](https://www.libreoffice.org/)
2. 安装 [Pandoc](https://pandoc.org/installing.html)

#### 使用

```bash
# 方法 1：先转为 ODT，再转 MD
libreoffice --headless --convert-to odt input.docx
pandoc input.odt -o output.md

# 方法 2：直接用 LibreOffice 转 HTML，再用 Pandoc
libreoffice --headless --convert-to html input.docx
pandoc input.html -o output.md
```

**优势：**
- ✅ 完全免费开源
- ✅ 跨平台支持
- ✅ 支持无头模式（自动化）

**劣势：**
- ⚠️ 转换链路较长，可能损失格式
- ⚠️ 需要安装完整的 LibreOffice

---

## 🎯 最佳实践建议

### 针对不同场景的推荐

#### 场景 1：技术文档（含代码、表格）

**推荐方案：** Pandoc + GFM 格式

```bash
pandoc input.docx \
  -f docx \
  -t gfm \
  --extract-media=./images \
  --wrap=none \
  --markdown-headings=atx \
  --standalone \
  -o output.md
```

**原因：**
- GFM 对表格、代码块支持最好
- 表格格式保留完整
- 代码语法高亮支持

---

#### 场景 2：含大量图片的文档

**推荐方案：** Pandoc + 完整媒体提取

```bash
pandoc input.docx \
  -t markdown \
  --extract-media=./media \
  --wrap=preserve \
  --standalone \
  -o output.md
```

**额外处理：**
```bash
# 批量优化图片大小
for img in media/media/*.png; do
  convert "$img" -quality 85 "$img"
done
```

---

#### 场景 3：学术论文（含脚注、引用）

**推荐方案：** Pandoc + 学术格式

```bash
pandoc input.docx \
  -f docx \
  -t markdown_strict+footnotes+citations \
  --extract-media=./figures \
  --standalone \
  --wrap=none \
  -o output.md
```

**特点：**
- 保留脚注格式
- 支持引用标记
- 适合再次转换为学术格式

---

#### 场景 4：需求规格说明书

**推荐方案：** Pandoc + 完整结构

```bash
pandoc 需求规格说明书.docx \
  -f docx \
  -t gfm \
  --extract-media=./需求规格说明书_images \
  --wrap=none \
  --markdown-headings=atx \
  --standalone \
  --toc \
  --toc-depth=4 \
  -o 需求规格说明书.md
```

**特点：**
- 自动生成目录（--toc）
- 保留 4 级标题结构
- 表格完整保留（重要）

---

#### 场景 5：批量转换

**推荐方案：** Bash/Python 脚本自动化

```bash
#!/bin/bash
# batch-convert.sh

for file in *.docx; do
  filename="${file%.docx}"
  echo "正在转换: $file"
  
  pandoc "$file" \
    -f docx \
    -t gfm \
    --extract-media="./media_${filename}" \
    --wrap=none \
    --standalone \
    -o "${filename}.md"
  
  echo "✅ 完成: ${filename}.md"
done

echo "🎉 所有文件转换完成！"
```

---

## 💡 提升还原度的技巧

### 1. 预处理 Word 文档

在转换前优化 Word 文档：

#### 1.1 统一样式
```
✅ 使用标准样式：标题 1-6、正文、引用
✅ 代码使用"代码"样式或等宽字体
❌ 避免过度使用自定义格式
❌ 减少手动调整字体大小、颜色
```

#### 1.2 优化表格
```
✅ 使用简单表格（网格线表格）
✅ 避免复杂的合并单元格
✅ 表格内容尽量简洁
❌ 避免嵌套表格
❌ 避免表格内使用复杂格式
```

#### 1.3 处理图片
```
✅ 使用"嵌入式"图片
✅ 图片命名规范（如：fig-01-architecture.png）
✅ 图片尺寸适中
❌ 避免"浮动式"或"环绕式"图片
❌ 避免过大的图片文件
```

#### 1.4 清理格式
```
Word 中操作：
1. 全选文本（Ctrl/Cmd + A）
2. 清除格式（开始 → 清除所有格式）
3. 重新应用标准样式
4. 保存为新文件
```

---

### 2. 后处理 Markdown

转换后的优化步骤：

#### 2.1 检查表格格式

```bash
# 使用工具格式化表格
npm install -g markdown-table-formatter

# 格式化 MD 文件中的表格
markdown-table-formatter input.md -o output.md
```

#### 2.2 验证图片链接

```bash
# 检查所有图片链接
grep -E '!\[.*\]\(.*\)' output.md

# 批量修正图片路径
sed -i 's|media/media/|images/|g' output.md
```

#### 2.3 修正特殊字符

```bash
# 修正常见问题
sed -i 's/​//g' output.md              # 删除零宽空格
sed -i 's/　/ /g' output.md            # 全角空格转半角
sed -i 's/"/"/g; s/"/"/g' output.md    # 统一引号
```

#### 2.4 添加代码块语言标识

```markdown
<!-- 转换前 -->
```
function test() {
  console.log("hello");
}
```

<!-- 转换后（手动添加语言） -->
```javascript
function test() {
  console.log("hello");
}
```
```

---

### 3. 使用转换脚本

#### 完整的转换+清理脚本

```bash
#!/bin/bash
# convert-with-cleanup.sh

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ 错误: 请提供 Word 文件路径${NC}"
    echo "用法: $0 input.docx [output.md]"
    exit 1
fi

INPUT="$1"
OUTPUT="${2:-${INPUT%.docx}.md}"
BASENAME=$(basename "${INPUT%.docx}")
MEDIA_DIR="./media_${BASENAME}"

echo -e "${BLUE}📄 开始转换: $INPUT${NC}"

# 检查 Pandoc 是否安装
if ! command -v pandoc &> /dev/null; then
    echo -e "${RED}❌ 错误: 请先安装 Pandoc${NC}"
    exit 1
fi

# 创建媒体目录
mkdir -p "$MEDIA_DIR"

# 步骤 1: 转换
echo -e "${BLUE}🔄 步骤 1/4: 转换文档...${NC}"
pandoc "$INPUT" \
  -f docx \
  -t gfm \
  --extract-media="$MEDIA_DIR" \
  --wrap=none \
  --markdown-headings=atx \
  --standalone \
  --toc \
  -o "$OUTPUT"

# 步骤 2: 清理特殊字符
echo -e "${BLUE}🧹 步骤 2/4: 清理特殊字符...${NC}"
# 删除零宽空格
sed -i '' 's/​//g' "$OUTPUT" 2>/dev/null || sed -i 's/​//g' "$OUTPUT"
# 全角空格转半角
sed -i '' 's/　/ /g' "$OUTPUT" 2>/dev/null || sed -i 's/　/ /g' "$OUTPUT"

# 步骤 3: 优化图片路径
echo -e "${BLUE}🖼️  步骤 3/4: 优化图片路径...${NC}"
if [ -d "$MEDIA_DIR/media" ]; then
    # 移动图片到根目录
    mv "$MEDIA_DIR/media"/* "$MEDIA_DIR/" 2>/dev/null || true
    rmdir "$MEDIA_DIR/media" 2>/dev/null || true
    # 更新 MD 文件中的路径
    sed -i '' "s|$MEDIA_DIR/media/|$MEDIA_DIR/|g" "$OUTPUT" 2>/dev/null || \
    sed -i "s|$MEDIA_DIR/media/|$MEDIA_DIR/|g" "$OUTPUT"
fi

# 步骤 4: 生成统计信息
echo -e "${BLUE}📊 步骤 4/4: 生成统计信息...${NC}"
LINES=$(wc -l < "$OUTPUT")
IMAGES=$(grep -c '!\[.*\]' "$OUTPUT" 2>/dev/null || echo "0")
TABLES=$(grep -c '^|' "$OUTPUT" 2>/dev/null || echo "0")

# 完成
echo ""
echo -e "${GREEN}✅ 转换完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "📝 输出文件: ${BLUE}$OUTPUT${NC}"
echo -e "📁 媒体目录: ${BLUE}$MEDIA_DIR${NC}"
echo -e "📏 总行数: $LINES"
echo -e "🖼️  图片数: $IMAGES"
echo -e "📊 表格数: $TABLES"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
```

**使用方式：**
```bash
chmod +x convert-with-cleanup.sh
./convert-with-cleanup.sh input.docx
./convert-with-cleanup.sh input.docx custom-output.md
```

---

#### Python 批量转换脚本

```python
#!/usr/bin/env python3
# batch_convert.py

import os
import sys
import subprocess
from pathlib import Path

def convert_docx_to_md(docx_file, output_dir="./output"):
    """转换单个 docx 文件为 markdown"""
    
    # 确保输出目录存在
    Path(output_dir).mkdir(exist_ok=True)
    
    # 生成输出文件名
    basename = Path(docx_file).stem
    output_file = Path(output_dir) / f"{basename}.md"
    media_dir = Path(output_dir) / f"media_{basename}"
    
    # Pandoc 命令
    cmd = [
        "pandoc",
        str(docx_file),
        "-f", "docx",
        "-t", "gfm",
        "--extract-media", str(media_dir),
        "--wrap=none",
        "--markdown-headings=atx",
        "--standalone",
        "--toc",
        "-o", str(output_file)
    ]
    
    try:
        print(f"🔄 正在转换: {docx_file}")
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"✅ 完成: {output_file}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 转换失败: {docx_file}")
        print(f"错误信息: {e.stderr.decode()}")
        return False

def batch_convert(input_dir=".", output_dir="./output"):
    """批量转换目录中的所有 docx 文件"""
    
    # 查找所有 docx 文件
    docx_files = list(Path(input_dir).glob("*.docx"))
    
    if not docx_files:
        print("❌ 未找到任何 .docx 文件")
        return
    
    print(f"📁 找到 {len(docx_files)} 个文件")
    print("━" * 50)
    
    # 转换统计
    success_count = 0
    fail_count = 0
    
    # 逐个转换
    for docx_file in docx_files:
        if convert_docx_to_md(docx_file, output_dir):
            success_count += 1
        else:
            fail_count += 1
        print()
    
    # 输出统计
    print("━" * 50)
    print(f"🎉 转换完成！")
    print(f"✅ 成功: {success_count}")
    print(f"❌ 失败: {fail_count}")

if __name__ == "__main__":
    # 检查 pandoc 是否安装
    try:
        subprocess.run(["pandoc", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ 错误: 请先安装 Pandoc")
        print("安装方法: brew install pandoc  # macOS")
        sys.exit(1)
    
    # 运行批量转换
    if len(sys.argv) > 1:
        input_dir = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else "./output"
        batch_convert(input_dir, output_dir)
    else:
        batch_convert()
```

**使用方式：**
```bash
# 转换当前目录所有 docx
python3 batch_convert.py

# 转换指定目录
python3 batch_convert.py /path/to/docx/files

# 指定输出目录
python3 batch_convert.py /path/to/docx/files /path/to/output
```

---

### 4. 质量检查清单

转换完成后的检查项：

#### ✅ 结构检查
- [ ] 标题层级是否正确（h1-h6）
- [ ] 目录是否完整
- [ ] 章节编号是否保留
- [ ] 列表缩进是否正确

#### ✅ 内容检查
- [ ] 表格格式是否完整
- [ ] 代码块是否正确识别
- [ ] 引用/脚注是否保留
- [ ] 特殊字符是否正常显示

#### ✅ 媒体检查
- [ ] 图片是否全部提取
- [ ] 图片链接是否正确
- [ ] 图片文件名是否规范
- [ ] 图片是否需要压缩

#### ✅ 格式检查
- [ ] 无多余空行
- [ ] 行尾无空格
- [ ] 链接格式统一
- [ ] 代码块有语言标识

---

## 📊 方案对比总结

| 方案 | 还原度 | 易用性 | 速度 | 表格 | 图片 | 样式 | 跨平台 | 适用场景 |
|------|--------|--------|------|------|------|------|--------|----------|
| **Pandoc** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ✅ | 通用、技术文档 |
| **Mammoth** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ | ✅ | ✅ | ✅ | Web 内容、博客 |
| **Writage** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ✅ | ✅ | ❌ | 非技术用户（Windows） |
| **docx2md** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ | ✅ | ⚠️ | ✅ | Python 项目 |
| **docx2txt** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⚠️ | ❌ | ✅ | 纯文本提取 |
| **LibreOffice** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⚠️ | ✅ | ⚠️ | ✅ | 免费开源方案 |

**图例：**
- ⭐ 评分（越多越好）
- ✅ 支持良好
- ⚠️ 部分支持
- ❌ 不支持或较差

---

## 🚀 实战示例

### 示例 1：需求规格说明书

```bash
# 文件：Linklogis_需求规格说明书_多级流转系统_V4.0.3.docx

pandoc Linklogis_需求规格说明书_多级流转系统_V4.0.3.docx \
  -f docx \
  -t gfm \
  --extract-media=./需求规格说明书_images \
  --wrap=none \
  --markdown-headings=atx \
  --standalone \
  --toc \
  --toc-depth=4 \
  -o Linklogis_需求规格说明书_多级流转系统_V4.0.3.md
```

**特点：**
- ✅ 生成 4 级目录
- ✅ 表格完整保留（需求表格很重要）
- ✅ 图片集中管理
- ✅ GFM 格式便于 GitHub/GitLab 查看

---

### 示例 2：技术文档

```bash
# 文件：技术架构设计文档.docx

pandoc 技术架构设计文档.docx \
  -f docx \
  -t gfm \
  --extract-media=./tech-doc-images \
  --wrap=none \
  --markdown-headings=atx \
  --standalone \
  --toc \
  --highlight-style=tango \
  -o 技术架构设计文档.md
```

**特点：**
- ✅ 代码高亮支持
- ✅ 架构图完整提取
- ✅ 表格格式保留

---

### 示例 3：API 文档

```bash
# 文件：API接口文档.docx

pandoc API接口文档.docx \
  -f docx \
  -t gfm \
  --extract-media=./api-images \
  --wrap=none \
  --standalone \
  --toc \
  -o API接口文档.md

# 后处理：添加语法高亮
sed -i '' 's/```json$/```json/g' API接口文档.md
sed -i '' 's/```http$/```http/g' API接口文档.md
```

---

### 示例 4：用户手册

```bash
# 文件：用户操作手册.docx

pandoc 用户操作手册.docx \
  -f docx \
  -t gfm \
  --extract-media=./manual-images \
  --wrap=none \
  --standalone \
  --toc \
  --toc-depth=3 \
  -o 用户操作手册.md

# 生成 HTML 版本（带搜索）
pandoc 用户操作手册.md \
  -s \
  --toc \
  --template=manual-template.html \
  --css=manual-style.css \
  -o 用户操作手册.html
```

---

### 示例 5：会议纪要批量转换

```bash
#!/bin/bash
# 批量转换会议纪要

for file in 会议纪要_*.docx; do
    basename="${file%.docx}"
    echo "转换: $file"
    
    pandoc "$file" \
      -f docx \
      -t gfm \
      --wrap=none \
      -o "markdown/${basename}.md"
done

echo "✅ 完成！已转换到 markdown/ 目录"
```

---

## 📚 参考资源

### 官方文档
- [Pandoc 官方文档](https://pandoc.org/MANUAL.html)
- [Pandoc GitHub](https://github.com/jgm/pandoc)
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js)
- [Writage](http://www.writage.com/)

### 样式和模板
- [Pandoc 模板库](https://github.com/jgm/pandoc-templates)
- [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css)
- [Markdown 样式集合](https://github.com/markdowncss/modest)

### 辅助工具
- [Markdown 表格格式化器](https://www.npmjs.com/package/markdown-table-formatter)
- [Markdown Lint](https://github.com/DavidAnson/markdownlint)
- [图片优化工具 ImageMagick](https://imagemagick.org/)

### 在线工具
- [Pandoc Online](https://pandoc.org/try/)
- [Word to Markdown Converter](https://word2md.com/)
- [CloudConvert](https://cloudconvert.com/docx-to-md)

---

## 🎓 总结

### 最佳推荐

1. **优先选择：Pandoc** （⭐⭐⭐⭐⭐）
   - 功能最强大、还原度最高
   - 跨平台、开源免费
   - 社区活跃、文档完善
   - 适合 90% 的场景

2. **备选方案：Mammoth**
   - 适合 Node.js 环境
   - Web 内容转换优秀
   - 样式映射灵活

3. **非技术用户：Writage**
   - 图形界面，所见即所得
   - 适合不熟悉命令行的用户
   - 仅限 Windows 平台

### 工作流建议

```
原始 Word 文档
    ↓
预处理（统一样式、优化表格）
    ↓
Pandoc 转换
    ↓
后处理（清理、验证）
    ↓
质量检查
    ↓
最终 Markdown 文档
```

### 关键要点

1. **预处理很重要**：在 Word 中统一样式可以大幅提升还原度
2. **选择合适格式**：GFM 适合技术文档，Markdown Strict 适合学术文档
3. **提取媒体文件**：使用 `--extract-media` 参数保存图片
4. **后处理必不可少**：清理特殊字符、优化格式
5. **自动化批量处理**：使用脚本提高效率
6. **质量检查**：转换后务必检查表格、图片、代码块

---

## 💪 实战技巧

### 技巧 1：处理大文件

```bash
# 大文件可能需要增加内存限制
pandoc large-document.docx \
  -f docx \
  -t gfm \
  --extract-media=./media \
  +RTS -K512m -RTS \
  -o output.md
```

### 技巧 2：保留更多格式

```bash
# 使用 raw_html 保留 HTML 标签
pandoc input.docx \
  -f docx \
  -t gfm+raw_html \
  --extract-media=./media \
  -o output.md
```

### 技巧 3：自定义图片命名

```bash
# 转换后重命名图片
cd media/media
counter=1
for img in image*.png; do
  mv "$img" "fig-$(printf "%02d" $counter).png"
  ((counter++))
done
```

### 技巧 4：合并多个文档

```bash
# 合并多个章节
pandoc chapter-*.docx \
  -f docx \
  -t gfm \
  --extract-media=./media \
  -o complete-book.md
```

### 技巧 5：生成多种格式

```bash
# 一次转换，输出多种格式
pandoc input.docx -o output.md    # Markdown
pandoc input.docx -o output.html  # HTML
pandoc input.docx -o output.pdf   # PDF
```

---

**版本信息：**
- 文档版本：v1.0
- 最后更新：2025-10-13
- 适用 Pandoc 版本：2.x 及以上

**许可证：** MIT License

---

🎉 祝您转换顺利！如有问题，欢迎参考 [Pandoc 官方文档](https://pandoc.org/MANUAL.html)。

