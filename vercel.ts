import { routes, type Rewrite, type VercelConfig } from '@vercel/config/v1';

/**
 * 门户入口（trust.autional.com / trust.autional.cn）的**唯一源站**（B3 单源双区）。
 *
 * 上游 API origin 值 **不写入本仓**，取自 Vercel 项目环境变量 `API_ORIGIN`
 * （cn 项目 = https://api.autional.cn，com 项目 = https://api.autional.com）。
 * 未设置时 **故意抛错**（fail-closed），避免静默产出坏路由。
 *
 * rewrites 承接原 vercel.json 全集；`/(.*)` 兜底仅在浏览器导航（Accept 含 text/html）时生效：
 * 缺的静态文件返真 404，不再被兜成 200 的 index.html（软 404）。
 */
const rawOrigin = process.env.API_ORIGIN;

if (!rawOrigin) {
  throw new Error(
    '[trust] 缺少环境变量 API_ORIGIN（Vercel 项目设置里配置后重新部署）',
  );
}

const ORIGIN = rawOrigin.replace(/\/+$/, '');

/**
 * SPA 兜底（2026-10-30 修订，与 status 站同一写法，两处必读）。
 *
 * 1) 目的文件 `/index.html` → `/spa.html`：
 *    构建期已按路由生成 dist/<route>/index.html（vite.config.ts staticRouteHtmlPlugin），
 *    sitemap 里的公开路由由文件系统直接命中；本兜底只服务未知路径。
 *    `spa.html` 不含 canonical / og:url —— 静态壳不知道真实路径，
 *    「没有 canonical」远好过「错误 canonical（每页都指首页）」。
 * 2) Accept 条件从 text/html 放宽到 text/html 或 *\/*，并排除资产/带扩展名路径：
 *    旧条件让社交/IM/AI 抓取器（facebookexternalhit / Twitterbot / Slack / curl 默认
 *    `Accept: *\/*`）请求深链一律 404 text/plain（线上实测 trust.cn/privacy）。
 *    排除正则保证缺失的 /assets/*.js 仍是真 404，不会被兜成 200 的 HTML。
 */
const spaFallback: Rewrite = {
  source: '^/(?!assets/|.*\\.[a-zA-Z0-9]+$).*$',
  destination: '/spa.html',
  has: [{ type: 'header', key: 'accept', value: { re: 'text/html|\\*/\\*' } }],
};

export const config: VercelConfig = {
  framework: 'vite',
  installCommand: 'pnpm install --frozen-lockfile',
  buildCommand: 'pnpm --filter @autional/trust-center... build',
  outputDirectory: 'apps/trust-center/dist',
  rewrites: [
    routes.rewrite('/bff/:path*', `${ORIGIN}/bff/:path*`),
    routes.rewrite('/api/v1/:path*', `${ORIGIN}/api/v1/:path*`),
    routes.rewrite('/oauth/:path*', `${ORIGIN}/oauth/:path*`),
    spaFallback,
  ],
};

// 守卫自证（2026-10-30 修订）：末条 rewrites 必须是 SPA 兜底，且同时满足三条：
//   ① source 为锚定正则并以负向前瞻排除 /assets/ 与带扩展名路径（缺失资产仍 404）；
//   ② destination = /spa.html（不含 canonical 的壳）；
//   ③ Accept 同时放行 text/html 与 */*（否则社交抓取器整片 404）。
// 改这三条之前先读 spaFallback 上方注释（2026-10-30 线上实证：trust.cn/privacy 对
// facebookexternalhit 返回 404 text/plain）。
const lastRewrite = config.rewrites?.at(-1);
if (!lastRewrite || lastRewrite.destination !== '/spa.html') {
  throw new Error('[trust] 末条 rewrite 必须是 SPA 兜底且指向 /spa.html（见 vercel.ts）');
}
const fallbackSource = String(lastRewrite.source ?? '');
if (!fallbackSource.startsWith('^/') || !fallbackSource.includes('assets/')) {
  throw new Error('[trust] SPA 兜底 source 必须排除 /assets/ 与带扩展名路径（见 vercel.ts）');
}
const acceptRule = JSON.stringify(lastRewrite.has ?? []);
if (!acceptRule.includes('text/html') || !acceptRule.includes('*')) {
  throw new Error('[trust] SPA 兜底必须同时放行 text/html 与 */*（见 vercel.ts）');
}
