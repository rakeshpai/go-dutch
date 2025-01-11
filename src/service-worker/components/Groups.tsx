import { FC } from 'hono/jsx';
import { getGroups } from '../lib/groups';
import { pickFromPalette } from '../utils/utils';

const NoGroups: FC = async () => {
  return (
    <div class="px-4 flex place-content-center">
      <div class="text-center">
        <p class="py-4">Create a new group to split expenses between</p>
        <a class="button" href="">
          Create a new group
        </a>
      </div>
    </div>
  );
};

const Groups: FC = async () => {
  const groups = await getGroups();

  if (groups.length) {
    return (
      <ul class="px-4 flex mt-4">
        {groups.map(group => (
          <li class="border border-primary min-w-64 rounded-lg overflow-hidden">
            <div
              class="h-20"
              style={{ backgroundColor: pickFromPalette(group.id)[0] }}
            ></div>
            <div class="py-2 px-4">
              <h2 class="text-xl">{group.name}</h2>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return <NoGroups />;
};

export default Groups;
