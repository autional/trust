import { test } from '@playwright/test';

/**
 * 标记「已知缺陷」为预期失败。
 *
 * 为什么要包一层：`test.fail()` 一旦写死，就**无法验证修复**——
 * 修好之后只会看到 "Expected to fail, but passed"。
 * 用 `QA_VERIFY_FIXES=1` 关掉预期失败，就能在**部署前**用本地预览跑一遍真断言。
 *
 *   pnpm qa:e2e                                  # 常规：缺陷仍被判为预期失败
 *   QA_VERIFY_FIXES=1 QA_SITE_CN=http://127.0.0.1:13109 pnpm qa:e2e   # 验证修复
 *
 * 部署后验证通过，直接从调用处删掉 knownFail()，即完成"转正"。
 */
export function knownFail(reason: string): void {
	if (process.env.QA_VERIFY_FIXES === '1') return;
	test.fail(true, reason);
}
