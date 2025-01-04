import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';
import PageContainer from './PageContainer';
import { getCurrentUser } from '../lib/user';
import Avatar from './Avatar';
import { HTTPException } from 'hono/http-exception';

type Props = {
  title: string;
  children: JSX.Element;
};

const Layout: FC<Props> = async ({ title, children }) => {
  const user = await getCurrentUser();
  if (!user) throw new HTTPException(404, { message: 'User not found' });

  return (
    <PageContainer title={title}>
      <>
        <div class="border-b border-seperator">
          <div class="px-4">
            <header class="flex justify-between items-center py-4">
              <a href="/" class="text-2xl">
                Go Dutch
              </a>
              <dov>
                <a href="/me" class="flex items-center gap-1">
                  <span class="block">{user.name}</span>
                  <Avatar size={48} name={user.name} id={user.id} />
                </a>
              </dov>
            </header>
          </div>
        </div>
        {children}
      </>
    </PageContainer>
  );
};

export default Layout;
