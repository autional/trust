/**
 * 公开可索引路由单点（2026-10-30）。
 *
 * 一份路由表同时驱动：
 *   1. `scripts/gen-env.mjs` → public/sitemap.xml 的 `<loc>` 列表；
 *   2. `apps/trust-center/vite.config.ts` → 构建期按路由生成静态 HTML
 *      （每页自带正确的 canonical / og:url / hreflang，不靠 JS 事后改）。
 *
 * `titleKey` 指向 i18n 标题键（静态 HTML 的 <title> 与运行期 useTrustSEO 同源）；
 * 描述留空 = 保留区域默认描述（页面级描述多为内联三元，暂不重复进构建期）。
 *
 * confirm / unsubscribe 等带令牌入口**不入表**（不得被索引）。
 */
export const PUBLIC_ROUTES = [
  { path: '/', titleKey: 'overview.title' },
  { path: '/compliance', titleKey: 'compliance.title' },
  { path: '/security', titleKey: 'security.title' },
  { path: '/data-residency', titleKey: 'dataResidency.title' },
  { path: '/audit-reports', titleKey: 'auditReports.title' },
  { path: '/incidents', titleKey: 'incidents.title' },
  { path: '/privacy', titleKey: 'privacy.title' },
  { path: '/privacy/device', titleKey: 'privacy.device.title' },
  { path: '/subprocessors', titleKey: 'subprocessors.title' },
  { path: '/vulnerability-disclosure', titleKey: 'vdp.title' },
  { path: '/storage-security', titleKey: 'storageSecurity.title' },
  { path: '/security-alerts', titleKey: 'securityAlerts.title' },
];
