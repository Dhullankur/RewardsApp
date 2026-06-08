import { useMemo } from "react";
import PropTypes from "prop-types";
import DynamicTable from "./DynamicTable";
import Pagination from "./Pagination";
import { getPageRows, sortTableRows } from "../rewards";

function TableSection({
  title,
  rows,
  page,
  onPageChange,
  pageSize,
  sortKey,
  sortDirection,
  onSortKeyChange,
  onSortDirectionChange,
  hiddenColumns,
  sortColumnMap = {},
}) {
  const sortedRows = useMemo(
    () => sortTableRows(rows, sortKey, sortDirection),
    [rows, sortKey, sortDirection],
  );

  const paginatedRows = useMemo(
    () => getPageRows(sortedRows, page, pageSize),
    [sortedRows, page, pageSize],
  );

  const handleSort = (column) => {
    const resolvedColumn = sortColumnMap[column] ?? column;

    if (sortKey === resolvedColumn) {
      onSortDirectionChange(sortDirection * -1);
    } else {
      onSortKeyChange(resolvedColumn);
      onSortDirectionChange(1);
    }

    onPageChange(1);
  };

  return (
    <section>
      <DynamicTable
        title={title}
        rows={paginatedRows.rows}
        hiddenColumns={hiddenColumns}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        sortColumnMap={sortColumnMap}
      />
      <Pagination
        currentPage={paginatedRows.currentPage}
        totalPages={paginatedRows.totalPages}
        onPageChange={onPageChange}
      />
    </section>
  );
}

TableSection.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  page: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  sortKey: PropTypes.string.isRequired,
  sortDirection: PropTypes.number.isRequired,
  onSortKeyChange: PropTypes.func.isRequired,
  onSortDirectionChange: PropTypes.func.isRequired,
  hiddenColumns: PropTypes.arrayOf(PropTypes.string),
  sortColumnMap: PropTypes.objectOf(PropTypes.string),
};

TableSection.defaultProps = {
  hiddenColumns: [],
  sortColumnMap: {},
};

export default TableSection;
