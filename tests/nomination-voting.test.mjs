import assert from "node:assert/strict";
import test from "node:test";

import { getNominationActions, getNominationUrl, toNominationPayload, validateNomination } from "../lib/nomination-voting.mjs";

const valid = { title: "People's Choice", top_n: 2, attendee_ids: [11, 22] };

test("nomination validation requires a title, top N, and at least two attendees", () => {
  const errors = validateNomination({ title: "   ", attendee_ids: [] });
  assert.ok(errors.title);
  assert.ok(errors.top_n);
  assert.ok(errors.attendee_ids);
  assert.deepEqual(validateNomination(valid), {});
});

test("nomination titles accept 255 characters and reject 256", () => {
  assert.deepEqual(validateNomination({ ...valid, title: "x".repeat(255) }), {});
  assert.ok(validateNomination({ ...valid, title: "x".repeat(256) }).title);
});

test("top N must be an integer of at least two within the API storage range", () => {
  for (const top_n of [undefined, "", " ", 0, 1, 2.5, "two", Infinity, 4294967296]) {
    assert.ok(validateNomination({ ...valid, top_n }).top_n, `Reject ${String(top_n)}`);
  }
  assert.deepEqual(validateNomination({ ...valid, top_n: "3" }), {});
  assert.deepEqual(validateNomination({ ...valid, top_n: 4294967295 }), {});
});

test("nominee counts accept two and 250 but reject one and 251", () => {
  assert.ok(validateNomination({ ...valid, attendee_ids: [11] }).attendee_ids);
  const attendee_ids = Array.from({ length: 250 }, (_, index) => index + 1);
  assert.deepEqual(validateNomination({ ...valid, attendee_ids }), {});
  assert.ok(validateNomination({ ...valid, attendee_ids: [...attendee_ids, 251] }).attendee_ids);
});

test("nomination validation rejects duplicate IDs including numeric strings", () => {
  assert.ok(validateNomination({ ...valid, attendee_ids: [11, 11] }).attendee_ids);
  assert.ok(validateNomination({ ...valid, attendee_ids: [11, "11"] }).attendee_ids);
});

test("nomination validation rejects malformed attendee selections", () => {
  for (const attendee_ids of [null, "11,22", [11, null], [11, ""], [11, -1], [11, 1.5], [11, {}]]) {
    assert.ok(validateNomination({ ...valid, attendee_ids }).attendee_ids);
  }
});

test("nomination payload contains only a trimmed title, numeric top N, and ordered attendee IDs", () => {
  const input = { title: "  People's Choice  ", top_n: "3", attendee_ids: ["22", 11], contestants: [{ name: "Private extra" }] };
  assert.deepEqual(toNominationPayload(input), {
    title: "People's Choice", top_n: 3, attendee_ids: [22, 11],
  });
  assert.deepEqual(input.attendee_ids, ["22", 11]);
});

test("nomination actions only permit draft edits/opening and active closure", () => {
  assert.deepEqual(getNominationActions("draft"), ["edit", "open", "qr", "leaderboard"]);
  assert.deepEqual(getNominationActions("active"), ["close", "qr", "leaderboard"]);
  assert.deepEqual(getNominationActions("closed"), ["qr", "leaderboard"]);
  assert.deepEqual(getNominationActions("unknown"), []);
});

test("nomination mutations use event and nomination slugs on their distinct route", () => {
  assert.equal(getNominationUrl("summer gala"), "/api/events/summer%20gala/nominations");
  assert.equal(getNominationUrl("summer gala", "people choice"), "/api/events/summer%20gala/nominations/people%20choice");
});
