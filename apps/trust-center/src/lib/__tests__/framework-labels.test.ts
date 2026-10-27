import { describe, it, expect } from 'vitest';
import {
	FRAMEWORK_LABELS,
	frameworkLabel,
	normalizeAssessmentStatus,
	worstAssessmentStatus,
} from '../framework-labels';

describe('framework labels', () => {
	it('maps gate keys and standards IDs to public names', () => {
		expect(frameworkLabel('gdpr')).toBe('GDPR');
		expect(frameworkLabel('iso27001')).toBe('ISO 27001');
		expect(frameworkLabel('iso27001_2022')).toBe('ISO 27001');
		expect(frameworkLabel('soc2_cc6')).toBe('SOC 2');
		expect(frameworkLabel('sox_itgc')).toBe('SOX ITGC');
		expect(frameworkLabel('pcidss')).toBe('PCI DSS');
		expect(frameworkLabel('dengbao_l3')).toBe('MLPS 2.0');
	});

	it('falls back to the raw key for unknown values', () => {
		expect(frameworkLabel('unknown_fw')).toBe('unknown_fw');
	});

	it('never maps a key to an empty label', () => {
		for (const [key, label] of Object.entries(FRAMEWORK_LABELS)) {
			expect(label, key).not.toBe('');
		}
	});
});

describe('assessment status vocabulary', () => {
	it('keeps the four backend states and downgrades unknown values to not_assessed', () => {
		expect(normalizeAssessmentStatus('compliant')).toBe('compliant');
		expect(normalizeAssessmentStatus('non_compliant')).toBe('non_compliant');
		expect(normalizeAssessmentStatus('not_assessed')).toBe('not_assessed');
		expect(normalizeAssessmentStatus('evaluation_error')).toBe('evaluation_error');
		// 未知值 / 空值不得臆断为通过或失败
		expect(normalizeAssessmentStatus('合规')).toBe('not_assessed');
		expect(normalizeAssessmentStatus(undefined)).toBe('not_assessed');
	});

	it('aggregates by worst state (non_compliant > evaluation_error > not_assessed > compliant)', () => {
		expect(worstAssessmentStatus(['compliant', 'not_assessed'])).toBe('not_assessed');
		expect(worstAssessmentStatus(['not_assessed', 'evaluation_error'])).toBe('evaluation_error');
		expect(worstAssessmentStatus(['evaluation_error', 'non_compliant'])).toBe('non_compliant');
		expect(worstAssessmentStatus(['compliant', 'compliant'])).toBe('compliant');
		// nullish 是"无信号"，不能把全绿结果拖成 not_assessed
		expect(worstAssessmentStatus(['compliant', undefined, null])).toBe('compliant');
		expect(worstAssessmentStatus([])).toBe('not_assessed');
	});
});
