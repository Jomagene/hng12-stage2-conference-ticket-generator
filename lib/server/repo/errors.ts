import type { z } from 'zod';
import { firstIssueMessage } from '@/lib/booking-schema';

export type DomainErrorCode = 'INVALID' | 'NOT_FOUND' | 'CLOSED' | 'SOLD_OUT' | 'CONFLICT';

// Expected failure; the message is shown to the user.
export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly field?: string;

  constructor(code: DomainErrorCode, message: string, field?: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.field = field;
  }
}

type PgError = { code?: string; cause?: { code?: string } };

export function isUniqueViolation(error: unknown) {
  const e = error as PgError | null;
  return (e?.code ?? e?.cause?.code) === '23505';
}

export function validationError(error: z.ZodError) {
  const issue = error.issues[0];
  return new DomainError('INVALID', firstIssueMessage(error), issue?.path?.join('.'));
}
