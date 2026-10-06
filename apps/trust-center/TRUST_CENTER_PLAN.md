# Trust Center 完善主计划

> 版本: v1.0 | 日期: 2026-05-09 | 状态: 执行中

---

## 一、愿景与目标

Trust Center 是 Autional 面向 B2B 客户、安全审计员和潜在采购决策者的**安全与合规透明门户**。对标 AWS Trust Center / SAP Trust Center，核心目标是：

1. **建立信任** — 通过第三方认证、实时合规状态、可下载审计报告降低客户采购顾虑
2. **支持销售** — 为 Enterprise 销售团队提供可转发的合规证据库
3. **满足审计** — 为现有客户提供自助式合规信息查询，减少客服工单

---

## 二、现状评估

### 2.1 已交付（Phase 1 完成）

| 维度 | 状态 |
|------|------|
| 7 个核心页面 | ✅ 全部实现 |
| 后端 API 接入 | ✅ 5 个接口（合规状态、审计发现、渗透测试、泄露通知、审计统计） |
| 401 降级 | ✅ 匿名访客自动回退静态内容 |
| 国际化 i18n | ✅ 基础设施就绪，TrustLayout + Overview 已翻译 |
| 主题切换 | ✅ 暗色/亮色模式 |
| SEO / OpenGraph | ✅ canonical、OG、Twitter Card、JSON-LD |
| @autional/ui 组件 | ✅ 新增 4 个组件（PageHeader、EmptyState、StatusBadge、SectionCard） |

### 2.2 已知缺口

| 缺口 | 优先级 | 影响 |
|------|--------|------|
| 后端 API 需鉴权，匿名访客无法获取实时数据 | P0 | 实时合规状态对匿名访客不可用 |
| 报告下载为 mailto 占位 | P1 | 无法自助下载，增加客服负担 |
| 数据驻留无地图可视化 | P1 | 纯表格不够直观 |
| 缺少安全评分仪表盘 | P1 | 没有"一眼看清安全状况"的入口 |
| 剩余 6 个页面未翻译 | P1 | 英文用户看到混合语言 |
| 无 ErrorBoundary | P1 | 页面崩溃时白屏 |
| 无 Toast 反馈 | P2 | 操作成功/失败无视觉反馈 |

---

## 三、Phase 2 实施路线图

### 3.1 P0 — 阻塞性问题（本周）

#### 任务 1: 后端公开只读合规端点

**问题**: Trust Center 调用 `/compliance/status` 等接口返回 401，匿名访客只能看到静态降级内容。

**方案**: 在 `compliance-service` 新增以下公开端点（无需 Bearer Token，但限流）：

```
GET /compliance/public/status
GET /compliance/public/penetration-test-reports
GET /compliance/public/audit-findings?severity=high,critical
GET /compliance/public/breach-notifications
GET /audit/public/stats
```

**响应策略**: 公开端点返回脱敏数据（不含 tenant_id、operator_id 等敏感字段）。

**前端改动**: 将 `src/lib/api.ts` 的 endpoint 从 `/compliance/status` 改为 `/compliance/public/status`。

---

### 3.2 P1 — 功能补全（1-2 周）

#### 任务 2: 补全所有页面国际化

**范围**: Security、Compliance、Data Residency、Audit Reports、Incidents、Privacy 六个页面的全部文本。

**工作量**: 约 200 个翻译 key。

#### 任务 3: 真实报告下载

**后端**: `storage-service` 新增 `GET /storage/public/reports` 列表 + `GET /storage/public/reports/{id}/download` 下载（需 Bearer Token）。

**前端**: 将 `mailto:` 替换为真实下载按钮，未登录时提示"登录以下载"。

#### 任务 4: 数据驻留地图可视化

**方案**: 使用 ECharts + world map JSON，在 `/data-residency` 页面顶部添加交互式地图：
- 已部署区域绿色高亮 + 弹窗显示数据中心信息
- 悬停显示合规认证标签
- 点击跳转到对应区域详情

**替代方案**（如果 ECharts 引入过重）: 使用 SVG 矢量地图（~30KB）+ CSS 动画。

#### 任务 5: 安全评分仪表盘（Security Score Dashboard）

**位置**: Overview 页面顶部，紧跟 Hero 区域。

**设计**:
```
┌─────────────────────────────────────────────┐
│  Autional 安全评分：94/100                      │
│  ████████████████████░░░                     │
│  ISO 27001: 100  SOC 2: 92  GDPR: 96  等保: 95 │
│  待处理高风险：2  |  最近审计：2025-03-15       │
└─────────────────────────────────────────────┘
```

**数据来源**: `/compliance/public/status` + `/compliance/public/audit-findings`。

#### 任务 6: ErrorBoundary + Toast 系统

**ErrorBoundary**: 页面级错误捕获，显示友好错误页（而非白屏）。

**Toast**: 轻量级 toast 通知（成功/失败/警告），不引入 Ant Design，使用 `@autional/ui` 自研。

---

### 3.3 P2 — 体验优化（2-4 周）

#### 任务 7: Trust Center CMS

**问题**: 隐私政策、事件通报、合规文档当前为手写 TSX，非工程师无法更新。

**方案**: 引入 `react-markdown` + 前端 Markdown 文件：
```
src/content/
  privacy-policy.zh.md
  privacy-policy.en.md
  incident-2025-001.zh.md
```

**构建时**: Vite 的 `?raw` import 加载 Markdown，前端渲染。

#### 任务 8: 接入 openapi-typescript

**CI 流水线**:
```bash
# 从 gateway swagger.json 生成类型
npx openapi-typescript http://localhost:11080/swagger.json -o src/types/api.d.ts
```

**收益**: 消除 `src/lib/api.ts` 中的手写 interface，API 变更时编译期报错。

#### 任务 9: 安全公告订阅

**功能**: 在 `/incidents` 页面添加邮件订阅表单，调用 `notification-service` 的订阅接口。

---

### 3.4 P3 — 长期演进（1 月+）

| 任务 | 说明 |
|------|------|
| **SOC 级安全仪表盘** | UEBA 异常检测可视化、MITRE ATT&CK 映射 |
| **合规对比工具** | 客户选择行业（金融/政务/医疗），自动生成合规差距报告 |
| **实时威胁情报** | 接入外部威胁情报源，在首页展示全球攻击态势 |
| **PDF 报告自动生成** | 一键生成定制化合规报告 PDF（客户 Logo + 选中认证） |

---

## 四、技术决策记录

### 4.1 为什么不用 Next.js SSG？

- Trust Center 需要实时数据（合规状态、事件列表），SSG 的静态生成会导致数据过期
- 当前 Vite SPA + React Query 的缓存策略已足够（staleTime: 5min）
- 如需 SEO 优化，可通过 `vite-plugin-ssr` 或 `prerender` 后期引入，不阻塞当前交付

### 4.2 为什么 @autional/ui 不引入 Radix UI？

- 当前 Trust Center 所需组件（Badge、Card、Header）均为纯样式组件，无复杂交互
- Radix UI 的引入会增加 ~50KB bundle，ROI 不成正比
- 当需要 Dropdown、Dialog、Tabs 等复杂组件时，再引入 Radix 作为 headless 基座

### 4.3 为什么公开 API 不放在 Gateway 层？

- Gateway 已统一路由，公开端点由各自服务实现，Gateway 只做透传
- 各服务对自身数据的脱敏逻辑最清楚，避免 Gateway 变成"大泥球"
- 限流在 Gateway 层统一配置（按路径前缀 `/public/` 设置宽松限流）

---

## 五、验收标准

| 检查项 | 标准 |
|--------|------|
| 匿名访客实时合规状态 | 打开首页即看到 `/compliance/public/status` 数据，无需登录 |
| 所有页面双语 | 切换语言后无硬编码中文残留 |
| 构建大小 | 首屏 JS < 200KB gzip（当前 ~135KB，预留 65KB 给 ECharts / Markdown） |
| Lighthouse | Performance >= 90, Accessibility >= 95, SEO >= 95, Best Practices = 100 |
| 错误处理 | 任意页面 throw Error 时显示友好错误页，不白屏 |

---

## 六、负责人与时间表

| Phase | 任务 | 负责人 | 预计工时 |
|-------|------|--------|----------|
| P0 | 后端公开只读端点 | 后端团队 | 2-3 天 |
| P1 | 补全国际化 | 前端 | 1 天 |
| P1 | 真实报告下载 | 后端 + 前端 | 3-4 天 |
| P1 | 数据驻留地图 | 前端 | 2-3 天 |
| P1 | 安全评分仪表盘 | 前端 | 1-2 天 |
| P1 | ErrorBoundary + Toast | 前端 | 1 天 |
| P2 | CMS (Markdown) | 前端 | 2-3 天 |
| P2 | openapi-typescript | 前端/DevOps | 1-2 天 |
| P3 | SOC 级仪表盘 | 前端 + 安全团队 | 2 周 |

---

*本计划应与 `UI_PLANNING_MASTER.md` 和 `UI_PORTAL_GAP_ANALYSIS_REPORT.md` 合并阅读。*
