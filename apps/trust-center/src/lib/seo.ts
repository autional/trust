import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSEO } from '@autional/shared';
import { OG_IMAGE, SIBLING_SITE_URL, SITE_URL } from '@/lib/site-env';

const TRUST_SITE_NAME = 'Autional Trust Center';

interface TrustSEOOptions {
	title: string;
	description: string;
	noindex?: boolean;
}

/**
 * hreflang 三行：当前路径在兄弟站上的同名页（两区页面结构一一对应）。
 * 静态路由已由构建期写入（dist/<route>/index.html）；这里补客户端导航后的头部，
 * 保证 SPA 内跳转不会把上一页的 hreflang 残留成旧值。
 */
function applyHreflang(pathname: string) {
	const self = new URL(pathname, `${SITE_URL}/`).toString();
	const sibling = new URL(pathname, `${SIBLING_SITE_URL}/`).toString();
	const isZh = SITE_URL.endsWith('.cn');
	const pairs: Array<[string, string]> = [
		['zh-CN', isZh ? self : sibling],
		['en-US', isZh ? sibling : self],
		['x-default', isZh ? sibling : self],
	];
	for (const [code, href] of pairs) {
		const selector = `link[rel="alternate"][hreflang="${code}"]`;
		let el = document.head.querySelector<HTMLLinkElement>(selector);
		if (!el) {
			el = document.createElement('link');
			el.rel = 'alternate';
			el.hreflang = code;
			document.head.appendChild(el);
		}
		el.href = href;
	}
}

export function useTrustSEO({ title, description, noindex }: TrustSEOOptions) {
	const { pathname } = useLocation();

	useSEO(
		{
			title,
			description,
			canonical: `${SITE_URL}${pathname}`,
			ogImage: OG_IMAGE,
		},
		{
			siteName: TRUST_SITE_NAME,
			baseUrl: SITE_URL,
			defaultOgImage: OG_IMAGE,
		},
	);

	useEffect(() => {
		// 带令牌入口（confirm / unsubscribe）都标了 noindex，不参与 hreflang 配对。
		// 注意：不只是"不加"，还要**清掉**上一页/静态壳可能残留的 hreflang——
		// 从已配对页面客户端跳转进来时，head 里的旧 link 会留下来（QA 实测）。
		if (noindex) {
			document.head
				.querySelectorAll('link[rel="alternate"][hreflang]')
				.forEach((el) => el.remove());
			return;
		}
		applyHreflang(pathname);
	}, [pathname, noindex]);

	useEffect(() => {
		if (!noindex) return;
		const meta = document.createElement('meta');
		meta.name = 'robots';
		meta.content = 'noindex';
		document.head.appendChild(meta);
		return () => {
			meta.remove();
		};
	}, [noindex]);
}
