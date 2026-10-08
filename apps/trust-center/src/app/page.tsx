import { useTrustSEO } from '@/lib/seo';
import { useComplianceStatus } from '@/hooks/use-trust-api';
import { useTranslation } from 'react-i18next';
import SecurityScore from '@/components/SecurityScore';
import {
	Shield,
	Lock,
	FileCheck,
	Globe,
	Server,
	Eye,
	Fingerprint,
	Clock,
	ArrowRight,
	CheckCircle2,
	AlertTriangle,
	Loader2,
} from 'lucide-react';
import { Link } from 'react-router';

const certIcons = {
	iso27001: FileCheck,
	soc2: Shield,
	gdpr: Lock,
	djbh: Globe,
};

const pillarIcons: Record<string, React.ComponentType<{ className?: string }>> = {
	encryption: Lock,
	zeroTrust: Fingerprint,
	immutableAudit: Eye,
	highAvailability: Server,
	soc247: Clock,
	securityTesting: Shield,
};

const FRAMEWORK_LABELS: Record<string, string> = {
	gdpr: 'GDPR',
	iso27001: 'ISO 27001',
	iso27001_2022: 'ISO 27001',
	soc2: 'SOC 2',
	sox: 'SOX',
};

export default function OverviewPage() {
	const { t, i18n } = useTranslation();
	useTrustSEO({
		title: t('overview.title'),
		description:
			i18n.language?.startsWith('zh')
				? 'Autional Trust Center 总览 — 安全实践、数据保护与合规建设进展的透明展示。'
				: 'Autional Trust Center Overview — Transparency on our security practices, data protection, and compliance progress.',
	});

	const { data: status, isLoading, isError } = useComplianceStatus();

	// 徽标以 frameworks_enabled 为准：未启用的框架不展示（其合规标志位可能是历史残留）
	const compliantFlags: Record<string, boolean | undefined> = {
		gdpr: status?.gdprCompliant,
		iso27001: status?.iso27001Compliant,
		iso27001_2022: status?.iso27001Compliant,
		sox: status?.soxCompliant,
	};
	const frameworkPills: { key: string; label: string; compliant?: boolean }[] = [];
	const seenFrameworkLabels = new Set<string>();
	for (const key of status?.frameworksEnabled ?? []) {
		const label = FRAMEWORK_LABELS[key] ?? key;
		if (seenFrameworkLabels.has(label)) continue;
		seenFrameworkLabels.add(label);
		frameworkPills.push({ key, label, compliant: compliantFlags[key] });
	}

	const statusDetailParts = [
		status?.lastAuditDate ? t('overview.lastAuditLine', { date: status.lastAuditDate }) : null,
		status?.openIssuesRange ? t('overview.openIssuesLine', { range: status.openIssuesRange }) : null,
	].filter((part): part is string => part !== null);

	const certKeys = ['iso27001', 'soc2', 'gdpr', 'djbh'] as const;
	const pillarKeys = [
		'encryption',
		'zeroTrust',
		'immutableAudit',
		'highAvailability',
		'soc247',
		'securityTesting',
	] as const;
	const quickLinkKeys = [
		'complianceDetail',
		'auditCompliance',
		'dataResidency',
		'incidents',
	] as const;
	const checklistItems = t('overview.checklistItems', {
		returnObjects: true,
	}) as unknown as string[];

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				{/* Hero */}
				<div className="text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-white/10 dark:text-sky-300">
						<Shield className="h-4 w-4" />
						{t('overview.trustCenterBadge')}
					</div>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
						{t('overview.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
						{t('overview.subtitle')}
					</p>
				</div>

				{/* Security Score Dashboard */}
				<div className="mt-8">
					<SecurityScore />
				</div>

				{/* Dynamic Compliance Status Banner */}
				{isLoading && (
					<div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
						<Loader2 className="h-4 w-4 animate-spin" />
						{t('overview.loadingStatus')}
					</div>
				)}
				{status && !isError && (
					<div className="mt-8 rounded-xl border border-neutral-200 bg-white p-4 shadow-card dark:border-neutral-800 dark:bg-surface">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-full ${status.overallStatus === 'compliant' || status.overallStatus === '合规' ? 'bg-[var(--color-success-soft)] text-[var(--color-success-text)]' : 'bg-[var(--color-warning-soft)] text-[var(--color-warning-text)]'}`}
								>
									{status.overallStatus === 'compliant' || status.overallStatus === '合规' ? (
										<CheckCircle2 className="h-5 w-5" />
									) : (
										<AlertTriangle className="h-5 w-5" />
									)}
								</div>
								<div>
									<div className="text-sm font-medium text-[var(--color-text-primary)]">
										{status.overallStatus === 'compliant' || status.overallStatus === '合规'
											? t('common.realTimeLabel')
											: t('overview.statusBuilding')}
									</div>
									{statusDetailParts.length > 0 && (
										<div className="text-xs text-[var(--color-text-muted)]">
											{statusDetailParts.join(' · ')}
										</div>
									)}
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								{frameworkPills.map((pill) => (
									<span
										key={pill.key}
										className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pill.compliant ? 'bg-[var(--color-success-soft)] text-[var(--color-success-text)]' : 'bg-neutral-100 text-[var(--color-text-muted)] dark:bg-surface'}`}
									>
										{pill.compliant && <CheckCircle2 className="h-3 w-3" />} {pill.label}
									</span>
								))}
							</div>
						</div>
					</div>
				)}
				{isError && (
					<div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-[var(--color-text-muted)] dark:border-neutral-800 dark:bg-surface/50">
						<AlertTriangle className="mb-1 inline h-4 w-4" />
						{t('overview.loadFailed')}
					</div>
				)}

				{/* Certifications */}
				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{certKeys.map((key) => {
						const cert = {
							name: t(`overview.certifications.${key}.name`),
							desc: t(`overview.certifications.${key}.desc`),
							status: t(`overview.certifications.${key}.status`),
						};
						const Icon = certIcons[key];
						return (
							<div
								key={cert.name}
								className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-card transition-all dark:border-neutral-800 dark:bg-surface hover:border-neutral-300"
							>
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-white/10">
									<Icon className="h-6 w-6 text-primary-600 dark:text-sky-300" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
									{cert.name}
								</h3>
								<span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)] dark:bg-surface">
									{cert.status}
								</span>
								<p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
									{cert.desc}
								</p>
							</div>
						);
					})}
				</div>

				{/* Security Pillars */}
				<div className="mt-20">
					<h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
						{t('overview.securityArchitecture')}
					</h2>
					<div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{pillarKeys.map((key) => {
							const pillar = {
								title: t(`overview.pillars.${key}.title`),
								desc: t(`overview.pillars.${key}.desc`),
							};
							const Icon = pillarIcons[key];
							const href = ['encryption', 'zeroTrust', 'securityTesting'].includes(key)
								? '/security'
								: key === 'immutableAudit'
									? '/compliance'
									: key === 'highAvailability'
										? '/data-residency'
										: '/incidents';
							return (
								<Link
									key={key}
									to={href}
									className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-card transition-all hover:border-primary-200 dark:border-neutral-800 dark:bg-surface dark:hover:border-primary-800"
								>
									<div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-white/10 dark:text-sky-300 dark:group-hover:bg-white/20">
										<Icon className="h-5 w-5" />
									</div>
									<h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
										{pillar.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
										{pillar.desc}
									</p>
									<span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400">
										{t('common.learnMore')}{' '}
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</span>
								</Link>
							);
						})}
					</div>
				</div>

				{/* Quick Links */}
				<div className="mt-20 rounded-md border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-surface/50">
					<h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
						{t('overview.quickLinks')}
					</h2>
					<div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
						{quickLinkKeys.map((key) => {
							const link = {
								title: t(`overview.quickLinkItems.${key}.title`),
								desc: t(`overview.quickLinkItems.${key}.desc`),
							};
							return (
								<Link
									key={key}
									to={`/${key === 'complianceDetail' ? 'compliance' : key === 'auditCompliance' ? 'audit-reports' : key === 'dataResidency' ? 'data-residency' : 'incidents'}`}
									className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-200 dark:border-neutral-800 dark:bg-surface dark:hover:border-primary-800"
								>
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-sky-300">
										<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
									</div>
									<div>
										<h3 className="text-base font-semibold text-[var(--color-text-primary)]">
											{link.title}
										</h3>
										<p className="mt-1 text-sm text-[var(--color-text-muted)]">
											{link.desc}
										</p>
									</div>
								</Link>
							);
						})}
					</div>
				</div>

				{/* Compliance Checklist */}
				<div className="mt-20">
					<h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
						{t('overview.complianceChecklist')}
					</h2>
					<div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
						{checklistItems.map((item: string) => (
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

				{/* CTA */}
				<div className="mt-16 text-center">
					<h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
						{t('overview.needReport')}
					</h2>
					<p className="mx-auto mt-2 max-w-xl text-[var(--color-text-muted)]">
						{t('overview.needReportDesc')}
					</p>
					<a
						href="mailto:support@autional.net?subject=Document%20Request"
						className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-card transition-colors hover:bg-primary-700"
					>
						{t('overview.requestDoc')}
					</a>
				</div>
			</div>
		</div>
	);
}
