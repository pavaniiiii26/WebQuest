/**
 * LLM service — streams a structured travel itinerary from Claude.
 *
 * Claude is instructed to return ONLY valid JSON matching the itinerary schema.
 * It must ONLY use the hotels/attractions we provide — no hallucination.
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are TravelGenie, an expert travel planner. 
Your job is to create a detailed, day-by-day travel itinerary using ONLY the hotel and attraction data provided to you.

CRITICAL RULES:
1. You MUST NOT invent, guess, or hallucinate any hotel names, prices, attraction names, descriptions, or addresses.
2. Every hotel and attraction you reference MUST appear VERBATIM in the input data provided.
3. If there is insufficient data to fill a day, say so honestly in the relevant day's notes field.
4. Return ONLY valid JSON — no markdown, no prose, no code fences. Just the raw JSON object.
5. The JSON must exactly match the schema provided.

OUTPUT SCHEMA (return only this, nothing else):
{
  "summary": "A 2-3 sentence overview of the trip",
  "destinations": ["city names covered"],
  "totalDays": <number>,
  "days": [
    {
      "day": <number>,
      "date": "<optional ISO date string if dates were given>",
      "theme": "<theme for the day, e.g. 'Beaches & Relaxation'>",
      "location": "<city/destination>",
      "attractions": [
        {
          "name": "<exact name from data>",
          "category": "<category>",
          "rating": <number or null>,
          "description": "<description from data, or empty string if none>",
          "address": "<address from data>",
          "imageUrl": "<imageUrl from data>"
        }
      ],
      "suggestedHotel": {
        "name": "<exact name from data>",
        "pricePerNight": <number or null>,
        "currency": "<currency code>",
        "rating": <number or null>,
        "url": "<url from data>",
        "imageUrl": "<imageUrl from data>"
      },
      "estimatedDailyCost": <number in USD, or null if unknown>,
      "notes": "<any caveats, e.g. 'Limited hotel data available for this city'>"
    }
  ],
  "budgetBreakdown": {
    "accommodation": <total USD for all nights>,
    "food": <estimated total food cost>,
    "activities": <estimated total activities cost>,
    "transport": <estimated transport>,
    "total": <sum of all above>
  },
  "tips": ["<practical travel tip 1>", "<tip 2>", "<tip 3>"]
}`;

/**
 * Build the user prompt from scraped data.
 */
function buildUserPrompt(destinations, scrapedData, options) {
  const { dates, budgetLevel } = options;
  const dateInfo = dates?.start ? `Travel dates: ${dates.start} to ${dates.end || 'open-ended'}` : 'Dates: flexible';
  const budget = budgetLevel ? `Budget level: ${budgetLevel}` : 'Budget level: mid-range';

  let prompt = `Create a travel itinerary for the following destinations: ${destinations.join(', ')}.
${dateInfo}
${budget}

Here is the REAL, SCRAPED data you must use. Do not use any data not listed here.

`;

  for (const [destination, data] of Object.entries(scrapedData)) {
    prompt += `\n=== ${destination.toUpperCase()} ===\n`;

    if (data.hotels?.length > 0) {
      prompt += `\nHOTELS (${data.hotels.length} found):\n`;
      prompt += JSON.stringify(data.hotels.slice(0, 8), null, 2);
    } else {
      prompt += `\nHOTELS: No hotel data available for ${destination}.\n`;
    }

    if (data.attractions?.length > 0) {
      prompt += `\n\nATTRACTIONS (${data.attractions.length} found):\n`;
      prompt += JSON.stringify(data.attractions.slice(0, 12), null, 2);
    } else {
      prompt += `\n\nATTRACTIONS: No attraction data available for ${destination}.\n`;
    }
  }

  prompt += `\n\nNow create the full itinerary JSON. Remember: ONLY use data from the lists above. Return raw JSON only.`;
  return prompt;
}

/**
 * Stream an itinerary from Claude.
 * @param {string[]} destinations
 * @param {object} scrapedData — { [destination]: { hotels, attractions } }
 * @param {object} options — { dates, budgetLevel }
 * @param {function} onChunk — called with each text chunk as it arrives
 * @returns {Promise<string>} full accumulated text
 */
export async function streamItinerary(destinations, scrapedData, options, onChunk) {
  const userPrompt = buildUserPrompt(destinations, scrapedData, options);

  let fullText = '';

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta?.type === 'text_delta'
    ) {
      const text = chunk.delta.text;
      fullText += text;
      if (onChunk) onChunk(text);
    }
  }

  return fullText;
}

/**
 * Parse Claude's JSON output with one retry on failure.
 */
export function parseGuideJSON(rawText) {
  // Strip any accidental markdown fences
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  return JSON.parse(cleaned);
}
