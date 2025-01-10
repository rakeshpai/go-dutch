import { FC } from 'hono/jsx';
import { Group } from '../lib/groups';

type Props = {
  pendingInvitations?: Group['pendingInvitations'];
  confirmedUsers?: Group['confirmedUsers'];
};

const ContactPicker: FC<Props> = ({ confirmedUsers, pendingInvitations }) => {
  return (
    <ul>
      {confirmedUsers?.map(c => <li>{c.name}</li>)}
      {pendingInvitations?.map(p => <li>{p.name}</li>)}
    </ul>
  );
};

export default ContactPicker;
