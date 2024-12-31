import { defineConfig } from 'vite';
import { resolve } from 'path';
import { Plugin, Rollup } from 'vite';
import { unlink, writeFile } from 'node:fs/promises';

const vitePluginSw = (): Plugin => {
  const dummySwHtml = 'sw-inject.html';
  const swFilePrefix = 'sw';

  let resolvedConfig;

  const deleteBuiltDummyHTML = async () => {
    const generatedDummyHtmlPath = resolve(
      resolvedConfig.root,
      resolvedConfig.build.outDir,
      dummySwHtml,
    );

    await unlink(generatedDummyHtmlPath);
  };

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
        if (file.type !== 'chunk') return;

        const injected = file.code.replace(
          '"##SW_ASSETS##"',
          createManifestString,
        );

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

  const fixSwEntry = async (bundle: Rollup.OutputBundle) => {
    const swEntry = Object.keys(bundle).find(
      f => f.startsWith(`${swFilePrefix}-`) && f.endsWith('.js'),
    );
    if (!swEntry) return;

    const indexJsFile = Object.entries(bundle).find(
      ([f]) => f.startsWith('index-') && f.endsWith('.js'),
    )?.[1];

    if (!indexJsFile || indexJsFile.type !== 'chunk') return;

    const fixedSwEntry = indexJsFile.code.replace('##SW_PATH##', swEntry);

    await writeFile(
      resolve(
        resolvedConfig.root,
        resolvedConfig.build.outDir,
        indexJsFile.fileName,
      ),
      fixedSwEntry,
    );
  };

  return {
    name: 'vite-plugin-sw',
    config(config) {
      config.build = config.build ?? {};
      config.build.rollupOptions = config.build.rollupOptions ?? {};
      config.build.rollupOptions.input = {
        index: 'index.html',
        sw: dummySwHtml,
      };
      config.build.assetsDir = '.';
      config.build.modulePreload = false;
    },
    configResolved(config) {
      resolvedConfig = config;
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/sw-entry-point.js') return next();

        res.writeHead(200, {
          'Content-Type': 'text/javascript',
          'Service-Worker-Allowed': '/',
        });
        res.end(
          `import './service-worker/index.js';\nexport default () => {};\n`,
        );
      });
    },
    async writeBundle(options, bundle) {
      await Promise.all([
        deleteBuiltDummyHTML(),
        injectManifestIntoSw(bundle),
        fixSwEntry(bundle),
      ]);
    },
  };
};

export default defineConfig({
  plugins: [vitePluginSw()],
});
