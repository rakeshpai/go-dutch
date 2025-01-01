import { defineConfig } from 'vite';
import { resolve } from 'path';
import { Plugin, Rollup } from 'vite';
import { writeFile } from 'node:fs/promises';

const vitePluginSw = (): Plugin => {
  let resolvedConfig;

  const injectManifestIntoSw = async (bundle: Rollup.OutputBundle) => {
    const manifestString = (() => {
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
        ).replace('"##SW_ASSETS##"', manifestString);

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
    config(config) {
      config.build = config.build || {};
      config.build.assetsDir = '.';
      config.build.assetsInlineLimit = 0;
      config.worker = config.worker || {};
      config.worker.format = 'iife';
      config.worker.rollupOptions = config.worker.rollupOptions || {};
      config.worker.rollupOptions.output = {};
      config.worker.rollupOptions.output.entryFileNames = '[name].js';
    },
    configResolved(config) {
      resolvedConfig = config;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/src/service-worker/sw.ts')) {
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
});
