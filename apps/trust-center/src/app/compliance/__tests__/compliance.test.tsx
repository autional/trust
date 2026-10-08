import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import CompliancePage from '../page';

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return { ...actual, Link: ({ to, children }: any) => <a href={to}>{children}</a> };
});

vi.mock('react-i18next', () => {
	const certMap: Record<string, Record<string, unknown>> = {
		iso27001: { name: 'ISO 27001', status: '未认证', scope: 'test scope' },
		soc2: { name: 'SOC 2 Type II', status: '未认证', scope: 'test scope' },
		gdpr: { name: 'GDPR', status: '未认证', scope: 'test scope' },
		djbh: { name: '等保三级', status: '未认证', scope: 'test scope' },
	};
	const zhCN: Record<string, string> = {
		'compliance.title': '合规建设',
		'compliance.subtitle': '这里公开我们对照的主要合规框架、当前状态与建设进展。',
		'compliance.latestFindings': '最新审计发现',
		'compliance.findingsDesc': '来自合规系统的实时审计发现（需登录查看）',
		'compliance.noFindings': '当前无未关闭的高风险审计发现',
		'compliance.noFindingsDesc': '当前没有未关闭的高风险审计发现。',
		'compliance.needReport': '需要了解我们的合规建设进展？',
		'compliance.needReportDesc': '我们尚未取得第三方认证。请联系合规团队。',
		'compliance.applyReport': '联系合规团队',
		'compliance.loadingFindings': '加载审计发现...',
		'compliance.findingsLoadFailed': '审计发现加载失败，请登录后查看完整信息。',
		'common.controlType': '控制类型：',
		'common.controlId': '控制编号：',
		'common.dueDate': '截止日期：',
		'common.status.notCertified': '未认证',
	};
	return {
		useTranslation: () => ({
			t: (key: string, opts?: any) => {
				if (opts?.returnObjects) return key;
				const fieldMatch = key.match(/^compliance\.certifications\.(\w+)\.(\w+)$/);
				if (fieldMatch) {
					const val = certMap[fieldMatch[1]]?.[fieldMatch[2]];
					if (val !== undefined) return String(val);
				}
				return zhCN[key] || key;
			},
			i18n: { language: 'zh-CN' },
		}),
	};
});

vi.mock('@autional/shared', () => ({
	useSEO: vi.fn(),
}));

vi.mock('@/hooks/use-trust-api', () => ({
	useAuditFindings: vi.fn(),
	useComplianceStatus: () => ({
		data: null,
		isLoading: false,
		isError: false,
	}),
	useSecurityScore: () => ({
		data: null,
		isLoading: false,
		isError: false,
	}),
	usePublicCertifications: () => ({
		data: null,
		isLoading: false,
		isError: false,
	}),
}));

vi.mock('@autional/ui', () => ({
	PageHeader: ({ title, subtitle }: any) => (
		<div>
			<h1>{title}</h1>
			<p>{subtitle}</p>
		</div>
	),
	SectionCard: ({ children }: any) => <div>{children}</div>,
	StatusBadge: ({ children }: any) => <span data-testid="status-badge">{children}</span>,
	EmptyState: ({ title, description }: any) => (
		<div data-testid="empty-state">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	),
}));

import { useAuditFindings } from '@/hooks/use-trust-api';

function renderCompliance() {
	return render(
		<MemoryRouter>
			<CompliancePage />
		</MemoryRouter>,
	);
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('CompliancePage', () => {
	it('renders compliance page with certifications', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
		} as any);

		renderCompliance();

		expect(screen.getByText('合规建设')).toBeInTheDocument();
		expect(screen.getByText('ISO 27001')).toBeInTheDocument();
		expect(screen.getByText('SOC 2 Type II')).toBeInTheDocument();
		expect(screen.getByText('GDPR')).toBeInTheDocument();
		expect(screen.getByText('等保三级')).toBeInTheDocument();
		expect(screen.getAllByText('未认证').length).toBeGreaterThan(0);
	});

	it('shows loading state for audit findings', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
		} as any);

		renderCompliance();

		expect(screen.getByText('加载审计发现...')).toBeInTheDocument();
	});

	it('shows audit findings when data loaded', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: {
				items: [
					{
						id: 'FIND-1',
						title: 'Access Control Review Needed',
						severity: 'HIGH',
						status: 'OPEN',
						controlType: 'Access Control',
						controlId: 'AC-1',
						dueDate: '2026-06-01',
					},
					{
						id: 'FIND-2',
						title: 'Encryption Key Rotation',
						severity: 'MEDIUM',
						status: 'IN_PROGRESS',
						controlType: 'Cryptography',
						controlId: 'CR-2',
						dueDate: '2026-05-25',
					},
				],
			},
			isLoading: false,
			isError: false,
		} as any);

		renderCompliance();

		expect(screen.getByText('Access Control Review Needed')).toBeInTheDocument();
		expect(screen.getByText('Encryption Key Rotation')).toBeInTheDocument();
	});

	it('shows empty state when no audit findings', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: { items: [] },
			isLoading: false,
			isError: false,
		} as any);

		renderCompliance();

		expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		expect(screen.getByText('当前无未关闭的高风险审计发现')).toBeInTheDocument();
	});

	it('shows error state when audit findings fail', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
		} as any);

		renderCompliance();

		expect(screen.getByText('审计发现加载失败，请登录后查看完整信息。')).toBeInTheDocument();
	});
});
