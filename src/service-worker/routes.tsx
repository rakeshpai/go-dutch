import { Hono } from 'hono';
import Layout from './components/Layout';
import { getFromCache } from './utils/request-cache';

const createRouter = (buildAssets: string[]) => {
  const app = new Hono();

  buildAssets.map(asset => {
    app.get('/' + asset, c => getFromCache(c.req.url));
  });

  app.get('/', c => {
    return c.render(<Layout title="Hello world" buildAssets={buildAssets} />);
  });

  return app;
};

export default createRouter;
