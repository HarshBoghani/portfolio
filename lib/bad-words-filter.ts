/**
 * Profanity filter using bad-words.
 * Used for todo title validation (client + server).
 */

import { Filter } from 'bad-words';

let filterInstance: Filter | null = null;

function getFilter(): Filter {
  if (!filterInstance) {
    filterInstance = new Filter();
  }
  return filterInstance;
}

/** Returns true if the text contains profanity */
export function isProfane(text: string): boolean {
  if (!text?.trim()) return false;
  return getFilter().isProfane(text);
}
