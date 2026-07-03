export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  // Trim spaces and reject if empty/whitespace only
  const trimmed = email.trim();
  if (trimmed.length === 0) return false;

  // Reject spaces anywhere in the email
  if (/\s/.test(trimmed)) return false;

  // Maximum total length check: 254 characters
  if (trimmed.length > 254) return false;

  // Must contain exactly one '@'
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;

  // Local-part length check: Max 64 characters
  if (!local || local.length > 64) return false;

  // Local part cannot start or end with a dot, and cannot have consecutive dots
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;

  // Valid characters in local part (case-insensitive because lowercase normalization is handled, but regex supports both safely)
  const localRegex = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
  if (!localRegex.test(local)) return false;

  // Domain cannot be empty, maximum length 253
  if (!domain || domain.length > 253) return false;

  // Domain must contain at least one '.'
  if (!domain.includes('.')) return false;

  // Domain cannot start or end with a dot, and cannot have consecutive dots
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;

  const labels = domain.split('.');

  // Domain labels check
  // Domain labels cannot start or end with '-'
  for (const label of labels) {
    if (label.length < 1 || label.length > 63) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;

    // Label characters must be alphanumeric or hyphen
    const labelRegex = /^[A-Za-z0-9-]+$/;
    if (!labelRegex.test(label)) return false;
  }

  // Last label (TLD) must be at least 2 characters
  if (labels[labels.length - 1].length < 2) return false;

  return true;
};

export default isValidEmail;
