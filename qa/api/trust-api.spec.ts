import { test, expect } from '@playwright/test';
import { CN, COM } from '../fixtures/env';
import { knownFail } from '../fixtures/known';
import { KNOWN } from '../known-issues';
import {
	ENDPOINTS,
	NOTIFICATION,
	dataEnvelope,
	listEnvelope,
	problem,
	unifiedProblem,
	type EndpointSpec,
} from './schema';

/**
 * 接口测试（prod 只读为主）。
 *
 * 覆盖 6 个维度：信封与形状 / 分页边界 / 错误语义 / 响应头与 CORS / 双区一致 / 可观测性。
 * 「已知缺陷」用 test.fail() 标注：修好后会自动报 unexpectedly passed，即转正信号。
 */

const CN_API = CN.api;

function missingFields(obj: unknown, required: string[]): string[] {
	if (!obj || typeof obj !== 'object') return required;
	const keys = new Set(Object.keys(obj as Record<string, unknown>));
	return required.filter((k) => !keys.has(k));
}

test.describe('信封与数据形状', () => {
	for (const ep of ENDPOINTS) {
		test(`${ep.id} 返回 200 且符合契约`, async ({ request }) => {
			const res = await request.get(CN_API + ep.path);
			expect(res.status(), `HTTP ${res.status()}`).toBe(200);

			const body = await res.json();
			const schema = ep.kind === 'list' ? listEnvelope : dataEnvelope;
			const parsed = schema.safeParse(body);
			expect(
				parsed.success,
				`信封不符: ${parsed.success ? '' : JSON.stringify(parsed.error.issues)}`,
			).toBe(true);

			if (ep.kind === 'data') {
				const missing = missingFields(body.data, ep.required);
				expect(missing, `data 缺字段: ${missing.join(',')}`).toEqual([]);
			} else {
				expect(body.total).toBe(body.pagination.total);
				if (body.items.length > 0 && ep.required.length > 0) {
					const missing = missingFields(body.items[0], ep.required);
					expect(missing, `items[0] 缺字段: ${missing.join(',')}`).toEqual([]);
				}
			}
		});
	}
});

test.describe('分页与筛选边界', () => {
	const BOUNDS: Array<{ q: string; known?: string; note: string }> = [
		{ q: 'page_size=0', known: KNOWN.F3, note: 'page_size 下界 0 应 4xx' },
		{ q: 'page_size=101', known: KNOWN.F1, note: 'page_size 超过 100 应 4xx' },
		{ q: 'page_size=9999', known: KNOWN.F1, note: 'page_size 极端越界应 4xx' },
		{ q: 'page_size=-1', known: KNOWN.F1, note: 'page_size 负数应 4xx' },
		{ q: 'page=0', known: KNOWN.F3, note: 'page 下界 0 应 4xx' },
		{ q: 'page=-1', known: KNOWN.F1, note: 'page 负数应 4xx' },
	];

	for (const b of BOUNDS) {
		test(`越界参数 ${b.q} → 4xx（${b.note}）`, async ({ request }) => {
			if (b.known) knownFail(b.known);
			const res = await request.get(
				`${CN_API}/compliance/api/v1/compliance/public/subprocessors?${b.q}`,
			);
			expect([400, 422], `实际 ${res.status()}`).toContain(res.status());
		});
	}

	test('合法分页 page=2&page_size=2 正确回显', async ({ request }) => {
		const res = await request.get(
			`${CN_API}/compliance/api/v1/compliance/public/subprocessors?page=2&page_size=2`,
		);
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(body.pagination.page).toBe(2);
		expect(body.pagination.page_size).toBe(2);
		expect(body.items.length).toBeLessThanOrEqual(2);
	});

	test('category 筛选只回该类（infrastructure）', async ({ request }) => {
		const res = await request.get(
			`${CN_API}/compliance/api/v1/compliance/public/subprocessors?category=infrastructure&page_size=50`,
		);
		expect(res.status()).toBe(200);
		const body = await res.json();
		for (const item of body.items) {
			expect(item.category).toBe('infrastructure');
		}
	});
});

test.describe('错误语义', () => {
	test('订阅：非法邮箱 → 400 且符合 RFC 7807', async ({ request }) => {
		const res = await request.post(CN_API + NOTIFICATION.subscribe, {
			data: { email: 'not-an-email' },
		});
		expect(res.status()).toBe(400);
		const body = await res.json();
		expect(problem.safeParse(body).success, JSON.stringify(body)).toBe(true);
		expect(body.status).toBe(400);
	});

	test('确认：无效令牌 → 404 且符合 RFC 7807', async ({ request }) => {
		const res = await request.get(
			`${CN_API}${NOTIFICATION.confirm}?email=qa-probe@example.com&token=invalid-token`,
		);
		expect(res.status()).toBe(404);
		const body = await res.json();
		expect(problem.safeParse(body).success, JSON.stringify(body)).toBe(true);
	});

	test('退订：无效令牌 → 4xx 且符合 RFC 7807', async ({ request }) => {
		const res = await request.post(CN_API + NOTIFICATION.unsubscribe, {
			data: { email: 'qa-probe@example.com', token: 'invalid-token' },
		});
		expect([400, 403, 404]).toContain(res.status());
		const body = await res.json();
		expect(problem.safeParse(body).success, JSON.stringify(body)).toBe(true);
	});

	test('错误体跨服务统一（RFC 7807 + code/service/timestamp）', async ({ request }) => {
		const cases = [
			{
				name: 'compliance 参数越界',
				node: await request.get(
					`${CN_API}/compliance/api/v1/compliance/public/subprocessors?page_size=9999`,
				),
			},
			{
				name: 'notification 非法邮箱',
				node: await request.post(CN_API + NOTIFICATION.subscribe, {
					data: { email: 'not-an-email' },
				}),
			},
			{
				name: 'notification 无效令牌',
				node: await request.get(
					`${CN_API}${NOTIFICATION.confirm}?email=qa-probe@example.com&token=invalid-token`,
				),
			},
		];

		for (const { name, node } of cases) {
			const body = await node.json();
			const parsed = unifiedProblem.safeParse(body);
			expect(
				parsed.success,
				`${name} 错误体不统一: ${JSON.stringify(body)}`,
			).toBe(true);
			expect(body.status, `${name} 状态字段与 HTTP 不一致`).toBe(node.status());
		}
	});
});

test.describe('响应头与 CORS', () => {
	test('API 安全响应头齐全', async ({ request }) => {
		const res = await request.get(`${CN_API}/compliance/api/v1/compliance/public/status`);
		const h = res.headers();
		expect(h['content-type']).toContain('application/json');
		expect(h['x-content-type-options']).toContain('nosniff');
		expect(h['x-frame-options']).toContain('DENY');
		expect(h['content-security-policy']).toBeTruthy();
		expect(h['cache-control']).toBeTruthy();
	});

	test('API 响应头不重复', async ({ request }) => {
		knownFail(KNOWN.F10);
		const res = await request.get(`${CN_API}/compliance/api/v1/compliance/public/security-score`);
		const counts = new Map<string, number>();
		for (const { name } of res.headersArray()) {
			const key = name.toLowerCase();
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		const duplicated = [...counts.entries()].filter(
			([name, n]) => n > 1 && ['content-security-policy', 'x-content-type-options', 'x-frame-options'].includes(name),
		);
		expect(duplicated, `重复头: ${JSON.stringify(duplicated)}`).toEqual([]);
	});

	test('CORS：站点来源预检放行', async ({ request }) => {
		const res = await request.fetch(`${CN_API}/compliance/api/v1/compliance/public/status`, {
			method: 'OPTIONS',
			headers: {
				Origin: CN.site,
				'Access-Control-Request-Method': 'GET',
			},
		});
		expect([200, 204]).toContain(res.status());
		expect(res.headers()['access-control-allow-origin']).toBe(CN.site);
	});

	test('CORS：未登记来源不放行', async ({ request }) => {
		const preflight = await request.fetch(
			`${CN_API}/compliance/api/v1/compliance/public/status`,
			{
				method: 'OPTIONS',
				headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'GET' },
			},
		);
		expect(preflight.headers()['access-control-allow-origin']).toBeUndefined();

		const get = await request.get(`${CN_API}/compliance/api/v1/compliance/public/status`, {
			headers: { Origin: 'https://evil.example' },
		});
		expect(get.headers()['access-control-allow-origin']).toBeUndefined();
	});

	test('可观测性：响应带 request/trace id', async ({ request }) => {
		const res = await request.get(`${CN_API}/compliance/api/v1/compliance/public/status`);
		const h = res.headers();
		expect(Boolean(h['x-request-id'] || h['x-trace-id'])).toBe(true);
	});
});

test.describe('公开数据面卫生', () => {
	test('公开报告端点不暴露测试上传物', async ({ request }) => {
		knownFail(KNOWN.F6);
		const res = await request.get(`${CN_API}/storage/api/v1/storage/public/reports`);
		expect(res.status()).toBe(200);
		const body = await res.json();

		const junk = body.items.filter(
			(it: { filename?: string; size?: number }) =>
				typeof it.filename === 'string' &&
				/^(a|avatar|banner|test|tmp|demo)\.(png|jpe?g|gif|webp)$/i.test(it.filename) &&
				(typeof it.size !== 'number' || it.size < 1024),
		);
		expect(
			junk,
			`公开端点含测试残留: ${JSON.stringify(junk.map((i: { filename: string }) => i.filename))}`,
		).toEqual([]);
	});
});

test.describe('双区一致性', () => {	const SAMPLES: EndpointSpec[] = ENDPOINTS.filter((e) =>
		['compliance.status', 'compliance.subprocessors', 'audit.stats'].includes(e.id),
	);

	for (const ep of SAMPLES) {
		test(`${ep.id} 在 com 区结构一致`, async ({ request }) => {
			const cnRes = await request.get(CN_API + ep.path);
			const comRes = await request.get(COM.api + ep.path);
			expect(cnRes.status(), 'cn').toBe(200);
			expect(comRes.status(), 'com').toBe(200);

			const cnBody = await cnRes.json();
			const comBody = await comRes.json();
			const schema = ep.kind === 'list' ? listEnvelope : dataEnvelope;
			expect(schema.safeParse(cnBody).success, 'cn 信封').toBe(true);
			expect(schema.safeParse(comBody).success, 'com 信封').toBe(true);

			const cnKeys = Object.keys(cnBody.data ?? cnBody.items?.[0] ?? {}).sort();
			const comKeys = Object.keys(comBody.data ?? comBody.items?.[0] ?? {}).sort();
			expect(comKeys, `字段集不一致 cn=${cnKeys} com=${comKeys}`).toEqual(cnKeys);
		});
	}
});
