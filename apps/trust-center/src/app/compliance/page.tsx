import { useTrustSEO } from '@/lib/seo';
import {
	useAuditFindings,
	useComplianceStatus,
	useSecurityScore,
	usePublicCertifications,
} from '@/hooks/use-trust-api';
import { PageHeader, SectionCard, StatusBadge, EmptyState } from '@autional/ui';
import { useTranslation } from 'react-i18next';
import {
	Shield,
	FileCheck,
	Lock,
	Globe,
	CheckCircle2,
	ExternalLink,
	Loader2,
	AlertTriangle,
	Award,
	FileText,
} from 'lucide-react';

const certIcons: Record<string, React.ComponentType<{ className?: string }>> = {
	iso27001: FileCheck,
	soc2: Shield,
	gdpr: Lock,
	djbh: Globe,
};
const certKeys = ['iso27001', 'soc2', 'gdpr', 'djbh'] as const;

export default function CompliancePage() {
	const { t, i18n } = useTranslation();
	useTrustSEO({
		title: t('compliance.title'),
		description:
			i18n.language === 'zh-CN'
				? 'Autional 合规建设进展 — 我们对照的合规框架、当前状态与建设情况说明。'
				: 'Autional Compliance Progress — The compliance frameworks we track, their current status, and our build-out progress.',
	});

	const { data: findingsData, isLoading, isError } = useAuditFindings(undefined, 1, 5);
	const { data: statusData } = useComplianceStatus();
	const { data: scoreData } = useSecurityScore();
	const { data: certsData } = usePublicCertifications();
	const publicScore = scoreData?.overallScore ?? null;
	const publicStandards = statusData?.frameworksEnabled ?? [];
	const apiCerts = certsData?.items?.length ? certsData.items : null;

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<PageHeader title={t('compliance.title')} subtitle={t('compliance.subtitle')} />

				{/* Dynamic Compliance Score */}
				{publicScore != null && (
					<div className="mt-8 rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6 dark:border-primary-800 dark:from-primary-800 dark:to-surface">
						<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 dark:bg-white/10">
									<Award className="h-7 w-7 text-primary-600 dark:text-sky-300" />
								</div>
								<div>
									<h2 className="text-lg font-bold text-[var(--color-text-primary)]">
										{t('compliance.liveScore', '实时合规评分')}
									</h2>
									<p className="text-sm text-[var(--color-text-muted)]">
										{t('compliance.liveScoreDesc', '当前系统的安全合规指标综合评分')}
									</p>
								</div>
							</div>
							<div className="flex items-baseline gap-2">
								<span className="text-4xl font-bold text-primary-600 dark:text-sky-300">{publicScore}</span>
								<span className="text-lg text-[var(--color-text-muted)]">/ 100</span>
							</div>
						</div>
						{publicStandards.length > 0 && (
							<div className="mt-4 flex flex-wrap gap-2">
								{publicStandards.map((s: string) => (
									<span
										key={s}
										className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-800 dark:text-primary-300"
									>
										{s}
									</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Certifications */}
				<div className="mt-12 space-y-8">
					{apiCerts && apiCerts.length > 0 && (
						<div className="mb-4 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-xs text-primary-700 dark:border-primary-800 dark:bg-white/5 dark:text-primary-300">
							{t('compliance.liveCertData', '以下数据来自认证管理 API，实时同步')}
						</div>
					)}
					{apiCerts && apiCerts.length > 0
						? apiCerts.map((cert) => (
								<SectionCard key={cert.framework || cert.auditor} padding="lg">
									<div className="flex flex-col gap-6 md:flex-row md:items-start">
										<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-white/10">
											<FileText className="h-7 w-7 text-primary-600 dark:text-sky-300" />
										</div>
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-3">
												<h2 className="text-xl font-bold text-[var(--color-text-primary)]">
												{cert.framework || cert.auditor}
											</h2>
											{cert.lastAuditedDate && (
												<span className="text-xs text-[var(--color-text-muted)]">
													{t('common.lastAudited')}
													{cert.lastAuditedDate}
												</span>
											)}
										</div>
										{cert.criteriaScopes && (
											<p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
												{cert.criteriaScopes}
											</p>
										)}
									</div>
								</div>
							</SectionCard>
						))
					: certKeys.map((key) => {
							const cert = {
								name: t(`compliance.certifications.${key}.name`),
								status: t(`compliance.certifications.${key}.status`),
								scope: t(`compliance.certifications.${key}.scope`),
							};
							const Icon = certIcons[key];
							return (
								<SectionCard key={key} padding="lg">
									<div className="flex flex-col gap-6 md:flex-row md:items-start">
										<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-white/10">
											<Icon className="h-7 w-7 text-primary-600 dark:text-sky-300" />
										</div>
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-3">
												<h2 className="text-xl font-bold text-[var(--color-text-primary)]">
													{cert.name}
												</h2>
												<StatusBadge variant="neutral">{cert.status}</StatusBadge>
											</div>
											<p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
												{cert.scope}
											</p>
										</div>
									</div>
								</SectionCard>
							);
						})}
				</div>

				{/* Dynamic Audit Findings */}
				<div className="mt-12">
					<h2 className="text-xl font-bold text-[var(--color-text-primary)]">
						{t('compliance.latestFindings')}
					</h2>
					<p className="mt-1 text-sm text-[var(--color-text-muted)]">
						{t('compliance.findingsDesc')}
					</p>

					{isLoading && (
						<div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
							<Loader2 className="h-4 w-4 animate-spin" />
							{t('compliance.loadingFindings')}
						</div>
					)}

					{isError && (
						<div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-[var(--color-text-muted)] dark:border-neutral-800 dark:bg-surface/50">
							<AlertTriangle className="mb-1 inline h-4 w-4" />
							{t('compliance.findingsLoadFailed')}
						</div>
					)}

					{findingsData && findingsData.items.length > 0 && (
						<div className="mt-4 space-y-3">
							{findingsData.items.map((finding) => {
								const severity = finding.severity?.toLowerCase();
								const variant =
									severity === 'critical'
										? 'danger'
										: severity === 'high'
											? 'warning'
											: severity === 'medium'
												? 'info'
												: 'neutral';
								return (
									<div
										key={finding.id}
										className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-surface sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<span className="text-sm font-semibold text-[var(--color-text-primary)]">
													{finding.title}
												</span>
												<StatusBadge variant={variant}>{finding.severity}</StatusBadge>
												<StatusBadge variant="neutral">{finding.status}</StatusBadge>
											</div>
											<p className="mt-1 text-xs text-[var(--color-text-muted)]">
												{t('common.controlType')}
												{finding.controlType} · {t('common.controlId')}
												{finding.controlId}
											</p>
										</div>
										<div className="text-xs text-[var(--color-text-muted)]">
											{t('common.dueDate')}
											{finding.dueDate || '—'}
										</div>
									</div>
								);
							})}
						</div>
					)}

					{findingsData && findingsData.items.length === 0 && (
						<div className="mt-4">
							<EmptyState
								title={t('compliance.noFindings')}
								description={t('compliance.noFindingsDesc')}
								icon={<CheckCircle2 className="h-6 w-6 text-[var(--color-success-text)]" />}
							/>
						</div>
					)}
				</div>

				<div className="mt-12 rounded-xl border border-primary-200 bg-primary-50 p-6 dark:border-primary-800 dark:bg-white/5">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="text-base font-semibold text-primary-900 dark:text-primary-200">
								{t('compliance.needReport')}
							</h3>
							<p className="mt-1 text-sm text-primary-700 dark:text-primary-300">
								{t('compliance.needReportDesc')}
							</p>
						</div>
						<a
							href={`mailto:support@autional.net?subject=${encodeURIComponent(i18n.language === 'zh-CN' ? '合规报告申请' : 'Compliance Report Request')}`}
							className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
						>
							{t('compliance.applyReport')}
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
