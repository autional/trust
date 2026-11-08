/**
 * 接口契约 schema（唯一真源）。
 *
 * 成功信封（实测于 prod 2026-11-08）：
 *   单对象：{ code:0, message:'success', data:{...}, timestamp }
 *   列表：  { code:0, message:'success', items:[...], total, pagination, timestamp }
 * 错误体（RFC 7807）：{ type, title, status, detail } + 服务侧可选 { code, service, timestamp }
 *
 * 断言分层纪律：
 *   - 契约（信封/字段类型/状态码）**必断言**；
 *   - 数据（条数/内容）**不断言数量**——线上本来就允许空集（4 个合规数据源当前 total=0）。
 */
import { z } from 'zod';

export const successBase = z.object({
	code: z.literal(0),
	message: z.string(),
	timestamp: z.string().min(10),
});

export const dataEnvelope = successBase.extend({
	data: z.record(z.unknown()),
});

export const paginationSchema = z.object({
	total: z.number().int().nonnegative(),
	page: z.number().int(),
	page_size: z.number().int(),
	total_pages: z.number().int(),
	has_next: z.boolean(),
	has_prev: z.boolean(),
});

export const listEnvelope = successBase.extend({
	items: z.array(z.record(z.unknown())),
	total: z.number().int().nonnegative(),
	pagination: paginationSchema,
});

/** RFC 7807 基础错误体 */
export const problem = z.object({
	type: z.string(),
	title: z.string(),
	status: z.number().int(),
	detail: z.string(),
});

/** 统一错误契约：在 RFC 7807 之上必须带 code / service / timestamp（F2 的判据） */
export const unifiedProblem = problem.extend({
	code: z.number().int(),
	service: z.string().min(1),
	timestamp: z.string().min(10),
});

export interface EndpointSpec {
	id: string;
	path: string;
	kind: 'data' | 'list';
	/** data / items[] 必须具备的字段（名称存在性；类型另由断言检查） */
	required: string[];
}

export const ENDPOINTS: EndpointSpec[] = [
	{
		id: 'compliance.status',
		path: '/compliance/api/v1/compliance/public/status',
		kind: 'data',
		required: [
			'overall_status',
			'frameworks_enabled',
			'framework_assessments',
			'assessment_coverage',
		],
	},
	{
		id: 'compliance.security-score',
		path: '/compliance/api/v1/compliance/public/security-score',
		kind: 'data',
		required: ['overall_score', 'max_score', 'grade', 'dimensions', 'score_available'],
	},
	{
		id: 'compliance.certifications',
		path: '/compliance/api/v1/compliance/public/certifications?page_size=3',
		kind: 'list',
		required: [],
	},
	{
		id: 'compliance.subprocessors',
		path: '/compliance/api/v1/compliance/public/subprocessors?page_size=2',
		kind: 'list',
		required: ['entity_name', 'applicable_services', 'purpose', 'category'],
	},
	{
		id: 'compliance.audit-findings',
		path: '/compliance/api/v1/compliance/public/audit-findings?page_size=2',
		kind: 'list',
		required: [],
	},
	{
		id: 'compliance.breach-notifications',
		path: '/compliance/api/v1/compliance/public/breach-notifications?page_size=2',
		kind: 'list',
		required: [],
	},
	{
		id: 'compliance.penetration-test-reports',
		path: '/compliance/api/v1/compliance/public/penetration-test-reports?page_size=2',
		kind: 'list',
		required: [],
	},
	{
		id: 'audit.stats',
		path: '/audit/api/v1/audit/public/stats',
		kind: 'data',
		required: ['total_logs', 'by_module', 'by_level', 'by_status'],
	},
	{
		id: 'audit.hashchain',
		path: '/audit/api/v1/audit/public/hashchain',
		kind: 'data',
		required: ['start_hash', 'end_hash', 'log_count', 'last_validated'],
	},
	{
		id: 'audit.logs-summary',
		path: '/audit/api/v1/audit/public/logs-summary',
		kind: 'data',
		required: ['total_logs', 'last_activity', 'module_count'],
	},
	{
		id: 'storage.encryption-status',
		path: '/storage/api/v1/storage/public/encryption-status',
		kind: 'data',
		required: ['encryption_at_rest', 'encryption_in_transit', 'algorithm', 'key_management'],
	},
	{
		id: 'storage.reports',
		path: '/storage/api/v1/storage/public/reports',
		kind: 'list',
		required: ['id', 'filename', 'size', 'access_level'],
	},
];

/** 订阅/确认/退订端点（写面，单独组织） */
export const NOTIFICATION = {
	subscribe: '/notification/api/v1/notifications/public/security-subscribe',
	confirm: '/notification/api/v1/notifications/public/security-confirm',
	unsubscribe: '/notification/api/v1/notifications/public/security-unsubscribe',
} as const;
