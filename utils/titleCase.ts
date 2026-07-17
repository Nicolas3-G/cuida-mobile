// Title-cases display text that comes from lowercase-normalized data
// (e.g. Firestore city/state query keys like "san francisco").
export function titleCase(text: string): string {
  return text.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}
