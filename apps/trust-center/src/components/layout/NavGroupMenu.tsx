import { useEffect, useId, useRef, useState } from 'react';
import type React from 'react';
import { NavLink, useLocation } from 'react-router';
import { ChevronDown } from 'lucide-react';

export interface NavGroupItem {
	to: string;
	label: string;
}

export interface NavGroupMenuProps {
	label: string;
	base: string;
	items: NavGroupItem[];
}

// 一级导航分组下拉（W3C APG「disclosure navigation」模式）：trigger 是按钮，
// 面板内是真 <a> 链接（NavLink 渲染），不加 role=menu —— 站点导航用 disclosure，
// 不用 application menu 语义。Esc 关闭并还焦 trigger；外点 / 焦点离开 / 路由变化收起。
export function NavGroupMenu({ label, base, items }: NavGroupMenuProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const panelId = useId();
	const location = useLocation();
	const isActive =
		location.pathname === base || items.some((item) => location.pathname === item.to);

	useEffect(() => {
		setOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		if (!open) return;
		const onDocMouseDown = (event: MouseEvent) => {
			if (rootRef.current?.contains(event.target as Node)) return;
			setOpen(false);
		};
		const onDocKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			setOpen(false);
			triggerRef.current?.focus();
		};
		document.addEventListener('mousedown', onDocMouseDown);
		document.addEventListener('keydown', onDocKeyDown);
		return () => {
			document.removeEventListener('mousedown', onDocMouseDown);
			document.removeEventListener('keydown', onDocKeyDown);
		};
	}, [open]);

	return (
		<div
			ref={rootRef}
			className="relative"
			onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
				if (event.currentTarget.contains(event.relatedTarget)) return;
				setOpen(false);
			}}
		>
			<button
				ref={triggerRef}
				type="button"
				aria-expanded={open}
				aria-controls={open ? panelId : undefined}
				onClick={() => setOpen((value) => !value)}
				onKeyDown={(event) => {
					if (event.key === 'ArrowDown' && !open) {
						event.preventDefault();
						setOpen(true);
					}
				}}
				className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
					isActive
						? 'bg-primary-50 text-primary-700 dark:bg-white/10 dark:text-sky-300'
						: 'text-[var(--color-text-muted)] hover:bg-neutral-50 hover:text-[var(--color-text-primary)] dark:hover:bg-elevated'
				}`}
			>
				{label}
				<ChevronDown
					className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
					aria-hidden="true"
				/>
			</button>
			{open && (
				<div
					id={panelId}
					className="absolute left-0 top-full mt-1 min-w-[13rem] rounded-lg border border-neutral-200 bg-white p-1.5 shadow-card dark:border-neutral-800 dark:bg-surface"
				>
					{items.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							end
							onClick={() => setOpen(false)}
							className={({ isActive: itemIsActive }) =>
								`block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
									itemIsActive
										? 'bg-primary-50 text-primary-700 dark:bg-white/10 dark:text-sky-300'
										: 'text-[var(--color-text-muted)] hover:bg-neutral-50 hover:text-[var(--color-text-primary)] dark:hover:bg-elevated'
								}`
							}
						>
							{item.label}
						</NavLink>
					))}
				</div>
			)}
		</div>
	);
}
