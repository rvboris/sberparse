/**
 * Базовый класс для всех ошибок sberparse
 */
export class SberParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SberParseError";
  }
}

/**
 * Ошибка структуры входного файла
 */
export class InputFileStructureError extends SberParseError {
  constructor(message: string) {
    super(message);
    this.name = "InputFileStructureError";
  }
}

/**
 * Ошибка проверки баланса
 */
export class BalanceVerificationError extends SberParseError {
  constructor(message: string) {
    super(message);
    this.name = "BalanceVerificationError";
  }
}

/**
 * Ошибка пользовательского ввода
 */
export class UserInputError extends SberParseError {
  constructor(message: string) {
    super(message);
    this.name = "UserInputError";
  }
}

/**
 * Ошибка тестирования
 */
export class TestingError extends SberParseError {
  constructor(message: string) {
    super(message);
    this.name = "TestingError";
  }
}
