import { IFileParser, ParsedContent } from './interfaces';

export class PdfParser implements IFileParser {
    supportedMimeTypes = [
        'application/pdf'
    ];

    async parse(buffer: Buffer): Promise<ParsedContent> {
        try {
            // Dynamic import to avoid DOMMatrix error on server-side
            // pdf-parse requires canvas which needs DOMMatrix polyfill
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(buffer);

            // We store the raw text. PDF-to-HTML is often brittle.
            // We wrap it in a pre tag for basic display if needed.
            const htmlContent = `
                <div class="pdf-content">
                    <p class="text-sm text-muted-foreground mb-4">
                        <em>PDF Text Extraction (${data.numpages} pages)</em>
                    </p>
                    <pre class="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md overflow-auto border">
${data.text}
                    </pre>
                </div>
            `;

            return {
                content: htmlContent,
                metadata: {
                    pages: data.numpages,
                    info: data.info,
                    textLength: data.text.length
                }
            };
        } catch (error) {
            console.error('PdfParser Error:', error);
            throw new Error('Failed to parse PDF file.');
        }
    }
}
