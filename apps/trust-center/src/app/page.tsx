import { useSEO } from '@autional/shared';
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

export default function OverviewPage() {
	const { t, i18n } = useTranslation();
	useSEO(
		{
			title: t('overview.title'),
			description: i18n.language?.startsWith('zh')
				? 'Autional Trust Center 总览 — 安全实践、数据保护与合规建设进展的透明展示。'
				: 'Autional Trust Center Overview — Transparency on our security practices, data protection, and compliance progress.',
		},
		{ siteName: 'Autional Trust Center' },
	);

	const { data: status, isLoading, isError } = useComplianceStatus();

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
					<div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
						<Shield className="h-4 w-4" />
						{t('overview.trustCenterBadge')}
					</div>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
						{t('overview.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
						{t('overview.subtitle')}
					</p>
				</div>

				{/* Security Score Dashboard */}
				<div className="mt-8">
					<SecurityScore />
				</div>

				{/* Dynamic Compliance Status Banner */}
				{isLoading && (
					<div className="mt-8 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
						<Loader2 className="h-4 w-4 animate-spin" />
						{t('overview.loadingStatus')}
					</div>
				)}
				{status && !isError && (
					<div className="mt-8 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-slate-900">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-full ${status.overallStatus === 'compliant' || status.overallStatus === '合规' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
								>
									{status.overallStatus === 'compliant' || status.overallStatus === '合规' ? (
										<CheckCircle2 className="h-5 w-5" />
									) : (
										<AlertTriangle className="h-5 w-5" />
									)}
								</div>
								<div>
									<div className="text-sm font-medium text-neutral-900 dark:text-white">
										{status.overallStatus === 'compliant' || status.overallStatus === '合规'
											? t('common.realTimeLabel')
											: t('overview.statusBuilding')}
									</div>
									<div className="text-xs text-neutral-500 dark:text-neutral-400">
										{t('overview.lastAuditLine', {
											date: status.lastAuditDate || '\u2014',
											count: status.openIssues ?? 0,
										})}
									</div>
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								<span
									className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.iso27001Compliant ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-500 dark:bg-slate-800'}`}
								>
									{status.iso27001Compliant && <CheckCircle2 className="h-3 w-3" />} ISO 27001
								</span>
								<span
									className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.soxCompliant ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-500 dark:bg-slate-800'}`}
								>
									{status.soxCompliant && <CheckCircle2 className="h-3 w-3" />} SOX
								</span>
								<span
									className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.gdprCompliant ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-500 dark:bg-slate-800'}`}
								>
									{status.gdprCompliant && <CheckCircle2 className="h-3 w-3" />} GDPR
								</span>
							</div>
						</div>
					</div>
				)}
				{isError && (
					<div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-slate-900/50">
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
								className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-slate-900"
							>
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
									<Icon className="h-6 w-6 text-primary-600" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
									{cert.name}
								</h3>
								<span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-slate-800 dark:text-neutral-400">
									{cert.status}
								</span>
								<p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
									{cert.desc}
								</p>
							</div>
						);
					})}
				</div>

				{/* Security Pillars */}
				<div className="mt-20">
					<h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
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
									className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md dark:border-neutral-800 dark:bg-slate-900 dark:hover:border-primary-800"
								>
									<div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/20 dark:group-hover:bg-primary-900/30">
										<Icon className="h-5 w-5" />
									</div>
									<h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
										{pillar.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
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
				<div className="mt-20 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-slate-900/50">
					<h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
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
									className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-200 hover:shadow-sm dark:border-neutral-800 dark:bg-slate-900 dark:hover:border-primary-800"
								>
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/20">
										<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
									</div>
									<div>
										<h3 className="text-base font-semibold text-neutral-900 dark:text-white">
											{link.title}
										</h3>
										<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
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
					<h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
						{t('overview.complianceChecklist')}
					</h2>
					<div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
						{checklistItems.map((item: string) => (
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

				{/* CTA */}
				<div className="mt-16 text-center">
					<h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
						{t('overview.needReport')}
					</h2>
					<p className="mx-auto mt-2 max-w-xl text-neutral-600 dark:text-neutral-300">
						{t('overview.needReportDesc')}
					</p>
					<a
						href="mailto:support@autional.net?subject=Document%20Request"
						className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
					>
						{t('overview.requestDoc')}
					</a>
				</div>
			</div>
		</div>
	);
}
