import { useTrustSEO } from '@/lib/seo';
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
	useTrustSEO({
		title: t('dataResidency.title'),
		description:
			i18n.language === 'zh-CN'
				? 'Autional 数据驻留 — 数据存储区域、跨境传输原则与数据保留策略。'
				: 'Autional Data Residency — Data storage regions, cross-border transfer principles and retention policies.',
	});

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
					<h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
						{t('dataResidency.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
						{t('dataResidency.subtitle')}
					</p>
				</div>

				{/* Region Map / Table */}
				<div className="mt-12 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-surface">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="bg-neutral-50 text-[var(--color-text-muted)] dark:bg-surface">
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
												<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 dark:bg-white/10">
													<Globe className="h-4 w-4 text-primary-600 dark:text-sky-300" />
												</div>
												<div>
													<div className="font-semibold text-[var(--color-text-primary)]">
														{region.name}
													</div>
													<div className="text-xs text-[var(--color-text-muted)]">
														{region.code}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-[var(--color-text-muted)]">
											{region.location}
										</td>
										<td className="px-6 py-4">
											<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-success-text)]">
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
														className="inline-block rounded-md bg-neutral-100 px-2 py-1 text-xs text-[var(--color-text-muted)] dark:bg-surface"
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
					<h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
						{t('dataResidency.commitments')}
					</h2>
					<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{commitments.map((c) => (
							<div
								key={c.titleKey}
								className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-surface"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-white/10">
									<c.icon className="h-5 w-5 text-primary-600 dark:text-sky-300" />
								</div>
								<h3 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">
									{t(`dataResidency.${c.titleKey}`)}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
									{t(`dataResidency.${c.descKey}`)}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Checklist */}
				<div className="mt-16 rounded-md border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-surface/50">
					<h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
						{t('dataResidency.checklist')}
					</h2>
					<div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
						{checklistItems.map((item) => (
							<div
								key={item}
								className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-surface"
							>
								<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
								<span className="text-sm text-[var(--color-text-muted)]">{item}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
