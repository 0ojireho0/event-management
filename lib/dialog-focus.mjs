export function restoreDialogFocus(event, opener, fallback) {
  const target = opener?.isConnected ? opener : fallback?.isConnected ? fallback : null;
  if (!target) return;

  event.preventDefault();
  target.focus();
}
