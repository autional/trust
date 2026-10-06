import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ROUTER_BASENAME } from '@autional/shared';
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
			retry: (failureCount, error: any) => {
				if (error?.response?.status === 401 || error?.response?.status === 403) return false;
				return failureCount < 2;
			},
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
