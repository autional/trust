/**
 * QA 环境矩阵（唯一真源）。
 *
 * 默认对 **prod 只读**。所有目标都可用 QA_* 环境变量覆盖：
 *   QA_SITE_CN / QA_API_CN / QA_SITE_COM / QA_API_COM
 *
 * 站点 ↔ 接口的两条链路（与 scripts/env.mjs readBuildEnv 一致）：
 *   cn = 前端直连源站 `${API_ORIGIN}/bff`（跨域）
 *   com = 同域 `/bff`，由 Vercel rewrite 转发（proxy）
 * 两区都测，才能覆盖 CORS 与 rewrite 两条路径。
 */

export interface RegionTarget {
  id: 'cn' | 'com';
  /** 站点基址（无尾斜杠） */
  site: string;
  /** 接口基址（已含 /bff 前缀） */
  api: string;
  /** 默认 html lang */
  locale: string;
}

const SITE_CN = (process.env.QA_SITE_CN ?? 'https://trust.autional.cn').replace(/\/+$/, '');
const SITE_COM = (process.env.QA_SITE_COM ?? 'https://trust.autional.com').replace(/\/+$/, '');

export const REGIONS: RegionTarget[] = [
  {
    id: 'cn',
    site: SITE_CN,
    // cn 线上为 direct 模式：前端跨域直连源站（不是站点同域 /bff）
    api: (process.env.QA_API_CN ?? 'https://api.autional.tianv.mobi/bff').replace(/\/+$/, ''),
    locale: 'zh-CN',
  },
  {
    id: 'com',
    site: SITE_COM,
    api: (process.env.QA_API_COM ?? `${SITE_COM}/bff`).replace(/\/+$/, ''),
    locale: 'en-US',
  },
];

export const CN = REGIONS[0];
export const COM = REGIONS[1];

/**
 * 写链路（订阅 → 确认 → 退订）。
 *
 * token 由后端随机生成、**加密落库 + 盲索引**（notification_security_subscribers），
 * 无法从库或接口反推，只能从确认邮件里取 → 因此正向链路需要人工/IMAP 提供令牌。
 * 未提供时正向用例自动 skip，负向用例（无效邮箱/无效令牌）始终执行。
 */
export const WRITE_PATH = {
  /** 订阅用测试邮箱（建议 `qa+<ts>@<域>`，便于事后清理） */
  subscribeEmail: process.env.QA_SUBSCRIBE_EMAIL ?? '',
  /** 确认页所需的邮箱与令牌（从确认邮件里复制） */
  confirmEmail: process.env.QA_CONFIRM_EMAIL ?? '',
  confirmToken: process.env.QA_CONFIRM_TOKEN ?? '',
};

export const hasSubscribeChain = Boolean(
  WRITE_PATH.subscribeEmail || (WRITE_PATH.confirmEmail && WRITE_PATH.confirmToken),
);
