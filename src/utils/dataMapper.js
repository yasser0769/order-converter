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
  الرياض: 'Riyadh',
  mecca: 'Mecca',
  makkah: 'Mecca',
  'makkah region': 'Mecca',
  'mecca region': 'Mecca',
  'makkah province': 'Mecca',
  مكة: 'Mecca',
  'مكة المكرمة': 'Mecca',
  madinah: 'Madinah',
  medina: 'Madinah',
  'madinah region': 'Madinah',
  'al madinah': 'Madinah',
  'al madinah region': 'Madinah',
  المدينة: 'Madinah',
  'المدينة المنورة': 'Madinah',
  'eastern province': 'Eastern Province',
  eastern: 'Eastern Province',
  'eastern region': 'Eastern Province',
  'eastern province region': 'Eastern Province',
  الشرقية: 'Eastern Province',
  'المنطقة الشرقية': 'Eastern Province',
  qassim: 'Al Qassim',
  'al qassim': 'Al Qassim',
  القصيم: 'Al Qassim',
  asir: 'Asir',
  aseer: 'Asir',
  عسير: 'Asir',
  tabuk: 'Tabuk',
  تبوك: 'Tabuk',
  hail: 'Hail',
  حائل: 'Hail',
  'northern borders': 'Northern Borders',
  'northern border': 'Northern Borders',
  'الحدود الشمالية': 'Northern Borders',
  jazan: 'Jazan',
  jizan: 'Jazan',
  جازان: 'Jazan',
  najran: 'Najran',
  نجران: 'Najran',
  'al bahah': 'Al Bahah',
  bahah: 'Al Bahah',
  الباحة: 'Al Bahah',
  'al jouf': 'Al Jouf',
  jouf: 'Al Jouf',
  jawf: 'Al Jouf',
  الجوف: 'Al Jouf',
};

const CITY_TO_REGION = {
  riyadh: 'Riyadh',
  الخرج: 'Riyadh',
  'al kharj': 'Riyadh',
  الدرعية: 'Riyadh',
  diriyah: 'Riyadh',

  mecca: 'Mecca',
  makkah: 'Mecca',
  جدة: 'Mecca',
  jeddah: 'Mecca',
  الطائف: 'Mecca',
  taif: 'Mecca',

  madinah: 'Madinah',
  medina: 'Madinah',
  ينبع: 'Madinah',
  yanbu: 'Madinah',

  dammam: 'Eastern Province',
  الدمام: 'Eastern Province',
  khobar: 'Eastern Province',
  الخبر: 'Eastern Province',
  'al khobar': 'Eastern Province',
  dhahran: 'Eastern Province',
  الظهران: 'Eastern Province',
  jubail: 'Eastern Province',
  الجبيل: 'Eastern Province',
  القطيف: 'Eastern Province',
  qatif: 'Eastern Province',
  الاحساء: 'Eastern Province',
  'al ahsa': 'Eastern Province',
  hofuf: 'Eastern Province',

  بريدة: 'Al Qassim',
  buraydah: 'Al Qassim',
  عنيزة: 'Al Qassim',
  unaizah: 'Al Qassim',
};

function normalizeLookup(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[()\[\],._-]/g, ' ')
    .replace(/\s+/g, ' ');
}

function normalizeSaudiRegion(region) {
  const normalized = normalizeLookup(region);
  if (!normalized) return '';

  if (REGION_ALIASES[normalized]) return REGION_ALIASES[normalized];

  const exactMatch = CANONICAL_REGIONS.find(
    (item) => item.toLowerCase() === normalized
  );
  return exactMatch || '';
}

function resolveState(aiState, aiCity, rawCity) {
  const direct = normalizeSaudiRegion(aiState);
  if (direct) return direct;

  const cityNormalized = normalizeLookup(aiCity);
  if (CITY_TO_REGION[cityNormalized]) return CITY_TO_REGION[cityNormalized];

  const rawCityNormalized = normalizeLookup(rawCity);
  if (CITY_TO_REGION[rawCityNormalized]) return CITY_TO_REGION[rawCityNormalized];

  return '';
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
      State: resolveState(ai.state, ai.city, order.city),
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
