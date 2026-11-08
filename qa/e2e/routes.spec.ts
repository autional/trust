import { test, expect, type Page } from '@playwright/test';
import { CN } from '../fixtures/env';
import { KNOWN } from '../known-issues';
import { knownFail } from '../fixtures/known';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 系统测试 · 全路由巡检。
 *
 * 每个公开路由断言：HTTP 200 / h1 / 标题 / canonical / hreflang / 0 console error / 无 4xx-5xx 子请求。
 * 截图落 `.artifacts/screens/`（证据，不入库）。
 */

const SCREENS = join(process.cwd(), '.artifacts', 'screens');

/** 可索引路由（与 scripts/routes.mjs 一一对应） */
const PUBLIC_ROUTES = [
	{ path: '/', title: '安全与合规' },
	{ path: '/compliance', title: '合规建设' },
	{ path: '/security', title: '安全架构' },
	{ path: '/data-residency', title: '数据驻留' },
	{ path: '/audit-reports', title: '审计报告' },
	{ path: '/incidents', title: '事件响应' },
	{ path: '/privacy', title: '隐私政策' },
	{ path: '/privacy/device', title: '设备数据隐私' },
	{ path: '/subprocessors', title: '子处理商清单' },
	{ path: '/vulnerability-disclosure', title: '漏洞披露政策' },
	{ path: '/storage-security', title: '存储安全' },
	{ path: '/security-alerts', title: '安全告警订阅' },
];

/** 带令牌入口：不入 sitemap，必须 noindex */
const TOKEN_ROUTES = [
	{ path: '/security-alerts/confirm', title: '安全告警订阅确认' },
	{ path: '/security-alerts/unsubscribe', title: '取消安全告警订阅' },
];

function collect(page: Page) {
	const consoleErrors: string[] = [];
	const failedResponses: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') consoleErrors.push(msg.text());
	});
	page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
	page.on('response', (res) => {
		const url = res.url();
		if (res.status() >= 400 && !url.includes('favicon')) {
			failedResponses.push(`${res.status()} ${url}`);
		}
	});
	return { consoleErrors, failedResponses };
}

function normalize(href: string): string {
	return href.replace(/\/+$/, '');
}

test.beforeAll(() => {
	mkdirSync(SCREENS, { recursive: true });
});

for (const route of PUBLIC_ROUTES) {
	test(`路由 ${route.path} 正常渲染且头部正确`, async ({ page }) => {
		const { consoleErrors, failedResponses } = collect(page);

		const res = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
		expect(res?.status(), `HTTP ${res?.status()}`).toBe(200);

		await expect(page.locator('h1').first()).toBeVisible();

		// 标题（静态 HTML 与运行期同源；只断言包含，避免被站点名后缀绑死）
		await expect(page).toHaveTitle(new RegExp(route.title));

		// canonical：必须指向"本站 + 本路径"（防每页都指首页）
		const canonical = await page.locator('link[rel="canonical"]').first().getAttribute('href');
		expect(canonical, 'canonical 缺失').toBeTruthy();
		expect(normalize(canonical!), `canonical=${canonical}`).toBe(
			normalize(`${CN.site}${route.path}`),
		);

		// hreflang：zh-CN / en-US / x-default 三行
		for (const lang of ['zh-CN', 'en-US', 'x-default']) {
			await expect(
				page.locator(`link[rel="alternate"][hreflang="${lang}"]`),
				`缺 hreflang=${lang}`,
			).toHaveCount(1);
		}

		await page.screenshot({
			path: join(SCREENS, `cn${route.path === '/' ? '-root' : route.path.replace(/\//g, '-')}.png`),
			fullPage: true,
		});

		expect(consoleErrors, `console error:\n${consoleErrors.join('\n')}`).toEqual([]);
		expect(failedResponses, `失败请求:\n${failedResponses.join('\n')}`).toEqual([]);
	});
}

for (const route of TOKEN_ROUTES) {
	test(`令牌入口 ${route.path} 渲染且 noindex`, async ({ page }) => {
		knownFail(KNOWN.F11);
		const { consoleErrors } = collect(page);
		const res = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
		expect(res?.status()).toBe(200);
		await expect(page.locator('h1').first()).toBeVisible();
		await expect(page).toHaveTitle(new RegExp(route.title));

		await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
		// 令牌入口不得进 hreflang 配对
		await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);

		await page.screenshot({
			path: join(SCREENS, `cn${route.path.replace(/\//g, '-')}.png`),
			fullPage: true,
		});
		expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
	});
}

test('未匹配路径渲染 404 页而不是白屏', async ({ page }) => {
	const { consoleErrors } = collect(page);
	await page.goto('/qa-nonexistent-path', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('h1').first()).toBeVisible();
	await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
	expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
});
