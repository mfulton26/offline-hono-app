import { z } from "zod";

export type User = z.infer<typeof User>;
export const User = z.object({
  id: z.number().positive().int(),
  name: z.string(),
  username: z.string().regex(/[a-z._]/i),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string(),
    geo: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
    }),
  }),
  phone: z.string(),
  website: z.string(),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string(),
  }),
});

export default z.array(User);
