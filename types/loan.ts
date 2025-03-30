import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Enum schemas
export const PaymentScheduleSchema = z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']);
export const RequestStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export const RepayStatusSchema = z.enum(['pending', 'in_repayment', 'paid', 'defaulted']);
export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP']);

// Loan schema
export const LoanSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  purpose: z.string().min(1, 'Purpose is required'),
  loaned_amount: z.number().positive('Amount must be greater than 0'),
  funded_amount: z.number().default(0),
  loan_duration: z.number().int().positive('Duration must be greater than 0'),
  payment_schedule: PaymentScheduleSchema,
  request_status: RequestStatusSchema,
  repay_status: RepayStatusSchema,
  amount_repaid: z.number().default(0),
  currency: CurrencySchema,
  created_at: z.instanceof(Timestamp),
  updated_at: z.instanceof(Timestamp),
});

// Loan type
export type Loan = z.infer<typeof LoanSchema>;

// New loan input schema (for form validation)
export const NewLoanInputSchema = z.object({
  purpose: z.string().min(1, 'Purpose is required'),
  loaned_amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Amount must be a valid number greater than 0'
  ),
  loan_duration: z.string().refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
    'Duration must be a valid number greater than 0'
  ),
  payment_schedule: PaymentScheduleSchema,
  currency: CurrencySchema,
});

export type NewLoanInput = z.infer<typeof NewLoanInputSchema>; 