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
 * 令牌入口兜底（2026-11-08，缺陷 F5 改造）。
 *
 * 只有这两个路径需要「直接深链进 SPA」（确认/退订链接来自邮件）。
 * 其余未知路径**不再**兜底到 200 的壳——交给平台的 404.html（真 404 状态码）。
 * 旧写法 `/(.*)` 兜底会让任意乱路径返回 200，且 headers 按请求路径匹配、
 * 无法只给兜底响应打 noindex ⇒ 软 404 可被收录（线上实测）。
 */
const TOKEN_ROUTE_PATHS = ['/security-alerts/confirm', '/security-alerts/unsubscribe'];

const tokenRewrites: Rewrite[] = TOKEN_ROUTE_PATHS.map((path) => ({
	source: path,
	destination: '/spa.html',
	has: [{ type: 'header', key: 'accept', value: { re: 'text/html|\\*/\\*' } }],
}));

/**
 * 静态页安全响应头（缺陷 F4）。
 *
 * 之前只有 HSTS 是平台默认给的；CSP / XFO / nosniff 全缺（API 侧反而齐全）。
 * 取值按当前构建产物核对过：字体自托管（/assets/*.woff2）、无外部 CDN 资源、
 * JSON-LD 为数据块不被 script-src 拦截 ⇒ 不需要放宽。
 * connect-src 必须含本区 API 源站（cn 前端直连，com 走同域 /bff）。
 */
const SECURITY_HEADERS = [
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	{ key: 'X-Frame-Options', value: 'DENY' },
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	{ key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
	{
		key: 'Content-Security-Policy',
		value: [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data:",
			"font-src 'self' data:",
			`connect-src 'self' ${ORIGIN}`,
			"object-src 'none'",
			"base-uri 'self'",
			"form-action 'self'",
			"frame-ancestors 'none'",
		].join('; '),
	},
];

export const config: VercelConfig = {
	framework: 'vite',
	installCommand: 'pnpm install --frozen-lockfile',
	buildCommand: 'pnpm --filter @autional/trust-center... build',
	outputDirectory: 'apps/trust-center/dist',
	headers: [
		// 兜底壳（/spa.html）可被直接访问：不带 canonical，标 noindex 免得被当成独立页收录。
		routes.header('/spa.html', [{ key: 'X-Robots-Tag', value: 'noindex' }]),
		routes.header('/(.*)', SECURITY_HEADERS),
	],
	rewrites: [
		routes.rewrite('/bff/:path*', `${ORIGIN}/bff/:path*`),
		routes.rewrite('/api/v1/:path*', `${ORIGIN}/api/v1/:path*`),
		routes.rewrite('/oauth/:path*', `${ORIGIN}/oauth/:path*`),
		...tokenRewrites,
	],
};

// 守卫自证（2026-11-08 改造后）：
//   ① 每个令牌入口都必须有到 /spa.html 的 rewrite（否则邮件深链进不了 SPA）；
//   ② **不得**存在通配兜底 rewrite（`/(.*)` / `/:path*` 之类）——
//      它会把未知路径兜成 200，软 404 与"可被收录"会同时回来。
const tokenCovered = TOKEN_ROUTE_PATHS.filter((path) =>
	(config.rewrites ?? []).some(
		(r) => r.source === path && (r as Rewrite).destination === '/spa.html',
	),
);
if (tokenCovered.length !== TOKEN_ROUTE_PATHS.length) {
	throw new Error(
		`[trust] 令牌入口缺少 SPA rewrite：${TOKEN_ROUTE_PATHS.filter((p) => !tokenCovered.includes(p)).join(', ')}`,
	);
}

const CATCH_ALL = /^\/?(\(\.\*\)|:path\*|:path\(\.\*\))$/;
const catchAll = (config.rewrites ?? []).filter((r) => CATCH_ALL.test(String(r.source ?? '')));
if (catchAll.length > 0) {
	throw new Error(
		`[trust] 禁止通配兜底 rewrite（会重新引入软 404）：${catchAll.map((r) => r.source).join(', ')}`,
	);
}

const csp = SECURITY_HEADERS.find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
if (!csp.includes(ORIGIN)) {
	throw new Error('[trust] CSP connect-src 必须包含本区 API 源站 API_ORIGIN');
}
