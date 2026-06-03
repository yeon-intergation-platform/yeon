export function createYeonInitials(label: string) {
  const trimmed = label.trim();

  if (!trimmed) {
    return "?";
  }

  return trimmed.slice(0, 2).toUpperCase();
}
