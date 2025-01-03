import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';
import PageContainer from './PageContainer';

type Props = {
  title: string;
  children: JSX.Element;
};

const Layout: FC<Props> = ({ title, children }) => {
  return (
    <PageContainer title={title}>
      <div>
        <header>
          <a href="/">Go Dutch</a>
          <a href="/me"></a>
        </header>
        {children}
      </div>
    </PageContainer>
  );
};

export default Layout;
