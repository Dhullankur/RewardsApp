import PropTypes from "prop-types";
import { PAGE_SIZE_OPTIONS } from "../constants";

function DashboardFilters({
  dateFrom,
  dateTo,
  pageSize,
  filteredCount,
  totalCount,
  onDateFromChange,
  onDateToChange,
  onClearDates,
  onPageSizeChange,
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Date from
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Date to
        <input
          type="date"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
        />
      </label>
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
  pageSize: PropTypes.number.isRequired,
  filteredCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onDateFromChange: PropTypes.func.isRequired,
  onDateToChange: PropTypes.func.isRequired,
  onClearDates: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
};

export default DashboardFilters;
