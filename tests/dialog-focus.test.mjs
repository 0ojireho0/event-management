import assert from "node:assert/strict";
import test from "node:test";

import { restoreDialogFocus } from "../lib/dialog-focus.mjs";

test("closing a dialog focuses its connected invoking button", () => {
  const calls = [];
  const event = { preventDefault: () => calls.push("prevent default") };
  const opener = { isConnected: true, focus: () => calls.push("opener") };
  const fallback = { isConnected: true, focus: () => calls.push("fallback") };

  restoreDialogFocus(event, opener, fallback);

  assert.deepEqual(calls, ["prevent default", "opener"]);
});

test("closing after a row is deleted focuses Add Scanner", () => {
  const calls = [];
  const event = { preventDefault: () => calls.push("prevent default") };
  const removedButton = { isConnected: false, focus: () => calls.push("removed button") };
  const addButton = { isConnected: true, focus: () => calls.push("Add Scanner") };

  restoreDialogFocus(event, removedButton, addButton);

  assert.deepEqual(calls, ["prevent default", "Add Scanner"]);
});
