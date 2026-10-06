import { usePageTitle, usePageMeta } from '@autional/shared';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export default function DevicePrivacyPage() {
	const { t } = useTranslation();
	usePageTitle(t('privacy.device.title'));
	usePageMeta(t('privacy.device.meta'));

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-4xl">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
						{t('privacy.device.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
						{t('privacy.device.subtitle')}
					</p>
				</div>

				<div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-12 dark:border-neutral-800 dark:bg-slate-900">
					<Shield className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
					<p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
						{t('privacy.device.comingSoon')}
					</p>
				</div>
			</div>
		</div>
	);
}
