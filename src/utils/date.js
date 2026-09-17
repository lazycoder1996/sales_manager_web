export function formatDate(date) {
  if (!date) {
    return "—"
  }

  const value = new Date(date)

  if (Number.isNaN(value.getTime())) {
    return "—"
  }

  return value.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  )
}