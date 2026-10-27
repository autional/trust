import {
	frameworkLabel,
	normalizeAssessmentStatus,
	worstAssessmentStatus,
	type AssessmentStatus,
} from './framework-labels';

/**
 * 公开合规状态响应的**结构子集**（视图模型）：只声明本页实际读取的字段。
 * 契约源 = service-compliance swagger（PublicComplianceStatusResponse /
 * FrameworkAssessmentPublic / AssessmentCoveragePublic）。站点按已发布
 * @autional/shared 的 rc 版本编译，故视图模型由站点持有；字段与契约逐字对齐。
 */
export interface PublicComplianceStatusSnapshot {
	overallStatus?: string;
	evaluationError?: boolean;
	lastAuditDate?: string;
	nextAuditDate?: string;
	openIssuesRange?: string;
	frameworksEnabled?: string[];
	gdprCompliant?: boolean;
	iso27001Compliant?: boolean;
	soxCompliant?: boolean;
	frameworkAssessments?: FrameworkAssessmentSnapshot[];
	assessmentCoverage?: AssessmentCoverageSnapshot;
	assessmentVersion?: string;
}

export interface FrameworkAssessmentSnapshot {
	framework?: string;
	standardId?: string;
	displayName?: string;
	status?: string;
	controlsTotal?: number;
	controlsAssessed?: number;
	controlsUnknown?: number;
}

export interface AssessmentCoverageSnapshot {
	assessed?: number;
	total?: number;
	percent?: number;
}

/** 公开安全评分响应的结构子集（同上）。 */
export interface PublicSecurityScoreSnapshot {
	overallScore?: number;
	maxScore?: number;
	grade?: string;
	calculatedAt?: string;
	scoreAvailable?: boolean;
	dimensions?: { name?: string; score?: number; weight?: number }[];
	assessmentCoverage?: AssessmentCoverageSnapshot;
}

/**
 * 公开合规状态的展示视图（总览页与合规页共用，避免两页各自推导导致口径漂移）。
 *
 * 数据来源优先级：
 *  1. frameworkAssessments（四态 + 覆盖度）—— 后端 assessment-v2 响应；
 *  2. 旧字段回退（frameworks_enabled + *_compliant）—— 仅旧缓存响应过渡。
 *     旧布尔 false 只表示"未评估"，不得映射为 non_compliant。
 */
export interface FrameworkStatusView {
	key: string;
	label: string;
	status: AssessmentStatus;
	coverage?: { assessed: number; total: number };
}

export interface AssessmentCoverageView {
	assessed: number;
	total: number;
	percent: number;
}

export interface ComplianceStatusView {
	frameworks: FrameworkStatusView[];
	overallStatus: AssessmentStatus;
	coverage: AssessmentCoverageView | null;
}

const LEGACY_FLAG_BY_KEY: Record<string, keyof PublicComplianceStatusSnapshot> = {
	gdpr: 'gdprCompliant',
	iso27001: 'iso27001Compliant',
	iso27001_2022: 'iso27001Compliant',
	sox: 'soxCompliant',
};

function frameworksFromAssessments(
	status: PublicComplianceStatusSnapshot,
): FrameworkStatusView[] {
	const seen = new Set<string>();
	const views: FrameworkStatusView[] = [];
	for (const assessment of status.frameworkAssessments ?? []) {
		const key = assessment.framework || assessment.standardId || '';
		const label = assessment.displayName || frameworkLabel(key);
		if (seen.has(label)) continue;
		seen.add(label);
		const total = assessment.controlsTotal ?? 0;
		views.push({
			key,
			label,
			status: normalizeAssessmentStatus(assessment.status),
			coverage: total > 0 ? { assessed: assessment.controlsAssessed ?? 0, total } : undefined,
		});
	}
	return views;
}

function frameworksFromLegacyFlags(status: PublicComplianceStatusSnapshot): FrameworkStatusView[] {
	const seen = new Set<string>();
	const views: FrameworkStatusView[] = [];
	for (const key of status.frameworksEnabled ?? []) {
		const label = frameworkLabel(key);
		if (seen.has(label)) continue;
		seen.add(label);
		const flagKey = LEGACY_FLAG_BY_KEY[key];
		const compliant = flagKey ? status[flagKey] === true : false;
		views.push({ key, label, status: compliant ? 'compliant' : 'not_assessed' });
	}
	return views;
}

export function buildComplianceStatusView(
	status?: PublicComplianceStatusSnapshot | null,
): ComplianceStatusView {
	if (!status) {
		return { frameworks: [], overallStatus: 'not_assessed', coverage: null };
	}
	const frameworks =
		(status.frameworkAssessments?.length ?? 0) > 0
			? frameworksFromAssessments(status)
			: frameworksFromLegacyFlags(status);

	// 总览 = 最差状态（与后端 worstState 同序）；evaluation_error 布尔作为额外降级信号。
	const overallStatus = worstAssessmentStatus([
		...(status.evaluationError ? ['evaluation_error'] : []),
		status.overallStatus,
		...frameworks.map((framework) => framework.status),
	]);

	const raw = status.assessmentCoverage;
	const coverage =
		raw && (raw.total ?? 0) > 0
			? {
					assessed: raw.assessed ?? 0,
					total: raw.total ?? 0,
					percent: raw.percent ?? 0,
				}
			: null;

	return { frameworks, overallStatus, coverage };
}
