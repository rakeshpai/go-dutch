import { FC } from 'hono/jsx';
import { GroupId } from '../utils/branded-types';
import Layout from './Layout';
import { getGroup } from '../lib/groups';
import ContactPicker from './ContactPicker';

const AddEditGroup: FC<{ groupId?: GroupId }> = async ({ groupId }) => {
  const group = groupId ? await getGroup(groupId) : undefined;

  return (
    <Layout title={group ? 'Edit a group' : 'Add a group'}>
      <div class="px-4">
        <h1 class="py-4 text-2xl">
          {group ? 'Edit group' : 'Add a new group'}
        </h1>

        <form class="flex flex-col gap-8">
          <div class="flex flex-col gap-2">
            <label id="group-name-label" for="group-name">
              Name
            </label>
            <input
              type="text"
              id="group-name"
              aria-labelledBy="group-name-label"
              value={group?.name || ''}
              placeholder="e.g. Trip to Egypt"
              autofocus
            />
          </div>
          <div class="">Add people</div>
          <ContactPicker
            pendingInvitations={group?.pendingInvitations}
            confirmedUsers={group?.confirmedUsers}
          />
        </form>
      </div>
    </Layout>
  );
};

export default AddEditGroup;
