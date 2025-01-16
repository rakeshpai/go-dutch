import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';

type Props = {
  id: string;
  title: string;
  showCloseButton?: boolean;
  children: JSX.Element[];
};

const Dialog: FC<Props> = ({ title, showCloseButton = true, children }) => {
  return (
    <dialog
      id="delete-confirmation"
      class="max-w-xl bg-primary-inverted p-4 rounded-md"
    >
      <div class="flex mb-4">
        <h2 class="text-2xl flex-grow">{title}</h2>
        {showCloseButton && (
          <button
            type="button"
            data-dialog-close
            class="flex-shrink py-1 px-2 text-base bg-primary-inverted border-0 text-secondary hover:text-primary"
          >
            ✕
          </button>
        )}
      </div>
      {children}
    </dialog>
  );
};

export default Dialog;
