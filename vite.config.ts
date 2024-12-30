import { defineConfig } from 'vite';
import { resolve } from 'path';
import { Plugin } from 'vite';
import { unlink } from 'node:fs/promises';

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
    generateBundle(...args) {
      console.log('dummy-sw generateBundle', args);
      // return null;
    },
    async writeBundle(options, bundle) {
      await deleteBuiltDummyHTML();
      console.log(bundle);
    },
  };
};

export default defineConfig({
  plugins: [vitePluginSw()],
  build: {
    sourcemap: true,
  },
});
