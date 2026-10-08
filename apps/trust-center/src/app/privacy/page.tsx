import { useTrustSEO } from '@/lib/seo';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Lock, Eye, Shield, FileText, Globe, Trash2, UserCheck, Cookie, Smartphone, ArrowRight } from 'lucide-react';

const sectionIcons: Record<string, React.FC<{ className?: string }>> = {
	collection: FileText,
	usage: Lock,
	sharing: Eye,
	crossBorder: Globe,
	retention: Trash2,
	rights: UserCheck,
	cookies: Cookie,
};

const sectionKeys = [
	'collection',
	'usage',
	'sharing',
	'crossBorder',
	'retention',
	'rights',
	'cookies',
] as const;

export default function PrivacyPage() {
	const { t, i18n } = useTranslation();
	useTrustSEO({
		title: t('privacy.title'),
		description:
			i18n.language === 'zh-CN'
				? 'Autional 隐私政策 — 数据收集、使用、共享、保留与您的隐私权利说明。'
				: 'Autional Privacy Policy — Data collection, usage, sharing, retention, and your privacy rights.',
	});

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-4xl">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
						{t('privacy.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
						{t('privacy.subtitle')}
					</p>
				</div>

				<div className="mt-12 space-y-8">
					{sectionKeys.map((key) => {
						const Icon = sectionIcons[key];
						const content = t(`privacy.sections.${key}`, {
							returnObjects: true,
						}) as unknown as string[];
						return (
							<div
								key={key}
								className="rounded-md border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-surface sm:p-8"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-white/10">
										<Icon className="h-5 w-5 text-primary-600 dark:text-sky-300" />
									</div>
									<h2 className="text-lg font-bold text-[var(--color-text-primary)]">
										{t(`privacy.${key}`)}
									</h2>
								</div>
								<ul className="mt-4 space-y-2">
									{content.map((item, idx) => (
										<li
											key={idx}
											className="flex items-start gap-2 text-sm leading-relaxed text-[var(--color-text-muted)]"
										>
											<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
											{item}
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>

				<Link
					to="/privacy/device"
					className="group mt-8 flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-200 dark:border-neutral-800 dark:bg-surface dark:hover:border-primary-800"
				>
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-sky-300">
						<Smartphone className="h-5 w-5" />
					</div>
					<div className="flex-1">
						<h3 className="text-base font-semibold text-[var(--color-text-primary)]">
							{t('privacy.deviceLink.title')}
						</h3>
						<p className="mt-1 text-sm text-[var(--color-text-muted)]">
							{t('privacy.deviceLink.desc')}
						</p>
					</div>
					<ArrowRight className="mt-2.5 h-5 w-5 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
				</Link>

				<div className="mt-12 rounded-md border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-surface/50 sm:p-8">
					<div className="flex items-center gap-3">
						<Shield className="h-6 w-6 text-primary-600 dark:text-sky-300" />
						<h2 className="text-lg font-bold text-[var(--color-text-primary)]">
							{t('privacy.contactDpo')}
						</h2>
					</div>
					<p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
						{t('privacy.contactDpoDesc')}
					</p>
					<div className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
						<div>
							<span className="text-[var(--color-text-muted)]">
								{t('privacy.dpoEmail')}
							</span>
							<a
								href="mailto:privacy@autional.net"
								className="text-primary-600 hover:underline dark:text-primary-400"
							>
								privacy@autional.net
							</a>
						</div>
						<div>
							<span className="text-[var(--color-text-muted)]">
								{t('privacy.dpoAddress')}
							</span>
							{t('privacy.dpoAddressText')}
						</div>
					</div>
				</div>

				<div className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
					{t('privacy.lastUpdated')}
					{i18n.language?.startsWith('zh') ? '\uFF1A' : ': '}
					{t('privacy.updatedDate')}
				</div>
			</div>
		</div>
	);
}
