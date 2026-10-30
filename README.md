# Autional 信任中心

**域名**：[trust.autional.cn](https://trust.autional.cn)（cn）· [trust.autional.com](https://trust.autional.com)（com）
**技术栈**：Vite + React 19 + TypeScript + Tailwind CSS
**仓库**：[github.com/autional/trust](https://github.com/autional/trust)

安全实践、数据保护与合规建设进展说明。

## 开发

```bash
pnpm install
pnpm dev      # http://localhost:13109（构建前自动生成 env.js/robots/sitemap/security.txt）
pnpm build    # 构建产物：apps/trust-center/dist/
pnpm test     # Vitest 单元测试
```

## 部署（单源双区）

`main` → `trust`（com）自动部署；`main` → `cn-trust`（cn）自动部署。两区**同一份源**，
区域差异全部由 Vercel 项目环境变量在构建期注入（见 `docs/positioning/24`）：

| 变量 | com | cn |
| --- | --- | --- |
| `REGION` | `com` | `cn` |
| `SITE_URL` | `https://trust.autional.com` | `https://trust.autional.cn` |
| `DEFAULT_LANG` / `FALLBACK_LANG` | `en` | `zh` |
| `API_ORIGIN` | `https://api.autional.com` | `https://api.autional.cn` |
| `CDN_HOST` | `https://cdn.autional.com` | `https://cdn.autional.cn` |

- 路由/重写：`vercel.ts`（fail-closed：`API_ORIGIN` 缺失即构建失败）。
- 生成物（勿手改、勿入库）：`apps/trust-center/public/{env.js,robots.txt,sitemap.xml,.well-known/security.txt}` ← `scripts/gen-env.mjs`；区域文案在 `scripts/region-copy.mjs`。
- 本地无 env 时兜底 cn 值（与迁移前基线一致）。

## SEO 产物（2026-10-30）

- **路由单点**：`scripts/routes.mjs`（12 条公开路由）同时驱动 sitemap 与静态 HTML 生成。
- **按路由出静态 HTML**：`dist/<route>/index.html`（每页正确 `canonical` / `og:url` / 三行 hreflang / 区域标题）+ `dist/spa.html`（未知路径兜底壳，不含 canonical/og:url）。
- **SPA 兜底**：`Accept: text/html` 或 `*/*` 才兜底（社交/IM/AI 抓取器不再 404），正则排除 `/assets/` 与带扩展名路径（缺失资产仍 404）；`vercel.ts` 有 fail-closed 守卫。
- **hreflang**：`zh-CN` ↔ `.cn`、`en-US` ↔ `.com`、`x-default` → `.com`；`useTrustSEO` 在客户端导航时同步。
- 本站**无 RSS**；`/security-alerts/confirm`、`/security-alerts/unsubscribe` 带令牌，不入 sitemap、不参与 hreflang 配对。
- 详见 `docs/SEO-FEED-REGION-ISOLATION-2026-10-30.md`。
