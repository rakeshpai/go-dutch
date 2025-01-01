import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';
import stylesheet from '../app.css?inline';
// import indexScriptUrl from '../../index.ts?inline';
import { raw } from 'hono/html';
import { isDevMode } from '../utils/utils';

type Props = {
  title: string;
  children: JSX.Element;
  buildAssets: string[];
};

const Layout: FC<Props> = ({ title, children, buildAssets }) => {
  const rootScriptPath = buildAssets.find(
    asset => asset.startsWith('index') && asset.endsWith('.js'),
  );

  return (
    <html>
      <head>
        {isDevMode && <script type="module" src="/@vite/client" />}
        <title>
          {title} {isDevMode ? 'yes' : 'no'}
        </title>
        <style>{raw(stylesheet)}</style>
      </head>
      {children}
      {rootScriptPath && <script src={'/' + rootScriptPath}></script>}
    </html>
  );
};

export default Layout;
