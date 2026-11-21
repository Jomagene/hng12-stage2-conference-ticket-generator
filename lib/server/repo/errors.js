import { firstIssueMessage } from '@/lib/booking-schema';

// Expected failure; the message is shown to the user.
export class DomainError extends Error {
  constructor(code, message, field) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.field = field;
  }
}

export function isUniqueViolation(error) {
  return (error?.code ?? error?.cause?.code) === '23505';
}

export function validationError(error) {
  const issue = error.issues[0];
  return new DomainError('INVALID', firstIssueMessage(error), issue?.path?.join('.'));
}
