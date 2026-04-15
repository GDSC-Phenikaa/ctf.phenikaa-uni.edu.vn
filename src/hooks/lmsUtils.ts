export type NormalizedQuestionType =
  | "single_choice"
  | "multi_choice"
  | "true_false"
  | "short_text"
  | "long_text"
  | "numeric"
  | "code";

export function normalizeQuestionType(type?: string): NormalizedQuestionType {
  switch (type) {
    case "single_choice":
    case "multi_choice":
    case "true_false":
    case "short_text":
    case "long_text":
    case "numeric":
    case "code":
      return type;
    case "mcq":
      return "single_choice";
    case "text":
      return "short_text";
    default:
      return "single_choice";
  }
}

export function parseQuestionOptions(options?: string | string[] | null): string[] {
  if (!options) return [];

  if (Array.isArray(options)) {
    return options.map((opt) => String(opt)).filter(Boolean);
  }

  const trimmed = options.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((opt) => String(opt)).filter(Boolean);
      }
    } catch {
      // Fall through to CSV parsing if JSON parsing fails.
    }
  }

  return trimmed
    .split(",")
    .map((opt) => opt.trim())
    .filter(Boolean);
}

export function toTimestampLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}