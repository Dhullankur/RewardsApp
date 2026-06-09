import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const API_DATE_FORMAT = "MMM-DD-YYYY";
export const ISO_DATE_FORMAT = "YYYY-MM-DD";
export const MAX_DATE_RANGE_DAYS = 90;

export function parseToDayjs(dateValue) {
  if (!dateValue) {
    return null;
  }

  const isoDate = dayjs(dateValue, ISO_DATE_FORMAT, true);
  if (isoDate.isValid()) {
    return isoDate;
  }

  const apiDate = dayjs(dateValue, API_DATE_FORMAT, true);
  return apiDate.isValid() ? apiDate : null;
}

export function toIsoDate(dateValue) {
  const parsedDate = parseToDayjs(dateValue);
  return parsedDate ? parsedDate.format(ISO_DATE_FORMAT) : "";
}

export function formatApiDate(dateValue) {
  const parsedDate = parseToDayjs(dateValue);
  return parsedDate ? parsedDate.format(API_DATE_FORMAT) : String(dateValue ?? "");
}

export function getDefaultDateRange(referenceDate = dayjs()) {
  return {
    dateFrom: referenceDate
      .subtract(MAX_DATE_RANGE_DAYS - 1, "day")
      .format(ISO_DATE_FORMAT),
    dateTo: referenceDate.format(ISO_DATE_FORMAT),
  };
}

export function getDateRangeDayCount(dateFrom, dateTo) {
  const startDate = parseToDayjs(dateFrom);
  const endDate = parseToDayjs(dateTo);

  if (!startDate || !endDate || endDate.isBefore(startDate)) {
    return 0;
  }

  return endDate.diff(startDate, "day") + 1;
}

export function isDateRangeWithinLimit(dateFrom, dateTo, maxDays = MAX_DATE_RANGE_DAYS) {
  const dayCount = getDateRangeDayCount(dateFrom, dateTo);
  return dayCount > 0 && dayCount <= maxDays;
}

export function getMonthKey(dateValue) {
  const parsedDate = parseToDayjs(dateValue);
  return parsedDate ? parsedDate.format("YYYY-MM") : "";
}

export function getMonthStartApiDate(dateValue) {
  const parsedDate = parseToDayjs(dateValue);
  return parsedDate
    ? parsedDate.startOf("month").format(API_DATE_FORMAT)
    : "";
}

export function getRecentMonthKey(transactions) {
  return transactions.reduce((latestMonthKey, transaction) => {
    const monthKey = getMonthKey(transaction.purchaseDate);

    if (!monthKey) {
      return latestMonthKey;
    }

    return !latestMonthKey || monthKey > latestMonthKey
      ? monthKey
      : latestMonthKey;
  }, "");
}

export function filterTransactionsToMonth(transactions, monthKey) {
  if (!monthKey) {
    return transactions;
  }

  return transactions.filter(
    (transaction) => getMonthKey(transaction.purchaseDate) === monthKey,
  );
}
