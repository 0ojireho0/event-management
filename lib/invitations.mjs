export function parseInvitationEmails(value) {
  const seen = new Set();

  return value
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => {
      if (!email || seen.has(email)) return false;
      seen.add(email);
      return true;
    });
}

export function isValidInvitationEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isInvitationContextCurrent(requestEventId, context) {
  return context.open && context.eventId === requestEventId;
}

export function invitationMessageType(failedCount) {
  return failedCount > 0 ? "error" : "success";
}

export function buildInvitationPreview(eventTitle, registrationUrl) {
  return `You are invited to register for ${eventTitle}.\n\nRegistration link: ${registrationUrl}`;
}
