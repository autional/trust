import { describe, it, expect } from 'vitest';
import { buildComplianceStatusView } from '../assessment-view';

describe('buildComplianceStatusView', () => {
	it('returns an empty not_assessed view when no status is loaded', () => {
		expect(buildComplianceStatusView(null)).toEqual({
			frameworks: [],
			overallStatus: 'not_assessed',
			coverage: null,
		});
	});

	it('maps framework_assessments to four-state views with coverage', () => {
		const view = buildComplianceStatusView({
			overallStatus: 'not_assessed',
			evaluationError: false,
			frameworkAssessments: [
				{
					framework: 'iso27001',
					standardId: 'iso27001_2022',
					displayName: 'ISO/IEC 27001:2022',
					status: 'not_assessed',
					controlsTotal: 10,
					controlsAssessed: 7,
					controlsUnknown: 3,
				},
				{
					framework: 'sox',
					standardId: 'sox_itgc',
					displayName: 'SOX ITGC',
					status: 'non_compliant',
					controlsTotal: 10,
					controlsAssessed: 4,
					controlsUnknown: 6,
				},
			],
			assessmentCoverage: { assessed: 11, total: 20, percent: 55 },
		});

		expect(view.frameworks).toEqual([
			{
				key: 'iso27001',
				label: 'ISO/IEC 27001:2022',
				status: 'not_assessed',
				coverage: { assessed: 7, total: 10 },
			},
			{
				key: 'sox',
				label: 'SOX ITGC',
				status: 'non_compliant',
				coverage: { assessed: 4, total: 10 },
			},
		]);
		// 任一框架 non_compliant ⇒ 总览 non_compliant（最差优先）
		expect(view.overallStatus).toBe('non_compliant');
		expect(view.coverage).toEqual({ assessed: 11, total: 20, percent: 55 });
	});

	it('falls back to legacy flags where false never means non_compliant', () => {
		const view = buildComplianceStatusView({
			frameworksEnabled: ['gdpr', 'iso27001_2022', 'sox'],
			gdprCompliant: true,
			iso27001Compliant: false,
			soxCompliant: false,
			overallStatus: 'compliant',
		});

		expect(view.frameworks).toEqual([
			{ key: 'gdpr', label: 'GDPR', status: 'compliant' },
			{ key: 'iso27001_2022', label: 'ISO 27001', status: 'not_assessed' },
			{ key: 'sox', label: 'SOX', status: 'not_assessed' },
		]);
		// 旧字段 false ⇒ 未评估；但由于后端 overall_status 仍是 compliant，这里聚合为 not_assessed
		expect(view.overallStatus).toBe('not_assessed');
		expect(view.coverage).toBeNull();
	});

	it('treats evaluation_error flag as a signal even without framework rows', () => {
		const view = buildComplianceStatusView({
			frameworksEnabled: [],
			overallStatus: 'compliant',
			evaluationError: true,
		});
		expect(view.frameworks).toEqual([]);
		expect(view.overallStatus).toBe('evaluation_error');
	});

	it('deduplicates frameworks that share a display label', () => {
		const view = buildComplianceStatusView({
			frameworkAssessments: [
				{ standardId: 'iso27001_2022', displayName: 'ISO 27001', status: 'compliant' },
				{ standardId: 'iso27001_2013', displayName: 'ISO 27001', status: 'non_compliant' },
			],
		});
		expect(view.frameworks).toHaveLength(1);
		expect(view.frameworks[0].status).toBe('compliant');
	});
});
