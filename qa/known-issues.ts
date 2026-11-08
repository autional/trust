/**
 * 已确认缺陷基线（2026-11-08 线上实测）。
 *
 * 用法：`test.fail(KNOWN.F1)` —— 属「预期失败」：
 *   - 缺陷仍在 → 用例失败被判为预期，套件保持绿；
 *   - 缺陷修好 → Playwright 报 "expected to fail but passed" ⇒ 这就是「转正」信号，
 *     删掉对应 test.fail() 即变成常规断言。
 *
 * 纪律：只登记**已经取证**的问题；每条都写明复现方式。
 */
export const KNOWN = {
  F1: 'F1 分页越界返回 500（应为 4xx）：GET /compliance/api/v1/compliance/public/subprocessors?page_size=9999',
  F3: 'F3 分页下界未校验：page=0 / page=-1 被静默接受（应 4xx）',
  F4: 'F4 静态页缺 CSP / X-Frame-Options / X-Content-Type-Options（API 侧有）',
  F5: 'F5 软 404：未知路径返回 200 且无 X-Robots-Tag（/spa.html 的 noindex 头不随 rewrite 生效）',
  F6: 'F6 公开端点暴露测试上传物：GET /storage/api/v1/storage/public/reports 含 a.png/avatar.png(73B)',
  F10: 'F10 API 响应头重复：Content-Security-Policy / X-Content-Type-Options 各出现两次',
  F11: 'F11 令牌入口未标 noindex：/security-alerts/confirm 与 /unsubscribe 的 useTrustSEO 未传 noindex（routes.mjs 注释要求"不得被索引"）',
  F12: 'F12 订阅表单非法邮箱只弹浏览器原生气泡，无内联中文文案（type=email 先于 RHF 拦截）',
} as const;

/**
 * 已撤回的误判（留档，避免下次重复质疑）：
 *   F2「错误体跨服务不统一」——**不成立**。全量响应体实测：compliance 的错误体同样带
 *   code/service/timestamp/request_id/trace_id，与 notification 一致。
 *   当初误判源于只看了 300 字符截断输出。
 *   F9「/incidents 无错误提示」——**不成立**。incidents/page.tsx:66 有 breachError 分支并渲染
 *   「数据泄露通知加载失败…」；误判源于只 grep 了 ErrorState 组件名，没看 isError 变量。
 */
