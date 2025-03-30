import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Bundle schema
export const BundleSchema = z.object({
  id: z.string(),
  loan_ids: z.array(z.string()),
  M: z.number().positive(),
  bundle_id: z.number().int().positive(),
  bundle_name: z.string().min(1, 'Bundle name is required'),
  bundle_description: z.string(),
  bundle_status: z.boolean(),
  bundle_value: z.number().positive(),
  bundle_created_at: z.instanceof(Timestamp),
  bundle_end_date: z.instanceof(Timestamp),
  i_rate: z.number().default(0.0),
});

// Bundle type
export type Bundle = z.infer<typeof BundleSchema>;

// New bundle input schema (for form validation)
export const NewBundleInputSchema = z.object({
  loan_ids: z.array(z.string()),
  M: z.number().positive('M must be greater than 0'),
  bundle_name: z.string().min(1, 'Bundle name is required'),
  bundle_description: z.string(),
  bundle_value: z.number().positive('Bundle value must be greater than 0'),
  bundle_end_date: z.instanceof(Date),
  i_rate: z.number().default(0.0),
});

export type NewBundleInput = z.infer<typeof NewBundleInputSchema>; 