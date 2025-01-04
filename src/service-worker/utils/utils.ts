import { z } from 'zod';

export const formDataToObject = (formData: FormData) => {
  return Object.fromEntries(formData.entries());
};

export const brandedIdSchema = <T extends string>(brand: T) =>
  z.string().nanoid().brand(brand);
