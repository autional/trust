import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { usePageTitle, usePageMeta } from '@autional/shared';
import { notificationsPublicSecurityConfirm } from '@autional/shared/generated/api';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Bell } from 'lucide-react';

type ConfirmState = 'loading' | 'success' | 'fail' | 'noToken';

/**
 * 安全公告订阅确认页（U349）。
 *
 * 确认邮件中的链接指向本页（不再直指 API 裸 JSON）：页面读取 ?email=&token=，
 * 落地即调用 notificationsPublicSecurityConfirm 完成双重确认，再渲染成功/失败版面。
 * 确认是幂等安全的一次性动作；失败常见原因 = 链接过期或已确认过。
 */
export default function SecurityAlertsConfirmPage() {
	const { t } = useTranslation();
	usePageTitle(t('securityAlerts.confirm.title'));
	usePageMeta(t('securityAlerts.confirm.meta'));

	const [searchParams] = useSearchParams();
	const email = searchParams.get('email') ?? '';
	const token = searchParams.get('token') ?? '';
	const [state, setState] = useState<ConfirmState>(email && token ? 'loading' : 'noToken');

	// 只发一次确认请求：StrictMode 下 effect 双跑时第二次请求会因订阅已 active 而失败，
	// 把成功的确认显示成失败（开发环境假阴性）。
	const firedRef = useRef(false);
	useEffect(() => {
		if (firedRef.current || !email || !token) return;
		firedRef.current = true;
		notificationsPublicSecurityConfirm({ email, token })
			.then(() => setState('success'))
			.catch((err) => {
				if (import.meta.env.DEV) {
					console.error('[SecurityAlertsConfirm] confirm failed:', err);
				}
				setState('fail');
			});
	}, [email, token]);

	const failed = state === 'fail' || state === 'noToken';

	return (
		<div className="px-4 py-16 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-xl text-center">
				{state === 'loading' && (
					<>
						<Loader2 className="mx-auto h-10 w-10 animate-spin text-primary-600" />
						<h1 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white">
							{t('securityAlerts.confirm.loading')}
						</h1>
						<p className="mt-2 text-neutral-600 dark:text-[var(--color-text-muted)]">
							{t('securityAlerts.confirm.loadingDesc')}
						</p>
					</>
				)}

				{state === 'success' && (
					<>
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft/30">
							<CheckCircle2 className="h-8 w-8 text-success-text" />
						</div>
						<h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
							{t('securityAlerts.confirm.successTitle')}
						</h1>
						<p className="mt-3 text-neutral-600 dark:text-[var(--color-text-muted)]">
							{t('securityAlerts.confirm.successDesc')}
						</p>
					</>
				)}

				{failed && (
					<>
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft/30">
							<XCircle className="h-8 w-8 text-danger-text" />
						</div>
						<h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
							{t('securityAlerts.confirm.failTitle')}
						</h1>
						<p className="mt-3 text-neutral-600 dark:text-[var(--color-text-muted)]">
							{state === 'noToken'
								? t('securityAlerts.confirm.noToken')
								: t('securityAlerts.confirm.failDesc')}
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
							{t('securityAlerts.confirm.resubscribe')}
						</Link>
					)}
					<Link
						to="/security-alerts"
						className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
					>
						<ArrowLeft className="h-4 w-4" />
						{t('securityAlerts.confirm.back')}
					</Link>
				</div>
			</div>
		</div>
	);
}
