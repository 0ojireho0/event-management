import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInvitationPreview,
  invitationMessageType,
  isInvitationContextCurrent,
  isValidInvitationEmail,
  parseInvitationEmails,
} from "../lib/invitations.mjs";

test("parses copied email lists with mixed separators", () => {
  assert.deepEqual(
    parseInvitationEmails("one@example.com, two@example.com;three@example.com\nfour@example.com"),
    ["one@example.com", "two@example.com", "three@example.com", "four@example.com"],
  );
});

test("normalizes casing and removes duplicate email addresses", () => {
  assert.deepEqual(
    parseInvitationEmails(" Guest@Example.com  guest@example.com\nSECOND@example.com "),
    ["guest@example.com", "second@example.com"],
  );
});

test("ignores empty values from repeated separators", () => {
  assert.deepEqual(parseInvitationEmails(" , ; \n attendee@example.com , "), ["attendee@example.com"]);
});

test("identifies invalid email values before submission", () => {
  assert.equal(isValidInvitationEmail("attendee@example.com"), true);
  assert.equal(isValidInvitationEmail("not-an-email"), false);
  assert.equal(isValidInvitationEmail("two words@example.com"), false);
});

test("applies asynchronous invitation results only to the open matching event", () => {
  assert.equal(isInvitationContextCurrent("event-a", { eventId: "event-a", open: true }), true);
  assert.equal(isInvitationContextCurrent("event-a", { eventId: "event-b", open: true }), false);
  assert.equal(isInvitationContextCurrent("event-a", { eventId: "event-a", open: false }), false);
});

test("uses an error message style when any invitation fails", () => {
  assert.equal(invitationMessageType(0), "success");
  assert.equal(invitationMessageType(1), "error");
});

test("builds the same event invitation content shown to email recipients", () => {
  assert.equal(
    buildInvitationPreview("Annual Corporate Gala 2026", "https://events.test/register/abc123"),
    "You are invited to register for Annual Corporate Gala 2026.\n\nRegistration link: https://events.test/register/abc123",
  );
});
