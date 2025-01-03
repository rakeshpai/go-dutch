import { Hono } from 'hono';
import PageContainer from './components/PageContainer';
import { getFromCache } from './utils/request-cache';
import { getCurrentUser, createUser } from './lib/user';
import { JSX } from 'hono/jsx/jsx-runtime';
import FirstLoad from './components/FirstLoad';

const createRouter = (buildAssets: string[]) => {
  const app = new Hono();

  const wrapInLayout = <T extends JSX.Element>(title: string, component: T) => (
    <PageContainer title={title} buildAssets={buildAssets}>
      {component}
    </PageContainer>
  );

  buildAssets.map(asset => {
    app.get('/' + asset, c => getFromCache(c.req.url));
  });

  app.get('/', async c => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return c.render(wrapInLayout('Get started', <FirstLoad />));
    }
    return c.render(
      wrapInLayout('Dashboard', <div>Logged in as {currentUser.name}</div>),
    );
  });

  app.post('/', async c => {
    const body = await c.req.formData();
    await createUser(body);
    return c.redirect('/');
  });

  app.notFound(async c => {
    return fetch(c.req.url);
  });

  return app;
};

export default createRouter;
