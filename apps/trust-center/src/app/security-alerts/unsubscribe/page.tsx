import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { usePageTitle, usePageMeta } from '@autional/shared';
import { notificationsPublicSecurityUnsubscribePost } from '@autional/shared/generated/api';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowLeft, Bell } from 'lucide-react';

type UnsubscribeState = 'idle' | 'submitting' | 'success' | 'fail' | 'noToken';

/**
 * 安全公告退订页（U349）。
 *
 * 公告邮件每封携带该订户自己的退订链接（email+token）。本页**不自动退订**：
 * 落地只展示身份与按钮，用户点击后才调用 security-unsubscribe ——
 * 链接扫描器/邮件客户端预取一个 GET 页面不会误触退订。
 */
export default function SecurityAlertsUnsubscribePage() {
	const { t } = useTranslation();
	usePageTitle(t('securityAlerts.unsubscribe.title'));
	usePageMeta(t('securityAlerts.unsubscribe.meta'));

	const [searchParams] = useSearchParams();
	const email = searchParams.get('email') ?? '';
	const token = searchParams.get('token') ?? '';
	const [state, setState] = useState<UnsubscribeState>(email && token ? 'idle' : 'noToken');

	const handleUnsubscribe = async () => {
		if (!email || !token || state === 'submitting') return;
		setState('submitting');
		try {
			await notificationsPublicSecurityUnsubscribePost({ email, token });
			setState('success');
		} catch (err) {
			if (import.meta.env.DEV) {
				console.error('[SecurityAlertsUnsubscribe] unsubscribe failed:', err);
			}
			setState('fail');
		}
	};

	const failed = state === 'fail' || state === 'noToken';

	return (
		<div className="px-4 py-16 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-xl text-center">
				{state === 'idle' && (
					<>
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
							<Mail className="h-8 w-8 text-amber-600 dark:text-amber-400" />
						</div>
						<h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
							{t('securityAlerts.unsubscribe.title')}
						</h1>
						<p className="mt-3 text-neutral-600 dark:text-[var(--color-text-muted)]">
							{t('securityAlerts.unsubscribe.desc')}
						</p>
						<p className="mt-2 break-all text-sm font-medium text-neutral-900 dark:text-white">
							{email}
						</p>
						<button
							type="button"
							onClick={handleUnsubscribe}
							className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
						>
							<XCircle className="h-4 w-4" />
							{t('securityAlerts.unsubscribe.confirmButton')}
						</button>
					</>
				)}

				{state === 'submitting' && (
					<>
						<Loader2 className="mx-auto h-10 w-10 animate-spin text-primary-600" />
						<h1 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white">
							{t('securityAlerts.unsubscribe.submitting')}
						</h1>
					</>
				)}

				{state === 'success' && (
					<>
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft/30">
							<CheckCircle2 className="h-8 w-8 text-success-text" />
						</div>
						<h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
							{t('securityAlerts.unsubscribe.successTitle')}
						</h1>
						<p className="mt-3 text-neutral-600 dark:text-[var(--color-text-muted)]">
							{t('securityAlerts.unsubscribe.successDesc')}
						</p>
					</>
				)}

				{failed && (
					<>
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft/30">
							<XCircle className="h-8 w-8 text-danger-text" />
						</div>
						<h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
							{t('securityAlerts.unsubscribe.failTitle')}
						</h1>
						<p className="mt-3 text-neutral-600 dark:text-[var(--color-text-muted)]">
							{state === 'noToken'
								? t('securityAlerts.unsubscribe.noToken')
								: t('securityAlerts.unsubscribe.failDesc')}
						</p>
					</>
				)}

				<div className="mt-8 flex flex-col items-center gap-3">
					{failed && (
						<Link
							to="/security-alerts"
							className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
						>
							<Bell className="h-4 w-4" />
							{t('securityAlerts.unsubscribe.backButton')}
						</Link>
					)}
					<Link
						to="/security-alerts"
						className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
					>
						<ArrowLeft className="h-4 w-4" />
						{t('securityAlerts.unsubscribe.back')}
					</Link>
				</div>
			</div>
		</div>
	);
}
