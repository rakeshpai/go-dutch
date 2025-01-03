import { Hono } from 'hono';
import PageContainer from './components/PageContainer';
import { getFromCache } from './utils/request-cache';
import { getCurrentUser, createUser } from './lib/user';
import FirstLoad from './components/FirstLoad';
import Layout from './components/Layout';
import { getBuildAssets } from './utils/build-assets';

const app = new Hono();

getBuildAssets().map(asset => {
  app.get('/' + asset, c => getFromCache(c.req.url));
});

app.get('/', async c => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return c.render(
      <PageContainer title="Get started">
        <FirstLoad />
      </PageContainer>,
    );
  }
  return c.render(
    <Layout title="Dashboard">
      <div>Logged in as {currentUser.name}</div>
    </Layout>,
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

export default app;
