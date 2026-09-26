export function normalizeRegistrationCode(value) {
  return String(value || "").trim().toUpperCase();
}

export function getCheckInFeedback(errorOrResponse) {
  const status = errorOrResponse?.response?.status ?? errorOrResponse?.status;

  if (status === 201) return { tone: "success", title: "Check-in accepted" };
  if (status === 409) return { tone: "warning", title: "Already checked in", modal: true };
  if (status === 404) return { tone: "error", title: "Registration not found", modal: true };
  if (status === 422) return { tone: "error", title: "Enter a valid registration code" };

  return { tone: "error", title: "Check-in failed" };
}

export function getCheckInErrorDetail(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 404 || typeof message !== "string" || message.startsWith("No query results for model")) {
    return "";
  }

  return message;
}

export function shouldPauseCamera({ submitting, scannedCode, modalOpen }) {
  return Boolean(submitting || scannedCode || modalOpen);
}

export function getCameraErrorMessage(error) {
  const messages = {
    "permission-denied": "Allow camera access in your browser settings, then try again.",
    "no-camera": "No camera was found on this device. Connect one or enter the registration code manually.",
    "in-use": "The camera is being used by another app or browser tab. Close it there, then try again.",
    overconstrained: "The selected camera cannot use the requested settings. Try another camera.",
    "insecure-context": "Camera scanning requires HTTPS or localhost.",
    unsupported: "This browser does not support camera scanning. Enter the registration code manually.",
    aborted: "Camera startup was interrupted. Try again.",
    security: "The browser blocked camera access. Check the site camera permission and try again.",
    "type-error": "The camera could not start with the current settings. Try again.",
    unknown: "The camera could not be started. Try again or enter the registration code manually.",
  };

  return messages[error?.kind] || messages.unknown;
}
