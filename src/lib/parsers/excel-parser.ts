import * as XLSX from 'xlsx';
import { IFileParser, ParsedContent } from './interfaces';

export class ExcelParser implements IFileParser {
    supportedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];

    async parse(buffer: Buffer): Promise<ParsedContent> {
        try {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            let htmlContent = '';
            const metadata: any = { sheets: [] };

            // Convert each sheet to an HTML table
            for (const sheetName of workbook.SheetNames) {
                const sheet = workbook.Sheets[sheetName];
                const html = XLSX.utils.sheet_to_html(sheet);

                // Wrap in a section for separation
                htmlContent += `
                    <div class="excel-sheet mb-8">
                        <h3 class="text-lg font-bold mb-2">${sheetName}</h3>
                        <div class="overflow-x-auto border rounded-md">
                            ${html}
                        </div>
                    </div>
                `;
                metadata.sheets.push(sheetName);
            }

            return {
                content: htmlContent,
                metadata
            };

        } catch (error) {
            console.error('ExcelParser Error:', error);
            throw new Error('Failed to parse Excel file.');
        }
    }
}
