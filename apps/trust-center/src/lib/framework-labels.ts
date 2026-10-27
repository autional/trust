/**
 * 合规框架展示名单一真源。
 * 入参可能是门禁键（gdpr/iso27001/sox/…）、历史 standards ID（iso27001_2022）
 * 或认证域内部键（djbh）；统一映射为对外展示名。
 */
export const FRAMEWORK_LABELS: Record<string, string> = {
	gdpr: 'GDPR',
	iso27001: 'ISO 27001',
	iso27001_2022: 'ISO 27001',
	soc2: 'SOC 2',
	soc2_cc6: 'SOC 2',
	sox: 'SOX',
	pcidss: 'PCI DSS',
	pci_dss_v4: 'PCI DSS',
	hipaa: 'HIPAA',
	psd2: 'PSD2',
	psd2_sca: 'PSD2',
	pipl: 'PIPL',
	dengbao: 'MLPS 2.0',
	dengbao_l3: 'MLPS 2.0',
	djbh: 'MLPS 2.0',
};

export function frameworkLabel(key: string): string {
	return FRAMEWORK_LABELS[key] ?? key;
}
