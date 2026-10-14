import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, X, Shield, ChevronUp } from 'lucide-react';
import { LANDING_SITE_URL, STATUS_PAGE_URL, DEVELOPER_PORTAL_URL } from '@autional/shared';
import { ThemeToggle, LanguageSwitcher } from '@autional/ui';
import { NavGroupMenu } from './NavGroupMenu';

export default function TrustLayout() {
	const { t } = useTranslation();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const location = useLocation();

	// 11 个页面按主题收成 4 组（一级导航 + 页脚共用同一套分组，防两处漂移）。
	// 组内落地页用页面自身标题键（security.title 等）——导航名与页面 H1 同一出处。
	const navGroups = [
		{
			label: t('layout.security'),
			base: '/security',
			items: [
				{ to: '/security', label: t('security.title') },
				{ to: '/storage-security', label: t('nav.storageSecurity') },
				{ to: '/vulnerability-disclosure', label: t('nav.vulnerabilityDisclosure') },
			],
		},
		{
			label: t('layout.compliance'),
			base: '/compliance',
			items: [
				{ to: '/compliance', label: t('compliance.title') },
				{ to: '/audit-reports', label: t('nav.auditReports') },
				{ to: '/data-residency', label: t('nav.dataResidency') },
			],
		},
		{
			label: t('layout.privacy'),
			base: '/privacy',
			items: [
				{ to: '/privacy', label: t('privacy.title') },
				{ to: '/subprocessors', label: t('nav.subprocessors') },
			],
		},
		{
			label: t('layout.incidents'),
			base: '/incidents',
			items: [
				{ to: '/incidents', label: t('incidents.title') },
				{ to: '/security-alerts', label: t('nav.securityAlerts') },
			],
		},
	];

	const mobileLinks = [
		{ to: '/', label: t('nav.overview'), end: true },
		...navGroups.flatMap((group) => group.items.map((item) => ({ ...item, end: true }))),
	];

	useEffect(() => {
		const onScroll = () => setShowScrollTop(window.scrollY > 400);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	return (
		<div className="flex min-h-screen flex-col">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
			>
				{t('a11y.skipToContent')}
			</a>
			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-surface/80">
				<div className="mx-auto flex h-[var(--layout-header-height)] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Link to="/" className="flex items-center gap-2">
						{/* 这里此前是 <Shield /> —— lucide 的**安全**图标被当成了品牌标。
						    图标表达概念，品牌标表达身份；两者不能互换。 */}
						<img src="/logo-mark.svg" alt="" className="h-8 w-8" />
						<span className="text-lg font-bold text-[var(--color-text-primary)]">Autional</span>
						<span className="hidden text-sm text-[var(--color-text-muted)] sm:inline">
							{t('layout.trustCenter')}
						</span>
					</Link>

					{/* Desktop Nav */}
					<nav className="hidden items-center gap-1 lg:flex">
						<NavLink
							to="/"
							end
							className={({ isActive }) =>
								`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
									isActive
										? 'bg-primary-50 text-primary-700 dark:bg-white/10 dark:text-sky-300'
										: 'text-[var(--color-text-muted)] hover:bg-neutral-50 hover:text-[var(--color-text-primary)] dark:hover:bg-elevated'
								}`
							}
						>
							{t('nav.overview')}
						</NavLink>
						{navGroups.map((group) => (
							<NavGroupMenu
								key={group.base}
								label={group.label}
								base={group.base}
								items={group.items}
							/>
						))}
					</nav>

					{/* Desktop Controls */}
					<div className="hidden items-center gap-2 lg:flex">
						<LanguageSwitcher
							className="inline-flex h-11 items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-surface dark:hover:bg-elevated"
							showIcon
						/>
						<ThemeToggle
							className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
							labelLight={t('layout.themeToLight')}
							labelDark={t('layout.themeToDark')}
						/>
					</div>

					{/* Mobile menu button */}
					<div className="flex items-center gap-2 lg:hidden">
						<LanguageSwitcher
							className="inline-flex h-11 items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-surface dark:hover:bg-elevated"
							showIcon
						/>
						<ThemeToggle
							className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
							labelLight={t('layout.themeToLight')}
							labelDark={t('layout.themeToDark')}
						/>
						<button
							className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-text-muted)]"
							onClick={() => setMobileOpen(!mobileOpen)}
							aria-label={t('layout.toggleMenu')}
						>
							{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
						</button>
					</div>
				</div>

				{/* Mobile Nav */}
				{mobileOpen && (
					<div className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-surface lg:hidden">
						<div className="space-y-1 px-4 py-3">
							{mobileLinks.map((link) => (
								<NavLink
									key={link.to}
									to={link.to}
									end={link.end}
									className={({ isActive }) =>
										`block rounded-md px-3 py-2 text-base font-medium ${
											isActive
												? 'bg-primary-50 text-primary-700 dark:bg-white/10 dark:text-sky-300'
												: 'text-[var(--color-text-muted)] hover:bg-neutral-50 dark:hover:bg-elevated'
										}`
									}
								>
									{link.label}
								</NavLink>
							))}
						</div>
					</div>
				)}
			</header>

			{/* Main Content */}
			<main id="main-content" className="flex-1">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-surface">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
						<div className="col-span-2 md:col-span-1">
							<Link to="/" className="flex items-center gap-2">
								<Shield className="h-5 w-5 text-primary-600 dark:text-sky-300" />
								<span className="text-base font-bold text-[var(--color-text-primary)]">
									{t('layout.trustCenter')}
								</span>
							</Link>
							<p className="mt-2 text-sm text-[var(--color-text-muted)]">
								{t('layout.description')}
							</p>
						</div>
						{navGroups.map((group) => (
							<div key={group.base}>
								<h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
									{group.label}
								</h3>
								<ul className="mt-3 space-y-2">
									{group.items.map((item) => (
										<li key={item.to}>
											<Link
												to={item.to}
												className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
											>
												{item.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
						<div>
							<h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
								{t('layout.brand')}
							</h3>
							<ul className="mt-3 space-y-2">
								<li>
									<a
										href={LANDING_SITE_URL()}
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('layout.officialSite')}
									</a>
								</li>
								<li>
									<a
										href={STATUS_PAGE_URL()}
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('layout.systemStatus')}
									</a>
								</li>
								<li>
									<a
										href={DEVELOPER_PORTAL_URL()}
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('layout.developerDocs')}
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="mt-8 border-t border-neutral-200 pt-8 text-center text-sm text-[var(--color-text-muted)] dark:border-neutral-800">
						© {new Date().getFullYear()} Autional.
					</div>
				</div>
			</footer>

			{/* Scroll to top */}
			{showScrollTop && (
				<button
					onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
					className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white shadow-brand transition-transform hover:scale-105 dark:bg-primary-700"
					aria-label={t('layout.backToTop')}
				>
					<ChevronUp className="h-5 w-5" />
				</button>
			)}
		</div>
	);
}
