import { test, expect } from '@playwright/test';
import { WRITE_PATH, CN } from '../fixtures/env';
import { KNOWN } from '../known-issues';
import { knownFail } from '../fixtures/known';

/**
 * 系统测试 · 写链路（安全告警订阅 / 确认 / 退订）。
 *
 * 负向用例始终执行（不产生邮件、不落库）。
 * 正向用例需要真实邮箱/令牌（token 加密落库、不可反推），未提供环境变量时自动 skip：
 *   QA_SUBSCRIBE_EMAIL   —— 订阅用测试邮箱
 *   QA_CONFIRM_EMAIL + QA_CONFIRM_TOKEN —— 确认邮件里的令牌
 */

const SUBSCRIBE_ENDPOINT = '/notifications/public/security-subscribe';

test.describe('订阅表单（负向，无副作用）', () => {
	test('空表单提交：提示必填，且不发请求', async ({ page }) => {
		let posted = 0;
		page.on('request', (req) => {
			if (req.method() === 'POST' && req.url().includes(SUBSCRIBE_ENDPOINT)) posted += 1;
		});

		await page.goto('/security-alerts', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /订阅安全告警/ }).click();

		await expect(page.getByText('请输入邮箱地址')).toBeVisible();
		await expect(page.getByText('请至少选择一个订阅主题')).toBeVisible();
		expect(posted, '表单未通过校验却发了请求').toBe(0);
	});

	test('非法邮箱（not-an-email）：不发请求', async ({ page }) => {
		let posted = 0;
		page.on('request', (req) => {
			if (req.method() === 'POST' && req.url().includes(SUBSCRIBE_ENDPOINT)) posted += 1;
		});

		await page.goto('/security-alerts', { waitUntil: 'domcontentloaded' });
		await page.locator('#email').fill('not-an-email');
		await page.getByLabel('数据泄露通知').check();
		await page.getByRole('button', { name: /订阅安全告警/ }).click();

		// 两条防线任一成立即可：浏览器原生拦截（修复前）或 zod 内联拦截（修复后）
		expect(posted, '非法邮箱却发了请求').toBe(0);
	});

	test('非法邮箱（not-an-email）：显示内联中文报错', async ({ page }) => {
		knownFail(KNOWN.F12);
		await page.goto('/security-alerts', { waitUntil: 'domcontentloaded' });
		await page.locator('#email').fill('not-an-email');
		await page.getByLabel('数据泄露通知').check();
		await page.getByRole('button', { name: /订阅安全告警/ }).click();

		await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
	});

	test('格式不合法（通过原生校验但违反 RFC 5322）：内联报错且不发请求', async ({ page }) => {
		let posted = 0;
		page.on('request', (req) => {
			if (req.method() === 'POST' && req.url().includes(SUBSCRIBE_ENDPOINT)) posted += 1;
		});

		await page.goto('/security-alerts', { waitUntil: 'domcontentloaded' });
		// `a@b` 能通过 HTML5 type=email，但违反后端/zod 的 RFC 5322 规则
		await page.locator('#email').fill('a@b');
		await page.getByLabel('数据泄露通知').check();
		await page.getByRole('button', { name: /订阅安全告警/ }).click();

		await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
		expect(posted, '非法邮箱却发了请求').toBe(0);
	});
});

test.describe('令牌入口（负向）', () => {
	test('确认页缺参数 → 明确提示链接无效', async ({ page }) => {
		await page.goto('/security-alerts/confirm', { waitUntil: 'domcontentloaded' });
		await expect(page.getByText('确认链接无效：缺少必要的参数。')).toBeVisible();
	});

	test('确认页无效令牌 → 失败态且可重新订阅', async ({ page }) => {
		await page.goto('/security-alerts/confirm?email=qa-probe%40example.com&token=invalid', {
			waitUntil: 'domcontentloaded',
		});
		await expect(page.getByText('订阅确认失败')).toBeVisible({ timeout: 20_000 });
		await expect(page.getByRole('link', { name: /重新订阅/ })).toBeVisible();
	});

	test('退订页缺参数 → 明确提示链接无效', async ({ page }) => {
		await page.goto('/security-alerts/unsubscribe', { waitUntil: 'domcontentloaded' });
		await expect(page.getByText('退订链接无效：缺少必要的参数。')).toBeVisible();
	});
});

test.describe('写链路（正向，需环境变量）', () => {
	test('订阅提交 → 返回待确认并提示查收邮件', async ({ page }) => {
		test.skip(!WRITE_PATH.subscribeEmail, '未设置 QA_SUBSCRIBE_EMAIL，跳过正向订阅（避免产生真实邮件）');

		await page.goto('/security-alerts', { waitUntil: 'domcontentloaded' });
		await page.getByLabel(/邮箱地址/).fill(WRITE_PATH.subscribeEmail);
		await page.getByLabel('数据泄露通知').check();
		await page.getByRole('button', { name: /订阅安全告警/ }).click();

		await expect(page.getByText('订阅成功！')).toBeVisible({ timeout: 25_000 });
		await expect(page.getByText(/请查看邮箱并点击确认链接/)).toBeVisible();
	});

	test('带令牌确认 → 确认成功', async ({ page }) => {
		test.skip(
			!WRITE_PATH.confirmEmail || !WRITE_PATH.confirmToken,
			'未设置 QA_CONFIRM_EMAIL / QA_CONFIRM_TOKEN，跳过正向确认',
		);

		const url = `/security-alerts/confirm?email=${encodeURIComponent(WRITE_PATH.confirmEmail)}&token=${encodeURIComponent(WRITE_PATH.confirmToken)}`;
		await page.goto(url, { waitUntil: 'domcontentloaded' });
		await expect(page.getByText('订阅确认成功')).toBeVisible({ timeout: 25_000 });
	});

	test('带令牌退订 → 退订成功', async ({ page }) => {
		test.skip(
			!WRITE_PATH.confirmEmail || !WRITE_PATH.confirmToken,
			'未设置 QA_CONFIRM_EMAIL / QA_CONFIRM_TOKEN，跳过正向退订',
		);

		const url = `/security-alerts/unsubscribe?email=${encodeURIComponent(WRITE_PATH.confirmEmail)}&token=${encodeURIComponent(WRITE_PATH.confirmToken)}`;
		await page.goto(url, { waitUntil: 'domcontentloaded' });
		await expect(page.getByText(WRITE_PATH.confirmEmail)).toBeVisible();
		await page.getByRole('button', { name: /确认退订/ }).click();
		await expect(page.getByText('已成功退订')).toBeVisible({ timeout: 25_000 });
	});
});

test.describe('接口侧写保护', () => {
	test('订阅接口对同一来源有速率限制（429 + Retry-After）', async ({ request }) => {
		test.skip(
			process.env.QA_RATE_LIMIT_PROBE !== '1',
			'会消耗额度：仅在显式设置 QA_RATE_LIMIT_PROBE=1 时执行',
		);
		const url = `${CN.api}${SUBSCRIBE_ENDPOINT}`;
		const codes: number[] = [];
		for (let i = 0; i < 25; i++) {
			const res = await request.post(url, { data: { email: 'not-an-email' } });
			codes.push(res.status());
			if (res.status() === 429) {
				expect(res.headers()['retry-after'], '429 缺 Retry-After').toBeTruthy();
				break;
			}
		}
		expect(codes, `未见 429：${codes.join(',')}`).toContain(429);
	});
});
