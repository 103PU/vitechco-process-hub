import { IFileParser } from './interfaces';
import { DocxParser } from './docx-parser';
import { ExcelParser } from './excel-parser';
import { PdfParser } from './pdf-parser';

export class ParserFactory {
    private static parsers: IFileParser[] = [
        new DocxParser(),
        new ExcelParser(),
        new PdfParser()
    ];

    static getParser(mimeType: string): IFileParser | null {
        return this.parsers.find(p => p.supportedMimeTypes.includes(mimeType)) || null;
    }
}
