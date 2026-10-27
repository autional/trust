/**
 * 合规框架展示名单一真源。
 * 入参可能是门禁键（gdpr/iso27001/sox/…）、标准 ID（iso27001_2022 / sox_itgc）
 * 或认证域内部键（djbh）；统一映射为对外展示名。
 */
export const FRAMEWORK_LABELS: Record<string, string> = {
	gdpr: 'GDPR',
	iso27001: 'ISO 27001',
	iso27001_2022: 'ISO 27001',
	soc2: 'SOC 2',
	soc2_cc6: 'SOC 2',
	sox: 'SOX',
	sox_itgc: 'SOX ITGC',
	pcidss: 'PCI DSS',
	pci_dss_v4: 'PCI DSS',
	hipaa: 'HIPAA',
	psd2: 'PSD2',
	psd2_sca: 'PSD2',
	pipl: 'PIPL',
	dengbao: 'MLPS 2.0',
	dengbao_l3: 'MLPS 2.0',
	djbh: 'MLPS 2.0',
	nist_sp800_63b_v4: 'NIST SP 800-63B',
	minors_protection: 'Minors Protection',
};

export function frameworkLabel(key: string): string {
	return FRAMEWORK_LABELS[key] ?? key;
}

/**
 * 评估状态词表（后端四态，见 compliance-service dto.go）。
 * 未知值一律按 not_assessed 展示：宁可显示"待评估"，不臆断为通过或失败。
 */
export type AssessmentStatus = 'compliant' | 'non_compliant' | 'not_assessed' | 'evaluation_error';

export const ASSESSMENT_STATUSES: readonly AssessmentStatus[] = [
	'compliant',
	'non_compliant',
	'not_assessed',
	'evaluation_error',
];

/** 聚合优先级（数值越大越差）：non_compliant > evaluation_error > not_assessed > compliant。 */
const STATUS_RANK: Record<AssessmentStatus, number> = {
	compliant: 1,
	not_assessed: 2,
	evaluation_error: 3,
	non_compliant: 4,
};

export function normalizeAssessmentStatus(status?: string | null): AssessmentStatus {
	return ASSESSMENT_STATUSES.includes(status as AssessmentStatus)
		? (status as AssessmentStatus)
		: 'not_assessed';
}

/**
 * 多个状态取最差（与后端 worstState 同序）。
 * nullish 表示"无信号"→ 跳过；未知非空值保守归为 not_assessed；空集返回 not_assessed。
 */
export function worstAssessmentStatus(statuses: readonly (string | undefined | null)[]): AssessmentStatus {
	let worst: AssessmentStatus | null = null;
	for (const raw of statuses) {
		if (raw == null || raw === '') continue;
		const status = normalizeAssessmentStatus(raw);
		if (worst === null || STATUS_RANK[status] > STATUS_RANK[worst]) worst = status;
	}
	return worst ?? 'not_assessed';
}

/** 状态 → Tailwind 语义色类（徽标/边框共用，保证两处不漂移）。 */
export const ASSESSMENT_STATUS_TONE: Record<AssessmentStatus, string> = {
	compliant: 'bg-[var(--color-success-soft)] text-[var(--color-success-text)]',
	non_compliant: 'bg-[var(--color-danger-soft)] text-[var(--color-danger-text)]',
	evaluation_error: 'bg-[var(--color-warning-soft)] text-[var(--color-warning-text)]',
	not_assessed: 'bg-neutral-100 text-[var(--color-text-muted)] dark:bg-surface',
};
