import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, X, Shield, ChevronUp } from 'lucide-react';
import { LANDING_SITE_URL, STATUS_PAGE_URL, DEVELOPER_PORTAL_URL } from '@autional/shared';
import { ThemeToggle, LanguageSwitcher } from '@autional/ui';

export default function TrustLayout() {
	const { t } = useTranslation();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const location = useLocation();

	const navLinks = [
		{ to: '/', label: t('nav.overview'), end: true },
		{ to: '/compliance', label: t('nav.compliance') },
		{ to: '/security', label: t('nav.security') },
		{ to: '/security-alerts', label: t('nav.securityAlerts') },
		{ to: '/data-residency', label: t('nav.dataResidency') },
		{ to: '/audit-reports', label: t('nav.auditReports') },
		{ to: '/incidents', label: t('nav.incidents') },
		{ to: '/privacy', label: t('nav.privacy') },
		{ to: '/subprocessors', label: t('nav.subprocessors') },
		{ to: '/vulnerability-disclosure', label: t('nav.vulnerabilityDisclosure') },
		{ to: '/storage-security', label: t('nav.storageSecurity') },
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
					<nav className="hidden items-center gap-1 md:flex">
						{navLinks.map((link) => (
							<NavLink
								key={link.to}
								to={link.to}
								end={link.end}
								className={({ isActive }) =>
									`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
										isActive
											? 'bg-primary-50 text-primary-700 dark:bg-white/10 dark:text-sky-300'
											: 'text-[var(--color-text-muted)] hover:bg-neutral-50 hover:text-[var(--color-text-primary)] dark:hover:bg-elevated'
									}`
								}
							>
								{link.label}
							</NavLink>
						))}
					</nav>

					{/* Desktop Controls */}
					<div className="hidden items-center gap-2 md:flex">
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
					<div className="flex items-center gap-2 md:hidden">
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
					<div className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-surface md:hidden">
						<div className="space-y-1 px-4 py-3">
							{navLinks.map((link) => (
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
					<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
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
						<div>
							<h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
								{t('layout.security')}
							</h3>
							<ul className="mt-3 space-y-2">
								<li>
									<Link
										to="/security"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.security')}
									</Link>
								</li>
								<li>
									<Link
										to="/compliance"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.compliance')}
									</Link>
								</li>
								<li>
									<Link
										to="/incidents"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.incidents')}
									</Link>
								</li>
								<li>
									<Link
										to="/vulnerability-disclosure"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.vulnerabilityDisclosure')}
									</Link>
								</li>
								<li>
									<Link
										to="/storage-security"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.storageSecurity')}
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
								{t('layout.compliance')}
							</h3>
							<ul className="mt-3 space-y-2">
								<li>
									<Link
										to="/audit-reports"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.auditReports')}
									</Link>
								</li>
								<li>
									<Link
										to="/data-residency"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.dataResidency')}
									</Link>
								</li>
								<li>
									<Link
										to="/privacy"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.privacy')}
									</Link>
								</li>
								<li>
									<Link
										to="/subprocessors"
										className="text-sm text-[var(--color-text-muted)] hover:text-primary-600 dark:hover:text-primary-400"
									>
										{t('nav.subprocessors')}
									</Link>
								</li>
							</ul>
						</div>
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
