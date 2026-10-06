import { usePageTitle, usePageMeta } from '@autional/shared';
import { useTranslation } from 'react-i18next';
import { Globe, Server, Database, Shield } from 'lucide-react';

const commitments = [
	{
		icon: Database,
		titleKey: 'transparency',
		descKey: 'transparencyDesc',
	},
	{
		icon: Shield,
		titleKey: 'noCrossBorder',
		descKey: 'noCrossBorderDesc',
	},
	{
		icon: Globe,
		titleKey: 'crossBorderCompliance',
		descKey: 'crossBorderComplianceDesc',
	},
	{
		icon: Server,
		titleKey: 'retention',
		descKey: 'retentionDesc',
	},
];

export default function DataResidencyPage() {
	const { t, i18n } = useTranslation();
	usePageTitle(t('dataResidency.title'));
	usePageMeta(
		i18n.language === 'zh-CN'
			? 'Autional 数据驻留 — 数据存储区域、跨境传输原则与数据保留策略。'
			: 'Autional Data Residency — Data storage regions, cross-border transfer principles and retention policies.',
	);

	const regions = t('dataResidency.regions', { returnObjects: true }) as unknown as Array<{
		code: string;
		name: string;
		location: string;
		status?: string;
		features: string[];
	}>;
	const checklistItems = t('dataResidency.checklistItems', {
		returnObjects: true,
	}) as unknown as string[];

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
						{t('dataResidency.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
						{t('dataResidency.subtitle')}
					</p>
				</div>

				{/* Region Map / Table */}
				<div className="mt-12 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-slate-900">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="bg-neutral-50 text-neutral-700 dark:bg-slate-800 dark:text-neutral-300">
								<tr>
									<th className="px-6 py-4 font-semibold">
										{t('dataResidency.regionTable.region')}
									</th>
									<th className="px-6 py-4 font-semibold">
										{t('dataResidency.regionTable.location')}
									</th>
									<th className="px-6 py-4 font-semibold">
										{t('dataResidency.regionTable.status')}
									</th>
									<th className="px-6 py-4 font-semibold">
										{t('dataResidency.regionTable.features')}
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
								{regions.map((region) => (
									<tr key={region.code}>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/20">
													<Globe className="h-4 w-4 text-primary-600" />
												</div>
												<div>
													<div className="font-semibold text-neutral-900 dark:text-white">
														{region.name}
													</div>
													<div className="text-xs text-neutral-500 dark:text-neutral-400">
														{region.code}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
											{region.location}
										</td>
										<td className="px-6 py-4">
											<span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
												<span className="relative flex h-2 w-2">
													<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
													<span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
												</span>
												{t('common.status.operational')}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="flex flex-wrap gap-2">
												{region.features.map((f) => (
													<span
														key={f}
														className="inline-block rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-slate-800 dark:text-neutral-300"
													>
														{f}
													</span>
												))}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Commitments */}
				<div className="mt-16">
					<h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
						{t('dataResidency.commitments')}
					</h2>
					<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{commitments.map((c) => (
							<div
								key={c.titleKey}
								className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-slate-900"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
									<c.icon className="h-5 w-5 text-primary-600" />
								</div>
								<h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-white">
									{t(`dataResidency.${c.titleKey}`)}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
									{t(`dataResidency.${c.descKey}`)}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Checklist */}
				<div className="mt-16 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-slate-900/50">
					<h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
						{t('dataResidency.checklist')}
					</h2>
					<div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
						{checklistItems.map((item) => (
							<div
								key={item}
								className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-slate-900"
							>
								<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
								<span className="text-sm text-neutral-700 dark:text-neutral-300">{item}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
