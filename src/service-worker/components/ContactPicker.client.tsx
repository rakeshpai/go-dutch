import { FC, useState } from 'hono/jsx';
import { render } from 'hono/jsx/dom';
import { nanoid } from 'nanoid';

/*
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

const pickContacts = () => {
  if (!isContactPickerAPISupported)
    throw new Error('Contact picker API not supported');

  return navigator.contacts!.select(['name'], { multiple: true });
};
*/

type Props = {
  users: { id: string; name: string }[];
};

const ContactPickerClient: FC<Props> = ({ users: receivedUsers }) => {
  const [users, setUsers] = useState(
    receivedUsers.length === 0
      ? [
          {
            id: nanoid(),
            name: '',
          },
        ]
      : receivedUsers,
  );

  return (
    <>
      <input type="hidden" name="people" value={JSON.stringify(users)} />
      <ul class="mb-4">
        {users.map(u => (
          <li class="grid grid-cols-[1fr_50px] gap-2">
            <input
              type="text"
              value={u.name}
              placeholder="eg. Jane Doe"
              required
              onChange={e => {
                setUsers(us =>
                  us.map(usr =>
                    // @ts-expect-error Hono types for event.target.value
                    usr.id === u.id ? { ...usr, name: e.target.value } : usr,
                  ),
                );
              }}
            />
            <button
              class="bg-primary-inverted text-primary"
              onClick={e => {
                e.preventDefault();
                setUsers(us => us.filter(usr => usr.id !== u.id));
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button
        class="outline text-lg py-2"
        onClick={e => {
          e.preventDefault();
          setUsers(u => [...u, { id: nanoid(), name: '' }]);
        }}
      >
        + Add another person
      </button>
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
