import { FC, JSX } from 'hono/jsx';
import { currencies, userCurrencyGuess } from '../utils/statics';

const CurrencyDropdown: FC<JSX.IntrinsicElements['select']> = attr => {
  return (
    <select {...attr}>
      {currencies.map(currency => (
        <option
          value={currency.code}
          selected={currency.code === userCurrencyGuess}
        >
          {currency.code} &mdash; {currency.name}{' '}
          {currency.symbol ? `(${currency.symbol})` : ''}
        </option>
      ))}
    </select>
  );
};

export default CurrencyDropdown;
