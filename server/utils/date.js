function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getWeekBounds(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = (day === 0 ? -6 : 1) - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  return { weekStart: formatDate(monday), weekEnd: formatDate(friday), monday, friday };
}

function getConsecutiveDates(count, endDate = new Date()) {
  const dates = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

module.exports = { formatDate, getWeekBounds, getConsecutiveDates };
