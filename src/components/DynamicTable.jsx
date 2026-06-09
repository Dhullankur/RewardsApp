import PropTypes from "prop-types";
import { tableRowPropType } from "../propTypes";

function getColumns(rows) {
  if (!rows.length) {
    return [];
  }

  return Object.keys(rows[0]);
}

function createLabel(columnName) {
  return columnName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}

function getRowKey(row) {
  return row.id ?? row.transactionId;
}

function SortIndicator({ column, sortKey, sortDirection, sortColumnMap = {} }) {
  const isActive = column === sortKey || sortColumnMap[column] === sortKey;

  if (!isActive) {
    return (
      <span className="ml-1 inline-flex flex-col text-[10px] leading-none text-slate-400">
        <span>▲</span>
        <span>▼</span>
      </span>
    );
  }

  return (
    <span className="ml-1 text-xs text-slate-900" aria-hidden="true">
      {sortDirection >= 0 ? "▲" : "▼"}
    </span>
  );
}

SortIndicator.propTypes = {
  column: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired,
  sortDirection: PropTypes.number.isRequired,
  sortColumnMap: PropTypes.objectOf(PropTypes.string),
};

function DynamicTable({
  title,
  rows,
  hiddenColumns = [],
  sortKey = "",
  sortDirection = 1,
  onSort,
  sortColumnMap = {},
}) {
  const columns = getColumns(rows).filter(
    (column) => !hiddenColumns.includes(column),
  );
  const isSortable = Boolean(onSort);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border border-slate-200 px-3 py-2 font-semibold text-slate-700"
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => onSort(column)}
                        className="inline-flex items-center gap-0.5 hover:text-slate-900"
                        aria-label={`Sort by ${createLabel(column)}`}
                      >
                        {createLabel(column)}
                        <SortIndicator
                          column={column}
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                          sortColumnMap={sortColumnMap}
                        />
                      </button>
                    ) : (
                      createLabel(column)
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const rowKey = getRowKey(row);

                return (
                  <tr
                    key={rowKey}
                    className="odd:bg-white even:bg-slate-50"
                  >
                    {columns.map((column) => (
                      <td
                        key={`${rowKey}-${column}`}
                        className="border border-slate-200 px-3 py-2 text-slate-700"
                      >
                        {String(row[column])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

DynamicTable.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(tableRowPropType).isRequired,
  hiddenColumns: PropTypes.arrayOf(PropTypes.string),
  sortKey: PropTypes.string,
  sortDirection: PropTypes.number,
  onSort: PropTypes.func,
  sortColumnMap: PropTypes.objectOf(PropTypes.string),
};

export default DynamicTable;
