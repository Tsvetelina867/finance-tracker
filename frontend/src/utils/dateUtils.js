export function formatDate(dateValue) {
  if (!dateValue) return "";

  let day, month, year;

  if (Array.isArray(dateValue)) {
    if (dateValue.length !== 3) return "";
    [year, month, day] = dateValue;
  } else if (typeof dateValue === "string") {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    day = date.getUTCDate();
    month = date.getUTCMonth() + 1;
    year = date.getUTCFullYear();
  } else if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return "";
    day = dateValue.getUTCDate();
    month = dateValue.getUTCMonth() + 1;
    year = dateValue.getUTCFullYear();
  } else {
    return "";
  }

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}
