
export interface ParsedContent {
    content: string; // HTML or Text content
    metadata: Record<string, any>; // Extra metadata like sheet names, page count, etc.
}

export interface IFileParser {
    supportedMimeTypes: string[];
    parse(buffer: Buffer, originalName: string, mimeType: string): Promise<ParsedContent>;
}
