import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Enum schemas
export const PaymentScheduleSchema = z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']);
export const RequestStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export const RepayStatusSchema = z.enum(['pending', 'in_repayment', 'paid', 'defaulted']);
export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP']);
export const LoanPurposeSchema = z.enum([
  'Agriculture',
  'Arts',
  'Clothing',
  'Construction',
  'Education',
  'Entertainment',
  'Food',
  'Health',
  'Housing',
  'Manufacturing',
  'Personal Use',
  'Retail',
  'Services',
  'Transportation',
  'Wholesale'
]);

// Loan schema
export const LoanSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  purpose: LoanPurposeSchema,
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
  default_rate: z.number().min(0).max(1).default(0),
});

// Loan type
export type Loan = z.infer<typeof LoanSchema>;

// New loan input schema (for form validation)
export const NewLoanInputSchema = z.object({
  purpose: LoanPurposeSchema,
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