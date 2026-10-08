'use client';

import { usePageTitle, usePageMeta } from '@autional/shared';
import { useStorageEncryptionStatus } from '@/hooks/use-trust-api';
import { useTranslation } from 'react-i18next';
import { PageHeader, SectionCard, LoadingScreen, ErrorState } from '@autional/ui';
import type { PublicEncryptionStatus } from '@autional/shared/generated/types';
import { Shield, Key, Globe, Database } from 'lucide-react';

export default function StorageSecurityPage() {
	const { t, i18n } = useTranslation();

	usePageTitle(t('storageSecurity.title'));
	usePageMeta(
		i18n.language === 'zh-CN'
			? 'Autional 存储安全 — 加密算法、静态/传输加密状态与密钥管理。'
			: 'Autional Storage Security — Encryption algorithms, at-rest/in-transit status and key management.',
	);

	const {
		data: encryptionStatus,
		isLoading: encLoading,
		isError: encError,
		refetch: refetchEnc,
	} = useStorageEncryptionStatus();

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<PageHeader title={t('storageSecurity.title')} subtitle={t('storageSecurity.subtitle')} />

				{/* Encryption Status */}
				<SectionCard title={t('storageSecurity.encryptionStatus')} className="mt-8">
					<p className="mb-6 text-sm text-neutral-500 dark:text-[var(--color-text-muted)]">
						{t('storageSecurity.encryptionDesc')}
					</p>

					{encLoading ? (
						<LoadingScreen />
					) : encError ? (
						<ErrorState onRetry={() => refetchEnc()} />
					) : encryptionStatus ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<EncryptionCard
								icon={Shield}
								label={t('storageSecurity.algorithm')}
								value={encryptionStatus.algorithm || '—'}
								enabled={true}
							/>
							<EncryptionCard
								icon={Database}
								label={t('storageSecurity.atRest')}
								value={encryptionStatus.encryptionAtRest ? t('storageSecurity.enabled') : '—'}
								enabled={!!encryptionStatus.encryptionAtRest}
							/>
							<EncryptionCard
								icon={Globe}
								label={t('storageSecurity.inTransit')}
								value={encryptionStatus.encryptionInTransit ? t('storageSecurity.enabled') : '—'}
								enabled={!!encryptionStatus.encryptionInTransit}
							/>
							<EncryptionCard
								icon={Key}
								label={t('storageSecurity.keyManagement')}
								value={encryptionStatus.keyManagement || '—'}
								enabled={true}
							/>
						</div>
					) : null}
				</SectionCard>
			</div>
		</div>
	);
}

function EncryptionCard({
	icon: Icon,
	label,
	value,
	enabled,
}: {
	icon: React.FC<{ className?: string }>;
	label: string;
	value: string;
	enabled: boolean;
}) {
	return (
		<div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-surface">
			<div className="flex items-center gap-3">
				<div
					className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
						enabled ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-neutral-100 dark:bg-elevated'
					}`}
				>
					<Icon
						className={`h-5 w-5 ${
							enabled ? 'text-primary-600' : 'text-[var(--color-text-muted)] dark:text-neutral-500'
						}`}
					/>
				</div>
				<div className="min-w-0">
					<div className="text-xs text-[var(--color-text-muted)] dark:text-neutral-500">{label}</div>
					<div className="mt-0.5 truncate text-sm font-semibold text-neutral-900 dark:text-white">
						{value}
					</div>
				</div>
			</div>
		</div>
	);
}
