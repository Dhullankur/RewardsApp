import PropTypes from "prop-types";
import { PAGE_SIZE_OPTIONS } from "../constants";
import { formatPurchaseDateLabel } from "../rewards";

function DateSelect({ label, value, dates, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
      >
        <option value="">All dates</option>
        {dates.map((date) => (
          <option key={date} value={date}>
            {formatPurchaseDateLabel(date)}
          </option>
        ))}
      </select>
    </label>
  );
}

DateSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  dates: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

function DashboardFilters({
  dateFrom,
  dateTo,
  availableDates,
  pageSize,
  filteredCount,
  totalCount,
  onDateFromChange,
  onDateToChange,
  onClearDates,
  onPageSizeChange,
}) {
  const dateToOptions = dateFrom
    ? availableDates.filter((date) => date >= dateFrom)
    : availableDates;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <DateSelect
        label="Date from"
        value={dateFrom}
        dates={availableDates}
        onChange={onDateFromChange}
      />
      <DateSelect
        label="Date to"
        value={dateTo}
        dates={dateToOptions}
        onChange={onDateToChange}
      />
      <button
        type="button"
        onClick={onClearDates}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Clear dates
      </button>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Rows per page
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-slate-500">
        Showing {filteredCount} of {totalCount} transactions
      </p>
    </div>
  );
}

DashboardFilters.propTypes = {
  dateFrom: PropTypes.string.isRequired,
  dateTo: PropTypes.string.isRequired,
  availableDates: PropTypes.arrayOf(PropTypes.string).isRequired,
  pageSize: PropTypes.number.isRequired,
  filteredCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onDateFromChange: PropTypes.func.isRequired,
  onDateToChange: PropTypes.func.isRequired,
  onClearDates: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
};

export default DashboardFilters;
