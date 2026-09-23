function eventMatchesCategory(event, category) {
  if (category === "all") return true;

  const eventCategory = (event.category || "").toLowerCase();

  if (category === "corporate") {
    return eventCategory.includes("corporate") || event.id.includes("FIN");
  }

  return eventCategory.includes(category);
}

export function filterEvents(events, category, searchQuery) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return events.filter((event) => {
    if (!eventMatchesCategory(event, category)) return false;
    if (!normalizedSearch) return true;

    const searchableText = `${event.title} ${event.location} ${event.id}`.toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}
