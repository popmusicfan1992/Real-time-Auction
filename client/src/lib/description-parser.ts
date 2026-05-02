/**
 * Parses a bilingual description string.
 * Format: "English description||VI||Vietnamese description"
 * If no separator found, returns the full string for both languages.
 */
export function getLocalizedDescription(description: string, language: "en" | "vi"): string {
  if (!description) return "";
  
  const separator = "||VI||";
  const parts = description.split(separator);
  
  if (parts.length === 2) {
    return language === "vi" ? parts[1].trim() : parts[0].trim();
  }
  
  // No Vietnamese translation available, return full description
  return description;
}
