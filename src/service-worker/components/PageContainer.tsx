import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';
import stylesheet from '../app.css?inline';
import { raw } from 'hono/html';
import { isDevMode } from '../utils/statics';
import { getBuildAssets } from '../utils/build-assets';

type Props = {
  title: string;
  children: JSX.Element;
};

const PageContainer: FC<Props> = ({ title, children }) => {
  const rootScriptPath = getBuildAssets().find(
    asset => asset.startsWith('index') && asset.endsWith('.js'),
  );

  return (
    <html>
      <head>
        {isDevMode && <script type="module" src="/@vite/client" />}
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{raw(stylesheet)}</style>
      </head>
      {children}
      <script
        src={rootScriptPath ? '/' + rootScriptPath : '/src/index.ts'}
        type="module"
      ></script>
    </html>
  );
};

export default PageContainer;
