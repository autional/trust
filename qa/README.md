# Trust Center QA（接口测试 + 系统测试）

对 `trust.autional.cn` / `trust.autional.com` 的自动化验证套件。基于 Playwright，
**独立于站点构建**：`pnpm --filter @autional/trust-center... build` 不会触碰本目录。

```
qa/
├── playwright.config.ts   2 个项目：api（无浏览器）/ e2e（系统 Edge，免下载 Chromium）
├── fixtures/env.ts        环境矩阵（cn/com 站点 + 接口）+ 写链路开关
├── known-issues.ts        已确认缺陷基线（预期失败）
├── api/
│   ├── schema.ts          成功信封 / 分页 / RFC 7807 错误体（zod）
│   └── trust-api.spec.ts  15 个公开端点 × 6 维度
└── e2e/
    ├── routes.spec.ts     15 路由巡检（标题/canonical/hreflang/console/失败请求/截图）
    ├── i18n.spec.ts       双区默认语言、localStorage 覆盖、路由集合一致
    ├── state.spec.ts      空态 / 500 / 不白屏
    ├── seo-security.spec.ts robots / sitemap / security.txt / 软 404 / 安全头
    └── subscribe.spec.ts  订阅表单负向 + 写链路正向（需环境变量）
```

## 运行

```bash
pnpm install                                   # 首次
pnpm qa:api                                    # 接口测试（约 15s）
pnpm qa:e2e                                    # 系统测试（约 2min）
pnpm qa:all                                    # 全跑
pnpm --filter @autional/trust-qa qa:report     # 打开 HTML 报告
```

产物（均已 gitignore）：`.artifacts/results.json`、`.artifacts/report/`、`.artifacts/screens/*.png`、`test-results/`。

浏览器：默认用系统 **Edge**（`channel=msedge`），无需 `playwright install`。
换浏览器：`QA_BROWSER_CHANNEL=chrome pnpm qa:e2e`。

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `QA_SITE_CN` | `https://trust.autional.cn` | cn 站点 |
| `QA_API_CN` | `https://api.autional.tianv.mobi/bff` | cn 直连源站（direct 模式） |
| `QA_SITE_COM` | `https://trust.autional.com` | com 站点 |
| `QA_API_COM` | `${QA_SITE_COM}/bff` | com 走 Vercel rewrite（proxy 模式） |
| `QA_SUBSCRIBE_EMAIL` | 空 | 填了才跑「正向订阅」，会**发一封真实邮件** |
| `QA_CONFIRM_EMAIL` + `QA_CONFIRM_TOKEN` | 空 | 从确认邮件里复制，解锁正向确认/退订 |
| `QA_RATE_LIMIT_PROBE` | 空 | `=1` 才跑限流探测（会消耗额度约 20 次请求） |

**为什么正向写链路要手填令牌**：后端 `security-subscribe` 的 token 为随机 32 位、
加密落库 + 盲索引（`notification_security_subscribers`），无法从库或接口反推，
只能从确认邮件取。填 `QA_CONFIRM_EMAIL` / `QA_CONFIRM_TOKEN` 即可跑完整链路。

## 断言分层纪律

- **契约**（HTTP 状态、信封字段、错误体、响应头、CORS）→ 必断言。
- **数据**（条数、内容）→ 只断言形状与类型，**不断言数量**：线上允许空集
  （当前 `certifications` / `audit-findings` / `breach-notifications` /
  `penetration-test-reports` 均为 `total=0`，属产品现状，不是失败）。

## 已知缺陷与「转正」

`known-issues.ts` 登记已取证的问题，用例里用 `test.fail(true, KNOWN.Fx)` 标注：

- 缺陷仍在 → 用例失败被判为预期，套件保持绿；
- 缺陷修好 → Playwright 报 **"Expected to fail, but passed"**，这就是转正信号，
  删掉那行 `test.fail()` 即变成常规断言。

当前基线见 [`FINDINGS.md`](./FINDINGS.md)。

**验证修复（部署前也能跑真断言）**：`QA_VERIFY_FIXES=1` 会让 `knownFail()` 失效，
所有"预期失败"变回真断言。配合本地预览即可在部署前确认修复：

```bash
API_ORIGIN=https://api.autional.tianv.mobi pnpm build
cd apps/trust-center && API_ORIGIN=https://api.autional.tianv.mobi pnpm preview
# 另一个终端：
QA_VERIFY_FIXES=1 QA_SITE_CN=http://localhost:13109 pnpm qa:e2e
```

注意：本地预览下 canonical / sitemap 的 **origin** 与线上不同，相关用例做的是路径级断言，
跨 origin 的绝对地址断言只在线上跑。

## 安全生产约定

- 全部对 **prod**；`workers: 1` 串行，避免触发 public 接口约 20/min/IP 的限流。
- 只读为主：写接口只跑**负向**（非法邮箱 / 无效令牌），不落库、不发信。
- 正向写链路需显式给环境变量，服务里用 `qa+<时间戳>@…` 邮箱，便于事后清理。
- 失败证据（trace / 截图）默认留在 `test-results/`，不自动上传任何地方。
