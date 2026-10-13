# Trust Center 行业 Gap Analysis 与补全计划

> 版本: v1.0 | 日期: 2026-05-09 | 方法论: `service-flow-test-writer` 角色旅程 + 行业对标
> **注记（2026-10-01）**：本文为实施前差距分析稿；文中联系地址统一为 `support@autional.net`（对外唯一联系地址）。

---

## 一、行业对标：Trust Center 标准功能矩阵

对标对象：**AWS Trust Center** / **SAP Trust Center** / **Okta Trust** / **Auth0 Security** / **Cloudflare Trust Hub**

| # | 功能域 | 行业标准 | Autional Trust Center 现状 | 差距等级 |
|---|--------|----------|--------------------------|----------|
| 1 | **安全评分仪表盘** | 实时综合评分 + 子项拆解 + 趋势图 | ✅ 已实现（前端启发式，基于 `/compliance/status`） | 小 |
| 2 | **认证展示** | ISO/SOC/GDPR 等认证卡片 + 有效期 + 范围 | ✅ 静态数据，卡片展示 | 无 |
| 3 | **实时合规状态** | 匿名访客可直接查看当前合规状态 | ⚠️ 需登录，匿名 401 降级为静态内容 | **中** |
| 4 | **审计报告下载** | SOC 2 报告、ISO 证书、DPA 等自助下载 | ❌ `mailto:` 占位，无法自助下载 | **大** |
| 5 | **数据驻留地图** | 交互式世界地图 + 区域高亮 + 弹窗详情 | ❌ 纯表格展示，无地图 | **中** |
| 6 | **安全事件时间线** | 历史事件 + 响应记录 + 透明度承诺 | ⚠️ 静态事件 + 动态 breach 通知（需登录） | **中** |
| 7 | **数据处理协议 (DPA)** | 可下载的 PDF DPA + 子处理商清单 | ❌ 仅文字描述，无下载 | **大** |
| 8 | **子处理商清单** | 第三方服务商列表 + 安全评估摘要 | ❌ 未提供 | **大** |
| 9 | **漏洞披露政策 (VDP)** | 安全研究员如何报告漏洞的流程 | ❌ 未提供 | **大** |
| 10 | **隐私政策** | 完整隐私政策 + Cookie 政策 + 联系方式 | ⚠️ 静态页面，内容较完整 | 小 |
| 11 | **安全公告订阅** | 邮件订阅安全通知 / RSS | ❌ 未提供 | **中** |
| 12 | **合规对比工具** | 选择行业（金融/政务/医疗）生成差距报告 | ❌ 未提供 | **大** |
| 13 | **状态页集成** | 链接到实时服务状态页 / 历史可用性数据 | ❌ 未链接 status-page(3006) | **中** |
| 14 | **FAQ / 信任常见问题** | CISO/采购常见问题的问答页面 | ❌ 未提供 | **中** |
| 15 | **联系方式** | 信任团队邮箱 + PGP 公钥 + 响应时间 SLA | ⚠️ 仅有 `support@autional.net` | 小 |
| 16 | **合规 API** | 供客户自动化审计的公开只读 API | ❌ 未提供 | **大** |
| 17 | **SOC 2 控制映射** | Trust Services Criteria 与控制措施的映射表 | ❌ 未提供 | **中** |
| 18 | **渗透测试摘要** | 第三方渗透测试的高级别摘要 | ⚠️ 前端调 API，但需登录 | **中** |
| 19 | **数据保留策略详情** | 按数据类型的保留期限表 | ❌ 未提供 | **中** |
| 20 | **加密与密钥管理详情** | 加密算法、密钥轮换周期、HSM 信息 | ⚠️ Security 页有简要描述 | 小 |

**差距汇总**：
- 大差距（6项）：审计报告下载、DPA/子处理商、VDP、合规对比工具、合规 API、SOC 2 映射
- 中差距（7项）：匿名实时状态、数据驻留地图、事件时间线、安全订阅、状态页集成、FAQ、渗透测试公开访问
- 小差距（4项）：安全评分精度、隐私政策完善度、联系方式、加密详情

---

## 二、用户角色与旅程分析

基于 `service-flow-test-writer` Skill 的 Persona × Scenario 方法论，识别 Trust Center 的 5 个核心角色：

### 角色 1：企业 CISO / 安全总监（评估者）

```
角色: EnterpriseCISO
目标: 在采购决策前，快速评估 Autional 的安全与合规成熟度
前提条件: 匿名访问，无任何账户
主流程:
  1. 打开 Trust Center 首页 → 看到安全评分（0-100）
  2. 点击「合规认证详情」→ 查看 ISO 27001 / SOC 2 / GDPR 卡片
  3. 查看认证有效期和审计机构 → 确认不是自认证
  4. 进入「审计报告」页 → 尝试下载 SOC 2 Type II 报告
  5. 进入「数据驻留」页 → 确认数据中心位置是否满足法规要求
  6. 进入「事件响应」页 → 查看历史安全事件和响应速度
分支/异常:
  A. 安全评分过低（<80）→ 产生疑虑，可能放弃评估
  B. 无法下载审计报告 → 增加采购阻力，需要人工联系
  C. 数据中心不在目标区域 → 直接淘汰
  D. 发现未披露的安全事件 → 信任度下降
后置条件: 形成初步评估结论，决定是否进入下一步（联系销售 / 技术评估）
验证点: 首页加载时间 <2s、评分可见、认证信息完整、报告可下载
```

### 角色 2：现有客户合规官（审计支持者）

```
角色: CustomerComplianceOfficer
目标: 获取合规证据以支持内部/外部审计
前提条件: 已登录 Autional，拥有租户访问权限
主流程:
  1. 登录后进入 Trust Center → 看到实时合规状态（绿色/红色）
  2. 下载 SOC 2 报告和 DPA → 提交给审计师
  3. 查看「子处理商清单」→ 确认第三方服务商合规性
  4. 导出「数据驻留证明」→ 用于数据主权审计
  5. 查看「审计发现」→ 确认所有 High/Critical 问题已关闭
分支/异常:
  A. 发现 Open Critical Issue → 联系客户成功经理要求解释
  B. DPA 版本不是最新 → 需要最新版本
  C. 缺少特定行业认证（如 HIPAA）→ 记录为合规缺口
后置条件: 收集到完整的审计证据包
验证点: 报告下载完整、数据最新、认证在有效期内
```

### 角色 3：企业法务 / DPO（合同审查者）

```
角色: LegalCounsel
目标: 审查数据处理协议和跨境传输条款
前提条件: 可能匿名或已登录
主流程:
  1. 访问 Privacy 页面 → 阅读数据处理说明
  2. 下载 DPA PDF → 审查责任边界和子处理商条款
  3. 查看「跨境传输」页面 → 确认 SCC 标准合同条款
  4. 查看「数据保留策略」→ 确认删除权和保留期限
  5. 查看「数据主体权利」→ 确认 DSAR 流程可用性
分支/异常:
  A. DPA 不可下载 → 法务流程阻塞，合同无法签署
  B. 缺少 SCC 信息 → 欧盟客户无法合规
  C. 数据保留期限不符合客户要求 → 需要定制化协商
后置条件: 完成法务审查，批准合同或提出修改意见
验证点: DPA 可下载、SCC 明确、权利说明清晰
```

### 角色 4：安全研究员（漏洞报告者）

```
角色: SecurityResearcher
目标: 发现 Autional 漏洞并安全地报告
前提条件: 匿名访问
主流程:
  1. 访问 Security 页面 → 寻找漏洞披露政策 (VDP)
  2. 阅读 VDP → 了解允许测试的范围和禁止行为
  3. 获取 PGP 公钥 → 加密漏洞详情
  4. 发送报告到 support@autional.net → 收到自动确认
  5. 在 Trust Center 查看漏洞处理状态 → 确认已接收/修复
分支/异常:
  A. 找不到 VDP → 不敢进行任何测试（法律风险）
  B. 没有明确的响应时间承诺 → 信任度低
  C. 报告后无反馈 → 可能公开披露（不负责任的披露）
后置条件: 漏洞被安全地报告给厂商并得到妥善处理
验证点: VDP 页面存在、范围明确、联系方式有效、响应时间 SLA 公开
```

### 角色 5：采购决策者（B2B 销售加速器）

```
角色: ProcurementDecisionMaker
目标: 快速获取 Autional 的安全合规摘要，用于内部提案
前提条件: 匿名，时间有限
主流程:
  1. 访问 Trust Center 首页 → 3 秒内看到安全评分
  2. 点击「一键生成合规摘要」→ 获得定制化 PDF（含 Logo、选中认证）
  3. 下载 PDF → 转发给内部安全和法务团队
  4. 查看「FAQ」→ 快速了解常见合规问题
  5. 点击「联系销售」→ 进入销售流程
分支/异常:
  A. 信息过于分散 → 无法快速形成摘要，放弃评估
  B. 无法生成 PDF → 需要手动复制粘贴，体验差
  C. FAQ 不覆盖行业特定问题 → 需要人工咨询
后置条件: 获得足够信息支持内部采购决策
验证点: 首页评分醒目、PDF 生成快速、FAQ 覆盖常见场景
```

---

## 三、后端 API 可用性评估

### 3.1 已接入 API（5 个）

| 前端用途 | 后端端点 | 认证要求 | 当前问题 |
|----------|----------|----------|----------|
| 合规状态 | `GET /compliance/status` | Bearer | 匿名 401 |
| 审计发现 | `GET /compliance/audit-findings` | Bearer | 匿名 401 |
| 渗透测试报告 | `GET /compliance/penetration-test-reports` | Bearer | 匿名 401 |
| 泄露通知 | `GET /compliance/breach-notifications` | Bearer | 匿名 401 |
| 审计统计 | `GET /audit/stats` | Bearer | 匿名 401 |

### 3.2 未接入但已有后端 API（可用于 Trust Center 扩展）

| 功能 | 后端端点 | 说明 |
|------|----------|------|
| 合规配置 | `GET /compliance/profile` | 已启用的框架、DPO 信息、保留期限 |
| 数据分类 | `GET /compliance/data-classifications` | 数据分级策略 |
| 跨境传输 | `GET /compliance/cross-border-transfers` | SCC、传输机制 |
| 保留策略 | `GET /compliance/retention-policies` | 按数据类型的保留期限 |
| ISO 27001 控制 | `GET /compliance/iso27001/controls` | 控制措施列表（可用于映射表） |
| 隐私影响评估 | `GET /compliance/privacy-impact` | PIA 列表 |
| 供应商风险评估 | `GET /compliance/vendor-risk-assessment` | 子处理商安全评估 |
| 监管监控 | `GET /compliance/regulatory-watch` | 法规变更跟踪 |
| 证据管理 | `GET /compliance/evidence` | 合规证据文件 |
| 审计日志哈希链 | `GET /audit/hashchain/{tenant_id}` | 日志完整性证明 |
| 存储加密状态 | `GET /storage/encryption-status` | 加密配置详情 |
| 文件下载 | `GET /files/download/{id}` | 报告文件下载 |
| 文件分享 | `GET /files/shared/{token}` | 公开分享链接 |

### 3.3 需新增的后端 API

| 功能 | 建议端点 | 说明 |
|------|----------|------|
| 公开合规状态 | `GET /compliance/public/status` | 匿名可访问，脱敏 |
| 公开审计发现 | `GET /compliance/public/audit-findings` | 仅 high/critical，匿名 |
| 公开渗透测试 | `GET /compliance/public/penetration-test-reports` | 摘要级别，匿名 |
| 公开泄露通知 | `GET /compliance/public/breach-notifications` | 已披露事件，匿名 |
| 公开审计统计 | `GET /audit/public/stats` | 聚合统计，匿名 |
| 公开子处理商 | `GET /compliance/public/subprocessors` | 子处理商清单 |
| 公开报告下载 | `GET /storage/public/reports` | 公开报告列表 |
| 安全评分计算 | `GET /compliance/public/security-score` | 后端计算的安全评分 |
| 安全公告订阅 | `POST /notifications/public/security-subscribe` | 邮件订阅安全公告 |

---

## 四、补全计划（Gap Closure Plan）

### Phase 1：信任基础（P0，1-2 周）

#### 任务 1：后端公开只读端点
**问题**：Trust Center 的核心价值是向匿名访客展示透明度，当前所有 API 需 Bearer token。
**方案**：
- `compliance-service` 新增 `internal/handler/public.go`，注册无认证路由：
  - `GET /compliance/public/status`
  - `GET /compliance/public/audit-findings?severity=high,critical`
  - `GET /compliance/public/penetration-test-reports`
  - `GET /compliance/public/breach-notifications`
  - `GET /compliance/public/subprocessors`
- `audit-service` 新增：
  - `GET /audit/public/stats`
- **脱敏规则**：移除 `tenant_id`、`operator_id`、`user_id` 等敏感字段；仅返回聚合数据或已公开信息。
- **限流**：Gateway 对 `/public/` 前缀设置宽松限流（如 100 req/min/IP）。
- **前端改动**：`api.ts` 中自动检测认证状态，未登录时调用 `/public/` 端点，已登录时调用原端点（获取更完整数据）。

**验收标准**：
- 匿名访客打开首页即可看到实时合规状态，无需登录
- 公开端点不包含任何租户/用户/操作者敏感信息
- 公开端点响应时间与认证端点一致（< 200ms）

#### 任务 2：Security Score 后端化
**问题**：当前 `SecurityScore.tsx` 是前端启发式计算，不同用户看到不同分数。
**方案**：
- `compliance-service` 新增 `GET /compliance/public/security-score`
- 后端基于以下因素计算统一分数：
  - ISO27001 控制项覆盖率（30%）
  - SOC 2 控制项覆盖率（30%）
  - Open Critical/High Issues 数量（20%）
  - 最近一次渗透测试结果（10%）
  - 数据泄露历史（10%）
- 前端改为直接展示后端返回的分数和子项。

---

### Phase 2：功能补全（P1，2-3 周）

#### 任务 3：真实报告下载系统
**问题**：`/audit-reports` 页面使用 `mailto:` 占位，无法自助下载。
**方案**：
1. **后端**：`storage-service` 新增公开报告管理：
   - `GET /storage/public/reports` — 公开报告列表（SOC 2、ISO 证书、DPA 等）
   - `GET /storage/public/reports/{id}/download` — 报告下载
   - 报告文件存储于 MinIO，通过预签名 URL 或公开 bucket 提供下载
   - 访问控制：基础报告匿名下载，敏感报告（如完整渗透测试）需 Enterprise 客户登录
2. **前端**：替换 `mailto:` 为真实下载按钮：
   - 可下载：直接触发下载
   - 需登录：显示「登录以下载」提示
   - 需 NDA：显示「联系销售」按钮

#### 任务 4：数据驻留地图可视化
**问题**：`/data-residency` 是纯表格，不够直观。
**方案**：
- 引入轻量级 SVG 世界地图（如 `react-simple-maps` 或自研 SVG，~30KB）
- 已部署区域高亮显示，悬停显示数据中心信息
- 点击区域跳转到详情
- 替代方案：如果 bundle 过大，使用 ECharts + 精简 world map JSON

#### 任务 5：子处理商清单页面
**问题**：企业客户需要了解第三方子处理商。
**方案**：
- 新增 `/subprocessors` 页面
- 调用 `GET /compliance/public/subprocessors`
- 展示：服务商名称、服务类型、数据中心位置、安全认证、DPA 状态

#### 任务 6：漏洞披露政策 (VDP) 页面
**问题**：安全研究员无法找到漏洞报告渠道。
**方案**：
- 新增 `/vulnerability-disclosure` 页面
- 内容：
  - 允许测试的范围（如 `*.autional.com`）
  - 禁止行为（如社会工程、物理入侵、数据破坏）
  - 报告流程（PGP 公钥 + support@autional.net）
  - 响应时间 SLA（确认 48h，评估 7d，修复 90d）
  - Hall of Fame（感谢名单）

#### 任务 7：补全国际化
**问题**：多个页面仍有硬编码中文。
**范围**：Compliance、Security、Data Residency、Audit Reports、Incidents、Privacy 六个页面。
**工作量**：约 200 个翻译 key，预计 1 天。

---

### Phase 3：体验优化（P2，2-4 周）

#### 任务 8：状态页集成
**问题**：Trust Center 未链接到 status-page(3006)。
**方案**：
- Overview 页面添加「系统状态」卡片，显示当前服务健康状态
- 调用 `GET /health` 或 status-page API
- 添加链接「查看详细状态页」→ `http://localhost:13106`

#### 任务 9：安全公告订阅
**问题**：客户无法主动订阅安全通知。
**方案**：
- `/incidents` 页面添加邮件订阅表单
- 调用 `POST /notifications/public/security-subscribe`
- 支持匿名订阅（只需邮箱）

#### 任务 10：FAQ / 信任常见问题
**问题**：CISO/采购常见问题没有集中回答。
**方案**：
- 新增 `/faq` 页面
- 内容：认证更新频率、审计机构名称、数据删除流程、SOC 2 控制范围、定制合规支持等

#### 任务 11：SOC 2 控制映射表
**问题**：审计师需要查看 SOC 2 Trust Services Criteria 与具体控制措施的映射。
**方案**：
- `/compliance` 页面新增「SOC 2 控制映射」标签页
- 调用 `GET /compliance/iso27001/controls`（或新增 `GET /compliance/public/soc2-mapping`）
- 展示：Criteria → 控制编号 → 控制描述 → 测试频率 → 最后测试日期 → 状态

#### 任务 12：合规摘要 PDF 生成
**问题**：采购决策者无法快速生成合规摘要。
**方案**：
- Overview 页面添加「生成合规摘要 PDF」按钮
- 前端使用 `html2canvas` + `jspdf` 生成 PDF（含选中认证、安全评分、数据驻留、联系方式）
- 或后端生成：新增 `POST /compliance/public/summary-pdf`

---

### Phase 4：长期演进（P3，1 月+）

| 任务 | 说明 | 依赖 |
|------|------|------|
| 合规对比工具 | 选择行业 → 自动生成合规差距报告 | 新增后端 API |
| 合规 API（供自动化审计） | `GET /compliance/public/api/status`、`/compliance/public/api/reports` | 公开 API 设计 |
| 实时威胁情报 | 首页展示全球攻击态势（接入外部威胁情报源） | 第三方服务 |
| 客户定制化报告 | 选择认证组合 + 客户 Logo → 生成白标 PDF | PDF 生成服务 |
| 审计日志公开验证 | 允许客户下载并独立验证哈希链 | 哈希链客户端验证工具 |

---

## 五、API 接入优先级矩阵

| 前端页面 | 当前接入 API | 建议新增接入 | 优先级 |
|----------|-------------|--------------|--------|
| Overview | `/compliance/status` | `/compliance/public/security-score`, `/health` | P0 |
| Compliance | `/compliance/audit-findings` | `/compliance/public/soc2-mapping`, `/compliance/iso27001/controls` | P1 |
| Security | 无动态 API | `/audit/public/stats`, `/storage/encryption-status` | P1 |
| Data Residency | 无动态 API | `/compliance/data-classifications`, `/compliance/cross-border-transfers`, `/compliance/retention-policies` | P1 |
| Audit Reports | `/compliance/penetration-test-reports` | `/storage/public/reports` | P0 |
| Incidents | `/compliance/breach-notifications`, `/audit/stats` | `/notifications/public/security-subscribe` | P1 |
| Privacy | 无动态 API | `/compliance/profile`, `/compliance/gdpr/consent` | P2 |
| Subprocessors (新) | 无 | `/compliance/public/subprocessors` | P1 |
| VDP (新) | 无 | 静态页面 | P1 |
| FAQ (新) | 无 | 静态页面 | P2 |

---

## 六、风险评估与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 公开 API 泄露敏感信息 | **高** | 严格脱敏审查 + CI 自动化检查 |
| 报告文件被爬虫批量下载 | **中** | 限流 + CAPTCHA + 预签名 URL 过期 |
| 安全评分算法不透明引发质疑 | **中** | 公开评分维度与权重 |
| 静态内容过期（认证到期未更新） | **中** | 认证到期前 30 天告警 + 定期审核流程 |
| 漏洞披露政策被滥用 | **低** | 明确范围 + 法律声明 + 善意假设 |

---

## 七、验收标准总览

| 检查项 | 标准 |
|--------|------|
| 匿名实时合规状态 | 未登录用户可在首页看到实时数据 |
| 报告自助下载 | 至少 3 份标准报告可点击下载（非 mailto） |
| 数据驻留可视化 | 世界地图展示 ≥5 个区域，悬停可交互 |
| 子处理商清单 | 独立页面，列出 ≥3 个子处理商 |
| 漏洞披露政策 | 独立页面，含范围、流程、联系方式、SLA |
| 所有页面双语 | 切换语言后无硬编码中文 |
| 状态页集成 | Overview 有系统状态卡片，可跳转 status-page |
| 安全评分一致性 | 所有用户看到相同的安全评分（后端统一计算） |
| Lighthouse | Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 |
