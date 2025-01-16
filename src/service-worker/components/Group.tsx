import { FC } from 'hono/jsx';
import { GroupId } from '../utils/branded-types';
import { getGroup } from '../lib/groups';
import { pickFromPalette, throwIfNullish } from '../utils/utils';
import Layout from './Layout';
import Dialog from './Dialog';

const Group: FC<{ groupId: GroupId }> = async ({ groupId }) => {
  const group = await getGroup(groupId);
  throwIfNullish(group, 'Group is invalid');

  return (
    <Layout title={group.name}>
      <>
        <div
          class="h-32"
          style={`background: ${pickFromPalette(group.id)[0]}; view-transition-name: ${group.id}-bg;`}
        />
        <div class="px-4">
          <h1 class="text-2xl" style={`view-transition-name: ${group.id}`}>
            {group.name}
          </h1>
          <button data-dialog-target="delete-confirmation">
            Delete this group
          </button>
          <Dialog title="Are yu sure?" id="delete-confirmation">
            <p>Are you sure you want to permanently delete this group?</p>
            <p class="py-2">
              Note, this will only delete the group from your device. Other
              people in the group will still have access to it.
            </p>
            <form
              method="post"
              action="/delete-group"
              class="mb-0 mt-4 flex gap-4"
            >
              <input type="hidden" name="groupId" value={group.id} />
              <button type="submit">Yes, delete the group</button>
              <button
                type="button"
                data-dialog-close
                class="bg-primary-inverted text-primary"
              >
                Cancel
              </button>
            </form>
          </Dialog>
        </div>
      </>
    </Layout>
  );
};

export default Group;
