import * as XLSX from 'xlsx';

/**
 * Parse an Excel (.xlsx) file and extract order data from the known Arabic column layout.
 * Returns an array of raw order objects with the relevant fields.
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to array of arrays (each row is an array)
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length < 2) {
          reject(new Error('Excel file appears to be empty or has no data rows.'));
          return;
        }

        // Column indices (0-based): A=0, C=2, D=3, E=4, S=18, T=19, U=20
        const COL_ORDER_ID = 0;    // A - رقم الطلب
        const COL_NAME = 2;        // C - اسم العميل
        const COL_PHONE = 3;       // D - رقم الجوال
        const COL_CITY = 4;        // E - المدينة
        const COL_SKU = 18;        // S - SKU
        const COL_ADDRESS = 19;    // T - عنوان العميل
        const COL_PRODUCTS = 20;   // U - اسماء المنتجات مع SKU

        // Skip header row (row 0)
        const orders = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const orderId = String(row[COL_ORDER_ID] || '').trim();
          if (!orderId) continue; // Skip empty rows

          orders.push({
            orderId,
            name: String(row[COL_NAME] || '').trim(),
            phone: String(row[COL_PHONE] || '').trim(),
            city: String(row[COL_CITY] || '').trim(),
            sku: String(row[COL_SKU] || '').trim(),
            address: String(row[COL_ADDRESS] || '').trim(),
            products: String(row[COL_PRODUCTS] || '').trim(),
          });
        }

        resolve(orders);
      } catch (err) {
        reject(new Error('Failed to parse Excel file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}
