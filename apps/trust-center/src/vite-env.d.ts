/// <reference types="vite/client" />

/** 构建期区域变量（vite.config.ts define 注入；缺失时 src/lib/site-env.ts 兜底）。 */
interface ImportMetaEnv {
	readonly VITE_REGION?: 'cn' | 'com';
	readonly VITE_SITE_URL?: string;
	readonly VITE_DEFAULT_LANG?: 'zh' | 'en';
	readonly VITE_FALLBACK_LANG?: 'zh' | 'en';
}
