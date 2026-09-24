import assert from "node:assert/strict";
import test from "node:test";

import { finishUserMutation } from "../lib/user-management-state.mjs";

const openState = { open: true, submitting: true, error: "", user: { id: 7 } };

test("a successful mutation closes the dialog and clears transient state", () => {
  assert.deepEqual(finishUserMutation(openState, { ok: true }), {
    open: false,
    submitting: false,
    error: "",
    user: null,
  });
});

test("a failed mutation keeps the dialog and selected user open", () => {
  assert.deepEqual(finishUserMutation(openState, { ok: false, error: "Email is already in use." }), {
    open: true,
    submitting: false,
    error: "Email is already in use.",
    user: { id: 7 },
  });
});
