import { ErrorBoundary as SharedErrorBoundary } from '@autional/ui';
import { useTranslation } from 'react-i18next';
import { type ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

export function ErrorBoundary({ children }: Props) {
	const { t } = useTranslation();
	return (
		<SharedErrorBoundary
			title={t('error.boundary.title')}
			message={t('error.boundary.unknown')}
			retryLabel={t('error.boundary.retry')}
			devMode={import.meta.env.DEV}
		>
			{children}
		</SharedErrorBoundary>
	);
}
