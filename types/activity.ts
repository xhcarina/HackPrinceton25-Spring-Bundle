import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Activity type enum
export const ActivityTypeSchema = z.enum([
  'investment',
  'return',
  'loan',
  'deposit',
  'withdrawal'
]);

// Activity status enum
export const ActivityStatusSchema = z.enum([
  'pending',
  'completed',
  'failed',
  'received',
  'active'
]);

// Activity schema
export const ActivitySchema = z.object({
  id: z.string(),
  type: ActivityTypeSchema,
  amount: z.number(),
  date: z.instanceof(Timestamp),
  status: ActivityStatusSchema,
  user_id: z.string(),
  description: z.string().optional(),
  reference_id: z.string().optional(), // For linking to loans, bundles, etc.
});

// Activity type
export type Activity = z.infer<typeof ActivitySchema>;

// New activity input schema
export const NewActivityInputSchema = ActivitySchema.omit({ 
  id: true,
  date: true 
});

// New activity input type
export type NewActivityInput = z.infer<typeof NewActivityInputSchema>; 