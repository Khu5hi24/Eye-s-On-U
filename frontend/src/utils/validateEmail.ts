export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const s = email.trim();
  if (s.length > 254) return false;
  const parts = s.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const localRegex = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
  if (!localRegex.test(local)) return false;
  if (!domain || domain.length > 253) return false;
  const labels = domain.split('.');
  if (labels.some((l) => l.length < 1 || l.length > 63)) return false;
  const labelRegex = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
  if (!labels.every((l) => labelRegex.test(l))) return false;
  if (labels[labels.length - 1].length < 2) return false;
  return true;
};

export default isValidEmail;
