'use client';

import { usePageTitle, usePageMeta } from '@autional/shared';
import {
	usePenTestReports,
	usePublicAuditStats,
	usePublicHashChain,
	usePublicLogsSummary,
	usePublicCertifications,
} from '@/hooks/use-trust-api';
import { useTranslation } from 'react-i18next';
import { PageHeader, SectionCard, EmptyState, LoadingScreen, ErrorState } from '@autional/ui';
import {
	FileText,
	Shield,
	Lock,
	FileCheck,
	AlertTriangle,
	Clock,
	CheckCircle2,
	Loader2,
	Activity,
	Hash,
	ArrowRight,
	Award,
} from 'lucide-react';

const STATIC_FALLBACK_CERTS = [
	{ key: 'iso27001', icon: FileCheck },
	{ key: 'dpa', icon: Lock },
	{ key: 'djbh', icon: FileText },
	{ key: 'bcp', icon: Clock },
] as const;

export default function AuditReportsPage() {
	const { t, i18n } = useTranslation();

	usePageTitle(t('auditReports.title'));
	usePageMeta(
		i18n.language === 'zh-CN'
			? 'Autional 审计报告 — 审计日志摘要、哈希链完整性证明与合规建设进展。'
			: 'Autional Audit Reports — Audit log summaries, hash chain integrity proofs and compliance progress.',
	);

	const { data: penTestData, isLoading, isError } = usePenTestReports(1, 20);

	const {
		data: statsData,
		isLoading: statsLoading,
		isError: statsError,
		refetch: refetchStats,
	} = usePublicAuditStats();
	const {
		data: hashChainData,
		isLoading: hashChainLoading,
		isError: hashChainError,
	} = usePublicHashChain();
	const {
		data: logsSummaryData,
		isLoading: logsSummaryLoading,
		isError: logsSummaryError,
	} = usePublicLogsSummary();

	const { data: certsData, isLoading: certsLoading } = usePublicCertifications();

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<PageHeader title={t('auditReports.title')} subtitle={t('auditReports.subtitle')} />

				{/* Live Audit Statistics */}
				<SectionCard title={t('audit.liveStats')} className="mt-8">
					{statsLoading ? (
						<LoadingScreen />
					) : statsError ? (
						<ErrorState onRetry={() => refetchStats()} />
					) : statsData ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<div className="text-3xl font-bold text-primary-600">
									{Number(statsData.totalLogs).toLocaleString()}
								</div>
								<div className="text-sm text-gray-500 mt-1">{t('audit.totalEvents')}</div>
							</div>
							{Object.entries(statsData.byModule || {})
								.slice(0, 3)
								.map(([k, v]) => (
									<div key={k} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<div className="text-3xl font-bold text-primary-600">
											{Number(v).toLocaleString()}
										</div>
										<div className="text-sm text-gray-500 mt-1">{k}</div>
									</div>
								))}
						</div>
					) : null}
				</SectionCard>

				{/* Hash Chain Integrity Proof */}
				<SectionCard title={t('audit.hashChainIntegrity')} className="mt-8">
					{hashChainLoading ? (
						<LoadingScreen />
					) : hashChainError ? (
						<ErrorState />
					) : hashChainData ? (
						<div className="space-y-4">
							<div className="flex items-center justify-center gap-3 text-sm font-mono">
								<span
									className="rounded bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-gray-600 dark:text-gray-300"
									title={hashChainData.startHash}
								>
									{hashChainData.startHash}
								</span>
								<ArrowRight className="h-4 w-4 text-gray-400" />
								<span className="rounded bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-gray-400">
									...
								</span>
								<ArrowRight className="h-4 w-4 text-gray-400" />
								<span
									className="rounded bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-gray-600 dark:text-gray-300"
									title={hashChainData.endHash}
								>
									{hashChainData.endHash}
								</span>
								<CheckCircle2 className="h-5 w-5 text-success" />
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
								<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
										{Number(hashChainData.logCount).toLocaleString()}
									</div>
									<div className="text-xs text-gray-500">{t('audit.logCount')}</div>
								</div>
								<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<div className="text-xs text-gray-500">{t('audit.startHash')}</div>
									<div className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1 break-all">
										{hashChainData.startHash}
									</div>
								</div>
								<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<div className="text-xs text-gray-500">{t('audit.endHash')}</div>
									<div className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1 break-all">
										{hashChainData.endHash}
									</div>
								</div>
							</div>
							{hashChainData.lastValidated && (
								<div className="text-center text-xs text-gray-500">
									{t('audit.lastValidated')}: {hashChainData.lastValidated}
								</div>
							)}
						</div>
					) : null}
				</SectionCard>

				{/* Operational Summary */}
				<SectionCard title={t('audit.operationalSummary')} className="mt-8">
					{logsSummaryLoading ? (
						<LoadingScreen />
					) : logsSummaryError ? (
						<ErrorState />
					) : logsSummaryData ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<Activity className="h-5 w-5 text-primary-600 mx-auto mb-1" />
								<div className="text-2xl font-bold text-primary-600">
									{Number(logsSummaryData.totalLogs).toLocaleString()}
								</div>
								<div className="text-xs text-gray-500 mt-1">{t('audit.totalLogs')}</div>
							</div>
							<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<Hash className="h-5 w-5 text-primary-600 mx-auto mb-1" />
								<div className="text-2xl font-bold text-primary-600">
									{Number(logsSummaryData.moduleCount).toLocaleString()}
								</div>
								<div className="text-xs text-gray-500 mt-1">{t('audit.modules')}</div>
							</div>
							<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<div className="text-xs text-gray-500">{t('audit.activeSince')}</div>
								<div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
									{logsSummaryData.activeSince || '—'}
								</div>
							</div>
							<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<div className="text-xs text-gray-500">{t('audit.lastActivity')}</div>
								<div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
									{logsSummaryData.lastActivity || '—'}
								</div>
							</div>
						</div>
					) : null}
				</SectionCard>

				{/* Dynamic Penetration Test Reports */}
				<div className="mt-12">
					<h2 className="text-xl font-bold text-neutral-900 dark:text-white">
						{t('auditReports.securityTestReports')}
					</h2>
					<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
						{t('auditReports.securityTestDesc')}
					</p>

					{isLoading && (
						<div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
							<Loader2 className="h-4 w-4 animate-spin" />
							{t('auditReports.loadingSecurityTests')}
						</div>
					)}

					{isError && (
						<div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-slate-900/50">
							<AlertTriangle className="mb-1 inline h-4 w-4" />
							{t('auditReports.securityTestLoadFailed')}
						</div>
					)}

					{penTestData && penTestData.items.length > 0 && (
						<div className="mt-4 grid gap-4">
							{penTestData.items.map((report) => (
								<SectionCard key={report.id} padding="lg">
									<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
										<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
											<Shield className="h-7 w-7 text-primary-600" />
										</div>
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-3">
												<h3 className="text-lg font-bold text-neutral-900 dark:text-white">
													{report.title}
												</h3>
												<span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
													<CheckCircle2 className="h-3.5 w-3.5" />
													{t('common.status.completed')}
												</span>
											</div>
											<p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
												{report.summary}
											</p>
											<div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
												<div>
													<span className="text-neutral-400 dark:text-neutral-500">
														{t('auditReports.labels.conductedAt')}
													</span>
													{report.conductedAt}
												</div>
												<div>
													<span className="text-neutral-400 dark:text-neutral-500">
														{t('auditReports.labels.severity')}
													</span>
													{report.severity}
												</div>
												<div>
													<span className="text-neutral-400 dark:text-neutral-500">
														{t('auditReports.labels.nextTest')}
													</span>
													{report.nextTestDate || '—'}
												</div>
											</div>
										</div>
									</div>
								</SectionCard>
							))}
						</div>
					)}

					{penTestData && penTestData.items.length === 0 && (
						<div className="mt-4">
							<EmptyState
								title={t('auditReports.noSecurityTests')}
								description={t('auditReports.noSecurityTestsDesc')}
							/>
						</div>
					)}
				</div>

				{/* Certifications / Standard Docs */}
				<div className="mt-12">
					<h2 className="text-xl font-bold text-neutral-900 dark:text-white">
						{t('auditReports.standardDocs')}
					</h2>

					{certsLoading && (
						<div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
							<Loader2 className="h-4 w-4 animate-spin" />
							{t('common.loading')}
						</div>
					)}

					{!certsLoading && (
						<div className="mt-4 grid gap-6">
							{certsData && certsData.items && certsData.items.length > 0
								? certsData.items.map((cert: any) => (
										<SectionCard key={cert.framework} padding="lg">
											<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
												<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
													<Award className="h-7 w-7 text-primary-600" />
												</div>
												<div className="flex-1">
													<div className="flex flex-wrap items-center gap-3">
														<h3 className="text-lg font-bold text-neutral-900 dark:text-white">
															{cert.framework}
														</h3>
														{cert.last_audited_date && (
															<span className="text-xs text-neutral-500 dark:text-neutral-400">
																{t('common.lastAudited')}
																{cert.last_audited_date}
															</span>
														)}
													</div>
													{cert.criteria_scopes && (
														<p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
															{cert.criteria_scopes}
														</p>
													)}
												</div>
											</div>
										</SectionCard>
									))
								: STATIC_FALLBACK_CERTS.map(({ key, icon: Icon }) => {
										const report = {
											title: t(`auditReports.reports.${key}.title`),
											desc: t(`auditReports.reports.${key}.desc`),
											status: t(`auditReports.reports.${key}.status`),
										};
										return (
											<SectionCard key={key} padding="lg">
												<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
													<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
														<Icon className="h-7 w-7 text-primary-600" />
													</div>
													<div className="flex-1">
														<div className="flex flex-wrap items-center gap-3">
															<h3 className="text-lg font-bold text-neutral-900 dark:text-white">
																{report.title}
															</h3>
															<span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-slate-800 dark:text-neutral-400">
																{report.status}
															</span>
														</div>
														<p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
															{report.desc}
														</p>
													</div>
												</div>
											</SectionCard>
										);
									})}
						</div>
					)}
				</div>

				<div className="mt-12 rounded-xl border border-primary-200 bg-primary-50 p-6 dark:border-primary-800 dark:bg-primary-900/20">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="text-base font-semibold text-primary-900 dark:text-primary-200">
								{t('auditReports.notFound')}
							</h3>
							<p className="mt-1 text-sm text-primary-700 dark:text-primary-300">
								{t('auditReports.notFoundDesc')}
							</p>
						</div>
						<a
							href={`mailto:support@autional.net?subject=${encodeURIComponent(i18n.language === 'zh-CN' ? '合规文档咨询' : 'Compliance Document Inquiry')}`}
							className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
						>
							{t('auditReports.contactTeam')}
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
