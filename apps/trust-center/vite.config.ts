import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { CDN_PIN, readBuildEnv } from '../../scripts/env.mjs';
import { REGION_COPY } from '../../scripts/region-copy.mjs';

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
  plugins: [react(), regionPlugin()],
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
