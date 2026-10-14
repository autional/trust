import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ROUTER_BASENAME, isRetryableError } from '@autional/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './non-tenant-segments';
import { ThemeProvider, ToastProvider } from '@autional/ui';
import './i18n';
import './index.css';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			// 重试策略唯一实现：只重试「重试可能改变结果」的错误（@autional/shared/utils/query-state
			// 的 isRetryableError：无状态码 / 5xx / 408 / 429）；4xx（含 404/401/403）一律不重试。
			retry: (failureCount, error) => isRetryableError(error) && failureCount < 1,
			refetchOnWindowFocus: false,
		},
	},
});

const root = document.getElementById('root');
if (root) {
	createRoot(root).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider storageKey="autional-trust-theme">
					<ToastProvider>
						<BrowserRouter basename={ROUTER_BASENAME}>
							<App />
						</BrowserRouter>
					</ToastProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}
