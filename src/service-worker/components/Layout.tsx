import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';
import stylesheet from '../app.css?inline';
import indexScriptUrl from '../../index.ts?inline';
import { raw } from 'hono/html';
import { isDevMode } from '../utils/utils';

type Props = {
  title: string;
  children: JSX.Element;
};

const Layout: FC<Props> = ({ title, children }) => {
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
      <script>{indexScriptUrl}</script>
    </html>
  );
};

export default Layout;
