import { FC } from 'hono/jsx';
import CurrencyDropdown from './CurrencyDropdown';

const FirstLoad: FC = () => {
  return (
    <div class="h-screen flex items-center justify-center">
      <div class="max-w-lg mx-6">
        <h1 class="max-w-96 text-7xl">Go Dutch</h1>
        <form action="/" method="post" class="mt-8 flex flex-col gap-8">
          <div class="flex flex-col gap-2">
            <label id="name-label" for="name-field">
              Your name
            </label>
            <input
              type="text"
              name="name"
              id="name-field"
              placeholder="e.g. John Doe"
              autocomplete="name"
              aria-labelledby="name-label"
              aria-describedby="name-description"
              required
              autofocus
            />
            <p id="name-description" class="text-secondary">
              This is shared with the people in your account books
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <label id="currency-label" for="currency-field">
              Preferred currency
            </label>
            <CurrencyDropdown
              name="currencyCode"
              id="currency-field"
              aria-labelledby="currency-label"
              aria-describedby="currency-description"
            />
            <p id="currency-description" class="text-secondary">
              This is the currency you prefer to use
            </p>
          </div>
          <div>
            <button type="submit">Get started</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirstLoad;
