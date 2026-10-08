import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { usePageTitle, usePageMeta } from '@autional/shared';
import { Shield, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
	const { t } = useTranslation();
	usePageTitle(t('notFound.title'));
	usePageMeta(t('notFound.meta'));

	return (
		<div className="flex min-h-[70vh] items-center justify-center px-4">
			<div className="text-center">
				<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-surface">
					<Search className="h-10 w-10 text-[var(--color-text-muted)] dark:text-neutral-500" />
				</div>
				<h1 className="mt-6 text-3xl font-extrabold text-neutral-900 dark:text-white">
					{t('notFound.title')}
				</h1>
				<p className="mx-auto mt-3 max-w-md text-neutral-600 dark:text-[var(--color-text-muted)]">
					{t('notFound.description')}
				</p>
				<div className="mt-8 flex items-center justify-center gap-3">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
					>
						<Shield className="h-4 w-4" />
						{t('notFound.backToOverview')}
					</Link>
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-surface dark:text-neutral-300 dark:hover:bg-elevated"
					>
						<ArrowLeft className="h-4 w-4" />
						{t('notFound.goBack')}
					</button>
				</div>
			</div>
		</div>
	);
}
