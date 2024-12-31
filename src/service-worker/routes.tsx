import { Hono } from 'hono';
import Layout from './components/Layout';
import { getFromCache } from './utils/request-cache';

const createRouter = (buildAssets: string[]) => {
  const app = new Hono();

  buildAssets.map(asset => {
    app.get('/' + asset, async c => {
      const res = await getFromCache(c.req.url);
      return res;
    });
  });

  app.get('/', c => {
    return c.render(<Layout title="Hello world" buildAssets={buildAssets} />);
  });

  return app;
};

export default createRouter;
