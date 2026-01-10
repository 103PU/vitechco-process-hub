
/**
 * Text Processing Utilities for Classification logic.
 * Extracted from ClassificationService to allow for independent testing.
 */

export const KNOWN_BRANDS = [
    'RICOH', 'TOSHIBA', 'CANON', 'SHARP', 'HP',
    'KONICA MINOLTA', 'KONICA', 'MINOLTA',
    'KYOCERA', 'BROTHER', 'EPSON', 'XEROX', 'FUJI XEROX',
    'SAMSUNG', 'PANASONIC', 'LEXMARK', 'OKI'
];

export const KNOWN_SERIES = [
    'MPC', 'MPW', 'MP', 'IM', 'SP', 'Pro C',
    'e-Studio', 'iR-ADV', 'iR'
];

export const JUNK_KEYWORDS = [
    'TEST', 'MÁY', 'MAY', 'COPY', 'PRINTER', 'SCAN', 'OFFICE',
    'NEW', 'OLD', 'A4', 'A3', 'COLOR', 'BW', 'FIX', 'ERROR'
];

/**
 * Extracts a canonical brand name from a raw string (folder name or text).
 * Returns null if no valid brand is found in the whitelist.
 */
export function cleanAndExtractBrand(rawInput: string): string | null {
    if (!rawInput) return null;
    const upper = rawInput.toUpperCase();

    // 1. Direct Whitelist Check
    for (const known of KNOWN_BRANDS) {
        // We look for word boundaries or distinct presence
        // e.g. "TEST MÁY RICOH" contains "RICOH"
        if (upper.includes(known)) {
            // Return formatted name
            if (known === 'KONICA' || known === 'MINOLTA' || known === 'KONICA MINOLTA') return 'Konica Minolta';
            if (known === 'HP') return 'HP';
            if (known === 'OKI') return 'Oki';
            if (known === 'FUJI XEROX') return 'Xerox';
            // Title Case for others (Ricoh, Canon...)
            return known.charAt(0) + known.slice(1).toLowerCase();
        }
    }
    return null;
}

/**
 * Expands a complex string like "MPC 3054-4054" into ["MPC 3054", "MPC 4054"]
 * Or "E-STUDIO-5516AC-6516AC" into ["e-Studio 5516AC", "e-Studio 6516AC"]
 */
export function expandModelNames(rawInput: string): string[] {
    if (!rawInput) return [];
    const results: string[] = [];

    // Known series patterns that we want to standardize
    // Note: These regexes expect the input to be JUST the model part (e.g. "MPC 3054-4054")
    const seriesPatterns = [
        { regex: /^(MPC)\s*(.+)$/i, series: 'MPC' },
        { regex: /^(MPW)\s*(.+)$/i, series: 'MPW' },
        { regex: /^(MP)\s*(.+)$/i, series: 'MP' },
        { regex: /^(IM)\s*(.+)$/i, series: 'IM' },
        { regex: /^(SP)\s*(.+)$/i, series: 'SP' },
        { regex: /^(e-?Studio)\s*(.+)$/i, series: 'e-Studio' },
        { regex: /^(iR-?ADV)\s*(.+)$/i, series: 'iR-ADV' },
        { regex: /^(iR)\s*(.+)$/i, series: 'iR' },
        { regex: /^(Pro\s*C)\s*(.+)$/i, series: 'Pro C' },
    ];

    let prefix = '';
    let numberPart = rawInput;

    // Try to match known series
    for (const p of seriesPatterns) {
        const match = rawInput.match(p.regex);
        if (match) {
            prefix = p.series;
            numberPart = match[2];
            break;
        }
    }

    // If no known series found, try generic Header + Numbers pattern
    if (!prefix) {
        const genericMatch = rawInput.match(/^([a-zA-Z\s\-\.]+)(\d.*)$/);
        if (genericMatch) {
            prefix = genericMatch[1].trim();
            numberPart = genericMatch[2];
        }
    }

    // Split by common delimiters: -, /, ,, whitespace
    // This handles "5516AC-6516AC-7516AC" and "3054/4054/5054"
    const tokens = numberPart.split(/[\-\/\,\s]+/).map(s => s.trim()).filter(s => /\d/.test(s) && s.length >= 2);

    if (tokens.length > 0 && prefix) {
        for (const token of tokens) {
            // Remove any leading dashes or special chars from token
            const cleanToken = token.replace(/^[\-\_]+/, '');
            if (cleanToken) {
                results.push(`${prefix} ${cleanToken}`);
            }
        }
    } else if (rawInput.trim().length > 2) {
        // Fallback: return original if nothing else worked
        results.push(rawInput.trim());
    }

    return Array.from(new Set(results));
}

export function extractMetadataFromName(fileName: string): { brand?: string, seriesList: string[], models: string[] } {
    // Normalize
    const name = fileName.toUpperCase();
    let brand: string | undefined;
    const seriesList: string[] = [];
    const models: string[] = [];

    // 1. Extract Brand
    brand = cleanAndExtractBrand(name) ?? undefined;

    // 2. KNOWN SERIES PATTERNS - Find ALL matches, not just first
    // Uses simpler patterns that work with Vietnamese text and handle both "MP7001" and "MP 7001"
    const SERIES_PATTERNS = [
        { pattern: /MPC\s*(\d[\d\-\/\,]*)/gi, series: 'MPC', brand: 'Ricoh' },
        { pattern: /MPW\s*(\d[\d\-\/\,]*)/gi, series: 'MPW', brand: 'Ricoh' },
        { pattern: /MP\s*(\d[\d\-\/\,]*)/gi, series: 'MP', brand: 'Ricoh' },
        { pattern: /IM\s*(\d[\d\-\/\,]*)/gi, series: 'IM', brand: 'Ricoh' },
        { pattern: /SP\s*(\d[\d\-\/\,]*)/gi, series: 'SP', brand: 'Ricoh' },
        { pattern: /PRO\s*C\s*(\d[\d\-\/\,]*)/gi, series: 'Pro C', brand: 'Ricoh' },
        { pattern: /E-?STUDIO\s*(\d[\d\-\/\,]*)/gi, series: 'e-Studio', brand: 'Toshiba' },
        { pattern: /IR-?ADV\s*(\d[\d\-\/\,]*)/gi, series: 'iR-ADV', brand: 'Canon' },
        { pattern: /IR\s*(\d[\d\-\/\,]*)/gi, series: 'iR', brand: 'Canon' },
    ];

    // Track which series we've already found and their positions to avoid duplicates
    const foundSeries = new Set<string>();
    const foundPositions = new Map<number, string>(); // position -> series found there

    for (const { pattern, series, brand: inferredBrand } of SERIES_PATTERNS) {
        let match;
        // Reset regex lastIndex for each pattern
        pattern.lastIndex = 0;

        while ((match = pattern.exec(name)) !== null) {
            const matchPos = match.index;

            // Skip if we already found a longer series at this position
            // e.g., if MPC found at pos 5, don't add MP at pos 5
            const existingAtPos = foundPositions.get(matchPos);
            if (existingAtPos && existingAtPos.length >= series.length) {
                continue;
            }

            // Skip MP if MPC already found at same position (MPC includes MP)
            if (series === 'MP' && foundPositions.get(matchPos) === 'MPC') {
                continue;
            }
            if (series === 'iR' && foundPositions.get(matchPos) === 'iR-ADV') {
                continue;
            }

            // Add to found series (only once per series type)
            if (!foundSeries.has(series)) {
                foundSeries.add(series);
                foundPositions.set(matchPos, series);
                seriesList.push(series);

                // Infer brand if not yet set
                if (!brand) brand = inferredBrand;

                // Extract model numbers if present
                if (match[1]) {
                    const expanded = expandModelNames(`${series} ${match[1]}`);
                    models.push(...expanded);
                }
            }
        }
    }

    return { brand, seriesList, models };
}
