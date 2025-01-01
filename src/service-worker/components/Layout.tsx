import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';

type Props = {
  title: string;
  buildAssets: string[];
  children: JSX.Element;
};

const Layout: FC<Props> = ({ title, buildAssets, children }) => {
  const pageScriptUrl = buildAssets.find(
    a => a.startsWith('index-') && a.endsWith('.js'),
  );
  const cssUrl = buildAssets.find(
    a => a.startsWith('sw-') && a.endsWith('.css'),
  );

  return (
    <html>
      <head>
        <title>{title}</title>
        <link rel="stylesheet" href={cssUrl} />
      </head>
      {children}
      <script type="module" src={pageScriptUrl} />
    </html>
  );
};

export default Layout;
