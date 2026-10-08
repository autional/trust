import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSEO } from '@autional/shared';

const TRUST_SITE_URL = 'https://trust.autional.cn';
const TRUST_SITE_NAME = 'Autional Trust Center';
// shared 的默认 og:image 指向 iam.tianv.com 构建哨兵（线上 404）；全站统一改用 web 站托管的分享图
const TRUST_OG_IMAGE = 'https://www.autional.cn/og-default.png';

interface TrustSEOOptions {
	title: string;
	description: string;
	noindex?: boolean;
}

export function useTrustSEO({ title, description, noindex }: TrustSEOOptions) {
	const { pathname } = useLocation();

	useSEO(
		{
			title,
			description,
			canonical: `${TRUST_SITE_URL}${pathname}`,
			ogImage: TRUST_OG_IMAGE,
		},
		{
			siteName: TRUST_SITE_NAME,
			baseUrl: TRUST_SITE_URL,
			defaultOgImage: TRUST_OG_IMAGE,
		},
	);

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
