import assert from "node:assert/strict";
import test from "node:test";

import { buildAnsweredFormRows } from "../lib/registration-answers.mjs";

test("buildAnsweredFormRows orders questions and formats attendee answers", () => {
  const registration = {
    answers: [
      {
        answer: ["Email", "SMS"],
        field: { id: 3, label: "Contact methods", position: 2 },
      },
      {
        answer: "Ana",
        field: { id: 1, label: "First name", position: 0 },
      },
      {
        answer: null,
        field: { id: 2, label: "Department", position: 1 },
      },
    ],
  };

  assert.deepEqual(buildAnsweredFormRows(registration), [
    { id: 1, label: "First name", answer: "Ana" },
    { id: 2, label: "Department", answer: "No answer provided" },
    { id: 3, label: "Contact methods", answer: "Email, SMS" },
  ]);
});

test("buildAnsweredFormRows handles empty and structured answers", () => {
  const registration = {
    answers: [
      {
        answer: [],
        field: { id: 1, label: "Interests", position: 0 },
      },
      {
        answer: { organization: "Acme" },
        field: { id: 2, label: "Company details", position: 1 },
      },
    ],
  };

  assert.deepEqual(buildAnsweredFormRows(registration), [
    { id: 1, label: "Interests", answer: "No answer provided" },
    { id: 2, label: "Company details", answer: '{"organization":"Acme"}' },
  ]);
});
