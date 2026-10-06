import { ErrorBoundary as SharedErrorBoundary } from '@autional/ui';
import { type ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

export function ErrorBoundary({ children }: Props) {
	return (
		<SharedErrorBoundary
			title="出错了"
			message="发生了意外错误，请刷新页面重试。"
			retryLabel="重新加载"
			devMode={import.meta.env.DEV}
		>
			{children}
		</SharedErrorBoundary>
	);
}
