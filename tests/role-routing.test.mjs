import assert from "node:assert/strict";
import test from "node:test";

import { canAccessRoute, getNavigationForRole, getRoleHome } from "../lib/role-routing.mjs";

test("role homes are exact and unknown roles have no protected destination", () => {
  assert.equal(getRoleHome("Admin"), "/");
  assert.equal(getRoleHome("Scanner"), "/scanner");
  assert.equal(getRoleHome("admin"), null);
  assert.equal(getRoleHome(null), null);
});

test("admin and scanner routes are mutually exclusive", () => {
  assert.equal(canAccessRoute("Admin", "/"), true);
  assert.equal(canAccessRoute("Admin", "/manage-users"), true);
  assert.equal(canAccessRoute("Admin", "/scanner"), false);
  assert.equal(canAccessRoute("Scanner", "/scanner"), true);
  assert.equal(canAccessRoute("Scanner", "/"), false);
  assert.equal(canAccessRoute("Scanner", "/manage-users"), false);
  assert.equal(canAccessRoute("Operator", "/scanner"), false);
});

test("each supported role receives only its own navigation", () => {
  assert.deepEqual(getNavigationForRole("Admin"), [
    { label: "Dashboard", href: "/" },
  ]);
  assert.deepEqual(getNavigationForRole("Scanner"), [
    { label: "Check In & Scanner", href: "/scanner" },
  ]);
  assert.deepEqual(getNavigationForRole("Operator"), []);
});
