import { useQuery } from '@tanstack/react-query';
import {
	getPenTestReports,
	getAuditFindings,
	getBreachNotifications,
	getAuditLogs,
	getAuditPublicStats,
	getAuditPublicHashchain,
	getAuditPublicLogsSummary,
	getStorageEncryptionStatus,
	getPublicCertifications,
} from '@/lib/api.generated';
import {
	compliancePublicStatus,
	compliancePublicSecurityScore,
	adminAuditStats,
} from '@autional/shared/generated/api';

export function useComplianceStatus() {
	return useQuery({
		queryKey: ['compliance', 'status'],
		queryFn: compliancePublicStatus,
	});
}

export function useSecurityScore() {
	return useQuery({
		queryKey: ['compliance', 'security-score'],
		queryFn: compliancePublicSecurityScore,
	});
}

export function usePenTestReports(page = 1, pageSize = 20) {
	return useQuery({
		queryKey: ['compliance', 'pen-test-reports', page, pageSize],
		queryFn: () => getPenTestReports({ page, page_size: pageSize }),
	});
}

export function useAuditFindings(severity?: string, status?: string, page = 1, pageSize = 20) {
	return useQuery({
		queryKey: ['compliance', 'audit-findings', severity, status, page, pageSize],
		queryFn: () => getAuditFindings({ severity, page, pageSize } as any),
	});
}

export function useBreachNotifications(page = 1, pageSize = 20) {
	return useQuery({
		queryKey: ['compliance', 'breach-notifications', page, pageSize],
		queryFn: () => getBreachNotifications({ page, page_size: pageSize }),
	});
}

export function useAuditStats() {
	return useQuery({
		queryKey: ['audit', 'stats'],
		queryFn: adminAuditStats,
	});
}

export function useAuditLogs(page = 1, pageSize = 10) {
	return useQuery({
		queryKey: ['audit', 'logs', page, pageSize],
		queryFn: () => getAuditLogs({ page, page_size: pageSize }),
	});
}

export function usePublicAuditStats() {
	return useQuery({
		queryKey: ['public-audit-stats'],
		queryFn: () => getAuditPublicStats(),
		staleTime: 120 * 1000,
	});
}

export function usePublicHashChain() {
	return useQuery({
		queryKey: ['public-hashchain'],
		queryFn: () => getAuditPublicHashchain(),
		staleTime: 30 * 1000,
	});
}

export function usePublicLogsSummary() {
	return useQuery({
		queryKey: ['public-logs-summary'],
		queryFn: () => getAuditPublicLogsSummary(),
		staleTime: 120 * 1000,
	});
}

export function useStorageEncryptionStatus() {
	return useQuery({
		queryKey: ['storage', 'encryption-status'],
		queryFn: () => getStorageEncryptionStatus(),
		staleTime: 300_000,
	});
}

export function usePublicCertifications(framework?: string) {
	return useQuery({
		queryKey: ['compliance', 'public-certifications', framework],
		queryFn: () => getPublicCertifications({ framework, page_size: 50 }),
		staleTime: 300_000,
	});
}
