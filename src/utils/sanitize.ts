/**
 * Cyber Security: XSS Sanitization & Input Cleansing
 * Protects forms and dynamic HTML against code injection & malicious payloads.
 */

export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    return input ? String(input) : '';
  }
  return input
    .replace(/[<>]/g, '') // Remove dangerous brackets
    .replace(/javascript:/gi, '') // Remove javascript pseudo-protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers like onload=, onerror=
    .trim();
}

export function sanitizePhone(phone: string): string {
  // Allow digits, plus, dashes, spaces, and parenthesis only
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Throttles rapid form submissions (Bot & Spam Protection)
 */
const lastSubmissionMap = new Map<string, number>();

export function checkSubmissionThrottle(formKey: string, cooldownMs = 4000): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now();
  const lastTime = lastSubmissionMap.get(formKey) || 0;
  const elapsed = now - lastTime;

  if (elapsed < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
    return { allowed: false, remainingSeconds };
  }

  lastSubmissionMap.set(formKey, now);
  return { allowed: true, remainingSeconds: 0 };
}
