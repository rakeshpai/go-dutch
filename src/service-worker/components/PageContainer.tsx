import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';
import stylesheet from '../app.css?inline';
import { raw } from 'hono/html';
import { isDevMode } from '../utils/utils';

type Props = {
  title: string;
  children: JSX.Element;
  buildAssets: string[];
};

const PageContainer: FC<Props> = ({ title, children, buildAssets }) => {
  const rootScriptPath = buildAssets.find(
    asset => asset.startsWith('index') && asset.endsWith('.js'),
  );

  return (
    <html>
      <head>
        {isDevMode && <script type="module" src="/@vite/client" />}
        <title>{title}</title>
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
