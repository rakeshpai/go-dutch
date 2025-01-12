import { FC } from 'hono/jsx';
import { getGroups } from '../lib/groups';
import { pickFromPalette } from '../utils/utils';

const NoGroups: FC = async () => {
  return (
    <div class="px-4 flex place-content-center">
      <div class="text-center">
        <p class="py-4">Create a new group to split expenses between</p>
        <a class="button" href="/add-group">
          Create a new group
        </a>
      </div>
    </div>
  );
};

const Groups: FC = async () => {
  const groups = await getGroups();

  if (!groups.length) return <NoGroups />;

  return (
    <ul
      class="px-4 grid mt-4 gap-8"
      style="grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)"
    >
      {groups.map(group => (
        <li class="min-w-64">
          <a
            class="border border-primary rounded-lg overflow-hidden block"
            href={`/groups/${group.id}`}
          >
            <div
              class="h-20"
              style={{ backgroundColor: pickFromPalette(group.id)[0] }}
            ></div>
            <div class="py-2 px-4">
              <h2 class="text-xl">{group.name}</h2>
            </div>
          </a>
        </li>
      ))}
      <li class="min-w-64">
        <a
          class="border border-dashed border-primary rounded-lg h-full flex items-center justify-center"
          href="/add-group"
        >
          Create a new group
        </a>
      </li>
    </ul>
  );
};

export default Groups;
