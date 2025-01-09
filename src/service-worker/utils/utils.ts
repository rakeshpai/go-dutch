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

export function throwIfUndefined<T>(
  value: T | undefined,
  errorMessage: string,
): asserts value is T {
  if (value !== undefined) return;
  throw new HTTPException(404, { message: errorMessage });
}
