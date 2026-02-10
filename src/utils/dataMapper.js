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
      State: ai.state || '',
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
