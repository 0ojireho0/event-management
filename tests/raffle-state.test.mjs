import assert from "node:assert/strict";
import test from "node:test";

import {
  canCancel,
  canConfirm,
  canStartDraw,
  createRaffleState,
  getRaffleErrorMessage,
  getWheelAttendees,
  raffleReducer,
} from "../lib/raffle-state.mjs";

const alice = { registration_id: 1, first_name: "Alice", last_name: "Rivera", masked_email: "a***@example.com" };
const bob = { registration_id: 2, first_name: "Bob", last_name: "Santos", masked_email: "b***@example.com" };
const draw = { id: 50, status: "pending", selected_at: "2026-09-29T00:00:00Z", expires_at: "2026-09-29T00:10:00Z" };
const winner = { id: 70, ...alice, won_at: "2026-09-29T00:01:00Z" };

function loaded(overrides = {}) {
  return raffleReducer(createRaffleState(), {
    type: "LOAD_SUCCESS",
    payload: {
      event: { id: 1, slug: "sample", title: "Sample Event" },
      eligible_attendees: [alice, bob],
      eligible_count: 2,
      pending_draw: null,
      winners: [],
      ...overrides,
    },
  });
}

test("load classifies available, empty, exhausted, and reserved raffles", () => {
  assert.equal(loaded().status, "ready");
  assert.equal(loaded({ eligible_attendees: [], eligible_count: 0 }).status, "empty");
  assert.equal(loaded({ eligible_attendees: [], eligible_count: 0, winners: [winner] }).status, "exhausted");
  const reserved = loaded({ eligible_attendees: [bob], eligible_count: 1, pending_draw: { ...draw, ...alice } });
  assert.equal(reserved.status, "pending");
  assert.equal(reserved.selectedAttendee.registration_id, 1);
  assert.equal(reserved.pendingDraw.id, 50);
});

test("reserved winner remains a wheel segment when the backend excludes it from eligibility", () => {
  const reserved = loaded({ eligible_attendees: [bob], eligible_count: 1, pending_draw: { ...draw, ...alice } });
  assert.deepEqual(getWheelAttendees(reserved), [bob, alice]);
  const alreadyIncluded = loaded({ pending_draw: { ...draw, ...alice } });
  assert.deepEqual(getWheelAttendees(alreadyIncluded), [alice, bob]);
});

test("draw stores the server-selected attendee through animation completion", () => {
  const drawing = raffleReducer(loaded(), { type: "DRAW_START" });
  assert.equal(drawing.status, "drawing");
  const spinning = raffleReducer(drawing, { type: "DRAW_SUCCESS", payload: { draw, attendee: bob } });
  assert.equal(spinning.status, "spinning");
  assert.deepEqual(spinning.selectedAttendee, bob);
  assert.equal(spinning.pendingDraw.id, 50);
  assert.equal(raffleReducer(spinning, { type: "SPIN_END" }).status, "pending");
});

test("confirmation removes only the returned winner and prepends server history", () => {
  const pending = raffleReducer(raffleReducer(raffleReducer(loaded(), { type: "DRAW_START" }), { type: "DRAW_SUCCESS", payload: { draw, attendee: alice } }), { type: "SPIN_END" });
  const confirmed = raffleReducer(raffleReducer(pending, { type: "CONFIRM_START" }), {
    type: "CONFIRM_SUCCESS",
    payload: { draw: { ...draw, status: "confirmed" }, attendee: alice, winner },
  });
  assert.equal(confirmed.status, "confirmed");
  assert.deepEqual(confirmed.eligibleAttendees, [bob]);
  assert.equal(confirmed.eligibleCount, 1);
  assert.deepEqual(confirmed.winners, [winner]);
  assert.equal(confirmed.pendingDraw, null);
});

test("failed confirmation retains the provisional winner for retry", () => {
  const pending = raffleReducer(loaded({ eligible_attendees: [bob], eligible_count: 1, pending_draw: { ...draw, ...alice } }), { type: "CONFIRM_START" });
  const failed = raffleReducer(pending, { type: "CONFIRM_FAILURE", error: new Error("network down") });
  assert.equal(failed.status, "pending");
  assert.deepEqual(failed.selectedAttendee, alice);
  assert.equal(failed.pendingDraw.id, 50);
  assert.equal(canConfirm(failed), true);
  assert.match(failed.error, /try again/i);
});

test("cancellation restores a reserved attendee without duplicating an existing one", () => {
  const pending = loaded({ eligible_attendees: [bob], eligible_count: 1, pending_draw: { ...draw, ...alice } });
  const cancelled = raffleReducer(raffleReducer(pending, { type: "CANCEL_START" }), {
    type: "CANCEL_SUCCESS",
    payload: { draw: { ...draw, status: "cancelled" }, attendee: alice },
  });
  assert.equal(cancelled.status, "ready");
  assert.deepEqual(cancelled.eligibleAttendees, [bob, alice]);
  assert.equal(cancelled.eligibleCount, 2);
  assert.equal(cancelled.pendingDraw, null);
  assert.equal(cancelled.selectedAttendee, null);
});

test("failed cancellation preserves the draw and shows a safe retry error", () => {
  const pending = raffleReducer(raffleReducer(loaded(), { type: "DRAW_START" }), { type: "DRAW_SUCCESS", payload: { draw, attendee: alice } });
  const failed = raffleReducer(raffleReducer(raffleReducer(pending, { type: "SPIN_END" }), { type: "CANCEL_START" }), {
    type: "CANCEL_FAILURE",
    error: { response: { data: { message: "SQLSTATE[42S02] missing table" } } },
  });
  assert.equal(failed.status, "pending");
  assert.equal(failed.pendingDraw.id, 50);
  assert.equal(canCancel(failed), true);
  assert.doesNotMatch(failed.error, /SQLSTATE/);
});

test("model lookup details are never shown to users", () => {
  assert.equal(
    getRaffleErrorMessage({ response: { data: { message: "No query results for model [App\\Models\\RaffleDraw] 8" } } }, "Please try again."),
    "Please try again.",
  );
  assert.equal(getRaffleErrorMessage({ response: { data: { message: "Draw is no longer pending." } } }, "Please try again."), "Draw is no longer pending.");
});

test("selectors block duplicate or overlapping lifecycle actions", () => {
  const ready = loaded();
  const pending = raffleReducer(raffleReducer(ready, { type: "DRAW_START" }), { type: "DRAW_SUCCESS", payload: { draw, attendee: alice } });
  const states = [
    raffleReducer(ready, { type: "DRAW_START" }),
    pending,
    raffleReducer(raffleReducer(pending, { type: "SPIN_END" }), { type: "CONFIRM_START" }),
    raffleReducer(raffleReducer(pending, { type: "SPIN_END" }), { type: "CANCEL_START" }),
  ];
  for (const state of states) {
    assert.equal(canStartDraw(state), false);
    assert.equal(canConfirm(state), false);
    assert.equal(canCancel(state), false);
  }
  const settled = raffleReducer(pending, { type: "SPIN_END" });
  assert.equal(canConfirm(settled), true);
  assert.equal(canCancel(settled), true);
  assert.equal(canStartDraw(ready), true);
});
