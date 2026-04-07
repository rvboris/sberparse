import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Конвертирует PDF файл в текст
 * @param pdf_file_name Путь к PDF файлу
 * @returns Текстовое содержимое
 */
export async function pdfToText(pdf_file_name: string): Promise<string> {
  const dataBuffer = await fs.readFile(pdf_file_name);
  const parser = new PDFParse({ data: dataBuffer });
  try {
    const data = await parser.getText();
    return data.text;
  } finally {
    await parser.destroy();
  }
}

/**
 * Конвертирует PDF файл в текстовый файл
 * @param pdf_file_name Путь к PDF файлу
 * @param txt_output_file_name Путь к выходному текстовому файлу (опционально)
 * @returns Путь к созданному текстовому файлу
 */
export async function pdfToTxtFile(
  pdf_file_name: string,
  txt_output_file_name?: string,
): Promise<string> {
  const text = await pdfToText(pdf_file_name);

  const outputFileName = txt_output_file_name || pdf_file_name.replace(/\.pdf$/i, ".txt");

  await fs.writeFile(outputFileName, text, "utf-8");

  return outputFileName;
}
