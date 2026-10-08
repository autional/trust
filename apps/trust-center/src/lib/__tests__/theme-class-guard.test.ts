import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
// 不用本站 tailwind.config.ts：它属 tsconfig.node.json 项目（composite），从 src 测试
// 跨项目引入报 TS6305；其包装层只加 darkMode/content/动画，对本探针候选无影响。
import preset from '@autional/tailwind-preset';

// 回归锁：禁止源码使用 `text-neutral-*` 文本色工具类。
// 背景（trust 站内容审计 TR-01/TR-05，2026-10-05）：tokens.css 的 `.dark` 块把 neutral
// 色阶整体反转（neutral-300→#1f3350 深海军蓝、400→#2a4060…），经典 Tailwind 心智的
// `dark:text-neutral-300/400` 在深色主题下实际渲染成深色 → 对比度 1.0~1.6:1 失明；
// 浅色侧 neutral-400/500 在白底同样不达 4.5:1（1.86:1 / 2.91:1）。文本色一律走语义令牌：
// `text-[var(--color-text-primary)]`（标题，浅 #041d31 / 深 #f8fbfe）或
// `text-[var(--color-text-muted)]`（次级，浅 #64748d / 深 #8896a6，双主题 AA 达标）；
// 语义前景色同理走 `--color-success-text` / `--color-warning-text` / `--color-info-text`。
// border-/bg-neutral- 不在管辖内。SVG stroke=currentColor 的轨道色用固定设计色。
const BANNED = /text-neutral-\d/;

// 回归锁 2（U394 换锁，2026-10-05）：预设色板 alpha 能力**在位**（编译实证）。
// 旧锁 DEAD_ALPHA（禁对预设色写 /NN）的前提 = preset 把色映射为纯 `var(--color-*)`
// （无通道）⇒ Tailwind 3.4 对带 /NN 的候选拿不到通道、**静默丢弃整条规则**
// （`dark:bg-primary-900/20` 根本不生成，深色下回退浅色底 ⇒ 浅底浅字失明）。
// ui 根修后色值走 `rgb(var(--color-*-rgb))` 通道三元组（伴生 `--color-*-rgb: R G B`
// 变量），前提失效。锁从「禁写」换向「能力断言」：用本站**真实安装**的 tailwindcss
// + @autional/tailwind-preset 编译探针候选。
// 若跟版回退到无通道旧预设，本测试 FAIL——这类回归构建期零警告、页面静默失样式。

// vitest 以本包目录为 cwd 运行
const SRC_ROOT = resolve(process.cwd(), 'src');

function collectSourceFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === '__tests__' || entry.name === 'test') continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...collectSourceFiles(full));
		} else if (/\.tsx?$/.test(entry.name)) {
			out.push(full);
		}
	}
	return out;
}

function findOffenders(pattern: RegExp): string[] {
	const offenders: string[] = [];
	for (const file of collectSourceFiles(SRC_ROOT)) {
		const content = readFileSync(file, 'utf8');
		if (pattern.test(content)) {
			offenders.push(file.slice(SRC_ROOT.length));
		}
	}
	return offenders;
}

describe('主题类回归锁', () => {
	it('源码不使用 text-neutral-*（深色主题下被反转为深色，恒失明）', () => {
		expect(findOffenders(BANNED)).toEqual([]);
	});

	it(
		'预设 alpha 能力在位：/NN 规则真实生成、语义文本类在位、裸色阶契约未破（编译实证）',
		async () => {
			const probe = [
				'bg-danger/10',
				'text-success-text/60',
				'text-primary',
				'text-muted',
				'bg-primary/10',
				'bg-[var(--color-danger)]/10',
			].join(' ');
			const cfg = { presets: [preset], content: [{ raw: probe }], corePlugins: { preflight: false } };
			// 双 postcss 拷贝（本站钉 8.5.14 / tailwindcss 内嵌 8.5.28）：跨拷贝 Plugin 类型
			// 互为递归，直接传参 tsc TS2321 栈深溢出；边界断言唯一一次（unknown 直转免比对），
			// 运行期两拷贝 API 相同。
			const plugins = [tailwindcss(cfg)] as unknown as postcss.AcceptedPlugin[];
			const { css } = await postcss(plugins).process('@tailwind utilities;', { from: undefined });
			const norm = css.replace(/\s+/g, '');

			// ① 通道三元组路径：flat 语义色与语义文本色，alpha 修饰符生成真实规则
			expect(norm).toContain('.bg-danger\\/10{background-color:rgb(var(--color-danger-rgb)/0.1)}');
			expect(norm).toContain('.text-success-text\\/60{color:rgb(var(--color-success-text-rgb)/0.6)}');
			// ② U389 语义文本类组（预设插件；输出在 flat 规则之后，同特异性后者胜出）
			expect(norm).toContain('.text-primary{color:var(--color-text-primary)}');
			expect(norm).toContain('}.text-muted{color:var(--color-text-muted)}');
			// ③ 契约未破：无 DEFAULT 的裸色阶仍不生成任何规则（U389 豁免仅限 text- 语义类）
			expect(norm).not.toContain('.bg-primary\\/10');
			// ④ 已知陷阱锁：arbitrary var + /NN 仍是死类（候选值是裸 var，通道解析不到）——
			//    正确写法 = flat 语义类（bg-danger/10），不要拼 bg-[var(--color-danger)]/10。
			expect(norm).not.toContain('.bg-\\[var\\(--color-danger\\)\\]\\/10');
		},
		30_000,
	);
});
