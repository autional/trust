import { usePageTitle, usePageMeta } from '@autional/shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
	Lock,
	Fingerprint,
	Eye,
	Server,
	Shield,
	AlertTriangle,
	KeyRound,
	Network,
	Clock,
	FileSearch,
} from 'lucide-react';

const pillars = [
	{ icon: Network, titleKey: 'zeroTrust', descKey: 'zeroTrustDesc' },
	{ icon: KeyRound, titleKey: 'encryption', descKey: 'encryptionDesc' },
	{ icon: Server, titleKey: 'infrastructure', descKey: 'infrastructureDesc' },
	{ icon: Eye, titleKey: 'observability', descKey: 'observabilityDesc' },
];

const programs = [
	{ icon: Shield, titleKey: 'securityTesting', descKey: 'securityTestingDesc' },
	{ icon: AlertTriangle, titleKey: 'bugBounty', descKey: 'bugBountyDesc' },
	{ icon: FileSearch, titleKey: 'codeAudit', descKey: 'codeAuditDesc' },
	{ icon: Clock, titleKey: 'soc247', descKey: 'soc247Desc' },
];

export default function SecurityPage() {
	const { t, i18n } = useTranslation();
	usePageTitle(t('security.title'));
	usePageMeta(
		i18n.language === 'zh-CN'
			? 'Autional 安全架构 — 零信任架构、加密、基础设施安全与可观测性。'
			: 'Autional Security Architecture — Zero trust, encryption, infrastructure security and observability.',
	);

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
						{t('security.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
						{t('security.subtitle')}
					</p>
				</div>

				<div className="mt-12 space-y-10">
					{pillars.map((p) => {
						const items = t(`security.items.${p.titleKey}`, {
							returnObjects: true,
						}) as unknown as string[];
						return (
							<div
								key={p.titleKey}
								className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-surface sm:p-8"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
										<p.icon className="h-6 w-6 text-primary-600" />
									</div>
									<h2 className="text-xl font-bold text-neutral-900 dark:text-white">
										{t(`security.${p.titleKey}`)}
									</h2>
								</div>
								<p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
									{t(`security.${p.descKey}`)}
								</p>
								<ul className="mt-4 grid gap-2 sm:grid-cols-2">
									{items.map((item) => (
										<li
											key={item}
											className="flex items-start gap-2 text-sm text-neutral-600 dark:text-[var(--color-text-muted)]"
										>
											<Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
											{item}
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>

				<div className="mt-16">
					<h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
						{t('security.securityPrograms')}
					</h2>
					<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{programs.map((prog) => (
							<div
								key={prog.titleKey}
								className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-surface"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
									<prog.icon className="h-5 w-5 text-primary-600" />
								</div>
								<h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-white">
									{t(`security.${prog.titleKey}`)}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-[var(--color-text-muted)]">
									{t(`security.${prog.descKey}`)}
								</p>
							</div>
						))}
					</div>
				</div>

				<div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-surface/50">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="text-base font-semibold text-neutral-900 dark:text-white">
								{t('security.vulnerabilityDisclosure')}
							</h3>
							<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
								{t('security.vulnerabilityDisclosureDesc')}
							</p>
						</div>
						<Link
							to="/vulnerability-disclosure"
							className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
						>
							{t('common.contact')}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
