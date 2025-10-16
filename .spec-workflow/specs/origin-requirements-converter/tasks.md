# 任务文档 - 原始需求文档转换器

## 任务分组

### 阶段 1: 基础架构（共 5 个任务）

- [x] 1.1 创建类型定义
- [x] 1.2 实现 Pandoc 执行器
- [x] 1.3 创建文件工具模块
- [x] 1.4 扩展配置管理
- [x] 1.5 创建转换策略接口

### 阶段 2: 转换策略实现（共 2 个任务）

- [x] 2.1 实现 Word2Md 转换策略
- [x] 2.2 实现 Md2Word 转换策略

### 阶段 3: 服务层（共 1 个任务）

- [x] 3.1 实现文档转换服务

### 阶段 4: MCP Tools（共 2 个任务）

- [x] 4.1 实现 convert-origin-requirement 工具
- [x] 4.2 实现 md2word 工具

### 阶段 5: 测试（共 6 个任务）

- [x] 5.1 单元测试 - PandocExecutor
- [x] 5.2 单元测试 - 转换策略
- [x] 5.3 单元测试 - DocumentConverter
- [x] 5.4 集成测试 - 转换流程
- [x] 5.5 集成测试 - MCP Tools
- [x] 5.6 端到端测试 - 完整场景

### 阶段 6: 文档和部署（共 2 个任务）

- [x] 6.1 更新项目文档
- [x] 6.2 更新 Dockerfile

---

## 详细任务列表

### 阶段 1: 基础架构

#### [x] 1.1 创建类型定义

- **文件**: `src/types/converter-types.ts`
- **目的**: 定义转换器相关的 TypeScript 类型和接口
- **任务内容**:
  - 定义 `ConversionConfig` 接口
  - 定义 `ConversionResult` 接口
  - 定义 `ConversionTask` 接口
  - 定义 `PandocCommand` 接口
  - 定义 `PandocOptions` 接口
  - 定义转换类型枚举 `ConversionType`
  - 定义错误类型
- **复用组件**: 无（新创建）
- **依赖**: 无
- **需求映射**: 需求 7（策略模式）
- **验收标准**:
  - 所有接口编译无错误
  - 类型定义完整且符合设计文档
  - 包含完整的 JSDoc 注释
- **AI Prompt**:

  ```
  Role: TypeScript Developer specializing in type systems and interfaces

  Task: Create comprehensive TypeScript type definitions for the document converter system in src/types/converter-types.ts. Define interfaces for ConversionConfig, ConversionResult, ConversionTask, PandocCommand, PandocOptions, and error types. Include ConversionType enum for 'word2md' and 'md2word'.

  Restrictions:
  - Must follow project TypeScript coding standards
  - All interfaces must have complete JSDoc comments
  - Use strict type checking (no 'any' types)
  - Follow naming conventions from design document

  Success Criteria:
  - All types compile without errors or warnings
  - Complete type coverage for converter system
  - JSDoc documentation for all public interfaces
  - Type definitions match design document specifications
  ```

#### [x] 1.2 实现 Pandoc 执行器

- **文件**: `src/utils/pandoc-executor.ts`
- **目的**: 封装 Pandoc 命令执行逻辑
- **任务内容**:
  - 创建 `PandocExecutor` 类
  - 实现 `checkAvailability()` 方法检查 Pandoc 是否可用
  - 实现 `execute()` 方法执行 Pandoc 命令
  - 实现错误处理和日志记录
  - 添加命令参数安全验证
- **复用组件**: `src/utils/logger.ts`（日志记录）
- **依赖**: 任务 1.1（类型定义）
- **需求映射**: 需求 4、需求 5（Pandoc 配置）
- **验收标准**:
  - Pandoc 可用性检查正常工作
  - 命令执行成功并返回正确结果
  - 错误场景正确处理并记录日志
  - 包含参数安全验证防止命令注入
- **AI Prompt**:

  ```
  Role: Backend Developer with expertise in Node.js child processes and command execution

  Task: Implement PandocExecutor class in src/utils/pandoc-executor.ts that wraps Pandoc command execution. Include checkAvailability() method to verify Pandoc installation, execute() method to run commands with proper error handling, and security validation to prevent command injection.

  Leverage:
  - src/utils/logger.ts for logging
  - src/types/converter-types.ts for type definitions

  Restrictions:
  - Must use Node.js spawn() for process execution
  - Must validate all command arguments for security
  - Must capture both stdout and stderr
  - Must handle process errors gracefully
  - Do not use shell execution mode

  Success Criteria:
  - checkAvailability() correctly detects Pandoc installation
  - execute() runs Pandoc commands and returns results
  - All errors are properly caught and logged
  - Command injection is prevented through argument validation
  - Async/await pattern used throughout
  ```

#### [x] 1.3 创建文件工具模块

- **文件**: `src/utils/file-utils.ts`
- **目的**: 提供文件操作相关的工具函数
- **任务内容**:
  - 实现路径验证函数 `validatePath()`
  - 实现文件大小检查函数 `validateFileSize()`
  - 实现 ZIP 解压函数 `extractZip()`
  - 实现目录清理函数 `cleanDirectory()`
  - 实现文件存在性检查 `fileExists()`
  - 添加路径遍历防护
- **复用组件**: Node.js `fs/promises`, `path`
- **依赖**: 任务 1.1（类型定义）
- **需求映射**: 需求 1（文件组织）、需求 10（临时文件管理）
- **验收标准**:
  - 路径验证正确防止路径遍历攻击
  - 文件大小检查符合 10MB 限制
  - ZIP 解压功能正常工作
  - 目录清理不影响其他文件
- **AI Prompt**:

  ```
  Role: Backend Developer with expertise in file system operations and security

  Task: Create file utility functions in src/utils/file-utils.ts including path validation (prevent traversal attacks), file size validation (10MB limit), ZIP extraction, directory cleanup, and file existence checking. Ensure all operations are secure and handle errors gracefully.

  Leverage:
  - Node.js fs/promises for async file operations
  - Node.js path for path manipulation
  - adm-zip or similar for ZIP handling

  Restrictions:
  - Must prevent path traversal attacks
  - Must enforce file size limits
  - Must handle ENOENT and EACCES errors gracefully
  - Do not use synchronous file operations
  - Must clean up temporary files on errors

  Success Criteria:
  - Path validation prevents ../../../ attacks
  - File size validation enforces 10MB limit
  - ZIP extraction works with nested directories
  - Directory cleanup removes only target files
  - All functions have proper error handling
  ```

#### [x] 1.4 扩展配置管理

- **文件**: `src/utils/config.ts`（修改现有）
- **目的**: 支持 Pandoc 和转换器相关配置
- **任务内容**:
  - 添加 `pandocPath` 配置项读取
  - 添加 `converterApiUrl` 配置项读取
  - 添加 `apiTimeout` 配置项读取
  - 实现配置优先级逻辑（CLI > 配置文件 > 系统 PATH）
  - 添加配置验证逻辑
- **复用组件**: 现有的 `ConfigManager` 类
- **依赖**: 任务 1.1（类型定义）
- **需求映射**: 需求 5（Pandoc 配置）
- **验收标准**:
  - 配置优先级正确实现
  - 命令行参数正确解析
  - 配置文件正确读取
  - 配置验证功能正常
- **AI Prompt**:

  ```
  Role: DevOps Engineer with expertise in configuration management and CLI parsing

  Task: Extend existing ConfigManager in src/utils/config.ts to support Pandoc configuration. Add support for pandocPath, converterApiUrl, and apiTimeout. Implement configuration priority: CLI args > config file > system PATH > API service. Add validation for all new configuration options.

  Leverage:
  - Existing ConfigManager class and patterns
  - src/types/converter-types.ts for ConversionConfig type
  - process.argv for CLI parsing

  Restrictions:
  - Must maintain backward compatibility
  - Must follow existing config loading patterns
  - Do not break existing configuration
  - Must validate Pandoc path if specified

  Success Criteria:
  - CLI argument --pandocPath works correctly
  - Config file pandocPath is loaded
  - Configuration priority is correctly implemented
  - Invalid configurations are rejected with clear errors
  - Existing functionality remains intact
  ```

#### [x] 1.5 创建转换策略接口

- **文件**: `src/services/strategies/conversion-strategy.ts`
- **目的**: 定义转换策略的统一接口
- **任务内容**:
  - 创建 `IConversionStrategy` 接口
  - 定义 `convertWithPandoc()` 方法签名
  - 定义 `convertWithApi()` 方法签名
  - 添加接口文档注释
- **复用组件**: 无（新创建接口）
- **依赖**: 任务 1.1（类型定义）
- **需求映射**: 需求 7（策略模式）
- **验收标准**:
  - 接口定义清晰完整
  - 方法签名符合设计文档
  - 包含完整的 JSDoc 文档
- **AI Prompt**:

  ```
  Role: Software Architect specializing in design patterns and interfaces

  Task: Define IConversionStrategy interface in src/services/strategies/conversion-strategy.ts following the Strategy pattern. Include convertWithPandoc() and convertWithApi() method signatures with proper parameter types and return types. Add comprehensive JSDoc documentation.

  Leverage:
  - src/types/converter-types.ts for type references
  - Strategy pattern design principles

  Restrictions:
  - Interface must be implementation-agnostic
  - Method signatures must match design document
  - Must support both Pandoc and API conversion modes
  - Do not include implementation details

  Success Criteria:
  - Interface clearly defines strategy contract
  - Method signatures are properly typed
  - JSDoc explains each method's purpose and parameters
  - Interface supports both word2md and md2word strategies
  ```

---

### 阶段 2: 转换策略实现

#### [x] 2.1 实现 Word2Md 转换策略

- **文件**: `src/services/strategies/word2md-strategy.ts`
- **目的**: 实现 Word 到 Markdown 的转换逻辑
- **任务内容**:
  - 创建 `Word2MdStrategy` 类实现 `IConversionStrategy`
  - 实现 `convertWithPandoc()` 方法
    - 创建输出目录 `.temp/{filename}/`
    - 构建 Pandoc 命令
    - 执行转换
    - 验证输出文件
  - 实现 `convertWithApi()` 方法
    - 上传文件到 API
    - 接收并解压 ZIP
    - 验证文件结构
  - 实现错误处理
- **复用组件**:
  - `src/utils/pandoc-executor.ts`（Pandoc 执行）
  - `src/utils/file-utils.ts`（文件操作）
  - `src/utils/logger.ts`（日志记录）
- **依赖**: 任务 1.2、1.3、1.5
- **需求映射**: 需求 4（Word 转换）、需求 7（策略模式）
- **验收标准**:
  - Pandoc 转换生成正确的目录结构
  - 媒体文件正确提取到 `media/` 目录
  - API 转换正确处理压缩包
  - 错误场景正确处理
- **AI Prompt**:

  ```
  Role: Backend Developer with expertise in document conversion and file processing

  Task: Implement Word2MdStrategy class in src/services/strategies/word2md-strategy.ts that implements IConversionStrategy. Provide both Pandoc-based local conversion (creating .temp/{filename}/ structure with media folder) and API-based conversion (handling ZIP responses). Follow the design document's command structure and error handling.

  Leverage:
  - src/utils/pandoc-executor.ts for Pandoc execution
  - src/utils/file-utils.ts for file operations and ZIP extraction
  - src/utils/logger.ts for logging
  - src/services/strategies/conversion-strategy.ts for interface

  Restrictions:
  - Must implement IConversionStrategy interface exactly
  - Pandoc command must match design: pandoc -f docx -t gfm --extract-media=.temp/{filename}/media --wrap=none -o .temp/{filename}/{filename}.md
  - Must validate output files exist after conversion
  - Must clean up on conversion failure
  - API requests must have proper timeout and error handling

  Success Criteria:
  - Pandoc conversion creates correct directory structure
  - Media files extracted to .temp/{filename}/media/
  - API conversion handles ZIP format correctly
  - All errors properly caught and logged
  - Output validation ensures conversion success
  ```

#### [x] 2.2 实现 Md2Word 转换策略

- **文件**: `src/services/strategies/md2word-strategy.ts`
- **目的**: 实现 Markdown 到 Word 的转换逻辑
- **任务内容**:
  - 创建 `Md2WordStrategy` 类实现 `IConversionStrategy`
  - 实现 `convertWithPandoc()` 方法
    - 构建 Pandoc 命令
    - 执行转换
    - 验证输出文件
    - 保存到同级目录
  - 实现 `convertWithApi()` 方法
    - 上传文件到 API
    - 接收文件流
    - 保存到同级目录
  - 实现错误处理
- **复用组件**:
  - `src/utils/pandoc-executor.ts`（Pandoc 执行）
  - `src/utils/file-utils.ts`（文件操作）
  - `src/utils/logger.ts`（日志记录）
- **依赖**: 任务 1.2、1.3、1.5
- **需求映射**: 需求 10（Md2Word 工具）、需求 7（策略模式）
- **验收标准**:
  - Pandoc 转换生成正确的 Word 文件
  - 输出文件保存在输入文件同级目录
  - API 转换正确处理文件流
  - 格式保留符合要求
- **AI Prompt**:

  ```
  Role: Backend Developer with expertise in document conversion and Pandoc

  Task: Implement Md2WordStrategy class in src/services/strategies/md2word-strategy.ts that implements IConversionStrategy. Provide both Pandoc-based local conversion and API-based conversion. Output DOCX file must be saved in same directory as input file with .docx extension. Preserve Markdown formatting (headings, lists, tables, code blocks, images).

  Leverage:
  - src/utils/pandoc-executor.ts for Pandoc execution
  - src/utils/file-utils.ts for file operations
  - src/utils/logger.ts for logging
  - src/services/strategies/conversion-strategy.ts for interface

  Restrictions:
  - Must implement IConversionStrategy interface exactly
  - Pandoc command must be: pandoc -f gfm -t docx -o {output} {input}
  - Output file must be in same directory as input
  - Must validate output file exists and has content
  - API response must be saved as binary file

  Success Criteria:
  - Pandoc conversion generates valid DOCX file
  - Output filename matches input with .docx extension
  - File saved in correct directory (same as input)
  - API conversion handles file stream correctly
  - Markdown formatting preserved in Word output
  ```

---

### 阶段 3: 服务层

#### [x] 3.1 实现文档转换服务

- **文件**: `src/services/document-converter.ts`
- **目的**: 协调转换策略和配置，提供统一转换接口
- **任务内容**:
  - 创建 `DocumentConverter` 类
  - 实现构造函数，接受配置
  - 实现 `convert()` 方法
    - 根据类型选择策略
    - 判断使用 Pandoc 还是 API
    - 执行转换
    - 返回结果
  - 实现 `shouldUsePandoc()` 私有方法
  - 实现 `getStrategy()` 私有方法
  - 注册所有转换策略
- **复用组件**:
  - `src/services/strategies/word2md-strategy.ts`
  - `src/services/strategies/md2word-strategy.ts`
  - `src/utils/config.ts`（配置管理）
  - `src/utils/logger.ts`（日志记录）
- **依赖**: 任务 1.2、1.4、2.1、2.2
- **需求映射**: 需求 7（转换服务）
- **验收标准**:
  - 策略选择逻辑正确
  - Pandoc/API 降级逻辑正确
  - 转换结果正确返回
  - 错误处理完整
- **AI Prompt**:

  ```
  Role: Backend Developer with expertise in service layer architecture and design patterns

  Task: Implement DocumentConverter service class in src/services/document-converter.ts that orchestrates document conversion using Strategy pattern. Support both 'word2md' and 'md2word' types. Implement fallback logic: local Pandoc (priority) -> API service (fallback). Inject strategies via constructor or strategy map.

  Leverage:
  - src/services/strategies/word2md-strategy.ts
  - src/services/strategies/md2word-strategy.ts
  - src/utils/pandoc-executor.ts for Pandoc availability check
  - src/utils/config.ts for configuration
  - src/utils/logger.ts for logging

  Restrictions:
  - Must use Strategy pattern for extensibility
  - Must implement configuration priority correctly
  - Must handle Pandoc unavailability gracefully
  - Do not hardcode strategy selection logic
  - Must validate conversion type before processing

  Success Criteria:
  - convert() method correctly selects strategy by type
  - shouldUsePandoc() checks Pandoc availability correctly
  - Automatic fallback to API when Pandoc unavailable
  - All conversion types supported
  - Comprehensive error handling and logging
  ```

---

### 阶段 4: MCP Tools

#### [x] 4.1 实现 convert-origin-requirement 工具

- **文件**: `src/tools/convert-origin-requirement.ts`
- **目的**: 提供 MCP 工具将原始需求文档转换为规范需求文档
- **任务内容**:
  - 定义工具输入输出接口
  - 实现工具处理函数
    - 解析 `filename`（去除 `#` 前缀）
    - 在 `origin-requirements/` 查找文件
    - 判断文件格式
    - 调用 DocumentConverter 转换（如需）
    - 读取 Markdown 内容
    - 转换为 spec-workflow 规范格式
    - 保存到 `.spec-workflow/specs/{spec-name}/requirements.md`
  - 注册到 MCP server
- **复用组件**:
  - `src/services/document-converter.ts`（转换服务）
  - `src/utils/file-utils.ts`（文件操作）
  - 现有的 MCP 工具注册机制
- **依赖**: 任务 1.3、3.1
- **需求映射**: 需求 2（文档引用语法）、需求 3（Markdown 直接处理）、需求 6（MCP Tool）
- **验收标准**:
  - `#filename` 语法正确解析
  - 文件查找逻辑正确
  - `.md` 文件直接处理
  - 非 `.md` 文件正确转换
  - 生成的需求文档符合 spec-workflow 规范
- **AI Prompt**:

  ```
  Role: MCP Tool Developer with expertise in Model Context Protocol and document processing

  Task: Implement convert-origin-requirement MCP tool in src/tools/convert-origin-requirement.ts. Parse filename (remove # prefix), locate file in origin-requirements/, determine format, convert if needed using DocumentConverter, read/parse Markdown content, transform to spec-workflow requirements.md format, and save to .spec-workflow/specs/{spec-name}/requirements.md.

  Leverage:
  - src/services/document-converter.ts for conversion
  - src/utils/file-utils.ts for file operations
  - Existing MCP tool patterns from src/tools/
  - @modelcontextprotocol/sdk for MCP tool definition

  Restrictions:
  - Must follow MCP tool schema and patterns
  - Must handle # prefix removal correctly
  - Must skip conversion for .md files
  - Must validate input filename
  - Must provide clear error messages
  - Tool schema must define all input parameters

  Success Criteria:
  - Tool registered successfully in MCP server
  - #filename syntax parsing works correctly
  - .md files processed directly without conversion
  - Non-.md files converted via DocumentConverter
  - Output requirements.md matches spec-workflow format
  - Comprehensive error handling with user-friendly messages
  ```

#### [x] 4.2 实现 md2word 工具

- **文件**: `src/tools/md2word.ts`
- **目的**: 提供 MCP 工具将 Markdown 文件转换为 Word 文档
- **任务内容**:
  - 定义工具输入输出接口
  - 实现工具处理函数
    - 验证输入文件存在且为 `.md`
    - 确定输出路径（默认同级目录）
    - 调用 DocumentConverter 转换
    - 返回生成的 Word 文件路径
  - 注册到 MCP server
- **复用组件**:
  - `src/services/document-converter.ts`（转换服务）
  - `src/utils/file-utils.ts`（文件操作）
  - 现有的 MCP 工具注册机制
- **依赖**: 任务 1.3、3.1
- **需求映射**: 需求 10（Md2Word 工具）
- **验收标准**:
  - 输入验证正确
  - 输出路径计算正确
  - 转换调用正确
  - 返回结果准确
- **AI Prompt**:

  ```
  Role: MCP Tool Developer with expertise in Model Context Protocol

  Task: Implement md2word MCP tool in src/tools/md2word.ts. Validate input file is .md format and exists, determine output path (default: same directory with .docx extension), call DocumentConverter with 'md2word' type, return generated Word file path. Follow MCP tool patterns.

  Leverage:
  - src/services/document-converter.ts for conversion
  - src/utils/file-utils.ts for validation
  - Existing MCP tool patterns from src/tools/
  - @modelcontextprotocol/sdk for MCP tool definition

  Restrictions:
  - Must validate input file format
  - Must check file existence before conversion
  - Must handle conversion errors gracefully
  - Output path must default to same directory as input
  - Tool schema must define filePath and optional outputPath

  Success Criteria:
  - Tool registered successfully in MCP server
  - Input validation rejects non-.md files
  - Output path correctly calculated from input path
  - Conversion successfully generates Word file
  - Error messages are clear and actionable
  ```

---

### 阶段 5: 测试

#### [x] 5.1 单元测试 - PandocExecutor

- **文件**: `tests/utils/pandoc-executor.test.ts`
- **目的**: 测试 Pandoc 执行器的核心功能
- **任务内容**:
  - 测试 `checkAvailability()` 方法
  - 测试 `execute()` 方法成功场景
  - 测试 `execute()` 方法失败场景
  - 测试命令参数验证
  - 测试错误处理
- **复用组件**: Jest 测试框架
- **依赖**: 任务 1.2
- **需求映射**: 需求 5（Pandoc 配置）
- **验收标准**:
  - 测试覆盖率 >= 80%
  - 所有测试通过
  - 边界情况覆盖
- **AI Prompt**:

  ```
  Role: QA Engineer with expertise in unit testing and Jest

  Task: Create comprehensive unit tests for PandocExecutor in tests/utils/pandoc-executor.test.ts. Test checkAvailability() for both available and unavailable cases, execute() for success and failure scenarios, command argument validation, and error handling. Mock child process spawn() for controlled testing.

  Leverage:
  - Jest testing framework
  - Jest mocks for child_process
  - Test fixtures if needed

  Restrictions:
  - Must not require actual Pandoc installation
  - Must mock all external dependencies
  - Must test both success and failure paths
  - Tests must be isolated and repeatable
  - Do not test implementation details

  Success Criteria:
  - Test coverage >= 80%
  - All edge cases covered
  - Tests run independently
  - Mock child process correctly
  - Error scenarios properly tested
  ```

#### [x] 5.2 单元测试 - 转换策略

- **文件**: `tests/services/strategies/word2md-strategy.test.ts`, `tests/services/strategies/md2word-strategy.test.ts`
- **目的**: 测试转换策略的实现逻辑
- **任务内容**:
  - 测试 Word2MdStrategy
    - Pandoc 转换成功场景
    - Pandoc 转换失败场景
    - API 转换成功场景
    - API 转换失败场景
    - 输出文件结构验证
  - 测试 Md2WordStrategy
    - Pandoc 转换成功场景
    - Pandoc 转换失败场景
    - API 转换成功场景
    - 输出路径计算
- **复用组件**: Jest 测试框架, Mock 工具
- **依赖**: 任务 2.1、2.2
- **需求映射**: 需求 4（Word 转换）、需求 10（Md2Word）
- **验收标准**:
  - 每个策略测试覆盖率 >= 80%
  - Mock 依赖正确
  - 测试独立运行
- **AI Prompt**:

  ```
  Role: QA Engineer with expertise in service testing and mocking

  Task: Create unit tests for Word2MdStrategy and Md2WordStrategy in their respective test files. Mock PandocExecutor and file utilities. Test both Pandoc and API conversion paths for success and failure. Verify output file structure, path calculations, and error handling.

  Leverage:
  - Jest testing framework
  - Jest mocks for PandocExecutor and file-utils
  - Test fixtures for sample files

  Restrictions:
  - Must mock all external dependencies (Pandoc, file system, network)
  - Must test both conversion modes (Pandoc and API)
  - Must verify output file structure and paths
  - Tests must be isolated and deterministic
  - Do not make actual file system changes

  Success Criteria:
  - Coverage >= 80% for each strategy
  - Both success and failure paths tested
  - Output validation comprehensive
  - Mock dependencies correctly configured
  - Tests run independently and reliably
  ```

#### [x] 5.3 单元测试 - DocumentConverter

- **文件**: `tests/services/document-converter.test.ts`
- **目的**: 测试文档转换服务的协调逻辑
- **任务内容**:
  - 测试策略选择逻辑
  - 测试 Pandoc 可用性判断
  - 测试 Pandoc → API 降级逻辑
  - 测试配置优先级
  - 测试错误处理
- **复用组件**: Jest 测试框架
- **依赖**: 任务 3.1
- **需求映射**: 需求 5（配置）、需求 7（转换服务）
- **验收标准**:
  - 测试覆盖率 >= 80%
  - 策略选择逻辑正确
  - 降级逻辑正确
- **AI Prompt**:

  ```
  Role: QA Engineer with expertise in integration testing and service layer testing

  Task: Create unit tests for DocumentConverter in tests/services/document-converter.test.ts. Mock conversion strategies and test convert() method for type selection, Pandoc availability checking, fallback logic (Pandoc -> API), configuration priority, and error handling. Verify strategy selection and execution.

  Leverage:
  - Jest testing framework
  - Mock strategies (Word2MdStrategy, Md2WordStrategy)
  - Mock PandocExecutor for availability checks

  Restrictions:
  - Must mock all strategy implementations
  - Must test configuration priority correctly
  - Must verify fallback logic triggers appropriately
  - Tests must not depend on actual Pandoc or network
  - Must test all conversion types

  Success Criteria:
  - Coverage >= 80%
  - Strategy selection tested for all types
  - Fallback logic verified
  - Configuration priority validated
  - Error scenarios covered
  ```

#### [x] 5.4 集成测试 - 转换流程

- **文件**: `tests/integration/conversion-flow.test.ts`
- **目的**: 测试端到端转换流程
- **任务内容**:
  - 测试 Word → Markdown 完整流程
  - 测试 Markdown → Word 完整流程
  - 测试临时文件创建和清理
  - 测试媒体文件提取
  - 使用真实测试文件
- **复用组件**: Jest 测试框架, 测试 fixtures
- **依赖**: 任务 2.1、2.2、3.1
- **需求映射**: 需求 1（文件组织）、需求 10（临时文件）
- **验收标准**:
  - 完整流程测试通过
  - 文件结构验证正确
  - 临时文件管理正确
- **AI Prompt**:

  ```
  Role: Integration Test Engineer with expertise in end-to-end testing

  Task: Create integration tests for conversion flows in tests/integration/conversion-flow.test.ts. Test complete Word->Markdown and Markdown->Word conversions using real test files. Verify .temp/ directory structure, media file extraction, output file content, and cleanup. May use real Pandoc if available or mock it.

  Leverage:
  - test-fixtures/ for sample Word and Markdown files
  - DocumentConverter service
  - File utilities for validation

  Restrictions:
  - Must use real or realistic test files
  - Must verify complete file structure
  - Must validate conversion output quality
  - Must test cleanup scenarios
  - Handle both Pandoc-available and unavailable cases

  Success Criteria:
  - Word->MD flow creates correct .temp/{filename}/ structure
  - Media files extracted to media/ subfolder
  - MD->Word flow outputs .docx in correct location
  - Temporary files properly managed
  - Output files contain expected content
  ```

#### [x] 5.5 集成测试 - MCP Tools

- **文件**: `tests/integration/mcp-tools.test.ts`
- **目的**: 测试 MCP 工具的完整功能
- **任务内容**:
  - 测试 convert-origin-requirement 工具
    - `#filename` 语法解析
    - 文件查找逻辑
    - 转换流程
    - 需求文档生成
  - 测试 md2word 工具
    - 输入验证
    - 转换流程
    - 输出文件生成
- **复用组件**: MCP SDK 测试工具
- **依赖**: 任务 4.1、4.2
- **需求映射**: 需求 6（convert-origin-requirement）、需求 10（md2word）
- **验收标准**:
  - 工具调用成功
  - 输入输出正确
  - 错误处理正确
- **AI Prompt**:

  ```
  Role: MCP Integration Test Engineer with expertise in Model Context Protocol

  Task: Create integration tests for MCP tools in tests/integration/mcp-tools.test.ts. Test convert-origin-requirement with #filename syntax, file lookup, conversion, and requirements.md generation. Test md2word with input validation, conversion, and output. Use MCP test client or direct function calls.

  Leverage:
  - @modelcontextprotocol/sdk testing utilities
  - Test fixtures for sample files
  - MCP tool implementations

  Restrictions:
  - Must test tools as MCP clients would use them
  - Must validate tool schemas
  - Must test error responses
  - Must verify output file format and location
  - Test both success and failure scenarios

  Success Criteria:
  - convert-origin-requirement handles #filename correctly
  - File lookup works for various extensions
  - Generated requirements.md matches spec format
  - md2word validates inputs and generates valid DOCX
  - Error messages are clear and helpful
  ```

#### [x] 5.6 端到端测试 - 完整场景

- **文件**: `tests/e2e/full-workflow.test.ts`
- **目的**: 测试真实用户场景
- **任务内容**:
  - 测试场景 1：从 Word 创建 spec
    - 准备 Word 文档
    - 调用 convert-origin-requirement
    - 验证需求文档生成
    - 验证临时文件
  - 测试场景 2：双向转换
    - Word → Markdown → Word
    - 验证内容一致性
  - 测试场景 3：Pandoc 降级
    - 模拟 Pandoc 不可用
    - 验证 API 降级
- **复用组件**: 测试框架, 测试 fixtures
- **依赖**: 所有前序任务
- **需求映射**: 所有需求
- **验收标准**:
  - 所有场景测试通过
  - 用户体验流畅
  - 错误处理友好
- **AI Prompt**:

  ```
  Role: Senior QA Engineer with expertise in end-to-end testing and user scenarios

  Task: Create comprehensive E2E tests in tests/e2e/full-workflow.test.ts covering complete user workflows. Test: (1) Creating spec from Word document via convert-origin-requirement, (2) Round-trip conversion Word->Markdown->Word, (3) Pandoc fallback to API. Verify complete system behavior and user experience.

  Leverage:
  - All implemented components
  - Test fixtures for realistic documents
  - MCP tool interfaces
  - Mock API if needed

  Restrictions:
  - Must test complete user journeys
  - Must validate end results, not intermediate steps
  - Must handle both Pandoc and API modes
  - Tests should be realistic and practical
  - Must clean up test files after execution

  Success Criteria:
  - Scenario 1: Word document successfully converted to spec requirements.md
  - Scenario 2: Round-trip conversion maintains content integrity
  - Scenario 3: System gracefully falls back to API when Pandoc unavailable
  - All user-facing errors are clear and actionable
  - Complete workflows execute within reasonable time
  ```

---

### 阶段 6: 文档和部署

#### [x] 6.1 更新项目文档

- **文件**: `README.md`, `docs/converter.md`（新建）
- **目的**: 提供完整的使用文档和配置说明
- **任务内容**:
  - 更新 README.md 添加新功能说明
  - 创建 `docs/converter.md` 详细文档
    - 功能介绍
    - 配置说明（pandocPath, converterApiUrl）
    - 使用示例
    - MCP Tools 说明
    - 故障排查
  - 添加配置文件示例
  - 添加 API 文档（如有）
- **复用组件**: 现有文档模板
- **依赖**: 所有实现完成
- **需求映射**: 非功能性需求（可用性、可维护性）
- **验收标准**:
  - 文档完整清晰
  - 示例准确可用
  - 故障排查有效
- **AI Prompt**:

  ```
  Role: Technical Writer with expertise in developer documentation

  Task: Create comprehensive documentation for the document converter feature. Update README.md with feature overview. Create docs/converter.md with detailed configuration guide (pandocPath, converterApiUrl, priority), usage examples for both MCP tools, troubleshooting guide, and API documentation if applicable.

  Leverage:
  - Existing documentation style from README.md
  - Design document for technical details
  - Requirements document for feature overview

  Restrictions:
  - Must be clear and concise
  - Must include practical examples
  - Must cover both local Pandoc and API modes
  - Must explain configuration priority
  - Include troubleshooting for common issues

  Success Criteria:
  - README.md updated with feature section
  - docs/converter.md is comprehensive and clear
  - Configuration examples are accurate
  - Usage examples work as documented
  - Troubleshooting covers common scenarios
  ```

#### [x] 6.2 更新 Dockerfile

- **文件**: `containers/Dockerfile`（修改现有）
- **目的**: 在 Docker 镜像中安装 Pandoc
- **任务内容**:
  - 添加 Pandoc 安装步骤
  - 添加 Pandoc 版本验证
  - 测试 Docker 构建
  - 更新 Docker 相关文档
- **复用组件**: 现有 Dockerfile
- **依赖**: 所有实现完成
- **需求映射**: Docker 部署要求
- **验收标准**:
  - Docker 镜像成功构建
  - Pandoc 正确安装
  - 验证步骤正常
- **AI Prompt**:

  ```
  Role: DevOps Engineer with expertise in Docker and containerization

  Task: Update containers/Dockerfile to install Pandoc. Add installation steps for the base image (likely Alpine or Debian), add verification step (pandoc --version), and document the changes. Ensure minimal image size increase. Test build process.

  Leverage:
  - Existing Dockerfile structure
  - Package managers (apk for Alpine, apt for Debian)

  Restrictions:
  - Must maintain existing Dockerfile patterns
  - Must minimize image size
  - Must verify installation with pandoc --version
  - Build must fail if Pandoc installation fails
  - Do not break existing functionality

  Success Criteria:
  - Dockerfile builds successfully
  - Pandoc installed and verified
  - Image size increase is minimal
  - Container can execute pandoc commands
  - Documentation updated with Pandoc requirement
  ```

---

## 任务统计

- **总任务数**: 18 个
- **预计工作量**: 约 5-7 个工作日
- **关键路径**: 1.1 → 1.2 → 1.5 → 2.1 → 3.1 → 4.1 → 5.4 → 5.6
- **并行任务组**:
  - 1.1, 1.3, 1.4 可并行
  - 2.1, 2.2 可并行
  - 5.1, 5.2, 5.3 可并行
  - 6.1, 6.2 可并行

## 里程碑

1. **M1 - 基础架构完成** (任务 1.1-1.5)

   - 所有基础类型、接口、工具完成
   - 配置管理扩展完成

2. **M2 - 转换功能完成** (任务 2.1-3.1)

   - 两个转换策略实现完成
   - 转换服务实现完成

3. **M3 - MCP Tools 完成** (任务 4.1-4.2)

   - 两个 MCP 工具实现并注册

4. **M4 - 测试完成** (任务 5.1-5.6)

   - 单元、集成、E2E 测试全部通过
   - 覆盖率达标

5. **M5 - 发布就绪** (任务 6.1-6.2)
   - 文档完整
   - Docker 支持完成
