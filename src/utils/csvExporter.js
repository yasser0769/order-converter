const CSV_HEADERS = [
  'COrderID',
  'FirstName',
  'LastName',
  'Address',
  'Address2',
  'City',
  'State',
  'Zip',
  'Country',
  'ShipMethod',
  'Phone',
  'OrderDetails',
  'GiftWrap',
  'Message',
];

function escapeCSVField(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Convert an array of row objects into a CSV string and trigger a download.
 */
export function downloadCSV(rows, filename = 'orders.csv') {
  const headerLine = CSV_HEADERS.join(',');
  const dataLines = rows.map((row) =>
    CSV_HEADERS.map((h) => escapeCSVField(row[h])).join(',')
  );

  const csvContent = [headerLine, ...dataLines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export { CSV_HEADERS };
