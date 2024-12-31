import { FC } from 'hono/jsx';

type Props = {
  title: string;
  buildAssets: string[];
};

const Layout: FC<Props> = ({ title, buildAssets }) => {
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
      <body>Hello world</body>
      <script type="module" src={pageScriptUrl} />
    </html>
  );
};

export default Layout;
