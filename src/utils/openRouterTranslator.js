const SYSTEM_PROMPT = `You are a Saudi address and name translator. You will receive order data in JSON format. For each order:
1. If the customer name is in Arabic, transliterate it to English (phonetic, not meaning). If already in English, keep it.
2. Split the name into first and last name. If only one name, use it for both.
3. From the address string, extract:
   - Neighborhood name (حي) → translate to English
   - Street name (شارع) → translate to English
   - Short address code (العنوان المختصر) → keep as-is (e.g., GNMA6281)
   - Zip code (الرمز البريدي) → extract the number
4. Determine the Saudi region/province for the given city.

Return ONLY a JSON array with the results for each order in this exact format:
[
  {
    "orderId": "...",
    "firstName": "...",
    "lastName": "...",
    "address": "... District, ... Street",
    "address2": "XXXX0000",
    "city": "...",
    "state": "... Region",
    "zip": "00000"
  }
]

Important rules:
- For the address field, format as: "[Neighborhood English] District, [Street English] Street"
- If neighborhood or street is missing, omit that part
- The city should be in English
- State should be the Saudi region (e.g., "Riyadh Region", "Makkah Region", "Eastern Region")
- Return ONLY the JSON array, no other text or markdown`;

/**
 * Send all orders to OpenRouter AI for translation in a single batch.
 */
export async function translateWithAI(orders, apiKey, model) {
  const orderData = orders.map((o) => ({
    orderId: o.orderId,
    name: o.name,
    city: o.city,
    address: o.address,
  }));

  const userPrompt = JSON.stringify(orderData, null, 2);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Order Converter',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response content from AI model.');
  }

  // Parse the JSON from the response, handling possible markdown code blocks
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response as JSON. Raw response:\n' + content);
  }
}
