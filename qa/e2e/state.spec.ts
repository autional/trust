import { test, expect } from '@playwright/test';
/**
 * 系统测试 · 状态覆盖（空态 / 服务端 500 / 不白屏）。
 *
 * 只拦截被测页面真正消费的端点，其它请求放行到真实接口——
 * 避免"用假数据证明页面没问题"。
 */

function emptyList() {
	return {
		code: 0,
		message: 'success',
		items: [],
		total: 0,
		pagination: {
			total: 0,
			page: 1,
			page_size: 20,
			total_pages: 0,
			has_next: false,
			has_prev: false,
		},
		timestamp: new Date().toISOString(),
	};
}

const SERVER_ERROR = {
	type: 'https://docs.autional.cn/errors/10000005',
	title: 'Internal Server Error',
	status: 500,
	detail: 'qa-injected failure',
};

test('合规页：接口空集 → 显示空态而非白屏', async ({ page }) => {
	await page.route('**/compliance/public/audit-findings*', (route) =>
		route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyList()) }),
	);
	await page.goto('/compliance', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('h1').first()).toBeVisible();
	await expect(page.getByText('暂无公开的审计发现')).toBeVisible({ timeout: 20_000 });
});

test('合规页：接口 500 → 显示加载失败提示', async ({ page }) => {
	await page.route('**/compliance/public/audit-findings*', (route) =>
		route.fulfill({ status: 500, contentType: 'application/problem+json', body: JSON.stringify(SERVER_ERROR) }),
	);
	await page.goto('/compliance', { waitUntil: 'domcontentloaded' });
	await expect(page.getByText('审计发现加载失败，请登录后查看完整信息。')).toBeVisible({
		timeout: 25_000,
	});
});

test('审计报告页：接口 500 → 显示 ErrorState', async ({ page }) => {
	await page.route('**/audit/public/stats*', (route) =>
		route.fulfill({ status: 500, contentType: 'application/problem+json', body: JSON.stringify(SERVER_ERROR) }),
	);
	await page.goto('/audit-reports', { waitUntil: 'domcontentloaded' });
	await expect(page.getByText('加载失败').first()).toBeVisible({ timeout: 25_000 });
});

test('存储安全页：接口 500 → 显示 ErrorState', async ({ page }) => {
	await page.route('**/storage/public/encryption-status*', (route) =>
		route.fulfill({ status: 500, contentType: 'application/problem+json', body: JSON.stringify(SERVER_ERROR) }),
	);
	await page.goto('/storage-security', { waitUntil: 'domcontentloaded' });
	await expect(page.getByText('加载失败').first()).toBeVisible({ timeout: 25_000 });
});

test('事件响应页：接口 500 → 显示加载失败（与"无事件"可区分）', async ({ page }) => {
	await page.route('**/compliance/public/breach-notifications*', (route) =>
		route.fulfill({ status: 500, contentType: 'application/problem+json', body: JSON.stringify(SERVER_ERROR) }),
	);
	await page.goto('/incidents', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('h1').first()).toBeVisible();
	await expect(page.getByText('数据泄露通知加载失败，请登录后查看完整信息。')).toBeVisible({
		timeout: 25_000,
	});
	// 失败态不得同时展示"暂无事件"空态（否则自相矛盾）
	await expect(page.getByText('当前无数据泄露通知记录')).toHaveCount(0);
});
