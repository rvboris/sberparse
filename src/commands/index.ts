import { Args, Command, Flags } from "@oclif/core";
import { convertPdf } from "../converter.js";
import { SberParseError } from "../exceptions.js";
import { extractorsList } from "../extractors/index.js";
import { logger } from "../logger.js";

export default class Convert extends Command {
  static description = "Конвертация выписок Сбербанка из PDF в JSON/CSV";

  static args = {
    inputFile: Args.string({
      description: "Входной PDF файл",
      required: true,
    }),
  };

  static flags = {
    output: Flags.string({
      char: "o",
      description: "Имя выходного файла (без расширения)",
    }),
    format: Flags.string({
      char: "f",
      description: `Принудительно использовать формат (${extractorsList
        .map((e) => e.name)
        .join(", ")})`,
    }),
    type: Flags.string({
      char: "t",
      description: "Тип выходного файла: json или csv",
      options: ["json", "csv"],
      default: "csv",
    }),
    reverse: Flags.boolean({
      char: "r",
      description: "Изменить порядок транзакций на обратный",
      default: false,
    }),
    balanceCheck: Flags.boolean({
      description: "Игнорировать результаты сверки баланса",
      allowNo: true,
      default: true,
    }),
    interm: Flags.boolean({
      description: "Сохранить промежуточный текстовый файл",
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Convert);

    try {
      await convertPdf(args.inputFile, {
        output: flags.output,
        format: flags.format,
        type: flags.type as "json" | "csv",
        reverse: flags.reverse,
        balance_check: flags.balanceCheck,
        interm: flags.interm,
      });
    } catch (error) {
      if (error instanceof SberParseError) {
        logger.error`Ошибка: ${error.message}`;
        this.error(error.message, { exit: 1 });
      } else {
        logger.error`Неожиданная ошибка: ${error}`;
        this.error("Unexpected error", { exit: 1 });
      }
    }
  }
}
