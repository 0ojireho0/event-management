import assert from "node:assert/strict";
import test from "node:test";

import { runUserRequest } from "../lib/user-request.mjs";

test("a failed user list request refreshes authentication before returning its 401", async () => {
  const failure = { response: { status: 401 } };
  const calls = [];

  await assert.rejects(
    runUserRequest(async () => {
      calls.push("list");
      throw failure;
    }, async () => {
      calls.push("auth");
    }),
    (error) => error === failure,
  );
  assert.deepEqual(calls, ["list", "auth"]);
});

test("a failed user mutation refreshes authentication and retains its 403 if refresh fails", async () => {
  const failure = { response: { status: 403 } };
  const calls = [];

  await assert.rejects(
    runUserRequest(async () => {
      calls.push("mutation");
      throw failure;
    }, async () => {
      calls.push("auth");
      throw new Error("auth refresh failed");
    }),
    (error) => error === failure,
  );
  assert.deepEqual(calls, ["mutation", "auth"]);
});

test("a validation failure does not refresh authentication", async () => {
  const failure = { response: { status: 422 } };
  let refreshed = false;

  await assert.rejects(
    runUserRequest(async () => {
      throw failure;
    }, async () => {
      refreshed = true;
    }),
    (error) => error === failure,
  );
  assert.equal(refreshed, false);
});
