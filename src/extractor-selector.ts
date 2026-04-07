import { InputFileStructureError, UserInputError } from "./exceptions.js";
import type { Extractor } from "./extractor.js";
import { extractorsList } from "./extractors/index.js";

/**
 * Определяет подходящий экстрактор для текста выписки автоматически
 * @param bankText Текст выписки
 * @returns Класс экстрактора
 * @throws {InputFileStructureError} если ни один экстрактор не подходит
 */
export function determineExtractorAuto(bankText: string): new (bank_text: string) => Extractor {
  const supportedExtractors = extractorsList.filter((ExtractorClass) => {
    try {
      const quickCheck = (
        ExtractorClass as unknown as {
          quickCheck?: (text: string) => boolean;
        }
      ).quickCheck;

      if (quickCheck && !quickCheck(bankText)) {
        return false;
      }

      const extractor = new ExtractorClass(bankText);
      return extractor.checkSupport();
    } catch {
      return false;
    }
  });

  if (supportedExtractors.length === 0) {
    throw new InputFileStructureError(
      "Неизвестный формат выписки, ни один из экстракторов не подходят",
    );
  }

  if (supportedExtractors.length > 1) {
    throw new InputFileStructureError(
      `Непонятный формат выписки. Больше чем один экстрактор говорят, что понимают его: ${supportedExtractors
        .map((e) => e.name)
        .join(", ")}`,
    );
  }

  return supportedExtractors[0];
}

/**
 * Возвращает экстрактор по имени
 * @param extractorName Имя экстрактора
 * @returns Класс экстрактора
 * @throws {UserInputError} если экстрактор не найден
 */
export function determineExtractorByName(
  extractorName: string,
): new (
  bank_text: string,
) => Extractor {
  for (const ExtractorClass of extractorsList) {
    if (ExtractorClass.name === extractorName) {
      return ExtractorClass;
    }
  }

  const availableNames = extractorsList.map((e) => e.name).join(", ");
  throw new UserInputError(
    `Указанный формат файла "${extractorName}" неизвестен. Доступные форматы: ${availableNames}`,
  );
}
