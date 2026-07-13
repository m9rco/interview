## ADDED Requirements

### Requirement: 构建产物校验

发布前 MUST 先产出 VuePress 静态构建产物并校验其存在且完整（入口 HTML、资源目录齐备）。构建失败 MUST 阻断发布。

#### Scenario: 构建成功才允许发布

- **WHEN** 执行发布流程
- **THEN** 先运行 `vuepress build`；仅当产出目录存在入口 `index.html` 与静态资源时才继续发布步骤，构建报错则中止且不发布

### Requirement: GitHub Pages 发布

站点 MUST 能发布到 GitHub Pages，使用与 Pages 子路径匹配的 `base` 构建产物。

#### Scenario: Pages 发布可访问

- **WHEN** 触发 GitHub Pages 发布（CI 或手动）
- **THEN** 构建产物被推送到 Pages 服务，访问 Pages URL 能正常打开站点，资源无 404，样式与搜索可用

### Requirement: 腾讯云 COS 同步

站点 MUST 能把同一份静态产物同步到腾讯云 COS 桶。同步 MUST 处理缓存头（入口 HTML 短缓存、带内容 hash 的静态资源长缓存）与上传顺序（先传静态资源、最后覆盖入口 HTML），以降低发布过程中的资源不一致与 404。

#### Scenario: COS 同步后可访问

- **WHEN** 执行 COS 同步
- **THEN** `dist` 内文件被上传到目标桶对应路径，访问 COS 站点（或其绑定域名）能正常打开，页面引用的资源均可加载

#### Scenario: 发布顺序与缓存策略

- **WHEN** 一次发布同时更新了入口 HTML 与带 hash 的静态资源
- **THEN** 同步先上传静态资源、最后覆盖入口 HTML；入口 HTML 设置短缓存、带 hash 资源设置长缓存

### Requirement: 双发布路径

系统 MUST 同时提供本地脚本与 GitHub Actions 两条发布路径，二者 MUST 复用同一构建产物与同步逻辑约定。

#### Scenario: 本地脚本发布

- **WHEN** 作者在本机运行发布脚本（如 `scripts/deploy-cos.sh`）
- **THEN** 脚本完成构建校验并把产物同步到 COS，密钥从环境变量或本机配置读取

#### Scenario: CI 自动发布

- **WHEN** 代码推送到 `main` 分支
- **THEN** GitHub Actions 自动执行构建、发布 Pages、同步 COS

### Requirement: 密钥不入库

所有发布凭据（COS SecretId/SecretKey、桶名、Pages token 等）MUST NOT 出现在仓库中。CI MUST 通过 GitHub Secrets 注入，本地 MUST 通过环境变量或被 `.gitignore` 排除的本机配置读取。

#### Scenario: 仓库中无明文密钥

- **WHEN** 检查仓库文件与提交历史新增内容
- **THEN** 不存在明文 COS 密钥或 token；`.gitignore` 排除 `.env`、`.cos.conf` 等本机凭据文件

#### Scenario: CI 从 Secrets 注入

- **WHEN** GitHub Actions 执行 COS 同步
- **THEN** 凭据来自 GitHub Secrets，且 CI 日志不回显密钥明文
