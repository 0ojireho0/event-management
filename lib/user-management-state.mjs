export function finishUserMutation(state, result) {
  if (result.ok) {
    return {
      open: false,
      submitting: false,
      error: "",
      user: null,
    };
  }

  return {
    ...state,
    open: true,
    submitting: false,
    error: result.error,
  };
}
