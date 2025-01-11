import { FC } from 'hono/jsx';
import { Group } from '../lib/groups';
import { render } from 'hono/jsx/dom';

interface ContactPickerOptions {
  multiple?: boolean;
  include?: Array<'name' | 'email' | 'tel' | 'address' | 'icon'>;
}

interface Contact {
  name?: string;
  email?: string[];
  tel?: string[];
  address?: string[];
  icon?: Blob[];
}

declare global {
  interface Navigator {
    contacts?: {
      select: (
        properties: string[],
        options?: ContactPickerOptions,
      ) => Promise<Contact[]>;
    };
  }
}

const isContactPickerAPISupported =
  'contacts' in navigator &&
  'ContactsManager' in window &&
  navigator.contacts &&
  'select' in navigator.contacts;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pickContacts = () => {
  if (!isContactPickerAPISupported)
    throw new Error('Contact picker API not supported');

  return navigator.contacts!.select(['name'], { multiple: true });
};

type Props = {
  users: Group['users'];
};

const ContactPickerClient: FC<Props> = ({ users }) => {
  return (
    <>
      <input type="hidden" name="users" value={JSON.stringify(users)} />
      <ul>
        {users.map(u => (
          <li>{u.name}</li>
        ))}
      </ul>
    </>
  );
};

export default ContactPickerClient;

export const initialize = () => {
  document
    .querySelectorAll<HTMLDivElement>('[data-component="contact-picker"]')
    .forEach(node => {
      const props = JSON.parse(
        node.getAttribute('data-props') || '{}',
      ) as Props;
      render(<ContactPickerClient {...props} />, node);
    });
};
