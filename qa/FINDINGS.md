# Trust Center 接口测试 + 系统测试 结论

- 被测：`trust.autional.cn`（zh）/ `trust.autional.com`（en），prod 只读为主
- 时间：2026-11-08
- 套件：`qa/`（Playwright），**76 项检查** = 接口 33 + 系统 43
- 结果：**接口 33/33 通过、系统 39/39 通过**（4 项写链路因未提供测试邮箱而 skip）
  - 其中 7 项为「已知缺陷」的预期失败（见下表），修好后会自动转为失败提示（转正信号）

## 一、覆盖范围

| 层 | 内容 | 数量 |
|---|---|---:|
| 接口 | compliance×7 / audit×3 / storage×2 共 12 个公开 GET + 3 个订阅类写接口 | 15 |
| 接口维度 | 信封与字段形状、分页边界、错误语义、响应头与 CORS、双区一致、可观测性、数据面卫生 | 7 |
| 系统 | 12 个可索引路由 + 2 个令牌入口 + 404 | 15 |
| 系统维度 | 标题 / canonical / hreflang / h1 / console error / 失败请求 / 截图 / 双语 / 空态 / 500 / robots / sitemap / security.txt / 软 404 / 安全头 | 12 |

## 二、缺陷清单

### P2（应排期修）

| ID | 现象 | 期望 | 证据 | 归属 |
|---|---|---|---|---|
| F1 | `GET …/compliance/public/subprocessors?page_size=9999`（及 `101`、`-1`、`page=-1`）返回 **HTTP 500** | 400/422（客户端输入错误） | 响应体 `title: "…failed on the 'max' tag"`，`service: compliance-service` | 后端 compliance（binding 错误被映射成内部错误） |
| F3 | `page_size=0`、`page=0` 返回 **200** 并正常出数据 | 400/422 | 源码 `service-core/base/dto/validation_builder.go:126` 明确 `page>=1`、`page_size∈[1,100]` | 后端（**线上行为与源码不一致 → 疑似部署漂移**） |
| F4 | 静态页响应只有 HSTS，缺 **CSP / X-Frame-Options / X-Content-Type-Options** | 三件套齐全（API 侧已有） | `curl -I https://trust.autional.cn/compliance` | 平台配置（Vercel headers） |
| F5 | 未知路径返回 **200 且无 `X-Robots-Tag`**，软 404 可被收录 | 软 404 标 `noindex` | `vercel.ts` 的 `headers` 只匹配 `/spa.html`，rewrite 后不生效 | 平台配置（Vercel headers + rewrite 组合） |
| F6 | 公开端点 `GET /storage/api/v1/storage/public/reports` 返回 **6 条测试上传物**（`a.png` / `avatar.png` / `banner.png`，73 B） | 公开面只应有正式文档 | 实际响应 `items[]` | 数据/后端（公开面上残留测试数据；若将来含真实文件即越权暴露） |

### P3（可随迭代修）

| ID | 现象 | 期望 | 归属 | 状态 |
|---|---|---|---|---|
| F10 | API 响应头**重复**：`Content-Security-Policy`、`X-Content-Type-Options` 各出现两次（Playwright 合并显示为 `nosniff, nosniff`） | 只下发一次 | 网关 + 服务双层同时加头 | 待修（后端/网关） |
| F11 | 令牌入口 `/security-alerts/confirm`、`/unsubscribe` **未标 noindex**，且被写入 hreflang 配对 | 按 `scripts/routes.mjs` 注释「不得被索引」应为 `noindex: true` | 前端 | **已修，待部署** |
| F12（观察） | 订阅表单输入 `not-an-email` 时**无内联中文报错**，只有浏览器原生气泡（DOM 无文案，跨浏览器不可控） | 与 `a@b` 一致，走内联 zod 文案 | 前端 | **已修，待部署** |

## 三、已撤回的误判（重要，避免重复质疑）

| 原判 | 结论 | 原因 |
|---|---|---|
| F2 错误体跨服务不统一 | **不成立** | 全量响应体实测：compliance 的错误体同样带 `code/service/timestamp/request_id/trace_id`，与 notification 一致。原先只看了 300 字符截断 |
| F9 `/incidents` 接口失败无提示 | **不成立** | `incidents/page.tsx:66` 有 `breachError` 分支并渲染「数据泄露通知加载失败…」；原先只 grep 了 `ErrorState` 组件名 |

这条本身就是自动化测试的价值：**静态读过的东西，跑一遍才知道真假**。

## 四、非缺陷但需产品确认的数据现状

| 端点 | 现状 |
|---|---|
| `compliance/public/certifications` | `total=0` |
| `compliance/public/audit-findings` | `total=0` |
| `compliance/public/breach-notifications` | `total=0` |
| `compliance/public/penetration-test-reports` | `total=0` |
| `compliance/public/subprocessors` | `total=3`（有数据） |
| `audit/public/stats` | `total_logs=266287`（有数据） |

后果：`/compliance` 的「最新审计发现」与 `/audit-reports` 的证书/渗透测试区块长期是空态。
对外的「信任中心」若长期无审计证据，属产品口径问题，不是代码缺陷。

## 五、复现

```bash
# 接口（含全部已知缺陷的预期失败）
pnpm qa:api

# 系统
pnpm qa:e2e

# 单项复现
curl "https://api.autional.tianv.mobi/bff/compliance/api/v1/compliance/public/subprocessors?page_size=9999" -i
curl -I https://trust.autional.cn/compliance
curl -I "https://trust.autional.cn/qa-nonexistent"
curl "https://api.autional.tianv.mobi/bff/storage/api/v1/storage/public/reports"
```

## 六、建议处置顺序

1. **F6 先清数据**（一条 SQL 级清理即可，风险最低、对外可见性最高）。
2. **F1 + F3 一起修**（同一个分页校验入口：binding 错误映射 400、确认 `ValidatePagination` 真正生效），
   顺带核对**线上构建是否落后于源码**——F3 的现象强烈指向部署漂移。
3. **F4 + F5 是同一处 Vercel 配置**（`vercel.ts` 的 `headers` 需要按路由前缀匹配，而不是只匹配 `/spa.html`）。
4. F10 去重（去掉网关或服务其中一层的头）。
5. F11 补 `noindex: true`；F12 改 `type="text"` 或加 `noValidate` 以走内联校验。

## 七、已实施修复（代码已改，待部署验证）

| 文件 | 改动 | 覆盖缺陷 |
|---|---|---|
| `apps/trust-center/src/app/security-alerts/confirm/page.tsx` | `useTrustSEO({ …, noindex: true })` | F11 |
| `apps/trust-center/src/app/security-alerts/unsubscribe/page.tsx` | 同上 | F11 |
| `apps/trust-center/src/lib/seo.ts` | `noindex` 分支不仅跳过配对，还**清掉**残留的 `link[rel=alternate][hreflang]`（原实现只"不加"不"删"，客户端跳转进来会残留） | F11 |
| `apps/trust-center/src/app/security-alerts/page.tsx` | `<form noValidate>`：关掉浏览器原生气泡，统一走 zod 内联中文文案 | F12 |

验证（本地预览，**真断言**，不靠预期失败）：

```bash
API_ORIGIN=https://api.autional.tianv.mobi pnpm build
cd apps/trust-center && API_ORIGIN=https://api.autional.tianv.mobi pnpm preview
# 另一个终端：
QA_VERIFY_FIXES=1 QA_SITE_CN=http://localhost:13109 \
  pnpm --filter @autional/trust-qa exec playwright test --project=e2e \
  -g "令牌入口|sitemap|robots|非法邮箱|格式不合法"
# → 9 passed
```

回归：站点单测 `pnpm --filter @autional/trust-center test` → **24 passed**。

部署后在**线上**跑 `QA_VERIFY_FIXES=1 pnpm qa:e2e -g "令牌入口"`，通过即把 `routes.spec.ts`
里的 `knownFail(KNOWN.F11)` 删掉，完成转正。
