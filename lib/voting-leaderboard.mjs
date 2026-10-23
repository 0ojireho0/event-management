const podiumByRank = { 1: "first", 2: "second", 3: "third" };

export function getVotingResultsPayload(response) {
  return response.data;
}

export function getLeaderboardRefreshInterval({ mode, status, visibilityState }) {
  return mode === "manual" && status === "active" && visibilityState === "visible" ? 3000 : 0;
}

export function getLeaderboardLifecycle({ eventSlug, subjectSlug, mode, status }) {
  if (!["manual", "nomination"].includes(mode) || !["draft", "active"].includes(status)) return null;
  const nomination = mode === "nomination";
  const action = status === "active" ? "close" : nomination ? "open" : "activate";
  return {
    action,
    url: `/api/events/${encodeURIComponent(eventSlug)}/${nomination ? "nominations" : "voting-subjects"}/${encodeURIComponent(subjectSlug)}/${action}`,
    label: status === "active" ? `Close ${nomination ? "nominations" : "voting"}` : nomination ? "Open nominations" : "Activate voting",
  };
}

function isNominationSnapshot(snapshot, eventId, subjectId) {
  const nonnegative = (value) => Number.isFinite(value) && value >= 0;
  const count = (value) => Number.isSafeInteger(value) && value >= 0;
  return Boolean(snapshot && String(snapshot.event?.id) === String(eventId)
    && String(snapshot.subject?.id) === String(subjectId)
    && ["draft", "active", "closed"].includes(snapshot.subject.status)
    && typeof snapshot.event.title === "string" && typeof snapshot.subject.title === "string"
    && count(snapshot.total_votes) && count(snapshot.total_registrations)
    && nonnegative(snapshot.participation_percentage)
    && Array.isArray(snapshot.contestants)
    && snapshot.contestants.every((row) => row && Number.isSafeInteger(row.id) && row.id > 0
      && typeof row.name === "string" && count(row.display_order) && count(row.votes)
      && nonnegative(row.percentage) && row.percentage <= 100));
}

export function subscribeToNominationLeaderboard({ echo, channelName, eventId, subjectId, mode, status, onSnapshot, revalidate, onStatus }) {
  if (mode !== "nomination" || status !== "active" || !eventId || !subjectId) return () => {};
  if (!echo) {
    onStatus("unavailable");
    return () => {};
  }

  let disposed = false;
  let recovery = 0;
  const eventName = ".App\\Events\\NominationStatisticsUpdated";
  const channel = echo.private(channelName);
  onStatus("connecting");
  const snapshotReceived = (snapshot) => {
    if (!disposed && isNominationSnapshot(snapshot, eventId, subjectId)) onSnapshot(snapshot);
  };
  const disconnected = () => {
    recovery++;
    if (!disposed) onStatus("disconnected");
  };
  channel.listen(eventName, snapshotReceived);
  channel.error(disconnected);
  channel.subscribed(async () => {
    if (disposed) return;
    const attempt = ++recovery;
    onStatus("recovering");
    try {
      // Also recover on the first subscription to cover the initial REST/auth gap.
      await revalidate();
      if (!disposed && attempt === recovery) onStatus("connected");
    } catch {
      if (!disposed && attempt === recovery) onStatus("disconnected");
    }
  });
  const stopConnectionChanges = echo.connector.onConnectionChange((state) => {
    if (disposed) return;
    if (state === "connected" || state === "connecting") {
      onStatus("connecting");
    } else {
      disconnected();
    }
  });

  return () => {
    if (disposed) return;
    disposed = true;
    recovery++;
    stopConnectionChanges();
    channel.stopListening(eventName, snapshotReceived);
    echo.leave(channelName);
  };
}

export function getRankedContestants(contestants) {
  if (!Array.isArray(contestants)) return [];

  let rank = 0;
  let previousVotes;

  return contestants.map((contestant, index) => {
    if (index === 0 || contestant.votes !== previousVotes) rank = index + 1;
    previousVotes = contestant.votes;
    return { ...contestant, rank, podium: podiumByRank[rank] || null };
  });
}
