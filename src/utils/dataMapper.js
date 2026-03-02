/**
 * Pre-extract structured data from address strings using regex,
 * then merge with AI translation results to produce the final output rows.
 */

// Regex-based extraction from Arabic address string
function extractFromAddress(address) {
  const shortAddress = address.match(/العنوان المختصر\s*([A-Z]{4}\d{4})/)?.[1] || '';
  const zipCode = address.match(/الرمز البريدي\s*(\d{5})/)?.[1] || '';
  const neighborhood = address.match(/حي\s+([^،,]+)/)?.[1]?.trim() || '';
  const street = address.match(/شارع\s+([^،,]+)/)?.[1]?.trim() || '';
  return { shortAddress, zipCode, neighborhood, street };
}

// Format phone: prepend 966, remove leading zero
function formatPhone(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('966')) return cleaned;
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  return '966' + cleaned;
}

// Parse product details string into "Qty,SKU|Qty,SKU|" format
function parseOrderDetails(products) {
  if (!products) return '';
  const matches = [...products.matchAll(/\(SKU:\s*(\d+)\).*?\(Qty:\s*(\d+)\)/g)];
  if (matches.length === 0) return '';
  return matches.map((m) => `${m[2]},${m[1]}`).join('|') + '|';
}

const CANONICAL_REGIONS = [
  'Riyadh',
  'Mecca',
  'Madinah',
  'Eastern Province',
  'Al Qassim',
  'Asir',
  'Tabuk',
  'Hail',
  'Northern Borders',
  'Jazan',
  'Najran',
  'Al Bahah',
  'Al Jouf',
];

const REGION_ALIASES = {
  riyadh: 'Riyadh',
  'riyadh region': 'Riyadh',
  mecca: 'Mecca',
  makkah: 'Mecca',
  'makkah region': 'Mecca',
  'mecca region': 'Mecca',
  madinah: 'Madinah',
  medina: 'Madinah',
  'madinah region': 'Madinah',
  'al madinah': 'Madinah',
  'al madinah region': 'Madinah',
  'eastern province': 'Eastern Province',
  eastern: 'Eastern Province',
  'eastern region': 'Eastern Province',
  qassim: 'Al Qassim',
  'al qassim': 'Al Qassim',
  asir: 'Asir',
  aseer: 'Asir',
  tabuk: 'Tabuk',
  hail: 'Hail',
  'northern borders': 'Northern Borders',
  'northern border': 'Northern Borders',
  jazan: 'Jazan',
  jizan: 'Jazan',
  najran: 'Najran',
  'al bahah': 'Al Bahah',
  bahah: 'Al Bahah',
  'al jouf': 'Al Jouf',
  jouf: 'Al Jouf',
  jawf: 'Al Jouf',
};

function normalizeSaudiRegion(region) {
  const normalized = String(region || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  if (!normalized) return '';

  if (REGION_ALIASES[normalized]) return REGION_ALIASES[normalized];

  const exactMatch = CANONICAL_REGIONS.find(
    (item) => item.toLowerCase() === normalized
  );
  return exactMatch || '';
}

/**
 * Map raw orders + AI translations into final CSV-ready row objects.
 */
export function mapOrderData(rawOrders, aiResults) {
  // Index AI results by orderId for quick lookup
  const aiMap = {};
  for (const item of aiResults) {
    aiMap[item.orderId] = item;
  }

  return rawOrders.map((order) => {
    const ai = aiMap[order.orderId] || {};
    const extracted = extractFromAddress(order.address);

    return {
      COrderID: order.orderId,
      FirstName: ai.firstName || '',
      LastName: ai.lastName || '',
      Address: ai.address || '',
      Address2: ai.address2 || extracted.shortAddress || '',
      City: ai.city || order.city || '',
      State: normalizeSaudiRegion(ai.state),
      Zip: ai.zip || extracted.zipCode || '',
      Country: 'SA',
      ShipMethod: 'Shipping',
      Phone: formatPhone(order.phone),
      OrderDetails: parseOrderDetails(order.products),
      GiftWrap: 'n',
      Message: '',
    };
  });
}
