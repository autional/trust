import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSEO } from '@autional/shared';
import { notificationsPublicSecuritySubscribePost } from '@autional/shared/generated/api';
import { useTranslation } from 'react-i18next';
import { Bell, Mail, CheckCircle2, AlertTriangle, ArrowRight, Shield, Loader2 } from 'lucide-react';

const subscribeSchema = z.object({
	email: z
		.string()
		.min(1, { message: 'securityAlerts.validateEmail' })
		.email({ message: 'securityAlerts.validateEmailInvalid' }),
	company: z.string().optional(),
	topics: z.array(z.string()).min(1, { message: 'securityAlerts.validateTopics' }),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

const TOPIC_KEYS = [
	'breach_notification',
	'vulnerability_alert',
	'security_update',
	'compliance_update',
	'incident_report',
] as const;

export default function SecurityAlertsPage() {
	const { t, i18n } = useTranslation();

	useSEO(
		{
			title: t('securityAlerts.title'),
			description: i18n.language?.startsWith('zh')
				? '订阅 Autional 安全告警，获取数据泄露通知、漏洞预警和安全更新。'
				: 'Subscribe to Autional security alerts for data breach notifications, vulnerability warnings, and security updates.',
		},
		{ siteName: 'Autional Trust Center' },
	);

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<SubscribeFormData>({
		resolver: zodResolver(subscribeSchema),
		defaultValues: { email: '', company: '', topics: [] },
	});

	const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');

	const onSubmit = async (data: SubscribeFormData) => {
		setSubmitState('idle');
		setMessage('');
		try {
			const res = await notificationsPublicSecuritySubscribePost({
				email: data.email.trim(),
				company: data.company?.trim() || undefined,
				topics: data.topics,
			} as any);
			setSubmitState('success');
			setMessage(
				(res as any)?.data?.message || (res as any)?.message || t('securityAlerts.successMessage'),
			);
		} catch (err) {
			if (import.meta.env.DEV) {
				console.error('[SecurityAlerts] Subscribe failed:', err);
			}
			setSubmitState('error');
			setMessage(t('securityAlerts.networkError'));
		}
	};

	const resetForm = () => {
		reset();
		setSubmitState('idle');
		setMessage('');
	};

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-3xl">
				<div className="text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
						<Bell className="h-4 w-4" />
						{t('securityAlerts.badge')}
					</div>
					<h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
						{t('securityAlerts.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-lg text-neutral-600 dark:text-neutral-300">
						{t('securityAlerts.subtitle')}
					</p>
				</div>

				{submitState === 'success' ? (
					<div className="mt-10 rounded-2xl border border-success-soft bg-success-soft p-8 text-center dark:border-success-soft dark:bg-success-soft/20">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft/30">
							<CheckCircle2 className="h-7 w-7 text-success-text" />
						</div>
						<h2 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
							{t('securityAlerts.success')}
						</h2>
						<p className="mt-2 text-neutral-600 dark:text-[var(--color-text-muted)]">{message}</p>
						<button
							onClick={resetForm}
							className="mt-6 inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-surface dark:text-neutral-300 dark:hover:bg-elevated"
						>
							{t('securityAlerts.subscribeMore')}
							<ArrowRight className="h-4 w-4" />
						</button>
					</div>
				) : (
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-surface sm:p-8"
					>
						<div className="space-y-5">
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-neutral-900 dark:text-white"
								>
									{t('securityAlerts.emailLabel')} <span className="text-danger">*</span>
								</label>
								<div className="relative mt-1.5">
									<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
									<input
										id="email"
										type="email"
										{...register('email')}
										placeholder="your@email.com"
										className={`w-full rounded-md border py-2.5 pl-10 pr-3 text-sm bg-white dark:bg-surface dark:text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-danger-soft focus:ring-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
									/>
								</div>
								{errors.email && (
									<p className="mt-1 text-xs text-danger-text">
										{t(errors.email.message || 'securityAlerts.validateEmail')}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="company"
									className="block text-sm font-medium text-neutral-900 dark:text-white"
								>
									{t('securityAlerts.companyLabel')}{' '}
									<span className="text-[var(--color-text-muted)] text-xs font-normal">
										{t('securityAlerts.companyOptional')}
									</span>
								</label>
								<input
									id="company"
									type="text"
									{...register('company')}
									placeholder="示例公司"
									className="mt-1.5 w-full rounded-md border border-neutral-300 py-2.5 px-3 text-sm bg-white dark:bg-surface dark:text-white dark:border-neutral-700 placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-neutral-900 dark:text-white mb-3">
									{t('securityAlerts.topicLabel')} <span className="text-danger">*</span>
								</label>
								<Controller
									name="topics"
									control={control}
									render={({ field }) => (
										<div className="grid gap-3 sm:grid-cols-2">
											{TOPIC_KEYS.map((key) => {
												const topic = {
													label: t(`securityAlerts.topics.${key}.label`),
													desc: t(`securityAlerts.topics.${key}.desc`),
												};
												const checked = field.value.includes(key);
												return (
													<label
														key={key}
														className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
															checked
																? 'border-primary-400 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
																: 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-surface dark:hover:border-neutral-700'
														}`}
													>
														<input
															type="checkbox"
															checked={checked}
															onChange={() => {
																const next = checked
																	? field.value.filter((t: string) => t !== key)
																	: [...field.value, key];
																field.onChange(next);
															}}
															className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
														/>
														<div>
															<span className="text-sm font-medium text-neutral-900 dark:text-white">
																{topic.label}
															</span>
															<p className="mt-0.5 text-xs text-neutral-500 dark:text-[var(--color-text-muted)]">
																{topic.desc}
															</p>
														</div>
													</label>
												);
											})}
										</div>
									)}
								/>
								{errors.topics && (
									<p className="mt-1 text-xs text-danger-text">
										{t(errors.topics.message || 'securityAlerts.validateTopics')}
									</p>
								)}
							</div>

							{submitState === 'error' && (
								<div className="flex items-start gap-2 rounded-lg border border-danger-soft bg-danger-soft p-3 text-sm text-danger-text dark:border-danger-soft dark:bg-danger-soft/20 dark:text-danger-text">
									<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
									<span>{message}</span>
								</div>
							)}

							<button
								type="submit"
								disabled={isSubmitting}
								className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										{t('securityAlerts.submitting')}
									</>
								) : (
									<>
										<Bell className="h-4 w-4" />
										{t('securityAlerts.submit')}
									</>
								)}
							</button>

							<p className="text-center text-xs text-[var(--color-text-muted)] dark:text-neutral-500">
								{t('securityAlerts.privacyFooter')}
							</p>
						</div>
					</form>
				)}

				<div className="mt-16 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-surface/50">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/20">
							<Shield className="h-5 w-5" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
								{t('securityAlerts.privacyTitle')}
							</h3>
							<p className="mt-1 text-sm text-neutral-600 dark:text-[var(--color-text-muted)]">
								{t('securityAlerts.privacyText')}{' '}
								<a href="/privacy" className="text-primary-600 underline hover:text-primary-700">
									{t('securityAlerts.privacyLink')}
								</a>
								{t('securityAlerts.privacyText2')}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
