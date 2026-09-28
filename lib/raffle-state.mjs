const safeMessages = new Set([
  "No eligible attendees remain.",
  "Draw is no longer pending.",
  "Registration is no longer eligible.",
]);

export function createRaffleRequestTracker() {
  let snapshotIdentity = {};
  let mutationActive = false;
  let disposed = false;
  let pendingDrawId = null;

  return {
    snapshotToken() {
      return mutationActive || disposed ? null : snapshotIdentity;
    },
    shouldApplySnapshot(token) {
      return !disposed && !mutationActive && token !== null && token === snapshotIdentity;
    },
    canRefresh() {
      return !disposed && !mutationActive;
    },
    beginMutation() {
      if (mutationActive || disposed) return false;
      mutationActive = true;
      snapshotIdentity = {};
      return true;
    },
    settleMutation() {
      mutationActive = false;
      snapshotIdentity = {};
    },
    setPendingDraw(drawId) {
      pendingDrawId = drawId ?? null;
    },
    dispose() {
      disposed = true;
    },
    resume() {
      disposed = false;
    },
    takeCleanupDrawId() {
      if (!disposed || mutationActive || pendingDrawId === null) return null;
      const drawId = pendingDrawId;
      pendingDrawId = null;
      return drawId;
    },
  };
}

export function getRaffleErrorMessage(error, fallback = "The raffle could not be updated. Please try again.") {
  const message = error?.response?.data?.message;
  return safeMessages.has(message) ? message : fallback;
}

export function createRaffleState() {
  return {
    status: "loading",
    event: null,
    eligibleAttendees: [],
    eligibleCount: 0,
    pendingDraw: null,
    selectedAttendee: null,
    lastWinner: null,
    winners: [],
    error: null,
  };
}

function availableStatus(attendees, winners) {
  if (attendees.length > 0) return "ready";
  return winners.length > 0 ? "exhausted" : "empty";
}

export function canStartDraw(state) {
  return ["ready", "confirmed", "error"].includes(state.status)
    && !state.pendingDraw
    && state.eligibleAttendees.length > 0;
}

export function canConfirm(state) {
  return state.status === "pending" && Boolean(state.pendingDraw && state.selectedAttendee);
}

export function canCancel(state) {
  return state.status === "pending" && Boolean(state.pendingDraw && state.selectedAttendee);
}

export function getWheelAttendees(state) {
  const selected = state.selectedAttendee;
  if (!selected || state.eligibleAttendees.some((attendee) => String(attendee.registration_id) === String(selected.registration_id))) {
    return state.eligibleAttendees;
  }
  return [...state.eligibleAttendees, selected];
}

export function raffleReducer(state, action) {
  switch (action.type) {
    case "LOAD_SUCCESS": {
      if (["drawing", "spinning", "confirming", "cancelling"].includes(state.status)) return state;
      const payload = action.payload;
      const attendees = payload.eligible_attendees || [];
      const winners = payload.winners || [];
      const pending = payload.pending_draw;
      return {
        ...state,
        status: pending ? "pending" : availableStatus(attendees, winners),
        event: payload.event,
        eligibleAttendees: attendees,
        eligibleCount: payload.eligible_count ?? attendees.length,
        pendingDraw: pending ? { id: pending.id, selected_at: pending.selected_at, expires_at: pending.expires_at } : null,
        selectedAttendee: pending ? {
          registration_id: pending.registration_id,
          first_name: pending.first_name,
          last_name: pending.last_name,
          masked_email: pending.masked_email,
        } : null,
        lastWinner: null,
        winners,
        error: null,
      };
    }
    case "LOAD_FAILURE":
      if (["drawing", "spinning", "confirming", "cancelling"].includes(state.status)) return state;
      return { ...state, status: "error", error: getRaffleErrorMessage(action.error, "The raffle could not be loaded. Please try again.") };
    case "DRAW_START":
      return canStartDraw(state) ? { ...state, status: "drawing", lastWinner: null, error: null } : state;
    case "DRAW_SUCCESS":
      if (state.status !== "drawing") return state;
      return { ...state, status: "spinning", pendingDraw: action.payload.draw, selectedAttendee: action.payload.attendee, error: null };
    case "DRAW_FAILURE":
      return state.status === "drawing"
        ? { ...state, status: "error", error: getRaffleErrorMessage(action.error, "The draw could not be started. Please try again.") }
        : state;
    case "SPIN_END":
      return state.status === "spinning" ? { ...state, status: "pending" } : state;
    case "CONFIRM_START":
      return canConfirm(state) ? { ...state, status: "confirming", error: null } : state;
    case "CONFIRM_SUCCESS": {
      if (state.status !== "confirming") return state;
      const winner = action.payload.winner;
      const attendees = state.eligibleAttendees.filter((attendee) => String(attendee.registration_id) !== String(winner.registration_id));
      return {
        ...state,
        status: "confirmed",
        eligibleAttendees: attendees,
        eligibleCount: attendees.length,
        pendingDraw: null,
        selectedAttendee: null,
        lastWinner: winner,
        winners: [winner, ...state.winners.filter((item) => item.id !== winner.id)].slice(0, 100),
        error: null,
      };
    }
    case "CONFIRM_FAILURE":
      return state.status === "confirming"
        ? { ...state, status: "pending", error: getRaffleErrorMessage(action.error, "The winner could not be confirmed. Please try again.") }
        : state;
    case "CANCEL_START":
      return canCancel(state) ? { ...state, status: "cancelling", error: null } : state;
    case "CANCEL_SUCCESS": {
      if (state.status !== "cancelling") return state;
      const attendee = action.payload.attendee;
      const attendees = state.eligibleAttendees.some((item) => String(item.registration_id) === String(attendee.registration_id))
        ? state.eligibleAttendees
        : [...state.eligibleAttendees, attendee];
      return {
        ...state,
        status: availableStatus(attendees, state.winners),
        eligibleAttendees: attendees,
        eligibleCount: attendees.length,
        pendingDraw: null,
        selectedAttendee: null,
        error: null,
      };
    }
    case "CANCEL_FAILURE":
      return state.status === "cancelling"
        ? { ...state, status: "pending", error: getRaffleErrorMessage(action.error, "The draw could not be cancelled. Please try again.") }
        : state;
    default:
      return state;
  }
}
