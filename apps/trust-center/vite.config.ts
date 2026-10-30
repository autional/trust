import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { CDN_PIN, readBuildEnv } from '../../scripts/env.mjs';
import { REGION_COPY } from '../../scripts/region-copy.mjs';
import { PUBLIC_ROUTES } from '../../scripts/routes.mjs';
import { applyRouteHead, siblingSiteUrl, stripRouteIdentity } from '../../scripts/route-html.mjs';

const buildEnv = readBuildEnv();
const copy = REGION_COPY[buildEnv.defaultLang];
const CDN_ASSET_BASE = `${buildEnv.cdnHost}/ui/${CDN_PIN}`;
const ROOT_URL = `https://www.${buildEnv.rootDomain}`;

function normalizeViteBase(p: string | undefined): string {
  if (!p || p === '/') return '/';
  if (p.includes('Program Files')) {
    throw new Error('MSYS2 path corruption detected on BASE_PATH: ' + p + '. Use PowerShell to build.');
  }
  return p.replace(/\/$/, '') + '/';
}


/**
 * 构建期「按路由出静态 HTML」（2026-10-30）。
 *
 * 纯 SPA 的所有路径都回同一份 index.html ⇒ 每页静态 canonical / og:url 都是首页，
 * 与 sitemap 声明的 URL 直接冲突，且不跑 JS 的抓取器（社交/IM/AI）只看到首页身份。
 * 生成：
 *   - dist/<route>/index.html：sitemap 每条公开路由一份，头部（canonical / og:url /
 *     hreflang / title）逐页正确；
 *   - dist/spa.html：未知路径兜底壳，不含 canonical / og:url（比错误 canonical 安全）。
 * 路由单点 = scripts/routes.mjs（与 sitemap 共用）。标题取 i18n，与运行期 useTrustSEO 同源。
 */
function staticRouteHtmlPlugin(): Plugin {
  return {
    name: 'static-route-html',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(outDir, 'index.html');
      if (!existsSync(indexPath)) {
        throw new Error('[trust] 构建产物缺少 dist/index.html，静态路由 HTML 无法生成');
      }
      const base = readFileSync(indexPath, 'utf8');
      const localePath = path.resolve(__dirname, `src/i18n/locales/${copy.locale}.json`);
      const locale = JSON.parse(readFileSync(localePath, 'utf8')) as Record<string, string>;
      const siteUrl = buildEnv.siteUrl;
      const siblingUrl = siblingSiteUrl(siteUrl);

      const home = applyRouteHead(base, { siteUrl, siblingUrl, path: '/' });
      writeFileSync(indexPath, home);

      let generated = 1;
      for (const route of PUBLIC_ROUTES) {
        if (route.path === '/') continue;
        const html = applyRouteHead(base, {
          siteUrl,
          siblingUrl,
          path: route.path,
          title: route.titleKey ? locale[route.titleKey] : undefined,
        });
        const dir = path.join(outDir, route.path);
        mkdirSync(dir, { recursive: true });
        writeFileSync(path.join(dir, 'index.html'), html);
        generated += 1;
      }

      writeFileSync(path.join(outDir, 'spa.html'), stripRouteIdentity(home));
      console.log(`[trust] static route html: ${generated} pages (+ spa.html)`);
    },
  };
}

/**
 * index.html 区域占位符（{{TOKEN}}）替换单点——值全部来自 scripts/env.mjs + region-copy.mjs。
 * 未知占位符 fail-closed（防拼写错误静默漏替）。
 */
function regionPlugin(): Plugin {
  const tokens: Record<string, string> = {
    LANG: copy.locale,
    TITLE: copy.title,
    DESCRIPTION: copy.description,
    KEYWORDS: copy.keywords,
    OG_TITLE: copy.ogTitle,
    OG_DESCRIPTION: copy.ogDescription,
    OG_LOCALE: copy.ogLocale,
    SITE_NAME: copy.siteName,
    OG_IMAGE: `${ROOT_URL}/og-default.png`,
    SITE_URL: buildEnv.siteUrl,
    ROOT_URL,
    CDN_ASSET_BASE,
  };
  return {
    name: 'region-plugin',
    enforce: 'pre',
    transformIndexHtml(html) {
      return html.replace(/\{\{(\w+)\}\}/g, (raw, key: string) => {
        if (!(key in tokens)) {
          throw new Error(`[trust] index.html 未知区域占位符: {{${key}}}`);
        }
        return tokens[key];
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), regionPlugin(), staticRouteHtmlPlugin()],
  define: {
    'import.meta.env.VITE_REGION': JSON.stringify(buildEnv.region),
    'import.meta.env.VITE_SITE_URL': JSON.stringify(buildEnv.siteUrl),
    'import.meta.env.VITE_DEFAULT_LANG': JSON.stringify(buildEnv.defaultLang),
    'import.meta.env.VITE_FALLBACK_LANG': JSON.stringify(buildEnv.fallbackLang),
  },
  base: normalizeViteBase(process.env.BASE_PATH),
  resolve: {
    extensions: ['.mjs', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {'@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 13109,
    proxy: {
      '/bff': {
        target: process.env.VITE_API_PROXY_URL || 'http://localhost:11080',
        changeOrigin: true,
      },
      '/oauth/': {
        target: process.env.VITE_API_PROXY_URL || 'http://localhost:11080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 13109,
    proxy: {
      '/bff': {
        target: process.env.VITE_API_PROXY_URL || 'http://localhost:11080',
        changeOrigin: true,
      },
      '/oauth/': {
        target: process.env.VITE_API_PROXY_URL || 'http://localhost:11080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
