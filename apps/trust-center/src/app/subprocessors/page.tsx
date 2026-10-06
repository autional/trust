import { usePageTitle, usePageMeta } from '@autional/shared';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getSubprocessors } from '@/lib/api.generated';
import { PageHeader, StatusBadge, EmptyState } from '@autional/ui';
import { Server, Globe, Shield, Database, Loader2, AlertTriangle, Building2 } from 'lucide-react';

export default function SubprocessorsPage() {
	const { t, i18n } = useTranslation();
	usePageTitle(t('subprocessors.title'));
	usePageMeta(
		i18n.language === 'zh-CN'
			? 'Autional 子处理商清单 — GDPR Art.28 要求的子处理商公示，包括名称、服务、位置与处理目的。'
			: 'Autional Subprocessor List — GDPR Art.28 required subprocessor disclosure, including name, service, location, and purpose.',
	);

	const { data, isLoading, isError } = useQuery({
		queryKey: ['subprocessors'],
		queryFn: () => getSubprocessors({ page_size: 50 }),
	});

	const subprocessors = data?.items ?? [];

	const categoryLabels: Record<string, string> = {
		infrastructure: t('subprocessors.categoryLabels.infrastructure'),
		service_provider: t('subprocessors.categoryLabels.service_provider'),
		third_party: t('subprocessors.categoryLabels.third_party'),
		infrastructure_service: t('subprocessors.categoryLabels.infrastructure_service'),
		email_service: t('subprocessors.categoryLabels.email_service'),
		sms_service: t('subprocessors.categoryLabels.sms_service'),
	};

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<PageHeader title={t('subprocessors.title')} subtitle={t('subprocessors.subtitle')} />

				{isLoading && (
					<div className="mt-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
						<Loader2 className="h-4 w-4 animate-spin" />
						{t('common.loading')}
					</div>
				)}

				{isError && (
					<div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-slate-900/50">
						<AlertTriangle className="mb-2 inline h-5 w-5 text-warning" />
						<p>{t('common.loadFailed')}</p>
					</div>
				)}

				{!isLoading && !isError && subprocessors.length === 0 && (
					<div className="mt-8">
						<EmptyState
							title={t('common.empty')}
							description={t('subprocessors.emptyDesc')}
							icon={<Building2 className="h-6 w-6 text-neutral-400" />}
						/>
					</div>
				)}

				{!isLoading && !isError && subprocessors.length > 0 && (
					<div className="mt-8 space-y-4">
						{subprocessors.map((sp: any) => (
							<div
								key={sp.id}
								className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-slate-900"
							>
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<div className="flex items-start gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
											<Server className="h-5 w-5 text-primary-600" />
										</div>
										<div>
											<h3 className="text-base font-semibold text-neutral-900 dark:text-white">
												{sp.entityName}
											</h3>
											{sp.applicableServices && (
												<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
													{sp.applicableServices}
												</p>
											)}
										</div>
									</div>
									{sp.category && (
										<StatusBadge variant="info">
											{categoryLabels[sp.category] ?? sp.category}
										</StatusBadge>
									)}
								</div>

								<div className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-700 sm:grid-cols-2 lg:grid-cols-3">
									{sp.locations && (
										<div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
											<Globe className="h-4 w-4 shrink-0 text-neutral-400" />
											<span>
												<span className="text-neutral-400 dark:text-neutral-500">
													{t('subprocessors.location')}
													{i18n.language?.startsWith('zh') ? '\uFF1A' : ': '}
												</span>
												{Array.isArray(sp.locations) ? sp.locations.join(', ') : sp.locations}
											</span>
										</div>
									)}
									{sp.subjectMatter && (
										<div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
											<Database className="h-4 w-4 shrink-0 text-neutral-400" />
											<span>
												<span className="text-neutral-400 dark:text-neutral-500">
													{t('subprocessors.dataCategories')}
													{i18n.language?.startsWith('zh') ? '\uFF1A' : ': '}
												</span>
												{sp.subjectMatter}
											</span>
										</div>
									)}
									{sp.purpose && (
										<div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
											<Shield className="h-4 w-4 shrink-0 text-neutral-400" />
											<span>
												<span className="text-neutral-400 dark:text-neutral-500">
													{t('subprocessors.certifications')}
													{i18n.language?.startsWith('zh') ? '\uFF1A' : ': '}
												</span>
												{sp.purpose}
											</span>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}

				<div className="mt-12 rounded-xl border border-primary-200 bg-primary-50 p-6 dark:border-primary-800 dark:bg-primary-900/20">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="text-base font-semibold text-primary-900 dark:text-primary-200">
								{t('subprocessors.aboutTitle')}
							</h3>
							<p className="mt-1 text-sm text-primary-700 dark:text-primary-300">
								{t('subprocessors.aboutDesc')}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
