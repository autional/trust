import { test, expect } from '@playwright/test';
import { CN } from '../fixtures/env';
import { KNOWN } from '../known-issues';
import { knownFail } from '../fixtures/known';

/**
 * 系统测试 · SEO 与安全响应面。
 *
 * 目标：robots / sitemap / security.txt 三者与路由表自洽；
 *       抓取器视角（不跑 JS）下的 404 语义与安全头。
 */

const EXPECTED_ROUTES = [
	'/',
	'/compliance',
	'/security',
	'/data-residency',
	'/audit-reports',
	'/incidents',
	'/privacy',
	'/privacy/device',
	'/subprocessors',
	'/vulnerability-disclosure',
	'/storage-security',
	'/security-alerts',
];

test('robots.txt 指向本站 sitemap 且允许收录', async ({ request }) => {
	const res = await request.get(`${CN.site}/robots.txt`);
	expect(res.status()).toBe(200);
	const text = await res.text();
	expect(text).toMatch(/User-agent:\s*\*/);
	expect(text).toMatch(/Allow:\s*\//);
	// 站点 origin 由部署配置决定（本地预览与线上不同），只校验有绝对地址的 sitemap
	expect(text).toMatch(/Sitemap:\s*https?:\/\/[^\s]+\/sitemap\.xml/);
});

test('sitemap.xml 只含公开路由，不含令牌入口', async ({ request }) => {
	const res = await request.get(`${CN.site}/sitemap.xml`);
	expect(res.status()).toBe(200);
	const xml = await res.text();
	const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
	expect(locs.length).toBe(EXPECTED_ROUTES.length);

	// 只比路径：站点 origin 由部署配置决定（本地预览时与线上不同）
	const paths = locs.map((u) => new URL(u).pathname.replace(/\/$/, '') || '/');
	for (const path of EXPECTED_ROUTES) {
		const normalized = path === '/' ? '/' : path;
		expect(paths, `sitemap 缺 ${path}`).toContain(normalized);
	}
	// 同一份 sitemap 不得混入两个 origin
	expect(new Set(locs.map((u) => new URL(u).origin)).size).toBe(1);
	expect(xml).not.toContain('/security-alerts/confirm');
	expect(xml).not.toContain('/security-alerts/unsubscribe');
});

test('security.txt 符合 RFC 9116 且未过期', async ({ request }) => {
	const res = await request.get(`${CN.site}/.well-known/security.txt`);
	expect(res.status()).toBe(200);
	const text = await res.text();

	expect(text).toMatch(/^Contact:\s*mailto:/m);
	const expires = text.match(/^Expires:\s*(.+)$/m)?.[1];
	expect(expires, 'security.txt 缺 Expires').toBeTruthy();
	expect(new Date(expires!).getTime(), 'security.txt 已过期').toBeGreaterThan(Date.now());
	expect(text).toMatch(/^Preferred-Languages:/m);
});

test('软 404：未知路径对不跑 JS 的抓取器应标 noindex', async ({ request }) => {
	knownFail(KNOWN.F5);
	const res = await request.get(`${CN.site}/qa-nonexistent-${Date.now()}`);
	const robotsHeader = res.headers()['x-robots-tag'];
	expect(robotsHeader, '缺失 X-Robots-Tag：软 404 可被收录').toContain('noindex');
});

test('软 404 返回的不是 5xx 且带 HTML（可被 SPA 接管）', async ({ request }) => {
	const res = await request.get(`${CN.site}/qa-nonexistent-${Date.now()}`);
	expect(res.status()).toBeLessThan(500);
	expect(res.headers()['content-type']).toContain('text/html');
});

test('静态页具备基础安全响应头', async ({ request }) => {
	knownFail(KNOWN.F4);
	const res = await request.get(`${CN.site}/compliance`);
	const h = res.headers();
	expect(h['x-content-type-options'], '缺 nosniff').toBe('nosniff');
	expect(h['x-frame-options'], '缺 X-Frame-Options').toBeTruthy();
	expect(h['content-security-policy'], '缺 CSP').toBeTruthy();
});

test('缺失静态资源返回真 404（不被 SPA 兜底成 200）', async ({ request }) => {
	const res = await request.get(`${CN.site}/assets/qa-missing-${Date.now()}.js`);
	expect(res.status()).toBe(404);
});

test('HTML 与站点同源资源不被 CORS 通配放大', async ({ request }) => {
	const res = await request.get(`${CN.site}/compliance`);
	const acao = res.headers()['access-control-allow-origin'];
	// 允许 * 或无该头；但不允许把凭据面暴露给任意外站（记录实际值）
	expect(acao === undefined || acao === '*').toBe(true);
});
