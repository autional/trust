import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSEO } from '@autional/shared';
import { OG_IMAGE, SITE_URL } from '@/lib/site-env';

const TRUST_SITE_NAME = 'Autional Trust Center';

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
