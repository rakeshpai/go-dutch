import { FC } from 'hono/jsx';
import { getGroups } from '../lib/groups';

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
      <ul>
        {groups.map(group => (
          <li>
            <h2>{group.name}</h2>
          </li>
        ))}
      </ul>
    );
  }

  return <NoGroups />;
};

export default Groups;
