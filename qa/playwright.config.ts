import { defineConfig, devices } from '@playwright/test';
import { CN } from './fixtures/env';

/**
 * Trust Center QA 配置。
 *
 * 两个项目：
 *   api —— 无浏览器，用 request fixture 打接口（prod 只读为主）
 *   e2e —— 真浏览器跑页面；默认用系统 Edge（channel=msedge，免下载 Chromium）
 *
 * 串行（workers=1）是刻意的：public 接口有 ~20/min/IP 限流，且要保证证据顺序可读。
 */
const browserChannel = (process.env.QA_BROWSER_CHANNEL ?? 'msedge') as
	| 'msedge'
	| 'chrome'
	| 'chromium';

export default defineConfig({
	timeout: 45_000,
	expect: { timeout: 10_000 },
	/** 不重试：test.fail() 的"预期失败"在重试时不生效，会把已知缺陷误报成真失败。
	 *  prod 抖动应显式暴露，而不是被重试掩盖。 */
	retries: 0,
	workers: 1,
	forbidOnly: false,
	reporter: [
		['list'],
		['json', { outputFile: '.artifacts/results.json' }],
		['html', { outputFolder: '.artifacts/report', open: 'never' }],
	],
	use: {
		baseURL: CN.site,
		actionTimeout: 15_000,
		navigationTimeout: 30_000,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'api',
			testDir: './api',
			use: { baseURL: undefined },
		},
		{
			name: 'e2e',
			testDir: './e2e',
			use: { ...devices['Desktop Chrome'], channel: browserChannel },
		},
	],
});
