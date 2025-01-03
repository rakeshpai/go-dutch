import { getCurrency } from 'locale-currency';

export const isDevMode = import.meta.env?.MODE === 'development';

export const locale =
  navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;

const currencyDisplayName = new Intl.DisplayNames([locale], {
  type: 'currency',
});

export const currencies = Intl.supportedValuesOf('currency').map(currency => {
  const symbol = (0)
    .toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, '')
    .trim();

  return {
    code: currency,
    name: currencyDisplayName.of(currency),
    symbol: symbol === currency ? undefined : symbol,
  };
});

export const userCurrencyGuess = getCurrency(locale);
