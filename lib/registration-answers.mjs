function formatRegistrationAnswer(answer) {
  if (
    answer === null
    || answer === undefined
    || answer === ""
    || (Array.isArray(answer) && answer.length === 0)
  ) {
    return "No answer provided";
  }

  if (Array.isArray(answer)) {
    return answer.map(String).join(", ");
  }

  if (typeof answer === "object") {
    return JSON.stringify(answer);
  }

  return String(answer);
}

export function buildAnsweredFormRows(registration) {
  return [...(registration?.answers || [])]
    .sort((first, second) => (first.field?.position ?? 0) - (second.field?.position ?? 0))
    .map(({ answer, field }) => ({
      id: field.id,
      label: field.label,
      answer: formatRegistrationAnswer(answer),
    }));
}
