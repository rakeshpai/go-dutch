import { defineConfig } from 'vite';
import { resolve } from 'path';
import { Plugin, Rollup } from 'vite';
import { unlink, writeFile } from 'node:fs/promises';

const vitePluginSw = (): Plugin => {
  const dummySwHtml = 'sw-inject.html';
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
    console.log('injectManifestIntoSw', bundle);

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
        if (file.type !== 'chunk') return;

        const injected = file.code.replace('"##SW_ASSETS##"', manifestString);

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
      config.build = config.build ?? {};
      config.build.rollupOptions = config.build.rollupOptions ?? {};
      config.build.rollupOptions.input = {
        index: 'index.html',
        sw: dummySwHtml,
      };
    },
    configResolved(config) {
      resolvedConfig = config;
      // console.log('dummy-sw configResolved', config);
    },
    transform(code, id) {
      console.log('dummy-sw transform', id);
    },
    // generateBundle(_, _bundle) {
    //   bundle = _bundle;
    //   // return null;
    // },
    async writeBundle(options, bundle) {
      await deleteBuiltDummyHTML();
      await injectManifestIntoSw(bundle);
    },
  };
};

export default defineConfig({
  plugins: [vitePluginSw()],
  build: {
    sourcemap: true,
  },
});
