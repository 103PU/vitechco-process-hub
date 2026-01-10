import mammoth from 'mammoth';
import { IFileParser, ParsedContent } from './interfaces';

export class DocxParser implements IFileParser {
    supportedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    async parse(buffer: Buffer): Promise<ParsedContent> {
        try {
            const options = {
                styleMap: [
                    "p[style-name='Heading 1'] => h1:fresh",
                    "p[style-name='Heading 2'] => h2:fresh",
                    "p[style-name='Heading 3'] => h3:fresh",
                    "p[style-name='Normal'] => p:fresh",
                    "b => strong"
                ]
            };
            const result = await mammoth.convertToHtml({ buffer }, options);
            return {
                content: result.value,
                metadata: {
                    messages: result.messages // Warnings from mammoth
                }
            };
        } catch (error) {
            console.error('DocxParser Error:', error);
            throw new Error('Failed to parse DOCX file.');
        }
    }
}
