import { CSV_HEADERS } from '../utils/csvExporter';

export default function EditableTable({ rows, setRows }) {
  const handleCellChange = (rowIndex, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      return updated;
    });
  };

  if (!rows || rows.length === 0) return null;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            {CSV_HEADERS.map((header) => (
              <th
                key={header}
                className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap border-b border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {CSV_HEADERS.map((header) => (
                <td key={header} className="px-1 py-1 border-b border-gray-100">
                  <input
                    type="text"
                    value={row[header] ?? ''}
                    onChange={(e) =>
                      handleCellChange(rowIndex, header, e.target.value)
                    }
                    className="w-full min-w-[80px] px-2 py-1 text-sm border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-transparent"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
