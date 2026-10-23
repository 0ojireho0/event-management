export function validateNomination(input) {
  const errors = {};
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const topN = Number(input?.top_n);
  const ids = input?.attendee_ids;

  if (!title) errors.title = "Enter a nomination title.";
  else if (title.length > 255) errors.title = "The title must be 255 characters or fewer.";

  if (!Number.isInteger(topN) || topN < 2 || topN > 4294967295) {
    errors.top_n = "Enter a whole number from 2 to 4294967295.";
  }

  if (!Array.isArray(ids) || ids.length < 2) errors.attendee_ids = "Select at least two nominees.";
  else if (ids.length > 250) errors.attendee_ids = "Select no more than 250 nominees.";
  else if (ids.some((id) => !["number", "string"].includes(typeof id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0)) {
    errors.attendee_ids = "Select valid attendees from the search results.";
  } else if (new Set(ids.map(Number)).size !== ids.length) {
    errors.attendee_ids = "Each attendee can only be selected once.";
  }

  return errors;
}

export function toNominationPayload(input) {
  return {
    title: input.title.trim(),
    top_n: Number(input.top_n),
    attendee_ids: input.attendee_ids.map(Number),
  };
}

export function getNominationActions(status) {
  if (status === "draft") return ["edit", "open", "qr", "leaderboard"];
  if (status === "active") return ["close", "qr", "leaderboard"];
  if (status === "closed") return ["qr", "leaderboard"];
  return [];
}

export function getNominationUrl(eventSlug, subjectSlug) {
  const collection = `/api/events/${encodeURIComponent(eventSlug)}/nominations`;
  return subjectSlug == null ? collection : `${collection}/${encodeURIComponent(subjectSlug)}`;
}
