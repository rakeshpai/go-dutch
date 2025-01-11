import { FC } from 'hono/jsx';
import { Group } from '../lib/groups';
import { GroupUserId } from '../utils/branded-types';
import { requireUser } from '../lib/user';

type Props = {
  users: Group['users'];
  deletableUsers: Set<GroupUserId>;
};

const ContactPicker: FC<Props> = async ({ users, deletableUsers }) => {
  const currentUser = await requireUser();

  const userIsDeletable = (user: Group['users'][number]) => {
    return (
      user.userId !== currentUser.id || deletableUsers.has(user.groupUserId)
    );
  };

  return (
    <>
      <ul>
        {users
          .filter(u => !userIsDeletable(u))
          .map(user => (
            <li>{user.name}</li>
          ))}
      </ul>
      <div
        data-component="contact-picker"
        data-props={JSON.stringify({
          users: users.filter(u => userIsDeletable(u)),
        })}
      ></div>
    </>
  );
};

export default ContactPicker;
