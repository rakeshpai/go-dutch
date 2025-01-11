import { HTTPException } from 'hono/http-exception';

export const formDataToObject = (formData: FormData) => {
  return Object.fromEntries(formData.entries());
};

export const sha256 = async (message: string) => {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
};

export function throwIfNullish<T>(
  value: T | undefined | null,
  errorMessage: string,
): asserts value is T {
  if (value !== undefined || value !== null) return;
  throw new HTTPException(404, { message: errorMessage });
}

const createPalette = (palette: [color: string, isTextWhite: boolean][]) => {
  const pickColor = (str: string) => {
    const index = str.charCodeAt(0) % palette.length;
    return palette[index];
  };

  return pickColor;
};

export const pickFromPalette = createPalette([
  ['purple', true],
  ['blue', true],
  ['yellow', false],
  ['black', true],
  ['green', true],
  ['gray', true],
  ['cyan', false],
  ['orange', false],
  ['teal', true],
  ['indigo', true],
  ['pink', false],
  ['red', true],
]);
