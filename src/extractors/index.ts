import type { Extractor } from "../extractor.js";
import { SBER_DEBIT_2604 } from "./sber-debit-2604.js";
import { SBER_DEBIT_2603 } from "./sber-debit-2603.js";

/**
 * Список всех доступных экстракторов
 */
export const extractorsList: Array<new (bank_text: string) => Extractor> = [
  SBER_DEBIT_2604,
  SBER_DEBIT_2603,
];

/**
 * Возвращает список имён экстракторов
 */
export function getListExtractorsInText(): string[] {
  return extractorsList.map((extractor) => extractor.name);
}
