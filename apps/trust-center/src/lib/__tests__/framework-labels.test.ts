import { describe, it, expect } from 'vitest';
import { FRAMEWORK_LABELS, frameworkLabel } from '../framework-labels';

describe('framework labels', () => {
	it('maps gate keys and standards IDs to public names', () => {
		expect(frameworkLabel('gdpr')).toBe('GDPR');
		expect(frameworkLabel('iso27001')).toBe('ISO 27001');
		expect(frameworkLabel('iso27001_2022')).toBe('ISO 27001');
		expect(frameworkLabel('soc2_cc6')).toBe('SOC 2');
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
