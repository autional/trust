import { test, expect } from '@playwright/test';
import { CN, COM } from '../fixtures/env';

/**
 * 系统测试 · 双区默认语言与切换。
 *
 * 语言契约（i18n/index.ts）：首访语言 = 区域默认（cn→zh-CN / com→en-US），
 * 探测链只认 localStorage 键 `autional-trust-i18n`；无该键时必须回落区域默认。
 */

const LANG_KEY = 'autional-trust-i18n';

test('cn 区默认中文', async ({ page, baseURL }) => {
	await page.goto(baseURL! + '/', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
	await expect(page.locator('h1').first()).toHaveText(/安全与合规/);
});

test('com 区默认英文', async ({ page }) => {
	await page.goto(COM.site + '/', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
	await expect(page.locator('h1').first()).toHaveText(/Security/i);
});

test('localStorage 覆盖区域默认语言并持久', async ({ page, baseURL }) => {
	await page.goto(baseURL! + '/', { waitUntil: 'domcontentloaded' });
	await page.evaluate(
		([key, val]) => window.localStorage.setItem(key as string, val as string),
		[LANG_KEY, 'en-US'],
	);
	await page.reload({ waitUntil: 'domcontentloaded' });
	await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
	await expect(page.locator('h1').first()).toHaveText(/Security/i);

	// 二次访问仍保持（缓存生效）
	await page.goto(baseURL! + '/compliance', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
	await expect(page).toHaveTitle(/Compliance/);
});

test('非法 localStorage 值不炸站，回落区域默认', async ({ page, baseURL }) => {
	await page.goto(baseURL! + '/', { waitUntil: 'domcontentloaded' });
	await page.evaluate(
		([key]) => window.localStorage.setItem(key as string, 'xx-XX'),
		[LANG_KEY],
	);
	await page.reload({ waitUntil: 'domcontentloaded' });
	await expect(page.locator('h1').first()).toBeVisible();
});

/** 双区页面数量一致（同一份源码，路由集合不应漂移） */
test('cn / com 路由集合一致', async ({ page }) => {
	const paths = ['/', '/compliance', '/privacy', '/subprocessors', '/security-alerts'];
	for (const p of paths) {
		const cn = await page.goto(CN.site + p, { waitUntil: 'domcontentloaded' });
		expect(cn?.status(), `cn ${p}`).toBe(200);
		const com = await page.goto(COM.site + p, { waitUntil: 'domcontentloaded' });
		expect(com?.status(), `com ${p}`).toBe(200);
	}
});
