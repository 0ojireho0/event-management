const headerStyle = {
  fontWeight: "bold",
  textColor: "#FFFFFF",
  backgroundColor: "#F6671E",
};

function toEventTime(value, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const dateParts = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]),
  );

  return new Date(Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    dateParts.hour,
    dateParts.minute,
    dateParts.second,
  ));
}

export function createAttendeeWorkbookSheets(exportData, timeZone = "UTC") {
  const columnWidths = exportData.columns.map((column) => ({
    width: column.key === "email" ? 30 : column.key === "registered_at" ? 22 : 24,
  }));

  return exportData.sheets.map((sheetData) => ({
    sheet: sheetData.name,
    stickyRowsCount: 1,
    columns: columnWidths,
    data: [
      exportData.columns.map((column) => ({ value: column.header, ...headerStyle })),
      ...sheetData.rows.map((row) => exportData.columns.map((column) => {
        if (column.key === "registered_at" && row.registered_at) {
          return {
            value: toEventTime(row.registered_at, timeZone),
            type: Date,
            format: "mmm d, yyyy h:mm AM/PM",
          };
        }

        return { value: row[column.key] ?? "" };
      })),
    ],
  }));
}
