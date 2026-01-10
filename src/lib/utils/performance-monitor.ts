/**
 * Performance Monitoring Utilities
 * 
 * Tools for measuring and optimizing application performance.
 * Use in development to identify bottlenecks.
 */

/**
 * Measure execution time of a function
 */
export async function measurePerformance<T>(
    fn: () => Promise<T> | T,
    label: string
): Promise<T> {
    const start = performance.now();
    try {
        const result = await fn();
        const end = performance.now();
        const duration = (end - start).toFixed(2);

        if (process.env.NODE_ENV === 'development') {
            console.log(`⚡ [Performance] ${label}: ${duration}ms`);
        }

        return result;
    } catch (error) {
        const end = performance.now();
        const duration = (end - start).toFixed(2);
        console.error(`❌ [Performance] ${label} failed after ${duration}ms:`, error);
        throw error;
    }
}

/**
 * Lighthouse performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
    // Core Web Vitals
    FCP: 1800,  // First Contentful Paint (ms)
    LCP: 2500,  // Largest Contentful Paint (ms)
    TTI: 3800,  // Time to Interactive (ms)
    TBT: 200,   // Total Blocking Time (ms)
    CLS: 0.1,   // Cumulative Layout Shift

    // Custom metrics
    TTFB: 600,  // Time to First Byte (ms)
    API_RESPONSE: 300  // API response time (ms)
};

/**
 * Check if metric passes threshold
 */
export function meetsThreshold(
    metric: keyof typeof PERFORMANCE_THRESHOLDS,
    value: number
): boolean {
    return value <= PERFORMANCE_THRESHOLDS[metric];
}

/**
 * Performance budget checker
 */
export interface PerformanceBudget {
    metric: string;
    budget: number;
    actual: number;
    passed: boolean;
}

export function checkPerformanceBudget(metrics: Record<string, number>): {
    passed: boolean;
    results: PerformanceBudget[];
} {
    const results: PerformanceBudget[] = [];

    for (const [metric, actual] of Object.entries(metrics)) {
        const budget = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
        if (budget !== undefined) {
            results.push({
                metric,
                budget,
                actual,
                passed: actual <= budget
            });
        }
    }

    const passed = results.every(r => r.passed);

    return { passed, results };
}

/**
 * Bundle size analyzer helper
 */
export function logBundleSize(name: string, sizeInBytes: number) {
    const kb = (sizeInBytes / 1024).toFixed(2);
    const mb = (sizeInBytes / 1024 / 1024).toFixed(2);

    console.log(`📦 [Bundle] ${name}: ${kb} KB (${mb} MB)`);

    // Warn if bundle is large
    if (sizeInBytes > 500 * 1024) {
        console.warn(`⚠️  Large bundle detected: ${name} (${kb} KB)`);
    }
}

/**
 * Database query performance logger
 */
export async function measureQuery<T>(
    query: () => Promise<T>,
    queryName: string
): Promise<T> {
    return measurePerformance(query, `DB Query: ${queryName}`);
}

/**
 * API endpoint performance logger
 */
export function logAPIPerformance(
    endpoint: string,
    method: string,
    duration: number,
    status: number
) {
    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    const warning = duration > PERFORMANCE_THRESHOLDS.API_RESPONSE ? '⚠️ SLOW' : '';

    console.log(
        `${emoji} [API] ${method} ${endpoint}: ${duration.toFixed(2)}ms (${status}) ${warning}`
    );
}

/**
 * Memory usage logger
 */
export function logMemoryUsage() {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory;
        const used = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const total = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
        const limit = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

        console.log(`🧠 [Memory] Used: ${used}MB / Total: ${total}MB / Limit: ${limit}MB`);

        // Warn if using > 80% of heap
        const percentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (percentage > 80) {
            console.warn(`⚠️  High memory usage: ${percentage.toFixed(1)}%`);
        }
    }
}

/**
 * Component render tracker for React Profiler
 */
export function trackRender(
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 [Render] ${id} [${phase}]`, {
            actualDuration: `${actualDuration.toFixed(2)}ms`,
            baseDuration: `${baseDuration.toFixed(2)}ms`,
            renderTime: `${(commitTime - startTime).toFixed(2)}ms`
        });

        // Warn for slow renders
        if (actualDuration > 16) {
            console.warn(`⚠️  Slow render detected: ${id} took ${actualDuration.toFixed(2)}ms`);
        }
    }
}

/**
 * Performance marks for custom metrics
 */
export function markPerformance(name: string) {
    if (typeof performance !== 'undefined') {
        performance.mark(name);
    }
}

export function measureBetweenMarks(startMark: string, endMark: string, name: string) {
    if (typeof performance !== 'undefined') {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            console.log(`⏱️  [Measure] ${name}: ${measure.duration.toFixed(2)}ms`);
            return measure.duration;
        } catch (error) {
            console.error(`Failed to measure ${name}:`, error);
            return 0;
        }
    }
    return 0;
}
