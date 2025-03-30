import { z } from 'zod';

export const GenderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  gender: GenderSchema,
  risk_score: z.number().min(0).max(100).optional().default(0),
  balance: z.number().min(0).default(0),
  created_at: z.date(),
  updated_at: z.date(),
  profile_picture: z.object({
    uri: z.string(),
    width: z.number(),
    height: z.number(),
  }).optional(),
});

export type User = z.infer<typeof UserSchema>; 