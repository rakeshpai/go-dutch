import { defineConfig } from 'vite';
import { resolve } from 'path';
import { Plugin, Rollup } from 'vite';
import { writeFile } from 'node:fs/promises';

const vitePluginSw = (): Plugin => {
  let resolvedConfig;

  const injectManifestIntoSw = async (bundle: Rollup.OutputBundle) => {
    const createManifestString = (() => {
      const m = JSON.stringify(
        Object.entries(bundle)
          .filter(
            ([, v]) =>
              !v.fileName.endsWith('.html') && !v.fileName.endsWith('.map'),
          )
          .map(([k]) => k),
      );

      return m.slice(1, m.length - 1);
    })();

    await Promise.all(
      Object.values(bundle).map(async file => {
        if (!file.fileName.endsWith('js')) return;

        const injected = (
          file.type === 'asset' ? file.source.toString() : file.code
        ).replace('"##SW_ASSETS##"', createManifestString);

        await writeFile(
          resolve(
            resolvedConfig.root,
            resolvedConfig.build.outDir,
            file.fileName,
          ),
          injected,
        );
      }),
    );
  };

  return {
    name: 'vite-plugin-sw',
    configResolved(config) {
      resolvedConfig = config;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/src/service-worker/index.ts')) {
          res.setHeader('Service-Worker-Allowed', '/');
        }
        next();
      });
    },
    transform(src) {
      if (resolvedConfig.command === 'build') return src;
      return src.replace('"##SW_ASSETS##"', '');
    },
    async writeBundle(options, bundle) {
      await injectManifestIntoSw(bundle);
    },
  };
};

export default defineConfig({
  plugins: [vitePluginSw()],
  build: {
    assetsDir: '.', // This ensures that the service worker's scope is root
    assetsInlineLimit: 0,
  },
  worker: {
    format: 'iife',
  },
});
