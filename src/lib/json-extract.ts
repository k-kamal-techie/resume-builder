/**
 * Robust JSON extraction from AI-generated text.
 *
 * Tries multiple strategies in order:
 * 1. Parse the entire string as JSON
 * 2. Extract from ```json code fence
 * 3. Balanced brace matching with string awareness
 */

/**
 * Extract and parse JSON from a string that may contain surrounding text.
 * Returns the parsed object, or null if no valid JSON found.
 */
export function extractJSON<T = Record<string, unknown>>(text: string): T | null {
  if (!text || !text.trim()) return null;

  const trimmed = text.trim();

  // Strategy 1: Try parsing the entire string as JSON
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Not pure JSON, continue
  }

  // Strategy 2: Extract from ```json code fence
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // Code fence content isn't valid JSON, continue
    }
  }

  // Strategy 3: Balanced brace matching with string awareness
  const result = extractBalancedJSON(trimmed);
  if (result) {
    try {
      return JSON.parse(result) as T;
    } catch {
      // Extracted text isn't valid JSON
    }
  }

  return null;
}

/**
 * Find the outermost balanced `{...}` in a string,
 * respecting quoted strings and escape characters.
 */
function extractBalancedJSON(text: string): string | null {
  const startIdx = text.indexOf("{");
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (inString) {
      if (ch === stringChar) {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.substring(startIdx, i + 1);
      }
    }
  }

  return null;
}
