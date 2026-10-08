import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';
import { FALLBACK_LANG, localeOf } from '@/lib/site-env';

// Unified flat-key format: all locale keys use dot-delimited paths (e.g. "nav.overview").
// keySeparator: false ensures dots in keys are treated as literal characters, not path separators.
//
// 语言契约（B3 §1.5）：首访语言 = 区域默认（cn→zh / com→en）——由 fallbackLng 承接，
// 探测链只留 localStorage（关 navigator：避免区域默认被浏览器语言覆盖）；
// 手动切换经 localStorage（lookupLocalStorage）持久，跨访问保留。
i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			'zh-CN': { translation: zhCN },
			'en-US': { translation: enUS },
		},
		fallbackLng: localeOf(FALLBACK_LANG),
		keySeparator: false,
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ['localStorage'],
			caches: ['localStorage'],
			lookupLocalStorage: 'autional-trust-i18n',
		},
	});

// 同步 <html lang> —— 语言切换后更新（a11y / 浏览器翻译）；不碰 document.title（各路由由 useTrustSEO 管理）
const syncDocumentLang = () => {
	if (typeof document !== 'undefined') {
		document.documentElement.lang = i18n.language || 'zh-CN';
	}
};
i18n.on('languageChanged', syncDocumentLang);
if (i18n.isInitialized) {
	syncDocumentLang();
} else {
	i18n.on('initialized', syncDocumentLang);
}

export default i18n;
