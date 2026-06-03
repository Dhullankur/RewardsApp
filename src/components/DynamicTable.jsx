import PropTypes from 'prop-types'

function getColumns(rows) {
  if (!rows.length) {
    return []
  }

  return Object.keys(rows[0])
}

function createLabel(columnName) {
  return columnName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase())
}

function DynamicTable({ title, rows }) {
  const columns = getColumns(rows)

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
                    {createLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${title}-${rowIndex}`} className="odd:bg-white even:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${title}-${rowIndex}-${column}`} className="border border-slate-200 px-3 py-2 text-slate-700">
                      {String(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

DynamicTable.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default DynamicTable
