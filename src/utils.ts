export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function isCapitalized(text: string): boolean {
  return text == capitalize(text);
}
