/**
 * 区域静态文案单点（index.html 元信息 / robots 注释 / security.txt 语言行）。
 * zh = cn 基线原文（逐字节不变）；en = com 面文案（B3 起 com 默认 en）。
 */
export const REGION_COPY = {
  zh: {
    locale: 'zh-CN',
    ogLocale: 'zh_CN',
    siteName: 'Autional Trust Center',
    title: 'Autional 信任中心',
    description: 'Autional 信任中心 —— 安全实践、数据保护与合规建设进展说明。',
    keywords: 'Autional, Trust Center, 安全, 合规建设, 数据驻留, 隐私政策, 审计日志',
    ogTitle: 'Autional Trust Center — 安全与合规建设',
    ogDescription: 'Autional Trust Center 公开我们的安全架构、数据保护措施与合规建设进展。',
    robotsComment: '公开信任中心，欢迎收录。',
    preferredLanguages: 'zh-CN, en',
  },
  en: {
    locale: 'en-US',
    ogLocale: 'en_US',
    siteName: 'Autional Trust Center',
    title: 'Autional Trust Center',
    description: 'Autional Trust Center — security practices, data protection, and compliance progress.',
    keywords: 'Autional, Trust Center, security, compliance, data residency, privacy policy, audit logs',
    ogTitle: 'Autional Trust Center — Security & Compliance',
    ogDescription: 'The Autional Trust Center discloses our security architecture, data protection measures, and compliance progress.',
    robotsComment: 'public trust center; indexing welcome.',
    preferredLanguages: 'en',
  },
};
