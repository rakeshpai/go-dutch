import { FC } from 'hono/jsx';
import { GroupId } from '../utils/branded-types';
import { getGroup } from '../lib/groups';
import { throwIfNullish } from '../utils/utils';
import Layout from './Layout';

const Group: FC<{ groupId: GroupId }> = async ({ groupId }) => {
  const group = await getGroup(groupId);
  throwIfNullish(group, 'Group is invalid');

  return (
    <Layout title={group.name}>
      <div class="px-4">
        <h1 class="text-2xl">{group.name}</h1>
      </div>
    </Layout>
  );
};

export default Group;
