import { Hono } from 'hono';
import Layout from './components/Layout';
import { getFromCache } from './utils/request-cache';
import { getCurrentUser } from './lib/user';
import { JSX } from 'hono/jsx/jsx-runtime';

const createRouter = (buildAssets: string[]) => {
  const app = new Hono();

  const wrapInLayout = <T extends JSX.Element>(title: string, component: T) => (
    <Layout title={title}>{component}</Layout>
  );

  buildAssets.map(asset => {
    app.get('/' + asset, c => getFromCache(c.req.url));
  });

  app.get('/', async c => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return c.render(
        wrapInLayout('Get started', <div>Hello world with layout</div>),
      );
    }
    return c.render('Hello world without layout');
  });

  app.notFound(async c => {
    return fetch(c.req.url);
  });

  return app;
};

export default createRouter;
